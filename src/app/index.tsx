import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { useAppSelector } from "@/store";

export default function Index() {
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
