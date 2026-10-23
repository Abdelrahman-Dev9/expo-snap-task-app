import { useHostedAuth } from "@clerk/expo/hosted-auth";
import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
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

/** Expo Go cannot complete custom-scheme OAuth redirects required by useSSO(). */
function isExpoGo() {
  return Constants.appOwnership === "expo";
}

function clerkErrorMessage(err: unknown) {
  if (err && typeof err === "object") {
    const anyErr = err as {
      message?: string;
      errors?: Array<{ longMessage?: string; message?: string }>;
    };
    const first = anyErr.errors?.[0];
    return (
      first?.longMessage ||
      first?.message ||
      anyErr.message ||
      "Social sign-in failed"
    );
  }
  if (err instanceof Error) return err.message;
  return "Social sign-in failed";
}

export function SocialAuthButtons({ onError }: Props) {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const { startHostedAuth } = useHostedAuth();
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null,
  );

  const finish = () => {
    router.replace("/(app)/(tabs)" as Href);
  };

  const onSocial = async (provider: SocialProvider) => {
    setSocialLoading(provider);
    try {
      if (isExpoGo()) {
        // Same 3-button UI; Expo Go uses Clerk hosted portal under the hood.
        const redirectUrl = AuthSession.makeRedirectUri({
          scheme: "snaptask",
          path: "oauth-native-callback",
        });
        const { createdSessionId } = await startHostedAuth({
          mode: "sign-in",
          redirectUrl,
        });
        if (!createdSessionId) {
          onError?.("Sign-in was cancelled or did not complete. Try again.");
          return;
        }
        finish();
        return;
      }

      const result = await startSocialSignIn(startSSOFlow, provider);
      if (result.status === "continue") {
        router.push("/(auth)/continue" as Href);
        return;
      }
      finish();
    } catch (err) {
      onError?.(clerkErrorMessage(err));
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
