import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/Text";
import { RootStackParamList } from "../navigation/RootNavigator";
import { registerWithPhone, sendSmsCode, useAuth } from "../services/auth";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { setAuth } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSendCode() {
    const normalizedPhone = phone.trim();
    if (normalizedPhone.length < 6) {
      Alert.alert("无法发送验证码", "请输入正确的手机号。");
      return;
    }

    setSending(true);
    try {
      await sendSmsCode(normalizedPhone);
      setCountdown(60);
      Alert.alert("验证码已发送", "开发环境默认验证码为 123456。");
    } catch (error) {
      Alert.alert("发送失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setSending(false);
    }
  }

  async function handleRegister() {
    const normalizedPhone = phone.trim();
    if (normalizedPhone.length < 6 || code.trim().length < 4 || password.length < 8) {
      Alert.alert("无法创建账户", "请填写手机号、验证码，并设置至少 8 位密码。");
      return;
    }
    if (!accepted) {
      Alert.alert("需要同意协议", "请先阅读并同意用户协议与隐私政策。");
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerWithPhone(normalizedPhone, code.trim(), password);
      setAuth({ token: result.accessToken, user: result.user });
    } catch (error) {
      Alert.alert("注册失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.logo}>
          <AppText style={styles.logoText}>账</AppText>
        </View>

        <View style={styles.header}>
          <AppText style={styles.title}>创建账户</AppText>
          <AppText style={styles.subtitle}>开启自动同步，3 分钟完成记账配置</AppText>
        </View>

        <View style={styles.card}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
            keyboardType="phone-pad"
            placeholder="手机号"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <View style={styles.codeRow}>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholder="验证码"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.codeInput]}
            />
            <Pressable
              style={[styles.codeButton, (sending || countdown > 0) && styles.disabled]}
              onPress={handleSendCode}
              disabled={sending || countdown > 0}
            >
              {sending ? (
                <ActivityIndicator color={colors.brand} />
              ) : (
                <AppText style={styles.codeText}>{countdown > 0 ? `${countdown}s` : "获取验证码"}</AppText>
              )}
            </Pressable>
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="设置密码"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />

          <Pressable style={styles.agreementRow} onPress={() => setAccepted((value) => !value)}>
            <View style={[styles.checkbox, !accepted && styles.checkboxOff]}>
              {accepted ? <AppText style={styles.checkmark}>✓</AppText> : null}
            </View>
            <AppText style={styles.agreementText}>我已阅读并同意用户协议与隐私政策</AppText>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, submitting && styles.disabled]}
            onPress={handleRegister}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color={colors.white} /> : <AppText style={styles.primaryText}>创建账户</AppText>}
          </Pressable>
        </View>

        <View style={styles.noticeCard}>
          <AppText style={styles.noticeTitle}>本地加密授权</AppText>
          <AppText style={styles.noticeText}>仅读取账单信息，不保存支付密码</AppText>
        </View>

        <Pressable style={styles.footerLink} onPress={() => navigation.navigate("Login")}>
          <AppText style={styles.linkText}>已有账号？去登录</AppText>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8f4"
  },
  container: {
    flex: 1,
    paddingHorizontal: 24
  },
  logo: {
    width: 56,
    height: 56,
    marginTop: 40,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4e8"
  },
  logoText: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: "700"
  },
  header: {
    marginTop: 24
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: "700"
  },
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  card: {
    marginTop: 34,
    padding: 24,
    gap: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#eee7dd",
    backgroundColor: colors.white
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee7dd",
    backgroundColor: "#f7f8f4",
    paddingHorizontal: 20,
    color: colors.text,
    fontSize: 14
  },
  codeRow: {
    flexDirection: "row",
    gap: 12
  },
  codeInput: {
    flex: 1
  },
  codeButton: {
    width: 96,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffd7ad",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4e8"
  },
  codeText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700"
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 2
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand
  },
  checkboxOff: {
    borderWidth: 1,
    borderColor: "#eee7dd",
    backgroundColor: colors.white
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700"
  },
  agreementText: {
    flex: 1,
    color: colors.muted,
    fontSize: 12
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand
  },
  disabled: {
    opacity: 0.65
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700"
  },
  noticeCard: {
    marginTop: 36,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#ecfdf5"
  },
  noticeTitle: {
    color: "#047857",
    fontSize: 15,
    fontWeight: "700"
  },
  noticeText: {
    marginTop: 8,
    color: "#047857",
    fontSize: 12
  },
  footerLink: {
    marginTop: "auto",
    marginBottom: 46,
    alignItems: "center"
  },
  linkText: {
    color: "#9a5a1f",
    fontSize: 13
  }
});
