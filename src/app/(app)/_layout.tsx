import { Redirect, Stack } from "expo-router";
import { CLERK_ENABLED } from "@/lib/clerk-config";
import { useAppSelector } from "@/store";

function AppStack() {
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

function AppLayoutNest() {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AppStack />;
}

function AppLayoutClerk() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuth } = require("@clerk/expo") as typeof import("@clerk/expo");
  const { isLoaded, isSignedIn } = useAuth();
  const token = useAppSelector((state) => state.auth.token);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn && !token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AppStack />;
}

export default function AppLayout() {
  return CLERK_ENABLED ? <AppLayoutClerk /> : <AppLayoutNest />;
}
