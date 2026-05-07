import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { useFinance } from "../services/finance";
import { colors } from "../theme/colors";

const iconMap = {
  微信支付: "logo-wechat",
  银行卡: "card",
  支付宝: "add-circle"
} as const;

function channelColor(name: string) {
  if (name === "微信支付") return colors.wechat;
  if (name === "支付宝") return colors.alipay;
  return colors.gold;
}

export function IntegrationsScreen() {
  const { integrations, setIntegrations } = useFinance();

  function toggle(id: string) {
    setIntegrations((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              enabled: !item.enabled,
              status: item.enabled ? "已停用" : "已授权",
              syncedToday: item.enabled ? 0 : item.syncedToday || 1
            }
          : item
      )
    );
  }

  return (
    <Screen>
      <AppText style={styles.title}>接入</AppText>
      <AppText style={styles.subtitle}>统一管理支付渠道与同步权限</AppText>
      <View style={styles.card}>
        {integrations.map((channel) => (
          <View key={channel.id} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: channelColor(channel.name), opacity: channel.enabled ? 1 : 0.48 }]}>
              <Ionicons name={iconMap[channel.name as keyof typeof iconMap]} size={20} color={colors.white} />
            </View>
            <View style={styles.body}>
              <AppText style={styles.channelName}>{channel.name}</AppText>
              <AppText style={styles.channelStatus}>{channel.status} · 今日同步 {channel.syncedToday} 笔</AppText>
            </View>
            <Pressable style={[styles.manage, channel.enabled && styles.manageActive]} onPress={() => toggle(channel.id)}>
              <AppText style={[styles.manageText, channel.enabled && styles.manageActiveText]}>{channel.enabled ? "停用" : "接入"}</AppText>
            </Pressable>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700" },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.muted },
  card: {
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  row: { minHeight: 72, flexDirection: "row", alignItems: "center" },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  body: { flex: 1, gap: 5 },
  channelName: { fontSize: 15, fontWeight: "700" },
  channelStatus: { fontSize: 12, color: colors.muted },
  manage: {
    height: 32,
    minWidth: 54,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.warmBg,
    borderWidth: 1,
    borderColor: colors.warmLine,
    justifyContent: "center",
    alignItems: "center"
  },
  manageActive: {
    backgroundColor: colors.white,
    borderColor: colors.line
  },
  manageText: { color: colors.brand, fontWeight: "700", fontSize: 13 },
  manageActiveText: { color: colors.muted }
});
