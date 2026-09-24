import React, { createContext, useContext, useEffect, useState } from "react";
import { clearStore, removeItem } from "./utils/encode";
import { getSessionItem, removeSessionItem, storeSessionItem } from "./utils/sessionEncode";
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
      return Boolean(getSessionItem("token")) && getSessionItem("isAuthenticated") === "true";
  });
  const login = async(token = null) => {
      if (token) {
        storeSessionItem("token", token);
       setIsAuthenticated(true);
         storeSessionItem("isAuthenticated", "true");
    }
       else {
    // If no token provided, treat as failed login
    setIsAuthenticated(false);
    removeSessionItem("isAuthenticated");
  }
   
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeSessionItem("token");
    removeSessionItem("isAuthenticated");
    removeItem("username"); // Clear additional data if needed
    // localStorage.removeItem("email");
    removeItem("email");
    // localStorage.removeItem("message");
    // localStorage.removeItem("role");
    removeItem("role");
    sessionStorage.removeItem("profile");
    clearStore()
    sessionStorage.clear()
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
    const token = getSessionItem("token");
    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
      storeSessionItem("isAuthenticated", "true");
    } else if (!token && isAuthenticated) {
      // Optional: Auto logout if token missing (prevents stale state)
      setIsAuthenticated(false);
      // window.location.reload()
      removeSessionItem("isAuthenticated");
 
      
    }
  }, [isAuthenticated]); // ✅ Add dependency

    useEffect(() => {
    const interval = setInterval(() => {
      if (!getSessionItem("token") && isAuthenticated) {
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
