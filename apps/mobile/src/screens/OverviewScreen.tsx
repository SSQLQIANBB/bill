import { Pressable, StyleSheet, View } from "react-native";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { TransactionRow } from "../components/TransactionRow";
import { formatMoney, markerFor, signedAmount, useBillStore } from "../store/billStore";
import { colors } from "../theme/colors";

function channelColor(channel: string) {
  if (channel === "微信支付") return colors.wechat;
  if (channel === "支付宝") return colors.alipay;
  if (channel === "银行卡") return colors.gold;
  return colors.brand;
}

export function OverviewScreen() {
  const transactions = useBillStore((state) => state.transactions);
  const integrations = useBillStore((state) => state.integrations);
  const addTransaction = useBillStore((state) => state.addTransaction);
  const income = transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = transactions.filter((item) => item.status !== "已分类").length;
  const syncedToday = integrations.reduce((sum, item) => sum + item.syncedToday, 0);
  const recent = transactions.slice(0, 4);

  return (
    <Screen>
      <View style={styles.titleRow}>
        <AppText style={styles.title}>智能记账</AppText>
      </View>
      <AppText style={styles.subtitle}>自动同步微信、支付宝、银行卡流水，快速完成分类与复核</AppText>

      <View style={styles.balanceCard}>
        <AppText style={styles.balanceLabel}>本月净收入</AppText>
        <AppText style={styles.balanceAmount}>{formatMoney(income - expense)}</AppText>
        <View style={styles.summaryRow}>
          <View>
            <AppText style={styles.balanceMetaLabel}>收入</AppText>
            <AppText style={styles.balanceMeta}>{formatMoney(income)}</AppText>
          </View>
          <View>
            <AppText style={styles.balanceMetaLabel}>支出</AppText>
            <AppText style={styles.balanceMeta}>{formatMoney(expense)}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.syncCard}>
        <View>
          <AppText style={styles.syncTitle}>今日自动记账</AppText>
          <AppText style={styles.syncText}>已同步 {syncedToday} 笔，{pendingCount} 笔待处理</AppText>
        </View>
        <View style={styles.tags}>
          {integrations.filter((item) => item.enabled).slice(0, 2).map((item) => (
            <View key={item.id} style={[styles.tag, { backgroundColor: item.name === "微信支付" ? colors.wechat : colors.gold }]}>
              <AppText style={styles.tagText}>{item.name}</AppText>
            </View>
          ))}
        </View>
      </View>

      <AppText style={styles.sectionTitle}>近期流水</AppText>
      <View style={styles.list}>
        {recent.map((item) => (
          <TransactionRow
            key={item.id}
            marker={markerFor(item.title)}
            title={item.title}
            subtitle={`${item.channel} · ${item.category} · ${item.occurredAt}`}
            amount={signedAmount(item)}
            color={channelColor(item.channel)}
            income={item.kind === "income"}
            status={item.status}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={() =>
            addTransaction({
              title: "手动记账",
              amount: 36,
              kind: "expense",
              category: "餐饮",
              channel: "手动"
            })
          }
        >
          <AppText style={styles.actionPrimaryText}>手动记一笔</AppText>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            addTransaction({
              title: "待分类流水",
              amount: 58,
              kind: "expense",
              category: "未分类",
              channel: "支付宝",
              status: "待分类"
            })
          }
        >
          <AppText style={styles.actionText}>模拟同步</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700"
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted
  },
  balanceCard: {
    marginTop: 20,
    minHeight: 146,
    borderRadius: 20,
    backgroundColor: colors.warmBg,
    borderWidth: 1,
    borderColor: colors.warmLine,
    paddingHorizontal: 22,
    paddingTop: 18
  },
  balanceLabel: {
    color: colors.amberText,
    fontSize: 13
  },
  balanceAmount: {
    marginTop: 6,
    fontSize: 34,
    lineHeight: 45,
    fontWeight: "700",
    color: colors.brand
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 44
  },
  balanceMetaLabel: {
    color: colors.amberText,
    fontSize: 11
  },
  balanceMeta: {
    marginTop: 3,
    color: colors.amberText,
    fontSize: 13,
    fontWeight: "700"
  },
  syncCard: {
    marginTop: 22,
    minHeight: 86,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: "700"
  },
  syncText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted
  },
  tags: {
    gap: 6
  },
  tag: {
    width: 76,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  tagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700"
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 6,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700"
  },
  list: {
    gap: 0
  },
  actions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 28
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  actionPrimary: {
    backgroundColor: colors.warmBg,
    borderColor: colors.warmLine
  },
  actionPrimaryText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "700"
  },
  actionText: {
    color: colors.amberText,
    fontSize: 14,
    fontWeight: "700"
  }
});
