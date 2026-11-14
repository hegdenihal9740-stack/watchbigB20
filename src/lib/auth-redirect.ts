const APP_ORIGIN = "https://bigb.invalid";
const DEFAULT_POST_AUTH_PATH = "/";
const OAUTH_RETURN_STORAGE_KEY = "pf-auth-return-path";
const LAST_VISITED_PATH_STORAGE_KEY = "pf-last-visited-path";
const PASSWORD_RECOVERY_REQUEST_STORAGE_KEY = "pf-password-recovery-request";
const OAUTH_RETURN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RECOVERY_REQUEST_MAX_AGE_MS = 60 * 60 * 1000;

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getBrowserStorage(storageName: "localStorage" | "sessionStorage"): Storage | null {
  try {
    const storage = globalThis[storageName];
    if (!storage || typeof storage.getItem !== "function") return null;
    return storage;
  } catch {
    return null;
  }
}

export function getSafeReturnPath(
  value: string | null | undefined,
  fallback = DEFAULT_POST_AUTH_PATH,
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, APP_ORIGIN);
    if (url.origin !== APP_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getPostAuthPath(returnPath: string | null | undefined): string {
  return getSafeReturnPath(returnPath, DEFAULT_POST_AUTH_PATH);
}

export function isPasswordRecoveryCallbackUrl(url: URL): boolean {
  const hash = new URLSearchParams(url.hash.slice(1));
  return (
    url.searchParams.get("type") === "recovery" ||
    hash.get("type") === "recovery" ||
    url.searchParams.get("recovery") === "1"
  );
}

export function savePasswordRecoveryRequest(storage: KeyValueStorage, now = Date.now()): void {
  storage.setItem(PASSWORD_RECOVERY_REQUEST_STORAGE_KEY, String(now));
}

export function clearPasswordRecoveryRequest(storage: KeyValueStorage): void {
  storage.removeItem(PASSWORD_RECOVERY_REQUEST_STORAGE_KEY);
}

export function isPendingPasswordRecoveryCallback(
  url: URL,
  storage: KeyValueStorage,
  now = Date.now(),
): boolean {
  if (!url.searchParams.has("code")) return false;

  const saved = storage.getItem(PASSWORD_RECOVERY_REQUEST_STORAGE_KEY);
  if (saved === null) return false;

  const requestedAt = Number(saved);
  if (
    !Number.isSafeInteger(requestedAt) ||
    now - requestedAt < 0 ||
    now - requestedAt > PASSWORD_RECOVERY_REQUEST_MAX_AGE_MS
  ) {
    clearPasswordRecoveryRequest(storage);
    return false;
  }
  return true;
}

export function createAuthEntryPath(returnPath: string, profile = false): string {
  const auth = new URL("/auth", APP_ORIGIN);
  if (profile) auth.searchParams.set("view", "profile");
  auth.searchParams.set("next", getPostAuthPath(returnPath));
  return `${auth.pathname}${auth.search}`;
}

export function createAuthCallbackUrl(origin: string, returnPath: string): string {
  const callback = new URL("/auth", origin);
  callback.searchParams.set("next", getSafeReturnPath(returnPath));
  return callback.toString();
}

export function getOAuthCallbackReturnPath(
  callbackUrl: URL,
  savedReturnPath: string | null,
): string | null {
  if (!callbackUrl.searchParams.has("code")) return null;

  const callbackPath = getSafeReturnPath(callbackUrl.searchParams.get("next"), "");
  if (callbackPath) return callbackPath;

  const savedPath = getSafeReturnPath(savedReturnPath, "");
  return savedPath || null;
}

export function saveLastVisitedPath(storage: KeyValueStorage, path: string): void {
  const safePath = getSafeReturnPath(path, "");
  if (safePath && !safePath.startsWith("/auth") && !safePath.startsWith("/reset-password")) {
    storage.setItem(LAST_VISITED_PATH_STORAGE_KEY, safePath);
  }
}

export function readLastVisitedPath(storage: KeyValueStorage): string | null {
  const saved = storage.getItem(LAST_VISITED_PATH_STORAGE_KEY);
  if (!saved) return null;
  const path = getSafeReturnPath(saved, "");
  return path && !path.startsWith("/auth") && !path.startsWith("/reset-password") ? path : null;
}

export function saveOAuthReturnPath(
  storage: KeyValueStorage,
  returnPath: string,
  now = Date.now(),
): void {
  storage.setItem(
    OAUTH_RETURN_STORAGE_KEY,
    JSON.stringify({
      path: getSafeReturnPath(returnPath, DEFAULT_POST_AUTH_PATH),
      createdAt: now,
    }),
  );
}

export function readOAuthReturnPath(storage: KeyValueStorage, now = Date.now()): string | null {
  const saved = storage.getItem(OAUTH_RETURN_STORAGE_KEY);
  if (saved === null) return null;

  try {
    const value: unknown = JSON.parse(saved);
    if (typeof value !== "object" || value === null) return null;
    if (!("path" in value) || typeof value.path !== "string") return null;
    if (!("createdAt" in value) || typeof value.createdAt !== "number") return null;
    if (now - value.createdAt < 0 || now - value.createdAt > OAUTH_RETURN_MAX_AGE_MS) return null;
    return getSafeReturnPath(value.path, DEFAULT_POST_AUTH_PATH);
  } catch {
    return null;
  }
}

export function consumeOAuthReturnPath(storage: KeyValueStorage, now = Date.now()): string | null {
  const saved = storage.getItem(OAUTH_RETURN_STORAGE_KEY);
  const returnPath = readOAuthReturnPath(storage, now);
  if (saved !== null) storage.removeItem(OAUTH_RETURN_STORAGE_KEY);
  return returnPath;
}

export function saveBrowserOAuthReturnPath(returnPath: string, now = Date.now()): void {
  const local = getBrowserStorage("localStorage");
  if (local) saveOAuthReturnPath(local, returnPath, now);
  try {
    const session = getBrowserStorage("sessionStorage");
    if (session) saveOAuthReturnPath(session, returnPath, now);
  } catch {
    /* Some mobile browsers restrict session storage. */
  }
}

export function readBrowserOAuthReturnPath(now = Date.now()): string | null {
  const local = getBrowserStorage("localStorage");
  const localPath = local ? readOAuthReturnPath(local, now) : null;
  if (localPath) return localPath;
  try {
    const session = getBrowserStorage("sessionStorage");
    return session ? readOAuthReturnPath(session, now) : null;
  } catch {
    return null;
  }
}

export function consumeBrowserOAuthReturnPath(now = Date.now()): string | null {
  const returnPath = readBrowserOAuthReturnPath(now);
  const local = getBrowserStorage("localStorage");
  if (local) local.removeItem(OAUTH_RETURN_STORAGE_KEY);
  try {
    const session = getBrowserStorage("sessionStorage");
    if (session) session.removeItem(OAUTH_RETURN_STORAGE_KEY);
  } catch {
    /* Session storage is optional. */
  }
  return returnPath;
}
