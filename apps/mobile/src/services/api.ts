import { request as commonRequest } from "@sycsq/common";
import { router } from "expo-router";
import { env } from "../config/env";
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from "../storage/tokenStorage";

export const API_BASE_URL = env.apiBaseUrl;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestOptions = {
  method?: RequestMethod;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  skipAuthRefresh?: boolean;
};

type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
};

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

type AuthSessionAdapter = {
  getAccessToken: () => string | null;
  setAccessToken: (accessToken: string | null) => void;
  clearSessionState: () => void;
};

let refreshPromise: Promise<string | null> | null = null;
let authSessionAdapter: AuthSessionAdapter = {
  getAccessToken: () => null,
  setAccessToken: () => undefined,
  clearSessionState: () => undefined
};

export class ApiError extends Error {
  constructor(
    message: string,
    public code = "REQUEST_ERROR",
    public status?: number
  ) {
    super(message);
  }
}

export function configureAuthSessionAdapter(adapter: AuthSessionAdapter) {
  authSessionAdapter = adapter;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await performRequest<T>(path, options);
  } catch (error) {
    const apiError = toApiError(error);
    if (shouldRefresh(apiError, options)) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return performRequest<T>(path, { ...options, skipAuthRefresh: true });
      }
      await clearSession();
    }
    throw apiError;
  }
}

async function performRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = options.auth === false ? null : authSessionAdapter.getAccessToken();
  const response = await commonRequest<ApiEnvelope<T> | T>(
    {
      url: path,
      method: options.method ?? "GET",
      data: options.data,
      params: options.params,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    },
    {
      apiUrl: API_BASE_URL,
      isTransformResponse: false,
      joinTime: false
    }
  );

  return unwrapResponse(response);
}

function unwrapResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "code" in response &&
    "message" in response &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
}

function shouldRefresh(error: ApiError, options: RequestOptions) {
  return options.auth !== false && !options.skipAuthRefresh && error.status === 401;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessTokenOnce().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function refreshAccessTokenOnce() {
  const refreshToken = await loadRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await requestRefresh(refreshToken);
    await saveRefreshToken(tokens.refreshToken);
    authSessionAdapter.setAccessToken(tokens.accessToken);
    return tokens.accessToken;
  } catch {
    await clearSession();
    return null;
  }
}

async function requestRefresh(refreshToken: string) {
  const response = await commonRequest<ApiEnvelope<RefreshResult>>(
    {
      url: `${env.authBasePath}/refresh`,
      method: "POST",
      data: { refreshToken },
      headers: {
        "Content-Type": "application/json"
      }
    },
    {
      apiUrl: API_BASE_URL,
      isTransformResponse: false,
      joinTime: false
    }
  );
  return unwrapResponse(response);
}

async function clearSession() {
  await clearRefreshToken();
  authSessionAdapter.clearSessionState();
  router.replace("/(auth)/login");
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const status = getStatus(error);
  const responseData = getResponseData(error);
  const code = typeof responseData?.code === "string" ? responseData.code : "REQUEST_ERROR";
  const message =
    typeof responseData?.message === "string"
      ? responseData.message
      : typeof responseData?.detail === "string"
        ? responseData.detail
        : error instanceof Error
          ? error.message
          : "请求失败";

  return new ApiError(message, code, status);
}

function getStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  return (error as { response?: { status?: number } }).response?.status;
}

function getResponseData(error: unknown): { code?: unknown; message?: unknown; detail?: unknown } | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const response = (error as { response?: { data?: unknown } }).response;
  return typeof response?.data === "object" && response.data !== null ? response.data : undefined;
}
