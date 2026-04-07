
// utils/encode.js

const SALT = import.meta.env.VITE_STORAGE_KEY;

const encode = (value) => {
  return btoa(SALT + ":" + String(value));
};

const decode = (encoded) => {
  try {
    const decoded = atob(encoded);
    return decoded.replace(`${SALT}:`, "");
  } catch {
    return null;
  }
};

export const storeItem = (key, value) => {
  localStorage.setItem(key, encode(value));
};


console.log('secrete key', SALT)
export const getItem = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return decode(raw);
};

export const removeItem = (key) => localStorage.removeItem(key);
export const clearStore = () => localStorage.clear();