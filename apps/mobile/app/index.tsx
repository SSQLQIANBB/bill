import { Redirect } from "expo-router";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { useAuthStore } from "../src/store/authStore";

export default function IndexRoute() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return <Redirect href={isLoggedIn ? "/(tabs)/overview" : "/(auth)/login"} />;
}
