import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { clearStore, removeItem } from "./utils/encode";
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
    return Boolean(Cookies.get("token")) && localStorage.getItem("isAuthenticated") === "true";
  });
  const login = async(token = null) => {
      if (token) {
      Cookies.set("token", token, { expires: 1, sameSite: "lax" });
      // Cookies.set("token", token,  { expires: 10 / 86400, sameSite: "lax" });
       setIsAuthenticated(true);
       localStorage.setItem("isAuthenticated", "true"); // Store login status
    }
       else {
    // If no token provided, treat as failed login
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  }
   
  };

  const logout = () => {
    setIsAuthenticated(false);
    Cookies.remove("token");
    localStorage.removeItem("isAuthenticated"); // Clear login status
    localStorage.removeItem("username"); // Clear additional data if needed
    // localStorage.removeItem("email");
    removeItem("email");
    // localStorage.removeItem("message");
    // localStorage.removeItem("role");
    removeItem("role");
    localStorage.removeItem("profile");
    clearStore()
    localStorage.clear()
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
    const token = Cookies.get("token");
    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
    } else if (!token && isAuthenticated) {
      // Optional: Auto logout if token missing (prevents stale state)
      setIsAuthenticated(false);
      // window.location.reload()
      localStorage.removeItem("isAuthenticated");
 
      
    }
  }, [isAuthenticated]); // ✅ Add dependency

    useEffect(() => {
    const interval = setInterval(() => {
      if (!Cookies.get("token") && isAuthenticated) {
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
