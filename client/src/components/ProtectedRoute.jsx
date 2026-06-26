import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ admin = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/matches" replace />;

  if (user.role !== "admin" && !user.isProfileSubmitted && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
