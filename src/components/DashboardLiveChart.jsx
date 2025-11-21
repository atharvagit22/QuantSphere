// src/components/DashboardLiveChart.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";

import { initChart, destroyChart } from "../utils/chartSetup.js";
import { useData } from "../context/DataContext.jsx";
import { ema as _ema } from "../utils/analyticsHelpers.js";
import toast from "react-hot-toast";

/**
 * DashboardLiveChart
 * Mirrors Live chart: candles, volume, EMA20/50, order markers, alert markers
 */
export default function DashboardLiveChart() {
  const {
    liveData,
    subscribeTrades,
    unsubscribeTrades,
    orders = [],
    alerts = [],
  } = useData();

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const resizeRef = useRef(null);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);

  // ---------- helpers ----------
  const buildMarkers = useCallback((ordersList = [], alertsList = []) => {
    const markers = [];
    (ordersList || []).forEach((o) => {
      try {
        let tm = null;
        if (o.time) tm = Math.floor(new Date(o.time).getTime() / 1000);
        else if (o.t) tm = typeof o.t === "number" && o.t > 1e10 ? Math.floor(o.t / 1000) : o.t;
        if (!tm || !o.price) return;
        const side = (o.side || "").toString().toLowerCase();
        markers.push({
          time: tm,
          position: side === "buy" ? "below" : "above",
          color: side === "buy" ? "#10b981" : "#ef4444",
          shape: side === "buy" ? "arrowUp" : "arrowDown",
          text: `${(o.side || "").toUpperCase()} ${o.qty ?? ""}`,
        });
      } catch (err) {}
    });

    (alertsList || []).forEach((a) => {
      try {
        let tm = null;
        if (a.time) tm = Math.floor(new Date(a.time).getTime() / 1000);
        else if (a.firedAt) tm = Math.floor(new Date(a.firedAt).getTime() / 1000);
        if (!tm) return;
        markers.push({
          time: tm,
          position: "above",
          color: "#f59e0b",
          shape: "circle",
          text: `AL:${a.id ?? a.metric ?? "?"}`,
        });
      } catch (err) {}
    });

    return markers;
  }, []);

  // ---------- init chart ----------
  useEffect(() => {
    if (!containerRef.current) return;

    // create chart with a sensible default height
    const chartObj = initChart(containerRef.current, { height: 520 });
    chartRef.current = chartObj;

    // ensure initial width is applied
    try {
      const w = containerRef.current.clientWidth || containerRef.current.offsetWidth || 800;
      chartObj.chart.applyOptions({ width: w });
    } catch {}

    // crosshair -> price tracker
    const priceEl = document.getElementById("dashboard-price-tracker");
    try {
      chartObj.chart.subscribeCrosshairMove((param) => {
        if (!priceEl) return;
        if (!param || !param.time) {
          priceEl.style.display = "none";
          return;
        }
        const price = param.seriesPrices.get(chartObj.candleSeries);
        if (price == null) {
          priceEl.style.display = "none";
          return;
        }
        priceEl.style.display = "block";
        priceEl.innerText = `$${Number(price).toFixed(2)}`;
      });
    } catch (err) {
      // ignore if not supported
    }

    // ResizeObserver for responsive charts
    try {
      resizeRef.current = new ResizeObserver(() => {
        try {
          const w = containerRef.current.clientWidth;
          chartObj.chart.applyOptions({ width: w });
        } catch {}
      });
      resizeRef.current.observe(containerRef.current);
    } catch (err) {
      const onResize = () => {
        try {
          chartObj.chart.applyOptions({ width: containerRef.current.clientWidth });
        } catch {}
      };
      window.addEventListener("resize", onResize);
      resizeRef.current = { disconnect: () => window.removeEventListener("resize", onResize) };
    }

    return () => {
      try {
        if (resizeRef.current && typeof resizeRef.current.disconnect === "function") resizeRef.current.disconnect();
      } catch {}
      try { destroyChart(chartObj); } catch {}
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- react to liveData changes (full set) ----------
  useEffect(() => {
    const chartObj = chartRef.current;
    if (!chartObj) return;

    const candles = (liveData && Array.isArray(liveData.candles)) ? liveData.candles : [];

    // set candles and volume
    try { chartObj.setCandles(candles); } catch (err) {}
    try { chartObj.setVolume(candles); } catch (err) {}

    // set markers (orders + alerts)
    try {
      const markers = buildMarkers(orders || [], alerts || []);
      chartObj.setMarkers(markers);
    } catch (err) {}

    // overlays (EMA)
    try { chartObj.resetOverlays(); } catch (err) {}

    if (showEMA20 && candles.length) {
      try {
        const closes = candles.map((c) => Number(c.close ?? c.c ?? 0));
        const arr = _ema(closes, 20);
        const data = arr.map((v, i) => {
          const time = Math.floor(new Date(candles[i].time).getTime() / 1000);
          return { time, value: Number(v) };
        });
        const s = chartObj.addOverlayLine({ color: "#f97316", lineWidth: 2 });
        try { s.setData(data); } catch (err) {}
      } catch (err) {}
    }

    if (showEMA50 && candles.length) {
      try {
        const closes = candles.map((c) => Number(c.close ?? c.c ?? 0));
        const arr = _ema(closes, 50);
        const data = arr.map((v, i) => {
          const time = Math.floor(new Date(candles[i].time).getTime() / 1000);
          return { time, value: Number(v) };
        });
        const s = chartObj.addOverlayLine({ color: "#a78bfa", lineWidth: 2 });
        try { s.setData(data); } catch (err) {}
      } catch (err) {}
    }
  }, [liveData, orders, alerts, showEMA20, showEMA50, buildMarkers]);

  // ---------- low-latency tick updates ----------
  useEffect(() => {
    const chartObj = chartRef.current;
    if (!chartObj) return;

    const tickHandler = (payload) => {
      try {
        const price = payload.p ? Number(payload.p) : payload.k?.c ? Number(payload.k.c) : null;
        const qty = payload.q ? Number(payload.q) : payload.k?.q ? Number(payload.k.q) : 0;
        const timeIso = payload.T ? new Date(payload.T).toISOString() : (payload.E ? new Date(payload.E).toISOString() : new Date().toISOString());
        if (price == null) return;

        const cand = {
          time: timeIso,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: qty,
        };

        try { chartObj.updateLatest(cand); } catch (err) {}
      } catch (err) {
        // swallow
      }
    };

    try {
      subscribeTrades(tickHandler);
    } catch (err) {
      // ignore if not available
    }

    return () => {
      try { unsubscribeTrades(tickHandler); } catch {}
    };
  }, [subscribeTrades, unsubscribeTrades]);

  // ---------- simple visual feedback if no live data ----------
  useEffect(() => {
    if (!liveData || !Array.isArray(liveData.candles) || liveData.candles.length === 0) {
      // optional toast if you want:
      // toast.dismiss(); toast("No live data for dashboard chart", { icon: "ℹ️" });
    }
  }, [liveData]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">Dashboard Live Chart (mirrors Live)</div>
          <div className="text-xs text-gray-500">Candles • Volume • EMA20/50 • Markers • Alerts</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEMA20((s) => !s)}
            className={`px-2 py-1 rounded text-sm ${showEMA20 ? "bg-[#111827] text-white" : "text-gray-300"}`}
          >
            EMA20
          </button>
          <button
            onClick={() => setShowEMA50((s) => !s)}
            className={`px-2 py-1 rounded text-sm ${showEMA50 ? "bg-[#111827] text-white" : "text-gray-300"}`}
          >
            EMA50
          </button>
        </div>
      </div>

      <div style={{ height: 520 }} className="relative w-full">
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        <div
          id="dashboard-price-tracker"
          style={{
            position: "absolute",
            right: 12,
            top: 32,
            padding: "6px 10px",
            background: "rgba(10,11,13,0.85)",
            color: "#fff",
            borderRadius: 8,
            fontSize: 12,
            display: "none",
            zIndex: 20,
          }}
        />
      </div>
    </div>
  );
}
