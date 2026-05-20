import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { env } from "../config/env";
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
  return request<{ message: string }>(`${env.authBasePath}/sms/send`, {
    method: "POST",
    data: { phone }
  });
}

export async function loginWithSms(phone: string, code: string) {
  return request<AuthResult>(`${env.authBasePath}/sms/login`, {
    method: "POST",
    data: { phone, code }
  });
}

export async function loginWithPassword(account: string, password: string) {
  return request<AuthResult>(`${env.authBasePath}/login`, {
    method: "POST",
    data: { account, password }
  });
}

export async function registerWithPhone(phone: string, code: string, password: string) {
  return request<AuthResult>(`${env.authBasePath}/register`, {
    method: "POST",
    data: { phone, code, password }
  });
}

export async function loginWithWechat(code: string) {
  return request<AuthResult>(`${env.authBasePath}/wechat`, {
    method: "POST",
    data: { code }
  });
}

export async function getMe(token: string) {
  return request<User>(`${env.authBasePath}/me`, { token });
}
