import { request as commonRequest } from "@sycsq/common";
import { env } from "../config/env";

export const API_BASE_URL = env.apiBaseUrl;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestOptions = {
  method?: RequestMethod;
  data?: unknown;
  params?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await commonRequest<T>(
      {
        url: path,
        method: options.method ?? "GET",
        data: options.data,
        params: options.params,
        headers: {
          "Content-Type": "application/json",
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...options.headers
        }
      },
      {
        apiUrl: API_BASE_URL,
        isTransformResponse: false,
        joinTime: false
      }
    );
  } catch (error) {
    const responseData = getResponseData(error);
    const detail = responseData?.detail;
    throw new Error(typeof detail === "string" ? detail : error instanceof Error ? error.message : "Request failed");
  }
}

function getResponseData(error: unknown): { detail?: unknown } | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const response = (error as { response?: { data?: unknown } }).response;
  return typeof response?.data === "object" && response.data !== null ? response.data : undefined;
}
