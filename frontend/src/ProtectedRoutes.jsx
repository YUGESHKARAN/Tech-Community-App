import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getItem } from "./utils/encode";

const ProtectedRoute = ({ element: Component, requiredRole }) => {
  const { isAuthenticated } = useAuth();
  // const role = localStorage.getItem("role");
  const role = getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return Component;
};

export default ProtectedRoute;
