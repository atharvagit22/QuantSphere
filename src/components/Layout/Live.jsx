// src/components/Layout/Live.jsx
import React, { useEffect, useState, useRef } from "react";
import { initChart, destroyChart } from "../../utils/chartSetup.js";
import LiveMarketPanel from "../ui/LiveMarketPanel.jsx";
import { useData } from "../../context/DataContext.jsx";
import { ema as _ema } from "../../utils/analyticsHelpers.js";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

/**
 * Live.jsx
 * - supports second-level candles when interval is like '1s', '5s', etc.
 * - when in seconds mode, initial candles are minimal and WS ticks build out second-candles
 */

export default function Live() {
  const {
    fetchOHLC,
    fetchOrderbook,
    connectWS,
    disconnectWS,
    subscribeTrades,
    unsubscribeTrades,
    fetchTrending,
    liveData,
    setLiveData,
    syncLiveToDashboard,
    mode,
    setMode,
    openPosition,
    closePosition,
    updateUnrealizedPrices,
    positions,
    orders,
    addAlert,
    alerts,
    pushAlertEvent,
  } = useData();

  const [symbol, setSymbol] = useState("ETHUSDT");
  const [source, setSource] = useState("auto");
  const [interval, setIntervalState] = useState("5min"); // support: '1s','5s','10s','30s','1min','5min',...
  const [candles, setCandlesState] = useState([]);
  const [orderbook, setOrderbook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(true);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const ema20Ref = useRef(null);
  const ema50Ref = useRef(null);

  const secondsModeRef = useRef(false);
  const tickBucketsRef = useRef({}); // { unixSecond: { open, high, low, close, volume, time } }
  const tickSubRef = useRef(null);
  const pollRef = useRef(null);

  // helper - determine if interval is seconds
  function isSecondsInterval(intv) {
    return typeof intv === "string" && intv.endsWith("s");
  }

  // build candles array from tickBuckets map (sorted)
  function buildCandlesFromBuckets(limit = 500) {
    const keys = Object.keys(tickBucketsRef.current).map((k) => Number(k)).sort((a, b) => a - b);
    const arr = keys.slice(-limit).map((k) => {
      const entry = tickBucketsRef.current[k];
      return {
        time: new Date(entry.time * 1000).toISOString(),
        open: entry.open,
        high: entry.high,
        low: entry.low,
        close: entry.close,
        volume: entry.volume,
      };
    });
    return arr;
  }

  // load OHLC or prepare seconds-mode base
  async function loadOHLC(sym = symbol, intv = interval, src = source) {
    setLoading(true);
    try {
      if (isSecondsInterval(intv)) {
        // For seconds mode, fetch a minute-based OHLC as context (optional),
        // but primary live data will be built from WS ticks.
        // We'll clear current buckets and set last N ticks if present.
        tickBucketsRef.current = {};
        setCandlesState([]);
        // Try fetch 1m/backfill for context if available
        try {
          const base = await fetchOHLC(sym, "1min", src);
          if (base?.candles && base.candles.length) {
            // We won't convert minute->seconds; just keep last minute candle as context if needed
            // Leave chart blank until ticks arrive (safer).
          }
        } catch {}
      } else {
        const res = await fetchOHLC(sym, intv, src);
        if (res?.candles) {
          setCandlesState(res.candles);
          // update liveData globally
          try { setLiveData({ symbol: sym, interval: intv, source: res.source, candles: res.candles }); } catch {}
        } else {
          setCandlesState([]);
        }
      }
    } catch (err) {
      console.error("loadOHLC", err);
      toast.error("Failed to load OHLC");
      setCandlesState([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrderbook(sym = symbol) {
    try {
      const ob = await fetchOrderbook(sym, 50);
      setOrderbook(ob);
    } catch (err) {
      setOrderbook(null);
    }
  }

  // init chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const chartObj = initChart(containerRef.current, { height: 420 });
    chartRef.current = chartObj;

    // crosshair -> price tracker (guarded)
    try {
      chartObj.chart.subscribeCrosshairMove((param) => {
        try {
          const priceEl = document.getElementById("price-tracker");
          if (!priceEl) return;
          if (!param || !param.time) {
            priceEl.style.display = "none";
            return;
          }
          // guard against missing seriesPrices or candleSeries
          if (!param.seriesPrices || !chartObj.candleSeries) {
            priceEl.style.display = "none";
            return;
          }
          const price = param.seriesPrices.get && param.seriesPrices.get(chartObj.candleSeries);
          if (price == null) {
            priceEl.style.display = "none";
            return;
          }
          priceEl.style.display = "block";
          priceEl.innerText = `$${Number(price).toFixed(2)}`;
        } catch (err) {
          // swallow
        }
      });
    } catch (err) {}

    const onResize = () => {
      try {
        chartObj.chart.applyOptions({ width: containerRef.current.clientWidth });
      } catch {}
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      try { destroyChart(chartObj); } catch {}
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update chart when candles change (works both for minute and seconds-mode)
  useEffect(() => {
    const chartObj = chartRef.current;
    if (!chartObj) return;
    const { setCandles, setVolume, addOverlayLine, resetOverlays, setMarkers } = chartObj;

    // set base series and volume
    setCandles(candles);
    setVolume(candles);

    // markers from orders (buy/sell)
    if (orders && Array.isArray(orders) && orders.length) {
      const markers = orders
        .filter((o) => o.price != null && o.time != null)
        .map((o) => ({
          time: Math.floor(new Date(o.time).getTime() / 1000),
          position: o.side?.toLowerCase() === "buy" ? "below" : "above",
          color: o.side?.toLowerCase() === "buy" ? "#10b981" : "#ef4444",
          shape: "arrowUp",
          text: `${o.side?.toUpperCase?.() || ""} ${o.qty || ""}`,
        }));
      setMarkers(markers);
    } else {
      setMarkers([]);
    }

    // reset overlays then add as needed
    resetOverlays();
    ema20Ref.current = null;
    ema50Ref.current = null;

    if (showEMA20 && candles.length) {
      const closes = candles.map((c) => Number(c.close ?? c.c ?? 0));
      const arr = _ema(closes, 20);
      const data = arr.map((v, i) => ({ time: Math.floor(new Date(candles[i].time).getTime() / 1000), value: v }));
      const series = addOverlayLine({ color: "#f97316" });
      try { series.setData(data); } catch {}
      ema20Ref.current = series;
    }

    if (showEMA50 && candles.length) {
      const closes = candles.map((c) => Number(c.close ?? c.c ?? 0));
      const arr = _ema(closes, 50);
      const data = arr.map((v, i) => ({ time: Math.floor(new Date(candles[i].time).getTime() / 1000), value: v }));
      const series = addOverlayLine({ color: "#a78bfa" });
      try { series.setData(data); } catch {}
      ema50Ref.current = series;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, showEMA20, showEMA50, orders]);

  // ticks -> second-candles when in seconds mode
  useEffect(() => {
    const subsHandler = (payload) => {
      try {
        // Normalize common Binance trade tick shapes: { p, q, T, s } or aggregate kline payloads
        const price = payload.p ? Number(payload.p) : (payload.k && payload.k.c ? Number(payload.k.c) : null);
        const qty = payload.q ? Number(payload.q) : (payload.k && payload.k.q ? Number(payload.k.q) : 0);
        const ts = payload.T ? Math.floor(Number(payload.T) / 1000) : Math.floor(Date.now() / 1000);
        if (price == null) return;

        // Only process ticks if in seconds mode for current Live component
        if (!secondsModeRef.current) return;

        // update bucket for this second
        const bucket = tickBucketsRef.current[ts] || { open: price, high: price, low: price, close: price, volume: 0, time: ts };
        if (!bucket.open) bucket.open = price;
        bucket.high = Math.max(bucket.high, price);
        bucket.low = Math.min(bucket.low, price);
        bucket.close = price;
        bucket.volume = (bucket.volume || 0) + (qty || 0);
        bucket.time = ts;
        tickBucketsRef.current[ts] = bucket;

        // quick update chart with the latest second bucket
        const latestCandles = buildCandlesFromBuckets(500);
        setCandlesState(latestCandles);
        // update global liveData
        try { setLiveData((prev) => ({ ...(prev || {}), symbol, interval, candles: latestCandles, source: "ws" })); } catch {}
        // update unrealized / simulator
        try { updateUnrealizedPrices(symbol, price); } catch {}
      } catch (err) {
        // swallow
      }
    };

    // subscribe when seconds mode active
    if (secondsModeRef.current) {
      tickSubRef.current = subsHandler;
      try { subscribeTrades(subsHandler); } catch {}
    }

    return () => {
      try {
        if (tickSubRef.current) {
          unsubscribeTrades(tickSubRef.current);
          tickSubRef.current = null;
        }
      } catch {}
    };
  }, [subscribeTrades, unsubscribeTrades, symbol, setLiveData, updateUnrealizedPrices]);

  // general trade subscription for updating last candle in non-seconds mode for low-latency UI
  useEffect(() => {
    const handler = (payload) => {
      try {
        const price = payload.p ? Number(payload.p) : payload.k?.c ? Number(payload.k.c) : null;
        const qty = payload.q ? Number(payload.q) : payload.k?.q ? Number(payload.k.q) : 0;
        if (price == null) return;

        // if seconds mode active, we let the seconds handler handle it
        if (secondsModeRef.current) return;

        setCandlesState((prev) => {
          const copy = Array.isArray(prev) ? [...prev] : [];
          const last = copy[copy.length - 1];
          const now = new Date();
          const lastTime = last ? new Date(last.time) : null;
          const sameMinute =
            lastTime &&
            lastTime.getUTCFullYear() === now.getUTCFullYear() &&
            lastTime.getUTCMonth() === now.getUTCMonth() &&
            lastTime.getUTCDate() === now.getUTCDate() &&
            lastTime.getUTCHours() === now.getUTCHours() &&
            lastTime.getUTCMinutes() === now.getUTCMinutes();

          let next;
          if (sameMinute && last) {
            const updated = { ...last };
            updated.close = price;
            if (price > updated.high) updated.high = price;
            if (price < updated.low) updated.low = price;
            updated.volume = (updated.volume || 0) + qty;
            next = [...copy.slice(0, -1), updated];
          } else {
            const c = { time: now.toISOString(), open: price, high: price, low: price, close: price, volume: qty };
            next = [...copy, c].slice(-500);
          }

          try { setLiveData({ symbol, interval, candles: next, source: "ws" }); } catch {}
          try { chartRef.current?.updateLatest && chartRef.current.updateLatest(next[next.length - 1]); } catch {}
          try { updateUnrealizedPrices(symbol, price); } catch {}
          return next;
        });
      } catch (err) {}
    };

    try { subscribeTrades(handler); } catch {}
    return () => {
      try { unsubscribeTrades(handler); } catch {}
    };
  }, [subscribeTrades, unsubscribeTrades, updateUnrealizedPrices, symbol, interval, setLiveData]);

  // polling and WS connect (handles seconds-mode vs normal)
  useEffect(() => {
    secondsModeRef.current = isSecondsInterval(interval);

    // always load OHLC / prepare seconds buckets
    loadOHLC();
    loadOrderbook();

    // auto polling for minute/daily intervals
    if (!secondsModeRef.current && auto) {
      pollRef.current = setInterval(() => {
        loadOHLC();
        loadOrderbook();
      }, 15000);
    } else {
      // if in seconds mode, keep polling disabled; ticks drive the chart
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    const shouldWS = source === "binance" || (/USDT$|BTC$|ETH$/i.test(symbol) && source === "auto");
    if (shouldWS) {
      try { connectWS(symbol, { type: "trade" }); } catch (err) {}
    } else {
      try { disconnectWS(); } catch (err) {}
    }

    // ensure we resubscribe/unsubscribe properly: seconds-mode subscription handled by effect above

    return () => {
      try { clearInterval(pollRef.current); } catch {}
      try { disconnectWS(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval, source, auto]);

  // Sync to dashboard
  function handleSyncToDashboard() {
    if (!liveData?.candles || !liveData.candles.length) {
      alert("No live dataset to sync.");
      return;
    }
    try {
      syncLiveToDashboard(liveData);
      setMode("csv"); // dashboard uses csv mode object mapping
      toast.success("Synced to Dashboard");
    } catch (err) {
      toast.error("Sync failed");
    }
  }

  // helpers
  const bids = orderbook?.bids?.slice(0, 10).map((b) => ({ price: Number(b[0]), qty: Number(b[1]) })) || [];
  const asks = orderbook?.asks?.slice(0, 10).map((a) => ({ price: Number(a[0]), qty: Number(a[1]) })) || [];

  function handlePanelSelect(sym) {
    setSymbol(sym);
    setTimeout(() => {
      loadOHLC(sym);
      loadOrderbook(sym);
      if (/USDT$|BTC$|ETH$/i.test(sym)) connectWS(sym, { type: "trade" });
    }, 40);
  }

  // UI
  return (
    <div className="p-6 space-y-6">
      {/* top bar */}
      <div className="flex items-center gap-3">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="px-3 py-2 rounded bg-[#071022] border border-[#0f1720] text-sm" />

        <select value={source} onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 rounded bg-[#071022] border border-[#0f1720] text-sm">
          <option value="auto">Auto</option>
          <option value="alphavantage">AlphaVantage</option>
          <option value="binance">Binance</option>
        </select>

        <select value={interval} onChange={(e) => setIntervalState(e.target.value)}
          className="px-3 py-2 rounded bg-[#071022] border border-[#0f1720] text-sm">
          <option value="1s">1s</option>
          <option value="5s">5s</option>
          <option value="10s">10s</option>
          <option value="30s">30s</option>
          <option value="1min">1min</option>
          <option value="5min">5min</option>
          <option value="15min">15min</option>
          <option value="daily">daily</option>
        </select>

        <button onClick={() => loadOHLC()} className="btn btn-primary">Load</button>
        <button onClick={() => setPanelOpen(true)} title="Open Market Panel" className="px-3 py-2 rounded bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] text-white flex items-center gap-2">
          <PlusCircle size={16} /> Market
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-400">Auto</label>
          <input type="checkbox" checked={auto} onChange={() => setAuto((v) => !v)} />
          <button onClick={handleSyncToDashboard} className="btn btn-primary ml-2">Sync → Dashboard</button>
        </div>
      </div>

      {/* chart card */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Live Chart</div>
          <div className="text-xs text-gray-500">{candles.length} points</div>
        </div>

        <div className="relative mt-3" style={{ height: 420 }}>
          <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
          <div id="price-tracker" style={{
            position: "absolute", right: 12, top: 32, padding: "6px 10px",
            background: "rgba(10,11,13,0.85)", color: "#fff", borderRadius: 8,
            fontSize: 12, display: "none", zIndex: 20,
          }} />
        </div>
      </motion.div>

      {/* orderbook + widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Orderbook (top 10)</div>
          <div className="mt-3 text-xs">
            <div className="flex justify-between font-medium border-b pb-2"><div>Bids</div><div>Asks</div></div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>{bids.length === 0 ? <div className="text-gray-400">—</div> : bids.map((b, i) => (<div key={i} className="flex justify-between text-xs"><div>{b.price}</div><div>{b.qty}</div></div>))}</div>
              <div>{asks.length === 0 ? <div className="text-gray-400">—</div> : asks.map((a, i) => (<div key={i} className="flex justify-between text-xs"><div>{a.price}</div><div>{a.qty}</div></div>))}</div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => loadOrderbook()} className="btn btn-outline">Refresh OB</button>
              <button onClick={() => connectWS(symbol, { type: "trade" })} className="btn btn-success">Start WS</button>
              <button onClick={() => disconnectWS()} className="btn btn-outline">Stop WS</button>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Positions (Simulator)</div>
          <div className="mt-3 text-xs">
            {positions.length === 0 ? <div className="text-gray-400">No open positions</div> : positions.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-1">
                <div>
                  <div className="font-medium">{p.symbol} • {p.side}</div>
                  <div className="text-xs text-gray-400">{p.qty} @ {p.avgEntry}</div>
                </div>
                <div className={`text-sm ${p.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>${(p.unrealizedPL || 0).toFixed(2)}</div>
              </div>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => openPosition?.({ symbol })} className="btn btn-success">Open Simulator</button>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Alerts</div>
          <div className="mt-3 text-xs">
            <div className="text-gray-400">Manage alerts</div>
            <div className="mt-2">
              <button onClick={() => alert("Open Alerts UI")} className="btn btn-outline">Open Alerts Panel</button>
            </div>
          </div>
        </div>
      </div>

      <LiveMarketPanel open={panelOpen} onClose={() => setPanelOpen(false)} onSelect={handlePanelSelect} />
    </div>
  );
}
