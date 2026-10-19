import { Redirect, Stack } from "expo-router";
import { useAppSelector } from "@/store";

export default function AppLayout() {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="task/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="pick-location" options={{ presentation: "modal" }} />
      <Stack.Screen name="profile/change-email" />
      <Stack.Screen name="profile/verify-email" />
    </Stack>
  );
}
