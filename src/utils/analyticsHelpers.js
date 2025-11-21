// analyticsHelpers.js — small perf tweaks + exports used across components

export function sma(values, period) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    const denom = Math.min(i + 1, period);
    out.push(sum / denom);
  }
  return out;
}

export function ema(values, period) {
  const out = [];
  const k = 2 / (period + 1);
  let prev = values[0] ?? 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    prev = i === 0 ? v : v * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null);
  if (values.length < 2) return out;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period && i < values.length; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gains += d; else losses += Math.abs(d);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  if (period < values.length) {
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out[period] = 100 - 100 / (1 + rs);
  }
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(0, change);
    const loss = Math.max(0, -change);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out[i] = 100 - 100 / (1 + rs);
  }
  return out;
}

export function macd(values, fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = values.map((_, i) => (emaFast[i] ?? 0) - (emaSlow[i] ?? 0));
  const signalLine = ema(macdLine, signal);
  const hist = macdLine.map((m, i) => m - (signalLine[i] ?? 0));
  return { macdLine, signalLine, hist };
}

export function detectMACross(maShort, maLong) {
  const signals = [];
  for (let i = 1; i < Math.min(maShort.length, maLong.length); i++) {
    const prevShort = maShort[i - 1];
    const prevLong = maLong[i - 1];
    const curShort = maShort[i];
    const curLong = maLong[i];
    if (prevShort == null || prevLong == null || curShort == null || curLong == null) continue;
    if (prevShort <= prevLong && curShort > curLong) signals.push({ index: i, type: "buy" });
    if (prevShort >= prevLong && curShort < curLong) signals.push({ index: i, type: "sell" });
  }
  return signals;
}
