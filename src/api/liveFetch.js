// src/api/liveFetch.js
import { fetchIntraday } from "./liveData";

/**
 * startPolling(symbol, onUpdate, intervalMs) -> returns stop() function
 */
export function startPolling(symbol = "AAPL", onUpdate = () => {}, intervalMs = 5000) {
  let id = null;
  let running = true;

  async function poll() {
    try {
      const candles = await fetchIntraday(symbol);
      // fetchIntraday returns array of candles with {time, open, high, low, close}
      onUpdate(candles);
    } catch (err) {
      // swallow errors for now
      console.warn("liveFetch poll error", err);
    }
  }

  // initial poll
  poll();
  id = setInterval(() => {
    if (!running) return;
    poll();
  }, intervalMs);

  return () => {
    running = false;
    if (id) clearInterval(id);
  };
}
