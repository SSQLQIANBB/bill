import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useAuthStore } from "../store/authStore";
import { useBillStore } from "../store/billStore";
import { useUserStore } from "../store/userStore";
import { colors } from "../theme/colors";

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: boolean;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
};

const quickActions: QuickAction[] = [
  { icon: "notifications-outline", label: "消息" },
  { icon: "medal-outline", label: "徽章" },
  { icon: "gift-outline", label: "积分" },
  { icon: "person-add-outline", label: "邀请" },
  { icon: "settings-outline", label: "设置", badge: true }
];

const accountMenus: MenuItem[] = [
  { icon: "wallet-outline", title: "我的账本" },
  { icon: "home-outline", title: "家庭账单" }
];

const supportMenus: MenuItem[] = [
  { icon: "settings-outline", title: "设置" },
  { icon: "shield-checkmark-outline", title: "账户安全中心", value: "高风险" },
  { icon: "help-circle-outline", title: "使用帮助" },
  { icon: "chatbox-ellipses-outline", title: "意见反馈" }
];

export function MineScreen() {
  const [loggingOut, setLoggingOut] = useState(false);
  const user = useUserStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const transactions = useBillStore((state) => state.transactions);

  const displayName = user?.nickname || user?.phone || user?.email || "记账用户";
  const accountText = user?.phone || user?.email || "已登录";
  const activeDays = new Set(transactions.map((item) => item.occurredAt)).size;

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    await logout();
    router.replace("/(auth)/login");
    setLoggingOut(false);
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={colors.brand} />
          </View>
          <View style={styles.profileText}>
            <AppText style={styles.name}>{displayName}</AppText>
            <AppText style={styles.account}>{accountText}</AppText>
          </View>
          <Pressable style={styles.checkButton}>
            <Ionicons name="calendar-outline" size={18} color={colors.text} />
            <AppText style={styles.checkText}>打卡</AppText>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText style={styles.statValue}>0</AppText>
            <AppText style={styles.statLabel}>连续打卡</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={styles.statValue}>{activeDays}</AppText>
            <AppText style={styles.statLabel}>记账天数</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={styles.statValue}>{transactions.length}</AppText>
            <AppText style={styles.statLabel}>记账笔数</AppText>
          </View>
        </View>
      </View>

      <View style={styles.vipCard}>
        <View style={styles.vipIcon}>
          <Ionicons name="diamond-outline" size={24} color={colors.brand} />
        </View>
        <View style={styles.vipBody}>
          <AppText style={styles.vipTitle}>升级为 VIP</AppText>
          <AppText style={styles.vipDesc}>解锁更多自动记账能力</AppText>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.inactive} />
      </View>

      <View style={styles.quickCard}>
        {quickActions.map((item) => (
          <Pressable key={item.label} style={styles.quickItem}>
            <View style={styles.quickIconWrap}>
              <Ionicons name={item.icon} size={24} color={colors.text} />
              {item.badge ? <View style={styles.badge} /> : null}
            </View>
            <AppText style={styles.quickLabel}>{item.label}</AppText>
          </Pressable>
        ))}
      </View>

      <MenuGroup items={accountMenus} />
      <MenuGroup items={supportMenus} />

      <Pressable style={[styles.logoutButton, loggingOut && styles.disabled]} onPress={handleLogout} disabled={loggingOut}>
        {loggingOut ? <ActivityIndicator color={colors.danger} /> : <AppText style={styles.logoutText}>退出登录</AppText>}
      </Pressable>
    </Screen>
  );
}

function MenuGroup({ items }: { items: MenuItem[] }) {
  return (
    <View style={styles.menuCard}>
      {items.map((item, index) => (
        <Pressable key={item.title} style={[styles.menuRow, index > 0 && styles.menuDivider]}>
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon} size={21} color={colors.text} />
          </View>
          <AppText style={styles.menuTitle}>{item.title}</AppText>
          {item.value ? <AppText style={styles.menuValue}>{item.value}</AppText> : null}
          <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 132
  },
  hero: {
    marginHorizontal: -18,
    paddingHorizontal: 28,
    paddingTop: 54,
    paddingBottom: 26,
    backgroundColor: colors.warmBg
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBg
  },
  profileText: {
    flex: 1
  },
  name: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "700"
  },
  account: {
    marginTop: 4,
    color: colors.amberText,
    fontSize: 12
  },
  checkButton: {
    minWidth: 76,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white
  },
  checkText: {
    fontSize: 15,
    fontWeight: "700"
  },
  statsRow: {
    marginTop: 34,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statValue: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700"
  },
  statLabel: {
    marginTop: 6,
    color: "#6f612a",
    fontSize: 13
  },
  vipCard: {
    marginTop: -12,
    minHeight: 76,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white
  },
  vipIcon: {
    width: 40,
    alignItems: "center"
  },
  vipBody: {
    flex: 1,
    marginLeft: 12
  },
  vipTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  vipDesc: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12
  },
  quickCard: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white
  },
  quickItem: {
    width: 58,
    alignItems: "center",
    gap: 8
  },
  quickIconWrap: {
    width: 32,
    height: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  quickLabel: {
    color: "#4b5563",
    fontSize: 12
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger
  },
  menuCard: {
    marginTop: 18,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white
  },
  menuRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center"
  },
  menuDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  menuIcon: {
    width: 34,
    alignItems: "flex-start"
  },
  menuTitle: {
    flex: 1,
    color: "#374151",
    fontSize: 16
  },
  menuValue: {
    marginRight: 8,
    color: "#d36b7b",
    fontSize: 13
  },
  logoutButton: {
    marginTop: 18,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#fecaca"
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "700"
  },
  disabled: {
    opacity: 0.6
  }
});
