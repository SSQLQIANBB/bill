import { Redirect, Slot } from "expo-router";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { useAuthStore } from "../../src/store/authStore";

export default function AuthLayout() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isInitializing) {
    return <LoadingScreen />;
  }
  if (isLoggedIn) {
    return <Redirect href="/(tabs)/overview" />;
  }

  return <Slot />;
}
