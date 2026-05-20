import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext, AuthState, getMe } from "./src/services/auth";
import { FinanceProvider } from "./src/services/finance";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

const AUTH_STORAGE_KEY = "bill.auth.v1";

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function hydrateAuth() {
      try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
          return;
        }
        const saved = JSON.parse(raw) as AuthState;
        if (!saved.token) {
          return;
        }
        const user = await getMe(saved.token);
        if (mounted) {
          setAuth({ token: saved.token, user });
        }
      } catch {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        if (mounted) {
          setHydrating(false);
        }
      }
    }

    hydrateAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrating) {
      return;
    }
    if (auth.token) {
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth)).catch(() => undefined);
    } else {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => undefined);
    }
  }, [auth, hydrating]);

  const authContextValue = useMemo(() => ({ auth, setAuth }), [auth]);

  if (hydrating) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <FinanceProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </FinanceProvider>
    </AuthContext.Provider>
  );
}
