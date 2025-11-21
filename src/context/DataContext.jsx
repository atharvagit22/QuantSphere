// src/context/DataContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import axios from "axios";

import { parseCSV } from "../utils/dataParser.js";
import { demoMainData } from "../utils/demoData.js";
import { computeRSI, computeMACD } from "../utils/indicators.js";

import WebSocketManager from "./WebSocketManager.js";
import createPortfolioEngine from "./PortfolioEngine.js";
import createAlertsEngine from "./AlertsEngine.js";   // ✅ Correct

import { ema as _ema } from "../utils/analyticsHelpers.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem("qd_data_v1");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [csvData, setCsvData] = useState(() => data || {});
  const [liveData, setLiveData] = useState(null);

  const [mode, setMode] = useState("csv");
  const [isLiveSynced, setIsLiveSynced] = useState(false);

  const ALPHA_KEY =
    import.meta.env.VITE_ALPHA_KEY ||
    (typeof window !== "undefined" && window.__ALPHA_FALLBACK_KEY) ||
    null;

  const wsManagerRef = useRef(null);
  const portfolioRef = useRef(null);
  const alertsRef = useRef(null);

  if (!wsManagerRef.current) wsManagerRef.current = WebSocketManager();
  if (!portfolioRef.current) portfolioRef.current = createPortfolioEngine();
  if (!alertsRef.current) alertsRef.current = createAlertsEngine(); // ✅ FIXED

  const wsManager = wsManagerRef.current;
  const portfolio = portfolioRef.current;
  const alertsEngine = alertsRef.current;

  useEffect(() => {
    try {
      localStorage.setItem("qd_data_v1", JSON.stringify(csvData || {}));
    } catch {}
  }, [csvData]);

  function enrichData(parsed) {
    const out = { ...parsed };

    const priceSeries = (out.equityData || []).map((p) =>
      Number(p.equity || 0)
    );

    try {
      out.indicators = {
        rsi: computeRSI(priceSeries, 14),
        macd: computeMACD(priceSeries, {
          fast: 12,
          slow: 26,
          signal: 9,
        }),
      };
    } catch {
      out.indicators = {
        rsi: [],
        macd: { macd: [], signal: [], hist: [] },
      };
    }

    out.markers = (out.orders || []).map((o) => ({
      time: o.from || o.date || new Date().toISOString().slice(0, 10),
      position: o.pl >= 0 ? "aboveBar" : "belowBar",
      color: o.pl >= 0 ? "#10b981" : "#ef4444",
      id: o.id,
      text: (o.side || "").slice(0, 1).toUpperCase(),
    }));

    return out;
  }

  const loadCSVFile = useCallback(async (file) => {
    const parsed = await parseCSV(file);
    const enriched = enrichData(parsed);
    setCsvData(enriched);
    setData(enriched);
    setIsLiveSynced(false);
    return enriched;
  }, []);

  const loadMultipleCSVFiles = useCallback(async (files) => {
    const list = [];
    for (const f of Array.from(files)) {
      const parsed = await parseCSV(f);
      list.push(enrichData(parsed));
    }
    setCsvData((prev) => ({ ...(prev || {}), compare: list }));
    setData((prev) => ({ ...(prev || {}), compare: list }));
    setIsLiveSynced(false);
    return list;
  }, []);

  const fetchOHLC = useCallback(
    async (symbol, interval = "5min", source = "auto") => {
      const isCrypto =
        /USDT$|BTC$|ETH$|USD$/i.test(symbol) ||
        symbol.toLowerCase().includes("btc") ||
        symbol.toLowerCase().includes("usdt");

      const useBinance = source === "binance" || (source === "auto" && isCrypto);

      if (useBinance) {
        try {
          const map = { "1min": "1m", "5min": "5m", "15min": "15m", daily: "1d" };
          const k = map[interval] || "5m";
          const sym = symbol.toUpperCase();
          const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${k}&limit=500`;
          const res = await axios.get(url);
          const candles = res.data.map((c) => ({
            time: new Date(c[0]).toISOString(),
            open: Number(c[1]),
            high: Number(c[2]),
            low: Number(c[3]),
            close: Number(c[4]),
            volume: Number(c[5]),
          }));
          return { source: "binance", symbol, interval, candles };
        } catch {}
      }

      if (!ALPHA_KEY) throw new Error("Missing VITE_ALPHA_KEY.");

      try {
        if (interval === "daily") {
          const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_KEY}`;
          const res = await axios.get(url);

          const raw = res.data["Time Series (Daily)"] || {};
          const times = Object.keys(raw).slice(0, 500).reverse();

          const candles = times.map((t) => ({
            time: t,
            open: Number(raw[t]["1. open"]),
            high: Number(raw[t]["2. high"]),
            low: Number(raw[t]["3. low"]),
            close: Number(raw[t]["4. close"]),
            volume: Number(raw[t]["6. volume"] || 0),
          }));
          return { source: "alphavantage", symbol, interval, candles };
        } else {
          const func = "TIME_SERIES_INTRADAY";
          const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=${interval}&outputsize=compact&apikey=${ALPHA_KEY}`;
          const res = await axios.get(url);

          const raw = res.data[`Time Series (${interval})`] || {};
          const times = Object.keys(raw).slice(0, 500).reverse();

          const candles = times.map((t) => ({
            time: t,
            open: Number(raw[t]["1. open"]),
            high: Number(raw[t]["2. high"]),
            low: Number(raw[t]["3. low"]),
            close: Number(raw[t]["4. close"]),
            volume: Number(raw[t]["5. volume"]),
          }));

          return { source: "alphavantage", symbol, interval, candles };
        }
      } catch (err) {
        console.error("fetchOHLC error", err);
        throw err;
      }
    },
    [ALPHA_KEY]
  );

  const fetchOrderbook = useCallback(async (symbol, limit = 50) => {
    try {
      const sym = symbol.toUpperCase();
      const url = `https://api.binance.com/api/v3/depth?symbol=${sym}&limit=${Math.min(
        1000,
        limit
      )}`;
      const res = await axios.get(url);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  const fetchTrending = useCallback(
    async (symbols = ["AAPL", "TSLA", "MSFT", "NVDA", "BTCUSDT"]) => {
      const results = [];
      for (const s of symbols) {
        try {
          if (/USDT$|BTC$|ETH$/i.test(s)) {
            const res = await axios.get(
              `https://api.binance.com/api/v3/klines?symbol=${s.toUpperCase()}&interval=1d&limit=2`
            );
            const last = res.data[res.data.length - 1];
            const prev = res.data[res.data.length - 2];
            const pct = prev ? (last[4] - prev[4]) / prev[4] : 0;

            results.push({
              symbol: s,
              pct,
              source: "binance",
              last: Number(last[4]),
            });
          } else {
            if (!ALPHA_KEY) {
              results.push({ symbol: s, pct: 0, source: "none" });
              continue;
            }

            const res = await axios.get(
              `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${s}&outputsize=compact&apikey=${ALPHA_KEY}`
            );
            const raw = res.data["Time Series (Daily)"] || {};
            const keys = Object.keys(raw).slice(0, 2);

            if (keys.length >= 2) {
              const last = Number(raw[keys[0]]["4. close"]);
              const prev = Number(raw[keys[1]]["4. close"]);
              const pct = prev ? (last - prev) / prev : 0;

              results.push({ symbol: s, pct, source: "alphavantage", last });
            } else {
              results.push({ symbol: s, pct: 0, source: "alphavantage", last: 0 });
            }
          }

          await new Promise((r) => setTimeout(r, 200));
        } catch {
          results.push({ symbol: s, pct: 0, source: "error" });
        }
      }

      return results.sort((a, b) => b.pct - a.pct);
    },
    [ALPHA_KEY]
  );

  function syncLiveToDashboard(livePayload) {
    if (!livePayload) return;

    const candles = livePayload.candles || [];
    if (!candles.length) return;

    setLiveData((prev) => ({ ...(prev || {}), ...livePayload, candles }));

    const equityData = candles.map((c) => ({
      date: c.time,
      equity: Number(c.close),
    }));

    let peak = -Infinity;
    const drawdownData = equityData.map((p) => {
      if (p.equity > peak) peak = p.equity;
      return {
        date: p.date,
        value: peak === -Infinity ? 0 : (p.equity - peak) / peak,
      };
    });

    const returns = equityData.slice(1).map((p, i) => {
      const prev = equityData[i].equity;
      return prev ? (p.equity - prev) / prev : 0;
    });

    const newData = {
      equityData,
      drawdownData,
      orders: livePayload.orders || [],
      tradeVolume: [],
      kpis: {
        total_pl:
          equityData.length > 1
            ? equityData[equityData.length - 1].equity -
              equityData[0].equity
            : 0,
        win_rate:
          returns.length > 0
            ? returns.filter((r) => r > 0).length / returns.length
            : 0,
        max_drawdown: Math.min(...drawdownData.map((d) => d.value)),
        total_trades: (livePayload.orders || []).length,
      },
    };

    setData((prev) => ({ ...(prev || {}), ...newData }));
  }

  const loadDemo = useCallback(() => {
    const demo = enrichData(demoMainData || {});
    setCsvData(demo);
    setData(demo);
    setIsLiveSynced(false);
    return demo;
  }, []);

  function resetData() {
    setData({});
    setCsvData({});
    setLiveData(null);
    setIsLiveSynced(false);
    localStorage.removeItem("qd_data_v1");
  }

  const api = {
    data,
    setData,
    csvData,
    setCsvData,
    liveData,
    setLiveData,

    mode,
    setMode,

    get current() {
      return mode === "live" && liveData
        ? { ...(liveData || {}), source: "live" }
        : data || csvData || {};
    },

    loadCSVFile,
    loadMultipleCSVFiles,
    loadDemo,
    resetData,

    fetchOHLC,
    fetchOrderbook,
    fetchTrending,
    syncLiveToDashboard,

    // Portfolio
    positions: portfolio.getPositions(),
    orders: portfolio.getOrders(),
    openPosition: portfolio.openPosition,
    closePosition: portfolio.closePosition,
    updateUnrealizedPrices: portfolio.updateUnrealizedPrices,
    computeSimulatorKPIs: portfolio.computeSimulatorKPIs,

    // Alerts
    alerts: alertsEngine.getAlerts(),
    addAlert: alertsEngine.addAlert,
    removeAlert: alertsEngine.removeAlert,
    toggleAlert: alertsEngine.toggleAlert,
    alertsLog: alertsEngine.getLog(),
    pushAlertEvent: alertsEngine.pushEvent,

    // WebSocket
    connectWS: (sym, opts, cb) => {
      if (typeof cb === "function") wsManager.subscribe(cb);
      return wsManager.connect(sym, opts);
    },
    disconnectWS: wsManager.disconnect,
    subscribeTrades: wsManager.subscribe,
    unsubscribeTrades: wsManager.unsubscribe,

    isLiveSynced,
    setIsLiveSynced,
  };

  return (
    <DataContext.Provider value={api}>{children}</DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
