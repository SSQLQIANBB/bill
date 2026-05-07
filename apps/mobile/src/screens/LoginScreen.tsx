import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { AppText } from "../components/Text";
import { loginWithSms, loginWithWechat, sendSmsCode, useAuth } from "../services/auth";

export function LoginScreen() {
  const { setAuth } = useAuth();
  const [phone, setPhone] = useState("13800138000");
  const [code, setCode] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function handleSmsLogin() {
    if (!phone || !code) {
      Alert.alert("请补全信息", "请输入手机号和验证码");
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithSms(phone, code);
      setAuth({ token: result.accessToken, user: result.user });
    } catch (error) {
      Alert.alert("登录失败", error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    try {
      await sendSmsCode(phone);
      Alert.alert("验证码已发送", "开发环境默认验证码为 123456");
    } catch (error) {
      Alert.alert("发送失败", error instanceof Error ? error.message : "请稍后重试");
    }
  }

  async function handleWechatLogin() {
    try {
      const result = await loginWithWechat("dev-wechat-code");
      setAuth({ token: result.accessToken, user: result.user });
    } catch (error) {
      Alert.alert("微信登录失败", error instanceof Error ? error.message : "请稍后重试");
    }
  }

  function handleDemoLogin() {
    setAuth({
      token: "demo-token",
      user: { id: 0, phone: phone || "13800138000", nickname: "体验用户", avatarUrl: null }
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <LinearGradient colors={["#fff3e8", "#ffffff"]} style={styles.mark}>
          <Ionicons name="wallet" size={34} color={colors.brand} />
        </LinearGradient>
        <AppText style={styles.title}>智能记账</AppText>
        <AppText style={styles.subtitle}>自动同步微信、支付宝、银行卡和更多支付渠道</AppText>
      </View>

      <View style={styles.form}>
        <AppText style={styles.label}>手机号登录</AppText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="请输入手机号"
          placeholderTextColor={colors.inactive}
          style={styles.input}
        />
        <View style={styles.codeRow}>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="验证码"
            placeholderTextColor={colors.inactive}
            style={[styles.input, styles.codeInput]}
          />
          <Pressable style={styles.codeButton} onPress={handleSendCode}>
            <AppText style={styles.codeText}>获取验证码</AppText>
          </Pressable>
        </View>
        <Pressable style={styles.primaryButton} onPress={handleSmsLogin} disabled={loading}>
          <AppText style={styles.primaryText}>{loading ? "登录中..." : "登录"}</AppText>
        </Pressable>
        <Pressable style={styles.wechatButton} onPress={handleWechatLogin}>
          <Ionicons name="logo-wechat" size={21} color={colors.white} />
          <AppText style={styles.wechatText}>微信授权登录</AppText>
        </Pressable>
        <Pressable style={styles.demoButton} onPress={handleDemoLogin}>
          <AppText style={styles.demoText}>本地体验</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24
  },
  header: {
    paddingTop: 70,
    paddingBottom: 34
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.warmLine,
    marginBottom: 18
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700"
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted
  },
  form: {
    gap: 14
  },
  label: {
    fontSize: 16,
    fontWeight: "700"
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text
  },
  codeRow: {
    flexDirection: "row",
    gap: 10
  },
  codeInput: {
    flex: 1
  },
  codeButton: {
    width: 116,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warmBg,
    borderWidth: 1,
    borderColor: colors.warmLine
  },
  codeText: {
    color: colors.brand,
    fontWeight: "700",
    fontSize: 13
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand
  },
  primaryText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16
  },
  wechatButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.wechat
  },
  wechatText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16
  },
  demoButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  demoText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 14
  }
});
