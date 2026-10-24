import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { CLERK_ENABLED } from "@/lib/clerk-config";
import { useAppSelector } from "@/store";

function IndexNest() {
  const token = useAppSelector((state) => state.auth.token);
  const status = useAppSelector((state) => state.auth.status);

  if (status === "idle" || status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-brand-950">
        <ActivityIndicator size="large" color={theme.colors.brand600} />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

function IndexClerk() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuth } = require("@clerk/expo") as typeof import("@clerk/expo");
  const { isLoaded, isSignedIn } = useAuth();
  const token = useAppSelector((state) => state.auth.token);
  const status = useAppSelector((state) => state.auth.status);

  if (!isLoaded || status === "idle" || status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-brand-950">
        <ActivityIndicator size="large" color={theme.colors.brand600} />
      </View>
    );
  }

  if (isSignedIn || token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

export default function Index() {
  return CLERK_ENABLED ? <IndexClerk /> : <IndexNest />;
}
