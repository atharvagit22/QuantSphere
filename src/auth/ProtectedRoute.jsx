// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

/**
 * Use this as a wrapper route element:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/*" element={<App />} />
 * </Route>
 */
export default function ProtectedRoute({ redirectTo = "/login", requireAdmin = false }) {
  const auth = useAuth();
  const user = auth?.user ?? null;

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
