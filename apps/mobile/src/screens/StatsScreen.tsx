import { StyleSheet, View } from "react-native";
import { Screen } from "../components/Screen";
import { AppText } from "../components/Text";
import { formatMoney, useBillStore } from "../store/billStore";
import { colors } from "../theme/colors";

const palette = [colors.brand, colors.alipay, colors.wechat, colors.gold, colors.danger];

export function StatsScreen() {
  const transactions = useBillStore((state) => state.transactions);
  const expense = transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const income = transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const byCategory = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.amount;
      return acc;
    }, {});
  const categories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      percent: expense ? Math.max(6, Math.round((value / expense) * 100)) : 0,
      color: palette[index % palette.length]
    }));

  return (
    <Screen>
      <AppText style={styles.title}>统计</AppText>
      <AppText style={styles.subtitle}>收入支出趋势与预算占用</AppText>
      <View style={styles.hero}>
        <AppText style={styles.heroLabel}>本月支出</AppText>
        <AppText style={styles.heroAmount}>{formatMoney(expense)}</AppText>
        <AppText style={styles.heroMeta}>收入 {formatMoney(income)} · 结余 {formatMoney(income - expense)}</AppText>
      </View>
      <View style={styles.card}>
        {categories.map((item) => (
          <View key={item.label} style={styles.category}>
            <View style={styles.categoryTop}>
              <AppText style={styles.categoryLabel}>{item.label}</AppText>
              <AppText style={styles.categoryValue}>{formatMoney(item.value)}</AppText>
            </View>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${item.percent}%`, backgroundColor: item.color }]} />
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700" },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.muted },
  hero: {
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: colors.warmBg,
    borderWidth: 1,
    borderColor: colors.warmLine,
    padding: 22
  },
  heroLabel: { color: colors.amberText, fontSize: 13 },
  heroAmount: { marginTop: 8, fontSize: 32, lineHeight: 42, fontWeight: "700", color: colors.brand },
  heroMeta: { marginTop: 6, color: colors.amberText, fontSize: 12 },
  card: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    gap: 18
  },
  category: { gap: 8 },
  categoryTop: { flexDirection: "row", justifyContent: "space-between" },
  categoryLabel: { fontSize: 14, fontWeight: "700" },
  categoryValue: { fontSize: 14, color: colors.muted },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.warmBg, overflow: "hidden" },
  bar: { height: 8, borderRadius: 4 }
});
