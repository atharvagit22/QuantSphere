// src/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

export default function ForgotPassword() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auth.sendOTP({ usernameOrEmail: identifier });
      // store pending reset username for OTP flow
      localStorage.setItem("qs_pending_reset", JSON.stringify({ username: res.username }));
      navigate("/verify-otp");
    } catch (err) {
      alert(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#030712] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-[#1a2335] rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold text-white text-center">Reset Password</h2>
        <p className="text-gray-400 text-center mt-2 mb-4">Enter your username or email to receive a one-time code.</p>

        <form onSubmit={handleSend} className="space-y-4">
          <input type="text" className="w-full bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b] text-gray-200" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="username or email" required />
          <div className="flex justify-between items-center">
            <Link to="/login" className="text-sm text-gray-400">Back to login</Link>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-500 text-white">{loading ? "Sending..." : "Send code"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
