import { Redirect, Tabs } from "expo-router";
import { GlassTabBar } from "../../src/components/GlassTabBar";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { useAuthStore } from "../../src/store/authStore";

export default function TabsLayout() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isInitializing) {
    return <LoadingScreen />;
  }
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="overview" options={{ title: "总览" }} />
      <Tabs.Screen name="transactions" options={{ title: "流水" }} />
      <Tabs.Screen name="stats" options={{ title: "统计" }} />
      <Tabs.Screen name="integrations" options={{ title: "接入" }} />
      <Tabs.Screen name="mine" options={{ title: "我的" }} />
    </Tabs>
  );
}
