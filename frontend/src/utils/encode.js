
import {
  AUTH_TOKEN_COOKIE,
  getAuthToken,
  getTokenCookie,
  IMPERSONATION_ORIGINAL_TOKEN_COOKIE,
  isTokenExpired,
  setAuthToken,
  setTokenCookie,
} from "./authToken";

const SALT = import.meta.env.VITE_STORAGE_KEY;

const encode = (value) => {
  const bytes = new TextEncoder().encode(`${SALT}:${String(value)}`);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
};

const decode = (encoded) => {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const prefix = `${SALT}:`;
    return decoded.startsWith(prefix) ? decoded.slice(prefix.length) : null;
  } catch {
    return null;
  }
};

export const storeItem = (key, value) => {
  localStorage.setItem(key, encode(value));
};

export const getItem = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return decode(raw);
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
};
export const clearStore = () => localStorage.clear();

export const migrateSessionStorage = () => {
  const legacySessionItems = Array.from(
    { length: sessionStorage.length },
    (_, index) => {
      const key = sessionStorage.key(index);
      return key === null ? null : [key, sessionStorage.getItem(key)];
    },
  ).filter((item) => item !== null);

  const legacyLocalToken = localStorage.getItem("token");
  if (legacyLocalToken !== null) {
    const token = decode(legacyLocalToken) ?? legacyLocalToken;
    if (token && !getAuthToken() && !isTokenExpired(token)) {
      setAuthToken(token);
    }
    localStorage.removeItem("token");
  }

  const legacyLocalImpersonationToken = localStorage.getItem(
    IMPERSONATION_ORIGINAL_TOKEN_COOKIE,
  );
  if (legacyLocalImpersonationToken !== null) {
    const token =
      decode(legacyLocalImpersonationToken) ?? legacyLocalImpersonationToken;
    if (
      !getTokenCookie(IMPERSONATION_ORIGINAL_TOKEN_COOKIE) &&
      !isTokenExpired(token)
    ) {
      setTokenCookie(IMPERSONATION_ORIGINAL_TOKEN_COOKIE, token);
    }
    localStorage.removeItem(IMPERSONATION_ORIGINAL_TOKEN_COOKIE);
  }

  for (const [key, value] of legacySessionItems) {
    if (key === "token" || key === IMPERSONATION_ORIGINAL_TOKEN_COOKIE) {
      const token = value === null ? null : decode(value) ?? value;
      const cookieName =
        key === AUTH_TOKEN_COOKIE ? AUTH_TOKEN_COOKIE : IMPERSONATION_ORIGINAL_TOKEN_COOKIE;
      if (token) {
        if (
          cookieName === AUTH_TOKEN_COOKIE &&
          !getAuthToken() &&
          !isTokenExpired(token)
        ) {
          setAuthToken(token);
        } else if (
          cookieName !== AUTH_TOKEN_COOKIE &&
          !getTokenCookie(cookieName) &&
          !isTokenExpired(token)
        ) {
          setTokenCookie(cookieName, token);
        }
      }
    } else if (value !== null && localStorage.getItem(key) === null) {
      storeItem(key, decode(value) ?? value);
    }

    sessionStorage.removeItem(key);
  }
};