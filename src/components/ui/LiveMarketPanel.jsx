// src/components/ui/LiveMarketPanel.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Search, Star, RefreshCw, Clock } from "lucide-react";
import { useData } from "../../context/DataContext.jsx";
import HeatmapTile from "./HeatmapTile.jsx";

/**
 * LiveMarketPanel — updated to use HeatmapTile and improved UX
 */
export default function LiveMarketPanel({ open, onClose, onSelect }) {
  const { fetchTrending, fetchOHLC } = useData();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("stocks");
  const [trending, setTrending] = useState([]);
  const [watchlist, setWatchlist] = useState(["AAPL", "MSFT", "TSLA", "NVDA", "BTCUSDT", "ETHUSDT"]);
  const [heatmapData, setHeatmapData] = useState({});
  const [sortBy, setSortBy] = useState("watchlist");
  const refreshRef = useRef(null);
  const isMounted = useRef(true);

  const POOLS = useMemo(() => ({
    stocks: ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "INTC"],
    etfs: ["SPY", "QQQ", "IVV", "VTI"],
    crypto: ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"],
    futures: ["NIFTY", "BANKNIFTY", "ES1!"],
    forex: ["EURUSD", "GBPUSD", "USDJPY"],
    commodities: ["GOLD", "SILVER", "USOIL"],
  }), []);

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      try {
        const res = (await fetchTrending?.()) || [];
        if (!isMounted.current) return;
        setTrending(res.slice(0, 8));
      } catch (err) {}
    })();

    return () => { isMounted.current = false; };
  }, [fetchTrending]);

  const buildList = () => {
    const pool = POOLS[activeTab] || [];
    const q = query.trim().toLowerCase();
    const fromPool = pool.filter((s) => (s + "").toLowerCase().includes(q));
    const fromWatch = watchlist.filter((s) => (s + "").toLowerCase().includes(q));
    const fromTrending = trending.map((t) => t.symbol).filter((s) => s.toLowerCase().includes(q));
    const merged = Array.from(new Set([...fromWatch, ...fromTrending, ...fromPool]));
    return merged;
  };

  const list = buildList();

  function handlePick(symbol) {
    onSelect?.(symbol);
    onClose?.();
  }

  function toggleWatch(symbol) {
    setWatchlist((prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [symbol, ...prev]));
  }

  async function refreshHeatmap(signalList = watchlist) {
    if (!signalList || signalList.length === 0) {
      setHeatmapData({});
      return;
    }
    try {
      const snapshot = (await fetchTrending?.(signalList)) || [];
      const snapMap = {};
      snapshot.forEach((s) => {
        snapMap[s.symbol] = {
          pct: typeof s.pct === "number" ? (s.pct * 100) : (typeof s.pct === "number" ? s.pct : 0),
          volume: s.volume ?? 0,
          price: s.price ?? null,
        };
      });

      const toFetch = signalList.slice(0, 20);
      const closePromises = toFetch.map(async (sym) => {
        try {
          const ohlc = await fetchOHLC?.(sym, "1min", "auto");
          if (!ohlc?.candles) return { sym, closes: [] };
          const closes = (ohlc.candles || []).map((c) => Number(c.close || 0)).slice(-40);
          return { sym, closes };
        } catch (err) {
          return { sym, closes: [] };
        }
      });

      const fetched = await Promise.all(closePromises);

      const heat = {};
      toFetch.forEach((sym) => {
        const snap = snapMap[sym] || {};
        const found = fetched.find((f) => f.sym === sym);
        heat[sym] = {
          pct: snap.pct ?? 0,
          volume: snap.volume ?? 0,
          price: snap.price ?? null,
          closes: (found && found.closes) || [],
        };
      });

      signalList.slice(20).forEach((sym) => {
        heat[sym] = {
          pct: snapMap[sym]?.pct ?? 0,
          volume: snapMap[sym]?.volume ?? 0,
          price: snapMap[sym]?.price ?? null,
          closes: [],
        };
      });

      setHeatmapData((prev) => ({ ...prev, ...heat }));
    } catch (err) {
      console.warn("refreshHeatmap:", err);
    }
  }

  useEffect(() => {
    refreshHeatmap();
    refreshRef.current = setInterval(() => { refreshHeatmap(); }, 15000);
    return () => { try { clearInterval(refreshRef.current); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist, fetchTrending, fetchOHLC]);

  function sortedWatch() {
    const arr = [...watchlist];
    if (sortBy === "pct") return arr.sort((a, b) => (heatmapData[b]?.pct ?? 0) - (heatmapData[a]?.pct ?? 0));
    if (sortBy === "volume") return arr.sort((a, b) => (heatmapData[b]?.volume ?? 0) - (heatmapData[a]?.volume ?? 0));
    if (sortBy === "symbol") return arr.sort((a, b) => a.localeCompare(b));
    return arr;
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: open ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="fixed right-0 top-0 h-full w-[420px] max-w-full z-50 shadow-2xl"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <div className="h-full bg-[#071018] border-l border-[#0f1720] flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#0f1720]">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">Market</div>
            <div className="text-xs text-gray-400">Explorer</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchTrending?.().then((r) => setTrending((r || []).slice(0, 8))).catch(() => {});
                refreshHeatmap();
              }}
              title="Refresh trending"
              className="px-2 py-1 rounded bg-[#0b1220] text-xs text-gray-300 flex items-center gap-2"
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button onClick={onClose} className="p-2 rounded hover:bg-[#0b1220]">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-[#0f1720]">
          <div className="flex items-center gap-2 bg-[#06101a] rounded px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 bg-transparent outline-none text-sm text-gray-200" placeholder="Search symbol or name (eg. AAPL, BTCUSDT)" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="text-xs text-gray-400 px-2 py-1" onClick={() => setQuery("")}>Clear</button>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-[#0f1720]">
          <div className="flex gap-2 text-xs">
            {["stocks", "etfs", "crypto", "futures", "forex", "commodities"].map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1 rounded text-sm ${activeTab === t ? "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white" : "text-gray-300 hover:bg-[#08121a]"}`}>{t.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="p-3 overflow-y-auto flex-1">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Watchlist</div>
              <div className="text-xs text-gray-500">Quick picks</div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-gray-400">Sort</div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs bg-[#07121a] px-2 py-1 rounded">
                <option value="watchlist">Watchlist order</option>
                <option value="pct">% Change</option>
                <option value="volume">Volume</option>
                <option value="symbol">Symbol</option>
              </select>

              <div className="ml-auto text-xs text-gray-400">Tiles: {Math.min(watchlist.length, 20)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sortedWatch().slice(0, 20).map((s) => {
                const data = heatmapData[s] || {};
                return <HeatmapTile key={s} symbol={s} pct={data.pct} volume={data.volume} closes={data.closes} onOpen={handlePick} onToggleWatch={toggleWatch} watched={watchlist.includes(s)} />;
              })}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Trending</div>
              <div className="text-xs text-gray-500">Live movers</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {trending.length === 0 ? <div className="text-gray-500 col-span-3">No data</div> : trending.map((t) => (
                <div key={t.symbol} className="p-2 bg-[#07121a] rounded">
                  <div className="font-medium">{t.symbol}</div>
                  <div className="text-xs text-gray-400">{t.pct ? (t.pct * 100).toFixed(2) + "%" : ""}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handlePick(t.symbol)} className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs">Open</button>
                    <button onClick={() => toggleWatch(t.symbol)} className="px-2 py-1 border rounded text-xs">★</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Results</div>
              <div className="text-xs text-gray-500">{list.length} items</div>
            </div>

            <div className="space-y-2">
              {list.length === 0 ? <div className="text-gray-500">No matches</div> : list.map((s) => (
                <div key={s} className="flex items-center justify-between p-2 bg-[#07121a] rounded hover:bg-[#091624]">
                  <div>
                    <div className="font-medium">{s}</div>
                    <div className="text-xs text-gray-400">—</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleWatch(s)} className="p-1" title="Toggle watch">★</button>
                    <button onClick={() => handlePick(s)} className="px-3 py-1 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white rounded text-sm">Open</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-6" />
        </div>

        <div className="px-3 py-2 border-t border-[#0f1720] text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock size={14} /> Real-time streams for crypto (Binance). Stocks via AlphaVantage (rate-limited).
          </div>
        </div>
      </div>
    </motion.div>
  );
}
