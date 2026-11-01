import Cookies from "js-cookie";

export const AUTH_TOKEN_COOKIE = "token";
export const IMPERSONATION_ORIGINAL_TOKEN_COOKIE = "director_original_token";

const cookieOptions = () => ({
  expires: 1,
  path: "/",
  sameSite: "lax",
  secure: window.location.protocol === "https:",
});

const getTokenExpiration = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const expiration = JSON.parse(decoded).exp;

    return typeof expiration === "number" ? new Date(expiration * 1000) : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration !== null && expiration.getTime() <= Date.now();
};

export const getTokenCookie = (name = AUTH_TOKEN_COOKIE) => Cookies.get(name);

export const setTokenCookie = (name, token) => {
  const expiration = getTokenExpiration(token);
  if (isTokenExpired(token)) {
    throw new Error("Cannot store an expired authentication token");
  }

  const options = cookieOptions();
  Cookies.set(name, token, {
    ...options,
    expires: expiration || options.expires,
  });
};

export const removeTokenCookie = (name = AUTH_TOKEN_COOKIE) => {
  Cookies.remove(name, { path: "/" });
};

export const getAuthToken = () => getTokenCookie();

export const setAuthToken = (token) => setTokenCookie(AUTH_TOKEN_COOKIE, token);

export const removeAuthToken = () => removeTokenCookie(AUTH_TOKEN_COOKIE);
