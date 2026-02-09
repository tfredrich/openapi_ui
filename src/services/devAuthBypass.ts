import { SecurityConfig } from "../../schemas/config.schema";

const devBypassEnabled = import.meta.env.VITE_DEV_AUTH_BYPASS === "true";

if (devBypassEnabled && !import.meta.env.DEV) {
  throw new Error("VITE_DEV_AUTH_BYPASS can only be enabled in development");
}

export function isDevAuthBypassEnabled() {
  return import.meta.env.DEV && devBypassEnabled;
}

export function assertDevBypassConfigAllowed(securityConfig?: SecurityConfig) {
  if (!import.meta.env.DEV && securityConfig?.dev_bypass) {
    throw new Error("security_config.dev_bypass can only be set in development");
  }
}

export function getDevBypassAuthorizationHeader(securityConfig?: SecurityConfig) {
  if (!isDevAuthBypassEnabled()) {
    return null;
  }
  const rawToken = securityConfig?.dev_bypass?.access_token?.trim();
  if (!rawToken) {
    return null;
  }
  if (rawToken.includes(" ")) {
    return rawToken;
  }
  const tokenType = securityConfig?.dev_bypass?.token_type?.trim() || "Bearer";
  return `${tokenType} ${rawToken}`;
}
