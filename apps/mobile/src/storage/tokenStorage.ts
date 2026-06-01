import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const REFRESH_TOKEN_KEY = "bill.refreshToken.v1";
let memoryRefreshToken: string | null = null;

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export async function saveRefreshToken(refreshToken: string) {
  memoryRefreshToken = refreshToken;
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return;
  }

  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function loadRefreshToken() {
  const webStorage = getWebStorage();
  if (webStorage) {
    return webStorage.getItem(REFRESH_TOKEN_KEY) ?? memoryRefreshToken;
  }

  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
  return memoryRefreshToken;
}

export async function clearRefreshToken() {
  memoryRefreshToken = null;
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

function getWebStorage() {
  if (Platform.OS !== "web") {
    return null;
  }

  try {
    return (globalThis as unknown as { localStorage?: WebStorage }).localStorage ?? null;
  } catch {
    return null;
  }
}
