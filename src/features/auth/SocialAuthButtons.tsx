import { useSSO } from "@clerk/expo";
import { type Href, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SocialButton } from "@/components/ui/SocialButton";
import {
  startSocialSignIn,
  useWarmUpBrowser,
  type SocialProvider,
} from "@/features/auth/social";

type Props = {
  onError?: (message: string) => void;
};

export function SocialAuthButtons({ onError }: Props) {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null,
  );

  const onSocial = async (provider: SocialProvider) => {
    setSocialLoading(provider);
    try {
      const result = await startSocialSignIn(startSSOFlow, provider);
      if (result.status === "continue") {
        router.push("/(auth)/continue" as Href);
        return;
      }
      router.replace("/(app)/(tabs)" as Href);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Social sign-in failed";
      onError?.(message);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <View className="gap-3">
      <SocialButton
        provider="google"
        onPress={() => void onSocial("google")}
        loading={socialLoading === "google"}
        disabled={socialLoading !== null}
      />
      <SocialButton
        provider="apple"
        onPress={() => void onSocial("apple")}
        loading={socialLoading === "apple"}
        disabled={socialLoading !== null}
      />
      <SocialButton
        provider="facebook"
        onPress={() => void onSocial("facebook")}
        loading={socialLoading === "facebook"}
        disabled={socialLoading !== null}
      />
    </View>
  );
}
