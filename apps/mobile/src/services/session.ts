import { router } from "expo-router";
import { AuthResult, getMe, refreshSession } from "./auth";
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from "../storage/tokenStorage";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";

export async function startAuthenticatedSession(tokens: AuthResult) {
  await saveRefreshToken(tokens.refreshToken);
  useAuthStore.getState().setAccessToken(tokens.accessToken);
  try {
    useUserStore.getState().setUser(await getMe());
  } catch (error) {
    await clearLocalSession();
    throw error;
  }
}

export async function restoreAuthenticatedSession() {
  const refreshToken = await loadRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const tokens = await refreshSession(refreshToken);
  await startAuthenticatedSession(tokens);
  return true;
}

export async function clearLocalSession(redirectToLogin = false) {
  await clearRefreshToken();
  useAuthStore.getState().clearAuth();
  useUserStore.getState().clearUser();
  if (redirectToLogin) {
    router.replace("/(auth)/login");
  }
}
