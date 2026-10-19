import { useAuth, useUser } from "@clerk/expo";
import { useEffect, useRef } from "react";
import { getMeRequest } from "@/features/profile/api";
import { setSession, setUser } from "@/store/auth-slice";
import { useAppDispatch } from "@/store";

/**
 * Keeps Redux API auth in sync with the Clerk session.
 * Nest accepts the Clerk session JWT as Bearer after verifying it.
 */
export function ClerkAuthBridge() {
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    const sync = async () => {
      if (!isSignedIn) {
        lastToken.current = null;
        return;
      }

      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const me = await getMeRequest(token);
        if (cancelled) return;

        if (token !== lastToken.current) {
          lastToken.current = token;
          dispatch(setSession({ token, user: me }));
        } else {
          dispatch(setUser(me));
        }
      } catch {
        // Backend may be offline; keep Clerk session and retry on next focus.
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, user?.id, dispatch]);

  return null;
}
