import { Redirect } from "expo-router";
import { CLERK_ENABLED } from "@/lib/clerk-config";

/** Clerk social sign-up continuation; Nest-only builds never reach here. */
export default function ContinueSignUpScreen() {
  if (!CLERK_ENABLED) {
    return <Redirect href="/(auth)/login" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ContinueClerk = require("./continue.clerk").default as () => React.ReactElement;
  return <ContinueClerk />;
}
