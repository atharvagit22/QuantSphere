// src/components/ui/card.jsx
import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={`
        glass-card
        shadow-xl shadow-black/40
        hover:shadow-2xl
        transition-all duration-300
        rounded-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}
