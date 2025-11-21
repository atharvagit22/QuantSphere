// src/components/UploadPanel.jsx
import React from "react";
import { LineChart } from "lucide-react";

export default function UploadPanel({ onUploaded }) {
  return (
    <button
      onClick={() => (onUploaded ? onUploaded() : null)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow"
      title="Upload CSV"
    >
      <LineChart size={16} />
      <span className="text-sm">Upload CSV</span>
    </button>
  );
}
