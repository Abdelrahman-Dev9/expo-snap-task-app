import { Redirect } from "expo-router";
import { CLERK_ENABLED } from "@/lib/clerk-config";

/** Deep-link landing for Clerk hosted auth; Nest-only builds skip Clerk. */
export default function OAuthNativeCallback() {
  if (!CLERK_ENABLED) {
    return <Redirect href="/(auth)/login" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const CallbackClerk = require("./oauth-native-callback.clerk")
    .default as () => React.ReactElement;
  return <CallbackClerk />;
}