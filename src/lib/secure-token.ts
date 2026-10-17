import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { TOKEN_STORAGE_KEY } from "./config";

const memoryFallback = new Map<string, string>();

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    memoryFallback.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore web storage failures
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(key) ?? memoryFallback.get(key) ?? null;
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  }

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    memoryFallback.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore web storage failures
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveAccessToken(token: string) {
  await setItem(TOKEN_STORAGE_KEY, token);
}

export async function loadAccessToken() {
  return getItem(TOKEN_STORAGE_KEY);
}

export async function clearAccessToken() {
  await deleteItem(TOKEN_STORAGE_KEY);
}
