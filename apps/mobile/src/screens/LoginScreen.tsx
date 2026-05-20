import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/Text";
import { RootStackParamList } from "../navigation/RootNavigator";
import { loginWithPassword, loginWithWechat, useAuth } from "../services/auth";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { setAuth } = useAuth();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const normalizedAccount = account.trim();
    if (normalizedAccount.length < 6 || password.length < 8) {
      Alert.alert("无法登录", "请输入正确的手机号/邮箱和至少 8 位密码。");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(normalizedAccount, password);
      setAuth({ token: result.accessToken, user: result.user });
    } catch (error) {
      Alert.alert("登录失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function handleWechatLogin() {
    setLoading(true);
    try {
      const result = await loginWithWechat("dev-wechat-code");
      setAuth({ token: result.accessToken, user: result.user });
    } catch (error) {
      Alert.alert("微信登录失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  function handleAlipayLogin() {
    Alert.alert("暂未开通", "支付宝授权登录需要接入开放平台后启用。");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
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
            onChangeText={setAccount}
            autoCapitalize="none"
            autoComplete="username"
            keyboardType="email-address"
            placeholder="手机号 / 邮箱"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoComplete="password"
            placeholder="密码"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />
          <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <AppText style={styles.primaryText}>登录</AppText>}
          </Pressable>
        </View>

        <Pressable style={styles.forgotButton} onPress={() => navigation.navigate("Register")}>
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

        <Pressable style={styles.footerLink} onPress={() => navigation.navigate("Register")}>
          <AppText style={styles.linkText}>还没有账号？立即注册</AppText>
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
    borderRadius: 16,
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
    marginBottom: 46,
    alignItems: "center"
  },
  linkText: {
    color: "#9a5a1f",
    fontSize: 13
  }
});
