import { create } from "zustand";
import { logoutWithRefreshToken } from "../services/auth";
import { configureAuthSessionAdapter } from "../services/api";
import { clearRefreshToken, loadRefreshToken } from "../storage/tokenStorage";
import { useUserStore } from "./userStore";

type AuthStore = {
  accessToken: string | null;
  isLoggedIn: boolean;
  isInitializing: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setInitializing: (isInitializing: boolean) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  isLoggedIn: false,
  isInitializing: true,
  setAccessToken: (accessToken) => set({ accessToken, isLoggedIn: Boolean(accessToken) }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  clearAuth: () => set({ accessToken: null, isLoggedIn: false }),
  logout: async () => {
    const refreshToken = await loadRefreshToken();
    await logoutWithRefreshToken(refreshToken).catch(() => undefined);
    await clearRefreshToken();
    useUserStore.getState().clearUser();
    set({ accessToken: null, isLoggedIn: false });
  }
}));

configureAuthSessionAdapter({
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (accessToken) => useAuthStore.getState().setAccessToken(accessToken),
  clearSessionState: () => {
    useAuthStore.getState().clearAuth();
    useUserStore.getState().clearUser();
  }
});
