import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";
import { SecurityConfig } from "../../schemas/config.schema";
import { useAuthStore } from "../state/useAuthStore";

const ACCESS_TOKEN_COOKIE = "oidc_access_token";
const REFRESH_TOKEN_COOKIE = "oidc_refresh_token";
const EXPIRES_AT_COOKIE = "oidc_expires_at";
const TOKEN_TYPE_COOKIE = "oidc_token_type";

let oauthConfig: SecurityConfig | undefined;
let userManager: UserManager | null = null;
let removeUserLoaded: (() => void) | null = null;
let removeUserUnloaded: (() => void) | null = null;
let refreshPromise: Promise<User | null> | null = null;

function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function getCookie(name: string) {
  const cookies = document.cookie.split(";").map((part) => part.trim());
  for (const cookie of cookies) {
    if (!cookie) continue;
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function setTokenCookies(user: User | null) {
  if (!user) {
    clearTokens();
    return;
  }
  const expiresIn = user.expires_in;
  const maxAge = typeof expiresIn === "number" ? Math.max(expiresIn - 30, 0) : undefined;
  const expiresAtMs = user.expires_at ? user.expires_at * 1000 : undefined;
  setCookie(ACCESS_TOKEN_COOKIE, user.access_token, maxAge);
  if (user.refresh_token) {
    setCookie(REFRESH_TOKEN_COOKIE, user.refresh_token);
  }
  if (expiresAtMs) {
    setCookie(EXPIRES_AT_COOKIE, String(expiresAtMs), maxAge);
  }
  setCookie(TOKEN_TYPE_COOKIE, user.token_type ?? "Bearer");
  useAuthStore.getState().setAccessToken(user.access_token);
}

function getTokenFromCookies() {
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
  if (!accessToken) return null;
  const tokenType = getCookie(TOKEN_TYPE_COOKIE) ?? "Bearer";
  const expiresAtRaw = getCookie(EXPIRES_AT_COOKIE);
  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : undefined;
  if (expiresAt && expiresAt <= Date.now()) {
    return null;
  }
  return { accessToken, tokenType };
}

export function clearTokens() {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
  deleteCookie(EXPIRES_AT_COOKIE);
  deleteCookie(TOKEN_TYPE_COOKIE);
  useAuthStore.getState().setAccessToken(null);
}

function buildUserManager(config: SecurityConfig) {
  const redirectUri = `${window.location.origin}/oauth/callback`;
  const silentRedirectUri = `${window.location.origin}/oauth/silent`;
  const scope = config.scopes?.length ? config.scopes.join(" ") : "openid profile";
  const authority = config.authority ?? window.location.origin;

  return new UserManager({
    authority,
    client_id: config.client_id ?? "",
    redirect_uri: redirectUri,
    silent_redirect_uri: silentRedirectUri,
    response_type: "code",
    scope,
    loadUserInfo: false,
    automaticSilentRenew: true,
    extraQueryParams: config.audience ? { audience: config.audience } : undefined,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  });
}

export function setOAuthConfig(config?: SecurityConfig) {
  oauthConfig = config;
  removeUserLoaded?.();
  removeUserUnloaded?.();
  removeUserLoaded = null;
  removeUserUnloaded = null;
  userManager = null;

  if (!config || config.type !== "oauth2") {
    return;
  }

  userManager = buildUserManager(config);
  removeUserLoaded = userManager.events.addUserLoaded((user) => setTokenCookies(user));
  removeUserUnloaded = userManager.events.addUserUnloaded(() => clearTokens());
  userManager.startSilentRenew();

  void userManager.getUser().then((user) => {
    if (user) {
      setTokenCookies(user);
    }
  });
}

export function isOAuthEnabled() {
  return oauthConfig?.type === "oauth2";
}

export async function startOAuthLogin(returnTo = window.location.pathname + window.location.search) {
  if (!userManager) return;
  await userManager.signinRedirect({ state: { returnTo } });
}

export async function completeOAuthLogin(url = window.location.href) {
  if (!userManager) {
    throw new Error("OAuth not configured");
  }
  const user = await userManager.signinRedirectCallback(url);
  setTokenCookies(user);
  const state = user.state as { returnTo?: string } | null;
  return state?.returnTo ?? "/";
}

export async function completeSilentLogin(url = window.location.href) {
  if (!userManager) return;
  await userManager.signinSilentCallback(url);
}

async function refreshWithUserManager() {
  if (!userManager) return null;
  if (!refreshPromise) {
    refreshPromise = userManager
      .signinSilent()
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function getAuthorizationHeader() {
  const cookieToken = getTokenFromCookies();
  if (cookieToken) {
    return `${cookieToken.tokenType} ${cookieToken.accessToken}`;
  }
  if (!userManager) return null;
  const user = await userManager.getUser();
  if (user && !user.expired) {
    setTokenCookies(user);
    return `${user.token_type ?? "Bearer"} ${user.access_token}`;
  }
  const refreshed = await refreshWithUserManager();
  if (refreshed && refreshed.access_token) {
    setTokenCookies(refreshed);
    return `${refreshed.token_type ?? "Bearer"} ${refreshed.access_token}`;
  }
  return null;
}

export async function ensureAuthenticated() {
  if (!isOAuthEnabled()) return true;
  const header = await getAuthorizationHeader();
  if (header) return true;
  await startOAuthLogin();
  return false;
}
