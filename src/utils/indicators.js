// src/utils/indicators.js

import {
  sma as _sma,
  ema as _ema,
  rsi as _rsi,
  macd as _macd,
  detectMACross as _detectMACross
} from "./analyticsHelpers.js";

// ------------------------------------
// Public functions used by Signals.jsx
// ------------------------------------
export function sma(values, period) {
  return _sma(values, period);
}

export function rsi(values, period = 14) {
  return _rsi(values, period);
}

export function macd(values, fast = 12, slow = 26, signal = 9) {
  const { macdLine, signalLine, hist } = _macd(values, fast, slow, signal);
  return {
    macd: macdLine,
    signal: signalLine,
    hist,
    macdLine,
    signalLine
  };
}

export function detectMACross(a, b) {
  return _detectMACross(a, b);
}

// ------------------------------------
// Extra helpers used by DataContext
// ------------------------------------
export function computeRSI(priceSeries = [], period = 14) {
  const nums = priceSeries.map(v => Number(v || 0));
  return rsi(nums, period);
}

export function computeMACD(priceSeries = [], opts = { fast: 12, slow: 26, signal: 9 }) {
  const { fast, slow, signal } = opts;
  const v = macd(priceSeries, fast, slow, signal);

  return {
    macd: v.macd,
    signal: v.signal,
    hist: v.hist,
    macdLine: v.macdLine,
    signalLine: v.signalLine
  };
}

// Default export (optional)
export default {
  sma,
  rsi,
  macd,
  detectMACross,
  computeMACD,
  computeRSI
};
