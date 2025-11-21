// src/auth/Register.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signup(form);
      navigate("/login");
    } catch (err) {
      alert(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#030712] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-[#1a2335] rounded-2xl p-10 w-full max-w-md shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center">Create account</h2>
        <p className="text-gray-400 text-center mt-2 mb-6">Sign up for <span className="text-indigo-400 font-semibold">QuantSphere</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Username</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-2 w-full bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b] text-gray-200" required />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b] text-gray-200" required />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 w-full bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b] text-gray-200" required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold shadow-lg hover:opacity-90 transition-all">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
