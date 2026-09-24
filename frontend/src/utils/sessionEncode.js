const SALT = import.meta.env.VITE_STORAGE_KEY;

const encode = (value) => btoa(`${SALT}:${String(value)}`);

const decode = (encoded) => {
  try {
    return atob(encoded).replace(`${SALT}:`, "");
  } catch {
    return null;
  }
};

export const storeSessionItem = (key, value) => {
  sessionStorage.setItem(key, encode(value));
};

export const getSessionItem = (key) => {
  const raw = sessionStorage.getItem(key);
  return raw ? decode(raw) : null;
};

export const removeSessionItem = (key) => sessionStorage.removeItem(key);