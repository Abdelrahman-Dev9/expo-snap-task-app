import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { theme } from "@/components/ui/theme";

/** Deep-link landing for Clerk hosted auth redirects. */
export default function OAuthNativeCallback() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={theme.colors.brand600} />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? "/(app)/(tabs)" : "/(auth)/login"} />;
}
