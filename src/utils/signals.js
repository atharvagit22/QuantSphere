// src/utils/signals.js
export function computeRSISignals(rsi, threshold = { overbought: 70, oversold: 30 }) {
  const signals = [];
  for (let i = 1; i < rsi.length; i++) {
    const prev = rsi[i - 1];
    const cur = rsi[i];
    if (!prev || !cur) continue;

    if (prev > threshold.overbought && cur <= threshold.overbought) {
      signals.push({ index: i, type: 'sell', reason: 'RSI Overbought → Sell' });
    }
    if (prev < threshold.oversold && cur >= threshold.oversold) {
      signals.push({ index: i, type: 'buy', reason: 'RSI Oversold → Buy' });
    }
  }
  return signals;
}

export function computeMACDSignals(macd) {
  const sig = [];
  const { macdLine, signalLine } = macd;
  for (let i = 1; i < macdLine.length; i++) {
    const prevDiff = macdLine[i - 1] - signalLine[i - 1];
    const curDiff = macdLine[i] - signalLine[i];
    if (prevDiff <= 0 && curDiff > 0) sig.push({ index: i, type: 'buy', reason: 'MACD Bullish Cross' });
    if (prevDiff >= 0 && curDiff < 0) sig.push({ index: i, type: 'sell', reason: 'MACD Bearish Cross' });
  }
  return sig;
}
