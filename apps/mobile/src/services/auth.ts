import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { request } from "./api";

export type User = {
  id: number;
  phone?: string | null;
  email?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
};

export type AuthState = {
  token: string | null;
  user: User | null;
};

export const AuthContext = createContext<{
  auth: AuthState;
  setAuth: Dispatch<SetStateAction<AuthState>>;
}>({
  auth: { token: null, user: null },
  setAuth: () => undefined
});

export function useAuth() {
  return useContext(AuthContext);
}

export type AuthResult = { accessToken: string; tokenType: string; user: User };

export async function sendSmsCode(phone: string) {
  return request<{ message: string }>("/api/v1/auth/sms/send", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export async function loginWithSms(phone: string, code: string) {
  return request<AuthResult>("/api/v1/auth/sms/login", {
    method: "POST",
    body: JSON.stringify({ phone, code })
  });
}

export async function loginWithPassword(account: string, password: string) {
  return request<AuthResult>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ account, password })
  });
}

export async function registerWithPhone(phone: string, code: string, password: string) {
  return request<AuthResult>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ phone, code, password })
  });
}

export async function loginWithWechat(code: string) {
  return request<AuthResult>("/api/v1/auth/wechat", {
    method: "POST",
    body: JSON.stringify({ code })
  });
}

export async function getMe(token: string) {
  return request<User>("/api/v1/auth/me", { token });
}
