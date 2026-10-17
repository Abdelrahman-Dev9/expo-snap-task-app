import { Redirect, Stack } from "expo-router";
import { useAppSelector } from "@/store";

export default function AppLayout() {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
