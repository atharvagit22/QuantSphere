// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Mock auth provider
 * - users persisted in localStorage ("qs_users")
 * - session persisted in localStorage ("qs_session")
 * - OTP is mocked (random code stored in memory)
 */

const AuthContext = createContext(null);

const USERS_KEY = "qs_users_v1";
const SESSION_KEY = "qs_session_v1";

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}
function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// Ensure default admin user exists
function ensureDefaultUsers() {
  const users = loadUsers() || [];
  const hasAdmin = users.some((u) => u.username === "admin");
  if (!hasAdmin) {
    users.push({
      id: "admin",
      username: "admin",
      email: "admin@quantsphere.local",
      password: "admin123", // mock default — change for prod
      role: "admin",
      createdAt: Date.now(),
    });
    saveUsers(users);
  }
}

export function AuthProvider({ children }) {
  ensureDefaultUsers();

  const [user, setUser] = useState(() => loadSession());
  const [loading, setLoading] = useState(false);

  // in-memory OTP store (simple): { username: code, ... }
  const otpStoreRef = React.useRef({});

  useEffect(() => {
    // sync session from storage (handles refresh)
    const s = loadSession();
    if (s) setUser(s);
  }, []);

  // Mock signup
  function signup({ username, email, password }) {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = loadUsers() || [];
          if (users.some((u) => u.username === username || u.email === email)) {
            reject(new Error("User or email already exists"));
            setLoading(false);
            return;
          }
          const newUser = {
            id: `${username}_${Date.now()}`,
            username,
            email,
            password,
            role: "user",
            createdAt: Date.now(),
          };
          users.push(newUser);
          saveUsers(users);
          toast.success("Signup successful — you can now login");
          setLoading(false);
          resolve(newUser);
        } catch (err) {
          setLoading(false);
          reject(err);
        }
      }, 700);
    });
  }

  // Mock login
  function login({ usernameOrEmail, password }) {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = loadUsers() || [];
          const u = users.find(
            (x) =>
              (x.username === usernameOrEmail || x.email === usernameOrEmail) &&
              x.password === password
          );
          if (!u) {
            setLoading(false);
            reject(new Error("Invalid credentials"));
            return;
          }
          const session = {
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role || "user",
            loggedAt: Date.now(),
          };
          saveSession(session);
          setUser(session);
          toast.success("Logged in");
          setLoading(false);
          resolve(session);
        } catch (err) {
          setLoading(false);
          reject(err);
        }
      }, 500);
    });
  }

  // Mock admin login (same login with role check)
  function adminLogin({ usernameOrEmail, password }) {
    return login({ usernameOrEmail, password }).then((sess) => {
      if (sess.role !== "admin") {
        logout();
        return Promise.reject(new Error("Not an admin"));
      }
      return sess;
    });
  }

  function logout() {
    clearSession();
    setUser(null);
    toast.success("Logged out");
  }

  // Forgot password (mock): generate OTP and "send"
  function sendOTP({ usernameOrEmail }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = loadUsers() || [];
          const u = users.find(
            (x) => x.username === usernameOrEmail || x.email === usernameOrEmail
          );
          if (!u) {
            reject(new Error("User not found"));
            return;
          }
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          otpStoreRef.current[u.username] = code;
          // In a real app you'd email/SMS the code. Here we display a toast with code for testing
          toast.success(`OTP (mock) for ${u.username}: ${code}`);
          resolve({ username: u.username, code });
        } catch (err) {
          reject(err);
        }
      }, 500);
    });
  }

  function verifyOTP({ username, code }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const stored = otpStoreRef.current[username];
        if (!stored) {
          reject(new Error("No OTP found for user"));
          return;
        }
        if (stored !== code) {
          reject(new Error("Invalid OTP"));
          return;
        }
        // consume OTP
        delete otpStoreRef.current[username];
        resolve(true);
      }, 300);
    });
  }

  function resetPassword({ username, newPassword }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = loadUsers() || [];
          const idx = users.findIndex((u) => u.username === username);
          if (idx === -1) {
            reject(new Error("User not found"));
            return;
          }
          users[idx].password = newPassword;
          saveUsers(users);
          toast.success("Password updated");
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 400);
    });
  }

  const api = {
    user,
    loading,
    signup,
    login,
    adminLogin,
    logout,
    sendOTP,
    verifyOTP,
    resetPassword,
  };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
