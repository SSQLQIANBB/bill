import { env } from "../config/env";
import { request } from "./api";

export type User = {
  id: number;
  phone?: string | null;
  email?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export async function sendSmsCode(phone: string) {
  return request<{ message: string }>(`${env.authBasePath}/sms/send`, {
    auth: false,
    method: "POST",
    data: { phone }
  });
}

export async function loginWithSms(phone: string, code: string) {
  return request<AuthResult>(`${env.authBasePath}/sms/login`, {
    auth: false,
    skipAuthRefresh: true,
    method: "POST",
    data: { phone, code }
  });
}

export async function loginWithPassword(account: string, password: string) {
  return request<AuthResult>(`${env.authBasePath}/login`, {
    auth: false,
    skipAuthRefresh: true,
    method: "POST",
    data: { account, password }
  });
}

export async function registerWithPhone(phone: string, code: string, password: string) {
  return request<AuthResult>(`${env.authBasePath}/register`, {
    auth: false,
    skipAuthRefresh: true,
    method: "POST",
    data: { phone, code, password }
  });
}

export async function loginWithWechat(code: string) {
  return request<AuthResult>(`${env.authBasePath}/wechat`, {
    auth: false,
    skipAuthRefresh: true,
    method: "POST",
    data: { code }
  });
}

export async function refreshSession(refreshToken: string) {
  return request<AuthResult>(`${env.authBasePath}/refresh`, {
    auth: false,
    skipAuthRefresh: true,
    method: "POST",
    data: { refreshToken }
  });
}

export async function logoutWithRefreshToken(refreshToken: string | null) {
  if (!refreshToken) {
    return;
  }
  await request<void>(`${env.authBasePath}/logout`, {
    auth: false,
    skipAuthRefresh: true,
    method: "POST",
    data: { refreshToken }
  });
}

export async function getMe() {
  return request<User>(`${env.authBasePath}/me`);
}
