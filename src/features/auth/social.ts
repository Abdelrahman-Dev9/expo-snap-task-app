import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = "google" | "facebook" | "apple";

export const SOCIAL_STRATEGY: Record<
  SocialProvider,
  "oauth_google" | "oauth_facebook" | "oauth_apple"
> = {
  google: "oauth_google",
  facebook: "oauth_facebook",
  apple: "oauth_apple",
};

/** Preloads the browser on Android to reduce auth load time. */
export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

type StartSSOFlow = ReturnType<typeof useSSO>["startSSOFlow"];

export async function startSocialSignIn(
  startSSOFlow: StartSSOFlow,
  provider: SocialProvider,
) {
  const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
    strategy: SOCIAL_STRATEGY[provider],
    redirectUrl: AuthSession.makeRedirectUri({
      scheme: "snaptask",
      path: "continue",
    }),
  });

  if (createdSessionId && setActive) {
    await setActive({ session: createdSessionId });
    return { status: "complete" as const };
  }

  return {
    status: "continue" as const,
    signIn,
    signUp,
  };
}
