// src/auth/AdminLogin.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

export default function AdminLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.adminLogin(form);
      navigate("/", { replace: true });
    } catch (err) {
      alert(err?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#030712] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-[#1a2335] rounded-2xl p-10 w-full max-w-md shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center">Admin Login</h2>
        <p className="text-gray-400 text-center mt-2 mb-6">Use your admin credentials</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-gray-300 text-sm">Username or Email</label>
            <div className="mt-2 flex items-center bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b]">
              <User className="text-gray-500 mr-2" size={18} />
              <input type="text" className="flex-1 bg-transparent outline-none text-gray-200" value={form.usernameOrEmail} onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <div className="mt-2 flex items-center bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b]">
              <Lock className="text-gray-500 mr-2" size={18} />
              <input type="password" className="flex-1 bg-transparent outline-none text-gray-200" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition-all">
            {loading ? "Signing in..." : "Admin Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
