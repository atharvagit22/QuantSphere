// src/components/ThemeEditor.jsx
import React from "react";
import { useData } from "../context/DataContext.jsx";
import { useFeatureFlags } from "../context/FeatureFlags.jsx";

export default function ThemeEditor({ onClose }) {
  const { /* you may use data/context later */ } = useData();
  const { flags } = useFeatureFlags();

  return (
    <div className="fixed top-12 right-12 bg-[#071018] rounded p-4 shadow-lg z-70 w-96">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Theme Editor</div>
        <button onClick={onClose} className="text-sm text-gray-400">Close</button>
      </div>

      <div className="space-y-3 text-sm text-gray-300">
        <label className="block">Accent color</label>
        <input type="color" defaultValue="#7c3aed" className="w-full h-10 rounded" />

        <label className="block mt-2">Accent 2</label>
        <input type="color" defaultValue="#06b6d4" className="w-full h-10 rounded" />

        <div className="mt-4 text-xs text-gray-400">
          Toggle packs (feature flags)
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Object.keys(flags).map((k) => (
            <div key={k} className="text-xs text-gray-300">{k}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
