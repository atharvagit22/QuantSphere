// src/router/AppRouter.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../auth/Login.jsx";
import Register from "../auth/Register.jsx";
import ForgotPassword from "../auth/ForgotPassword.jsx";
import VerifyOTP from "../auth/VerifyOTP.jsx";
import AdminLogin from "../auth/AdminLogin.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";
import App from "../App.jsx";

/**
 * Hybrid router:
 * - public auth routes
 * - protected root (your App with sidebar/tabs)
 *
 * Make sure `AuthProvider` wraps <AppRouter /> in main.jsx
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route path="/admin-login" element={<AdminLogin />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/*" element={<App />} />
    </Route>
  </Routes>
</BrowserRouter>

  );
}
