// src/components/Navbar.jsx
import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import UploadPanel from "./UploadPanel.jsx";
import { Sparkles, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function Navbar({ title = "Dashboard", brand = "QuantSphere" }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="
        flex items-center justify-between 
        px-6 py-4 
        border-b border-white/5
        bg-[#05060A]/80 backdrop-blur-md 
        shadow-lg sticky top-0 z-40
      "
    >
      {/* Brand + Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-purple-300">
          <Sparkles size={18} />
          <span className="text-sm tracking-wide">{brand}</span>
        </div>

        <h1 className="text-xl font-semibold text-white capitalize">{title}</h1>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-4 relative">

        <UploadPanel />
        <ThemeToggle />

        {/* USER MENU */}
        {auth.user && (
          <div className="relative">
            {/* Avatar Button */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="
                w-9 h-9 rounded-full 
                bg-gradient-to-br from-purple-600 to-cyan-500 
                text-white font-semibold 
                flex items-center justify-center
                shadow-md hover:opacity-90 transition
              "
            >
              {auth.user.username?.charAt(0)?.toUpperCase() || "U"}
            </button>

            {/* Dropdown */}
            {open && (
              <div
                className="
                  absolute right-0 mt-3 
                  w-44 rounded-xl 
                  bg-[#0a0f1a]/90 backdrop-blur-lg 
                  border border-white/10 shadow-2xl
                  py-2 text-sm text-gray-200
                  animate-fade-in
                "
              >
                <div className="px-4 py-2 text-xs text-gray-400">
                  Signed in as
                </div>

                <div className="px-4 pb-2 font-medium text-white truncate">
                  {auth.user.username}
                </div>

                <hr className="border-white/10 my-2" />

                {/* Profile */}
                <button
                  className="
                    w-full flex items-center gap-2 px-4 py-2
                    hover:bg-white/5 transition rounded-lg
                  "
                >
                  <User size={16} /> Profile
                </button>

                {/* Admin Panel */}
                {auth.user.role === "admin" && (
                  <button
                    className="
                      w-full flex items-center gap-2 px-4 py-2
                      hover:bg-white/5 transition rounded-lg
                    "
                  >
                    <Settings size={16} /> Admin Panel
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    auth.logout();
                    setOpen(false);
                  }}
                  className="
                    w-full flex items-center gap-2 px-4 py-2
                    text-red-400 hover:bg-red-500/10 transition rounded-lg
                  "
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
