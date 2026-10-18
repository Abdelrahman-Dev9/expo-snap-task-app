import { Platform } from "react-native";

const PRODUCTION_API_URL = "https://nest-task-app-ten.vercel.app";

// iOS Simulator can reach the Mac via loopback. Android emulator uses 10.0.2.2.
const LOCAL_API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://127.0.0.1:3000";

/**
 * In development the simulator often fails to reach Vercel reliably
 * (timeouts on image uploads). Use the local Nest server (same DB).
 * Production / release builds always use Vercel.
 */
export const API_BASE_URL = __DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL;

export const TOKEN_STORAGE_KEY = "snap_task_access_token";
