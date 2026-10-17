import { Alert } from "react-native";

export type SocialProvider = "google" | "facebook";

/**
 * Placeholder for social sign-in.
 *
 * When Clerk is added, replace this with:
 *   const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" })
 *   const { createdSessionId, setActive } = await startOAuthFlow()
 *
 * Keeping the UI wired to this single entry point means the buttons
 * don't change when the provider does.
 */
export async function signInWithProvider(provider: SocialProvider) {
  const name = provider === "google" ? "Google" : "Facebook";
  Alert.alert(
    `${name} sign-in coming soon`,
    "Social login will be powered by Clerk. Use email and password for now.",
  );
}
