import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Safe SecureStore-backed cache for Clerk.
 * Avoids hard crashes on Android if SecureStore fails during startup.
 */
export const clerkTokenCache = {
  async getToken(key: string): Promise<string | null> {
    if (Platform.OS === "web") return null;
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      if (!value) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore persistence failures — session still works in memory.
    }
  },
};
