import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { useAppSelector } from "@/store";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const token = useAppSelector((state) => state.auth.token);

  if (isSignedIn || token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
