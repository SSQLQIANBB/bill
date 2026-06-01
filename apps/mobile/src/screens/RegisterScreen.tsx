import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/Text";
import { registerWithPhone, sendSmsCode } from "../services/auth";
import { startAuthenticatedSession } from "../services/session";
import { colors } from "../theme/colors";

export function RegisterScreen() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [formError, setFormError] = useState("");
  const [focusedField, setFocusedField] = useState<"phone" | "code" | "password" | null>(null);
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
    if (!isMainlandPhone(normalizedPhone)) {
      setFormError("请输入正确的中国大陆手机号。");
      return;
    }

    setFormError("");
    setSending(true);
    try {
      await sendSmsCode(normalizedPhone);
      setCountdown(60);
      Alert.alert("验证码已发送", "开发环境默认验证码为 123456。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "请稍后重试。";
      setFormError(message);
      Alert.alert("发送失败", message);
    } finally {
      setSending(false);
    }
  }

  async function handleRegister() {
    const normalizedPhone = phone.trim();
    const validationError = validateRegisterForm(normalizedPhone, code.trim(), password, accepted);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setSubmitting(true);
    try {
      const result = await registerWithPhone(normalizedPhone, code.trim(), password);
      await startAuthenticatedSession(result);
      router.replace("/(tabs)/overview");
    } catch (error) {
      const message = error instanceof Error ? error.message : "请稍后重试。";
      setFormError(message);
      Alert.alert("注册失败", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.shell}>
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
                onChangeText={(value) => {
                  setPhone(value);
                  setFormError("");
                }}
                autoComplete="tel"
                editable={!submitting}
                keyboardType="phone-pad"
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("phone")}
                placeholder="手机号"
                placeholderTextColor={colors.muted}
                style={[styles.input, focusedField === "phone" && styles.fieldFocused, webTextInputReset]}
              />
              <View style={[styles.codeField, focusedField === "code" && styles.fieldFocused]}>
                <TextInput
                  value={code}
                  onChangeText={(value) => {
                    setCode(value);
                    setFormError("");
                  }}
                  editable={!submitting}
                  keyboardType="number-pad"
                  onBlur={() => setFocusedField(null)}
                  onFocus={() => setFocusedField("code")}
                  placeholder="验证码"
                  placeholderTextColor={colors.muted}
                  style={[styles.codeFieldInput, webTextInputReset]}
                />
                <Pressable
                  style={[styles.codeInlineButton, (sending || countdown > 0 || submitting) && styles.disabled]}
                  onPress={handleSendCode}
                  disabled={sending || countdown > 0 || submitting}
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
                onChangeText={(value) => {
                  setPassword(value);
                  setFormError("");
                }}
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!submitting}
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("password")}
                placeholder="设置密码"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={[styles.input, focusedField === "password" && styles.fieldFocused, webTextInputReset]}
              />

              <Pressable style={styles.agreementRow} onPress={() => setAccepted((value) => !value)} disabled={submitting}>
                <View style={[styles.checkbox, !accepted && styles.checkboxOff]}>
                  {accepted ? <AppText style={styles.checkmark}>✓</AppText> : null}
                </View>
                <AppText style={styles.agreementText}>我已阅读并同意用户协议与隐私政策</AppText>
              </Pressable>

              {formError ? <AppText style={styles.errorText}>{formError}</AppText> : null}

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

            <Pressable style={styles.footerLink} onPress={() => router.replace("/(auth)/login")}>
              <AppText style={styles.linkText}>已有账号？去登录</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function validateRegisterForm(phone: string, code: string, password: string, accepted: boolean) {
  if (!isMainlandPhone(phone)) {
    return "请输入正确的中国大陆手机号。";
  }
  if (!code) {
    return "请输入验证码。";
  }
  if (code.length < 4) {
    return "验证码格式不正确。";
  }
  if (!password) {
    return "请设置密码。";
  }
  if (password !== password.trim()) {
    return "密码不能包含首尾空格。";
  }
  if (password.length < 8) {
    return "密码至少需要 8 位。";
  }
  if (!accepted) {
    return "请先阅读并同意用户协议与隐私政策。";
  }
  return null;
}

function isMainlandPhone(phone: string) {
  return /^1[3-9]\d{9}$/.test(phone);
}

const webTextInputReset = Platform.select({
  web: { outlineStyle: "none" } as Record<string, string>,
  default: undefined
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 34
  },
  shell: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    flexGrow: 1
  },
  logo: {
    width: 56,
    height: 56,
    marginTop: 40,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBg
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
    padding: 22,
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    color: colors.text,
    fontSize: 14
  },
  fieldFocused: {
    borderColor: colors.brand
  },
  codeField: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    paddingLeft: 20,
    paddingRight: 8,
    gap: 8
  },
  codeFieldInput: {
    flex: 1,
    minWidth: 0,
    height: 52,
    color: colors.text,
    fontSize: 14
  },
  codeInlineButton: {
    minWidth: 82,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warmLine,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBg
  },
  codeText: {
    color: colors.brand,
    fontSize: 12,
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
    borderColor: colors.line,
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand
  },
  disabled: {
    opacity: 0.58
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700"
  },
  noticeCard: {
    marginTop: 26,
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
    paddingTop: 28,
    paddingBottom: 12,
    alignItems: "center"
  },
  linkText: {
    color: colors.amberText,
    fontSize: 13
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17
  }
});
