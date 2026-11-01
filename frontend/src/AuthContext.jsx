import React, { createContext, useContext, useEffect, useState } from "react";
import {
  clearStore,
  getItem,
  removeItem,
  storeItem,
} from "./utils/encode";
import {
  getAuthToken,
  IMPERSONATION_ORIGINAL_TOKEN_COOKIE,
  removeAuthToken,
  removeTokenCookie,
  setAuthToken,
} from "./utils/authToken";
// import { useNavigate } from "react-router-dom";
// Create context
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  // Initialize isAuthenticated based on localStorage value
  // const [isAuthenticated, setIsAuthenticated] = useState(
  //   () => localStorage.getItem("isAuthenticated") === "true"
  // );

  // const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(getAuthToken()) && getItem("isAuthenticated") === "true";
  });
  const login = async (token = null) => {
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      storeItem("isAuthenticated", "true");
    } else {
      setIsAuthenticated(false);
      removeItem("isAuthenticated");
      removeAuthToken();
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeAuthToken();
    removeTokenCookie(IMPERSONATION_ORIGINAL_TOKEN_COOKIE);
    removeItem("isAuthenticated");
    removeItem("username");
    removeItem("email");
    removeItem("role");
    clearStore();
  };

  // useEffect(() => {
  //   // check if the message in localStorage indicates a successful login
  //   const message = localStorage.getItem("message");
  //   if (message === "Login Successfull") {
  //     login(); // Set user as authenticated
  //   }
  // }, []);

    // ✅ Effect: Sync state if a valid token exists on reload
  useEffect(() => {
    const token = getAuthToken();
    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
      storeItem("isAuthenticated", "true");
    } else if (!token && isAuthenticated) {
      // Optional: Auto logout if token missing (prevents stale state)
      setIsAuthenticated(false);
      // window.location.reload()
      removeItem("isAuthenticated");
    }
  }, [isAuthenticated]); // ✅ Add dependency

    useEffect(() => {
    const interval = setInterval(() => {
      if (!getAuthToken() && isAuthenticated) {
        logout(); // Auto logout when token expires
      }
    }, 1000); // Check every 1 second

    return () => clearInterval(interval);
  }, [isAuthenticated]);


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
