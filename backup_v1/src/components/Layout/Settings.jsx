import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-semibold text-white mb-4">Settings</h1>

      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937] flex items-center justify-between">
        <div>
          <p className="text-gray-300 font-medium">Dark Mode</p>
          <p className="text-gray-500 text-sm">Toggle between light and dark theme</p>
        </div>
        <button
          onClick={() => setDarkMode((p) => !p)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
        >
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-400" />}
        </button>
      </div>
    </motion.div>
  );
}
