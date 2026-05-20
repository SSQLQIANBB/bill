type EnvKey =
  | "EXPO_PUBLIC_API_PROTOCOL"
  | "EXPO_PUBLIC_API_HOST"
  | "EXPO_PUBLIC_API_PORT"
  | "EXPO_PUBLIC_API_BASE_PATH"
  | "EXPO_PUBLIC_API_BASE_URL"
  | "EXPO_PUBLIC_AUTH_BASE_PATH"
  | "EXPO_PUBLIC_FINANCE_BASE_PATH";

function readEnv(key: EnvKey, fallback = "") {
  return process.env[key] || fallback;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePath(value: string) {
  if (!value) {
    return "";
  }
  return value.startsWith("/") ? value : `/${value}`;
}

function buildApiBaseUrl() {
  const explicit = readEnv("EXPO_PUBLIC_API_BASE_URL");
  if (explicit) {
    return trimTrailingSlash(explicit);
  }

  const protocol = readEnv("EXPO_PUBLIC_API_PROTOCOL", "http");
  const host = readEnv("EXPO_PUBLIC_API_HOST", "127.0.0.1");
  const port = readEnv("EXPO_PUBLIC_API_PORT", "8000");
  const basePath = normalizePath(readEnv("EXPO_PUBLIC_API_BASE_PATH"));
  const portSegment = port ? `:${port}` : "";

  return trimTrailingSlash(`${protocol}://${host}${portSegment}${basePath}`);
}

export const env = {
  apiBaseUrl: buildApiBaseUrl(),
  authBasePath: normalizePath(readEnv("EXPO_PUBLIC_AUTH_BASE_PATH", "/api/v1/auth")),
  financeBasePath: normalizePath(readEnv("EXPO_PUBLIC_FINANCE_BASE_PATH", "/api/v1/finance"))
};
