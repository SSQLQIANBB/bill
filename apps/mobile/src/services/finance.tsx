import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";

export type TransactionKind = "income" | "expense";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  kind: TransactionKind;
  category: string;
  channel: "微信支付" | "支付宝" | "银行卡" | "手动";
  status: "已分类" | "待分类" | "待复核";
  occurredAt: string;
};

export type Integration = {
  id: string;
  name: string;
  status: string;
  syncedToday: number;
  enabled: boolean;
};

const initialTransactions: Transaction[] = [
  { id: "1", title: "盒马鲜生", amount: 128.6, kind: "expense", category: "餐饮", channel: "支付宝", status: "已分类", occurredAt: "今天 12:48" },
  { id: "2", title: "工资入账", amount: 18500, kind: "income", category: "工资", channel: "银行卡", status: "已分类", occurredAt: "今天 09:12" },
  { id: "3", title: "滴滴出行", amount: 42, kind: "expense", category: "交通", channel: "微信支付", status: "已分类", occurredAt: "昨天 21:06" },
  { id: "4", title: "房租转账", amount: 4800, kind: "expense", category: "居住", channel: "银行卡", status: "待复核", occurredAt: "4月30日" },
  { id: "5", title: "瑞幸咖啡", amount: 18, kind: "expense", category: "餐饮", channel: "微信支付", status: "已分类", occurredAt: "4月29日" },
  { id: "6", title: "项目奖金", amount: 3600, kind: "income", category: "奖金", channel: "银行卡", status: "已分类", occurredAt: "4月28日" },
  { id: "7", title: "便利店", amount: 31.5, kind: "expense", category: "未分类", channel: "支付宝", status: "待分类", occurredAt: "4月28日" }
];

const initialIntegrations: Integration[] = [
  { id: "wechat", name: "微信支付", status: "已授权", syncedToday: 18, enabled: true },
  { id: "bank", name: "银行卡", status: "2 张卡片", syncedToday: 6, enabled: true },
  { id: "alipay", name: "支付宝", status: "待接入", syncedToday: 0, enabled: false }
];

type FinanceContextValue = {
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  integrations: Integration[];
  setIntegrations: Dispatch<SetStateAction<Integration[]>>;
  addTransaction: (input: Omit<Transaction, "id" | "occurredAt" | "status"> & { status?: Transaction["status"] }) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: PropsWithChildren) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      setTransactions,
      integrations,
      setIntegrations,
      addTransaction(input) {
        const now = new Date();
        setTransactions((current) => [
          {
            id: String(now.getTime()),
            occurredAt: "刚刚",
            status: input.status ?? "已分类",
            ...input
          },
          ...current
        ]);
      }
    }),
    [integrations, transactions]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value) {
    throw new Error("useFinance must be used inside FinanceProvider");
  }
  return value;
}

export function formatMoney(value: number) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export function signedAmount(item: Transaction) {
  return `${item.kind === "income" ? "+" : "-"}${formatMoney(item.amount)}`;
}

export function markerFor(title: string) {
  return title.trim().slice(0, 1) || "记";
}
