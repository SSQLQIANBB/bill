import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/Text";
import { loginWithPassword } from "../services/auth";
import { startAuthenticatedSession } from "../services/session";
import { colors } from "../theme/colors";

export function LoginScreen() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) {
      return;
    }

    const normalizedAccount = account.trim();
    const validationError = validateLoginForm(normalizedAccount, password);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setLoading(true);
    try {
      const result = await loginWithPassword(normalizedAccount, password);
      await startAuthenticatedSession(result);
      router.replace("/(tabs)/overview");
    } catch (error) {
      const message = error instanceof Error ? error.message : "请稍后重试。";
      setFormError(message);
      Alert.alert("登录失败", message);
    } finally {
      setLoading(false);
    }
  }

  async function handleWechatLogin() {
    Alert.alert("暂未开通", "微信授权登录需要接入真实开放平台授权后启用。");
  }

  function handleAlipayLogin() {
    Alert.alert("暂未开通", "支付宝授权登录需要接入开放平台后启用。");
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
              <AppText style={styles.title}>欢迎回来</AppText>
              <AppText style={styles.subtitle}>登录后继续同步和管理你的自动账单</AppText>
            </View>

            <View style={styles.card}>
              <TextInput
                value={account}
                onChangeText={(value) => {
                  setAccount(value);
                  setFormError("");
                }}
                autoCapitalize="none"
                autoComplete="username"
                editable={!loading}
                keyboardType="email-address"
                placeholder="手机号 / 邮箱"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setFormError("");
                }}
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
                placeholder="密码"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
              />
              {formError ? <AppText style={styles.errorText}>{formError}</AppText> : null}
              <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.white} /> : <AppText style={styles.primaryText}>登录</AppText>}
              </Pressable>
            </View>

            <Pressable style={styles.forgotButton} onPress={() => router.push("/(auth)/register")}>
              <AppText style={styles.linkText}>忘记密码？用验证码重新创建密码</AppText>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <AppText style={styles.dividerText}>或使用</AppText>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton} onPress={handleWechatLogin} disabled={loading}>
                <AppText style={styles.wechatText}>微信</AppText>
              </Pressable>
              <Pressable style={styles.socialButton} onPress={handleAlipayLogin} disabled={loading}>
                <AppText style={styles.alipayText}>支付宝</AppText>
              </Pressable>
            </View>

            <Pressable style={styles.footerLink} onPress={() => router.push("/(auth)/register")}>
              <AppText style={styles.linkText}>还没有账号？立即注册</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function validateLoginForm(account: string, password: string) {
  if (!account) {
    return "请输入账号。";
  }
  if (!password) {
    return "请输入密码。";
  }
  if (password !== password.trim()) {
    return "密码不能包含首尾空格。";
  }
  if (password.length < 8) {
    return "密码至少需要 8 位。";
  }
  if (!isSupportedAccount(account)) {
    return "账号格式不正确，请输入中国大陆手机号或邮箱。";
  }
  return null;
}

function isSupportedAccount(account: string) {
  if (account.includes("@")) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(account);
  }

  // 当前产品面向中国用户，账号登录先按中国大陆手机号校验。
  return /^1[3-9]\d{9}$/.test(account);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8f4"
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
    width: 64,
    height: 64,
    marginTop: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4e8"
  },
  logoText: {
    color: colors.brand,
    fontSize: 24,
    fontWeight: "700"
  },
  header: {
    marginTop: 28
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
    marginTop: 42,
    padding: 22,
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee7dd",
    backgroundColor: colors.white
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee7dd",
    backgroundColor: "#f7f8f4",
    paddingHorizontal: 20,
    color: colors.text,
    fontSize: 14
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
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 8
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 28
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee7dd"
  },
  dividerText: {
    color: "#9ca3af",
    fontSize: 12
  },
  socialRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 30
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee7dd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white
  },
  wechatText: {
    color: colors.wechat,
    fontSize: 14,
    fontWeight: "700"
  },
  alipayText: {
    color: colors.alipay,
    fontSize: 14,
    fontWeight: "700"
  },
  footerLink: {
    marginTop: "auto",
    paddingTop: 28,
    paddingBottom: 12,
    alignItems: "center"
  },
  linkText: {
    color: "#9a5a1f",
    fontSize: 13
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17
  }
});
