/**
 * Diagnostic / production toggle for Clerk.
 * Set EXPO_PUBLIC_ENABLE_CLERK=false to ship a Nest email-auth-only build
 * (used to isolate Android startup crashes after Clerk was added).
 */
const flag = (process.env.EXPO_PUBLIC_ENABLE_CLERK ?? "true").trim().toLowerCase();
const key = (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").trim();

export const CLERK_ENABLED = flag !== "false" && flag !== "0" && key.length > 0;

export const CLERK_PUBLISHABLE_KEY = key;
