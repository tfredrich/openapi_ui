export type RequestOptions = {
  baseUrl: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

import { getAuthorizationHeader, isOAuthEnabled, startOAuthLogin } from "./oauth";
import { getDevBypassAuthorizationHeader, isDevAuthBypassEnabled } from "./devAuthBypass";
import { useConfigStore } from "../state/useConfigStore";

export async function apiRequest<T = unknown>(options: RequestOptions): Promise<T> {
  const securityConfig = useConfigStore.getState().config?.security_config;
  const devBypassHeader = getDevBypassAuthorizationHeader(securityConfig);
  if (isDevAuthBypassEnabled()) {
    if (!devBypassHeader) {
      throw new Error(
        "API requests are disabled while VITE_DEV_AUTH_BYPASS is enabled unless security_config.dev_bypass.access_token is set"
      );
    }
  }

  const { baseUrl, path, method = "GET", headers, query, body } = options;
  const url = new URL(path, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  let authHeader: string | undefined = devBypassHeader ?? undefined;
  if (!authHeader && isOAuthEnabled()) {
    const header = await getAuthorizationHeader();
    if (!header) {
      await startOAuthLogin();
      throw new Error("Not authenticated");
    }
    authHeader = header;
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
