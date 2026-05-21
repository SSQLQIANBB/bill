import { Stack } from "expo-router";
import { useEffect } from "react";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { clearLocalSession, restoreAuthenticatedSession } from "../src/services/session";
import { useAuthStore } from "../src/store/authStore";

export default function RootLayout() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    let mounted = true;

    async function hydrateAuth() {
      try {
        await restoreAuthenticatedSession();
      } catch {
        if (mounted) {
          await clearLocalSession();
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    hydrateAuth();
    return () => {
      mounted = false;
    };
  }, [setInitializing]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
