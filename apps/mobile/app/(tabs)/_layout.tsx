import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { useAuthStore } from "../../src/store/authStore";
import { colors } from "../../src/theme/colors";

const icons = {
  overview: "home",
  transactions: "list",
  stats: "pie-chart",
  integrations: "link"
} as const;

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          height: 76,
          borderTopColor: colors.line,
          backgroundColor: colors.white
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          paddingBottom: 8
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name as keyof typeof icons]} size={size} color={color} />
        )
      })}
    >
      <Tabs.Screen name="overview" options={{ title: "总览" }} />
      <Tabs.Screen name="transactions" options={{ title: "流水" }} />
      <Tabs.Screen name="stats" options={{ title: "统计" }} />
      <Tabs.Screen name="integrations" options={{ title: "接入" }} />
    </Tabs>
  );
}
