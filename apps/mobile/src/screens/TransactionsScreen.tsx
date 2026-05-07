import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { TransactionRow } from "../components/TransactionRow";
import { markerFor, signedAmount, Transaction, useFinance } from "../services/finance";
import { colors } from "../theme/colors";

const filters = ["全部", "待处理", "微信支付", "支付宝", "银行卡"];

function channelColor(channel: Transaction["channel"]) {
  if (channel === "微信支付") return colors.wechat;
  if (channel === "支付宝") return colors.alipay;
  if (channel === "银行卡") return colors.gold;
  return colors.brand;
}

export function TransactionsScreen() {
  const { transactions, setTransactions } = useFinance();
  const [activeFilter, setActiveFilter] = useState("全部");

  const items = useMemo(() => {
    if (activeFilter === "全部") return transactions;
    if (activeFilter === "待处理") return transactions.filter((item) => item.status !== "已分类");
    return transactions.filter((item) => item.channel === activeFilter);
  }, [activeFilter, transactions]);

  function markReviewed(item: Transaction) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === item.id ? { ...transaction, status: "已分类", category: item.category === "未分类" ? "其他" : item.category } : transaction
      )
    );
  }

  return (
    <Screen>
      <AppText style={styles.title}>流水</AppText>
      <AppText style={styles.subtitle}>按渠道、分类和状态快速核对账单</AppText>
      <View style={styles.filters}>
        {filters.map((item) => {
          const active = item === activeFilter;
          return (
            <Pressable key={item} style={[styles.filter, active && styles.filterActive]} onPress={() => setActiveFilter(item)}>
              <AppText style={[styles.filterText, active && styles.filterTextActive]}>{item}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.card}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => markReviewed(item)}>
            <TransactionRow
              marker={markerFor(item.title)}
              title={item.title}
              subtitle={`${item.channel} · ${item.category} · ${item.occurredAt}`}
              amount={signedAmount(item)}
              color={channelColor(item.channel)}
              income={item.kind === "income"}
              status={item.status}
            />
          </Pressable>
        ))}
        {items.length === 0 ? <AppText style={styles.empty}>暂无匹配流水</AppText> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700" },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.muted },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 22 },
  filter: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: "center"
  },
  filterActive: { backgroundColor: colors.warmBg, borderColor: colors.warmLine },
  filterText: { fontSize: 13, color: colors.muted },
  filterTextActive: { color: colors.brand, fontWeight: "700" },
  card: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  empty: {
    paddingVertical: 28,
    textAlign: "center",
    color: colors.muted
  }
});
