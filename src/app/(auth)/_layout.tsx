import { Redirect, Stack } from "expo-router";
import { CLERK_ENABLED } from "@/lib/clerk-config";
import { useAppSelector } from "@/store";

function AuthLayoutNest() {
  const token = useAppSelector((state) => state.auth.token);

  if (token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function AuthLayoutClerk() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuth } = require("@clerk/expo") as typeof import("@clerk/expo");
  const { isSignedIn } = useAuth();
  const token = useAppSelector((state) => state.auth.token);

  if (isSignedIn || token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function AuthLayout() {
  return CLERK_ENABLED ? <AuthLayoutClerk /> : <AuthLayoutNest />;
}
