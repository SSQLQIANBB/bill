import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { AuthContext, AuthState } from "./src/services/auth";
import { FinanceProvider } from "./src/services/finance";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <FinanceProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </FinanceProvider>
    </AuthContext.Provider>
  );
}
