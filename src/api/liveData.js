// src/api/liveData.js
const API_KEY = import.meta.env.VITE_ALPHA_KEY;

export async function fetchIntraday(symbol = "AAPL") {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=compact&apikey=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const raw = data["Time Series (5min)"] || {};

  const candles = Object.entries(raw)
    .map(([time, v]) => ({
      time,
      open: parseFloat(v["1. open"]),
      high: parseFloat(v["2. high"]),
      low: parseFloat(v["3. low"]),
      close: parseFloat(v["4. close"]),
    }))
    .reverse();

  return candles;
}
