import React from "react";

export default function ReplayControls({ onStart, onStop, onSpeed }) {
  return (
    <div className="flex gap-4 p-4 bg-[#0f1724] rounded-xl border border-white/10">
      <button className="px-3 py-2 bg-green-600 rounded" onClick={onStart}>Play</button>
      <button className="px-3 py-2 bg-red-600 rounded" onClick={onStop}>Pause</button>

      <select
        onChange={(e) => onSpeed(Number(e.target.value))}
        className="bg-[#071018] text-white p-2 rounded"
      >
        <option value="1000">1x</option>
        <option value="500">2x</option>
        <option value="200">5x</option>
      </select>
    </div>
  );
}
