import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "bill.refreshToken.v1";
let memoryRefreshToken: string | null = null;

export async function saveRefreshToken(refreshToken: string) {
  memoryRefreshToken = refreshToken;
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function loadRefreshToken() {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
  return memoryRefreshToken;
}

export async function clearRefreshToken() {
  memoryRefreshToken = null;
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}
