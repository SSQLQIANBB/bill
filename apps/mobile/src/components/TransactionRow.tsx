import { StyleSheet, View } from "react-native";
import { AppText } from "./Text";
import { colors } from "../theme/colors";

type Props = {
  marker: string;
  title: string;
  subtitle: string;
  amount: string;
  color: string;
  income?: boolean;
  status?: string;
};

export function TransactionRow({ marker, title, subtitle, amount, color, income }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: color }]}>
        <AppText style={styles.iconText}>{marker}</AppText>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText style={styles.title}>{title}</AppText>
          {status && status !== "已分类" ? (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{status}</AppText>
            </View>
          ) : null}
        </View>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
      <AppText style={[styles.amount, { color: income ? colors.brand : colors.danger }]}>{amount}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  iconText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14
  },
  body: {
    flex: 1,
    gap: 4
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  title: {
    fontSize: 14,
    fontWeight: "700"
  },
  badge: {
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: colors.warmBg,
    borderWidth: 1,
    borderColor: colors.warmLine,
    justifyContent: "center"
  },
  badgeText: {
    fontSize: 10,
    color: colors.amberText,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted
  },
  amount: {
    width: 84,
    textAlign: "right",
    fontWeight: "700",
    fontSize: 14
  }
});
