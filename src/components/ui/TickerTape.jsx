// src/components/ui/TickerTape.jsx
import React, { useEffect, useState } from "react";
import { useData } from "../../context/DataContext.jsx";

/**
 * Minimal TickerTape — pulls from fetchTrending() periodically.
 * Props:
 *  - symbols (optional) : array of symbols to display; fallback to trending
 */
export default function TickerTape({ symbols = null, intervalMs = 15000 }) {
  const { fetchTrending } = useData();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function refresh() {
      try {
        const list = symbols || ["AAPL", "TSLA", "MSFT", "NVDA", "BTCUSDT", "ETHUSDT"];
        const res = await fetchTrending?.(list);
        if (!mounted) return;
        setItems((res || []).slice(0, 10));
      } catch (err) {
        // ignore
      }
    }
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => { mounted = false; clearInterval(id); };
  }, [fetchTrending, symbols, intervalMs]);

  if (!items || items.length === 0) return null;

  // build a long inline string for marquee effect
  const content = items.map((it) => {
    const pct = typeof it.pct === "number" ? it.pct * 100 : it.pct ?? 0;
    const sign = pct >= 0 ? "+" : "";
    return `${it.symbol} ${sign}${pct.toFixed(2)}% • `;
  }).join(" ");

  return (
    <div className="w-full overflow-hidden bg-[#05111a] px-3 py-1 rounded text-xs text-gray-200">
      <div className="animate-marquee whitespace-nowrap" style={{ display: "inline-block" }}>
        {content}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { display:inline-block; padding-right: 50%; animation: marquee 18s linear infinite; }
      `}</style>
    </div>
  );
}
