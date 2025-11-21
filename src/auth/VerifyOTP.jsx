// src/auth/VerifyOTP.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";

export default function VerifyOTP() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("qs_pending_reset");
      if (raw) {
        const obj = JSON.parse(raw);
        setUsername(obj.username);
      } else {
        navigate("/forgot-password");
      }
    } catch {
      navigate("/forgot-password");
    }
  }, []);

  async function handleVerify(e) {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    try {
      await auth.verifyOTP({ username, code });
      if (!newPassword) {
        alert("Enter new password");
        setLoading(false);
        return;
      }
      await auth.resetPassword({ username, newPassword });
      localStorage.removeItem("qs_pending_reset");
      navigate("/login");
    } catch (err) {
      alert(err?.message || "OTP verify failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#030712] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-[#1a2335] rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold text-white text-center">Enter code</h2>
        <p className="text-gray-400 text-center mt-2 mb-4">We sent a one-time code — enter it below and set a new password.</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input type="text" className="w-full bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b] text-gray-200" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
          <input type="password" className="w-full bg-[#0f172a] rounded-lg px-3 py-2 border border-[#1e293b] text-gray-200" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required />
          <div className="flex justify-between items-center">
            <Link to="/login" className="text-sm text-gray-400">Cancel</Link>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-500 text-white">{loading ? "Saving..." : "Verify & Reset"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
