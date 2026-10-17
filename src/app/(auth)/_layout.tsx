import { Redirect, Stack } from "expo-router";
import { useAppSelector } from "@/store";

export default function AuthLayout() {
  const token = useAppSelector((state) => state.auth.token);

  if (token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
