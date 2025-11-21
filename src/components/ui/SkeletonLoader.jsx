// src/components/ui/SkeletonLoader.jsx
import React from "react";

/**
 * Simple skeleton placeholder for charts / panels
 * Props:
 *  - height (number|string)
 */
export default function SkeletonLoader({ height = 200 }) {
  return (
    <div className="rounded-md overflow-hidden bg-gradient-to-r from-[#07121a] to-[#06111a] p-4">
      <div className="animate-pulse">
        <div className="bg-white/6 rounded h-6 w-1/3 mb-3" />
        <div className="bg-white/4 rounded h-40" style={{ height }} />
      </div>
    </div>
  );
}
