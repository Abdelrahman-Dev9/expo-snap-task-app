import type { ReactElement } from "react";
import { CLERK_ENABLED } from "@/lib/clerk-config";

type Props = {
  onError?: (message: string) => void;
};

/** Nest-only builds skip social buttons so @clerk/expo never loads. */
export function SocialAuthButtons(props: Props): ReactElement | null {
  if (!CLERK_ENABLED) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SocialAuthButtonsImpl } = require("./SocialAuthButtons.clerk") as {
    SocialAuthButtonsImpl: (p: Props) => ReactElement;
  };
  return <SocialAuthButtonsImpl {...props} />;
}
