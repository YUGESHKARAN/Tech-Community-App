import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../../instances/Axiosinstances";

// ── storage keys ──────────────────────────────────────────────────────────────
const COOKIE_KEY          = "token";                   // js-cookie key — your existing auth token
const ORIGINAL_TOKEN_KEY  = "director_original_token"; // sessionStorage — backup during impersonation
const IMPERSONATION_META  = "impersonation_meta";       // sessionStorage — impersonation context

// ── helpers ───────────────────────────────────────────────────────────────────

export const getImpersonationMeta = () => {
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_META);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isImpersonating = () => !!getImpersonationMeta();

/**
 * enterImpersonation
 *
 * 1. Reads the director's current token from the cookie
 * 2. Saves it to sessionStorage as backup
 * 3. Overwrites the cookie with the impersonation token
 *    (same cookie options as login so axiosInstance picks it up automatically)
 * 4. Saves impersonation meta
 * 5. Full page reload to "/"
 */
export const enterImpersonation = (impersonationToken, meta) => {
  const original = Cookies.get(COOKIE_KEY);

  if (!original) {
    throw new Error("No active session to impersonate from");
  }

  // preserve director's original token in sessionStorage
  sessionStorage.setItem(ORIGINAL_TOKEN_KEY, original);
  sessionStorage.setItem(IMPERSONATION_META, JSON.stringify({
    tenantId:   meta.tenantId,
    tenantName: meta.tenantName,
    jti:        meta.jti,
    expiresAt:  meta.expiresAt,
  }));

  // swap cookie — expires in 15 min (matches impersonation token TTL)
  Cookies.set(COOKIE_KEY, impersonationToken, {
    expires: 15 / (24 * 60), // 15 minutes in days
    sameSite: "lax",
  });

  // full reload — all React state clears, axiosInstance picks up new cookie
  window.location.href = "/";
};

/**
 * exitImpersonation
 *
 * 1. Revokes the impersonation token (best-effort)
 * 2. Restores the director's original token from sessionStorage back to cookie
 * 3. Clears sessionStorage impersonation state
 * 4. Navigates back to director console
 */
export const exitImpersonation = async () => {
  const meta     = getImpersonationMeta();
  const original = sessionStorage.getItem(ORIGINAL_TOKEN_KEY);

  // best-effort revocation — never block exit on failure
  if (meta?.jti) {
    try {
      await axiosInstance.post("/bytes/directorAdvanced/impersonation/revoke", {
        jti: meta.jti,
      });
    } catch (err) {
      console.error("Revoke impersonation token failed:", err.message);
    }
  }

  // restore original cookie
  if (original) {
    Cookies.set(COOKIE_KEY, original, {
      expires: 1,        // 1 day — matches your login cookie TTL
      sameSite: "lax",
    });
  } else {
    Cookies.remove(COOKIE_KEY);
  }

  // clear impersonation state from sessionStorage
  sessionStorage.removeItem(ORIGINAL_TOKEN_KEY);
  sessionStorage.removeItem(IMPERSONATION_META);

  // full reload back to director console
  window.location.href = "/director";
};

// ── hook ──────────────────────────────────────────────────────────────────────
const useImpersonation = () => {
  const meta     = getImpersonationMeta();
  const isActive = !!meta;

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!meta?.expiresAt) return 0;
    return Math.max(0, Math.floor((new Date(meta.expiresAt) - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(meta.expiresAt) - Date.now()) / 1000)
      );
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        exitImpersonation();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, meta?.expiresAt]);

  const exit = useCallback(() => exitImpersonation(), []);

  return { isActive, meta, timeLeft, exit };
};

export default useImpersonation;