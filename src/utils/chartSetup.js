// src/utils/chartSetup.js
// Lightweight Charts wrapper helpers for QuantDash
import { createChart, CrosshairMode } from "lightweight-charts";

/** convert ISO/string/Date/number -> unix seconds */
function toSec(t) {
  if (!t && t !== 0) return null;
  if (typeof t === "number") return Math.floor(t);
  const d = new Date(t);
  if (isNaN(d.getTime())) return null;
  return Math.floor(d.getTime() / 1000);
}

/**
 * initChart(container, opts)
 * Returns { chart, candleSeries, volumeSeries, setCandles, setVolume, updateLatest, addOverlayLine, resetOverlays, setMarkers, destroy }
 */
export function initChart(container, opts = {}) {
  if (!container) return null;

  const chart = createChart(container, {
    width: container.clientWidth,
    height: opts.height || 380,
    layout: {
      background: { color: opts.background || "#05060a" },
      textColor: opts.textColor || "#cbd5e1",
    },
    grid: {
      vertLines: { color: "rgba(255,255,255,0.03)" },
      horzLines: { color: "rgba(255,255,255,0.03)" },
    },
    crosshair: { mode: CrosshairMode.Normal },
    timeScale: {
      rightOffset: 5,
      barSpacing: 12,
      borderVisible: false,
      timeVisible: true,
      // show seconds (important for per-second candles)
      secondsVisible: true,
      tickMarkFormatter: (time, tickMarkType, locale) => {
        // time is unix seconds or string (lightweight-charts may pass number)
        try {
          const d = new Date(time * 1000);
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          const ss = String(d.getSeconds()).padStart(2, "0");
          return `${hh}:${mm}:${ss}`;
        } catch {
          return String(time);
        }
      },
    },
    rightPriceScale: {
      borderVisible: false,
    },
  });

  const candleSeries = chart.addCandlestickSeries({
    upColor: "#16a34a",
    downColor: "#ef4444",
    borderVisible: true,
    wickUpColor: "#16a34a",
    wickDownColor: "#ef4444",
    priceLineVisible: false,
  });

  const volumeSeries = chart.addHistogramSeries({
    priceScaleId: "",
    scaleMargins: { top: 0.8, bottom: 0 },
    priceFormat: { type: "volume" },
  });

  const overlays = [];

  function setCandles(raw = []) {
    const data = raw
      .map((c) => {
        const tm = toSec(c.time ?? c.t ?? c[0]);
        if (!tm) return null;
        return {
          time: tm,
          open: Number(c.open ?? c.o ?? c[1] ?? 0),
          high: Number(c.high ?? c.h ?? c[2] ?? 0),
          low: Number(c.low ?? c.l ?? c[3] ?? 0),
          close: Number(c.close ?? c.c ?? c[4] ?? 0),
        };
      })
      .filter(Boolean);
    try { candleSeries.setData(data); } catch (e) {}
    return data;
  }

  function setVolume(raw = []) {
    const data = raw
      .map((c) => {
        const tm = toSec(c.time ?? c.t ?? c[0]);
        if (!tm) return null;
        const open = Number(c.open ?? c.o ?? c[1] ?? 0);
        const close = Number(c.close ?? c.c ?? c[4] ?? 0);
        return {
          time: tm,
          value: Number(c.volume ?? c.v ?? 0),
          color: close >= open ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.45)",
        };
      })
      .filter(Boolean);
    try { volumeSeries.setData(data); } catch (e) {}
  }

  function updateLatest(c) {
    const tm = toSec(c.time ?? c.t ?? c[0]);
    if (!tm) return;
    const point = {
      time: tm,
      open: Number(c.open ?? c.o ?? c[1] ?? 0),
      high: Number(c.high ?? c.h ?? c[2] ?? 0),
      low: Number(c.low ?? c.l ?? c[3] ?? 0),
      close: Number(c.close ?? c.c ?? c[4] ?? 0),
    };
    try { candleSeries.update(point); } catch (e) {}
    try {
      volumeSeries.update({
        time: tm,
        value: Number(c.volume ?? c.v ?? 0),
        color: point.close >= point.open ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.45)",
      });
    } catch (e) {}
  }

  function addOverlayLine(options = {}) {
    const s = chart.addLineSeries({
      color: options.color || "#60a5fa",
      lineWidth: options.lineWidth ?? 2,
      priceLineVisible: false,
    });
    overlays.push(s);
    return s;
  }

  function resetOverlays() {
    overlays.forEach((s) => {
      try { chart.removeSeries(s); } catch {}
    });
    overlays.length = 0;
  }

  function setMarkers(markers = []) {
    try {
      candleSeries.setMarkers(markers);
    } catch (e) {}
  }

  function destroy() {
    try { chart.remove(); } catch {}
  }

  return {
    chart,
    candleSeries,
    volumeSeries,
    setCandles,
    setVolume,
    updateLatest,
    addOverlayLine,
    resetOverlays,
    setMarkers,
    destroy,
  };
}

/** convenience destroy */
export function destroyChart(obj) {
  if (!obj) return;
  try {
    if (obj.destroy) obj.destroy();
  } catch {}
}
