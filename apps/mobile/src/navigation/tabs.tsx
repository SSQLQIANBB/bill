import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OverviewScreen } from "../screens/OverviewScreen";
import { TransactionsScreen } from "../screens/TransactionsScreen";
import { StatsScreen } from "../screens/StatsScreen";
import { IntegrationsScreen } from "../screens/IntegrationsScreen";
import { colors } from "../theme/colors";
import { AppText } from "../components/Text";

export type MainTabParamList = {
  Overview: undefined;
  Transactions: undefined;
  Stats: undefined;
  Integrations: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Overview: "home",
  Transactions: "list",
  Stats: "pie-chart",
  Integrations: "link"
};

const labels: Record<keyof MainTabParamList, string> = {
  Overview: "总览",
  Transactions: "流水",
  Stats: "统计",
  Integrations: "接入"
};

export function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <BillTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Integrations" component={IntegrationsScreen} />
    </Tab.Navigator>
  );
}

function BillTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const name = route.name as keyof MainTabParamList;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={styles.hit}
            >
              <View style={[styles.pill, focused && styles.pillActive]}>
                <Ionicons name={icons[name]} size={focused ? 22 : 21} color={focused ? colors.brand : colors.inactive} />
              </View>
              <AppText style={[styles.label, focused && styles.labelActive]}>{labels[name]}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 80,
    backgroundColor: colors.white
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingTop: 8
  },
  hit: {
    width: 76,
    height: 64,
    alignItems: "center"
  },
  pill: {
    width: 56,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center"
  },
  pillActive: {
    backgroundColor: colors.warmBg,
    borderWidth: 1,
    borderColor: colors.warmLine
  },
  label: {
    marginTop: 3,
    fontSize: 11,
    color: colors.inactive
  },
  labelActive: {
    color: colors.brand,
    fontWeight: "700"
  }
});
