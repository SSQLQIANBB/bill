import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { AppText } from "./Text";

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type TabDescriptor = {
  options?: {
    title?: string;
    tabBarAccessibilityLabel?: string;
  };
};

type TabNavigation = {
  emit: (event: { type: "tabPress" | "tabLongPress"; target: string; canPreventDefault?: boolean }) => unknown;
  navigate: (name: string, params?: object) => void;
};

type GlassTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  descriptors: Record<string, TabDescriptor>;
  navigation: TabNavigation;
};

type TabMeta = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const tabs: Record<string, TabMeta> = {
  overview: { label: "总览", icon: "home" },
  transactions: { label: "流水", icon: "folder" },
  stats: { label: "统计", icon: "calendar" },
  integrations: { label: "接入", icon: "settings" },
  mine: { label: "我的", icon: "person-circle" }
};

export function GlassTabBar({ state, descriptors, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.menu, menuShadowStyle]}>
        <View style={[styles.gloss, styles.noPointerEvents]} />
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key]?.options;
          const meta = tabs[route.name] ?? {
            label: options?.title ?? route.name,
            icon: "ellipse"
          };

          function onPress() {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true
            });

            if (!isFocused && !isDefaultPrevented(event)) {
              navigation.navigate(route.name, route.params);
            }
          }

          function onLongPress() {
            navigation.emit({
              type: "tabLongPress",
              target: route.key
            });
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.item,
                isFocused && styles.activeItem,
                isFocused && activeItemShadowStyle,
                pressed && styles.pressedItem
              ]}
            >
              <Ionicons name={meta.icon} size={22} color={isFocused ? colors.brand : "rgba(255,255,255,0.9)"} />
              <AppText style={[styles.label, isFocused && styles.activeLabel]} numberOfLines={1}>
                {meta.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function isDefaultPrevented(event: unknown) {
  return (
    typeof event === "object" &&
    event !== null &&
    "defaultPrevented" in event &&
    Boolean((event as { defaultPrevented?: unknown }).defaultPrevented)
  );
}

const menuShadowStyle = Platform.select<ViewStyle>({
  web: { boxShadow: "0 10px 20px rgba(0,0,0,0.08)" } as ViewStyle,
  default: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8
  }
});

const activeItemShadowStyle = Platform.select<ViewStyle>({
  web: { boxShadow: "0 1px 8px rgba(255,255,255,0.45)" } as ViewStyle,
  default: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.45,
    shadowRadius: 8
  }
});

const styles = StyleSheet.create({
  safe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 10
  },
  menu: {
    width: "100%",
    maxWidth: 520,
    minHeight: 68,
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    backgroundColor: "rgba(0,122,255,0.54)",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.42)"
  },
  noPointerEvents: {
    pointerEvents: "none"
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  activeItem: {
    backgroundColor: "rgba(237,237,237,0.66)"
  },
  pressedItem: {
    transform: [{ scale: 0.98 }]
  },
  label: {
    marginTop: 4,
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "700"
  },
  activeLabel: {
    color: colors.brand
  }
});
