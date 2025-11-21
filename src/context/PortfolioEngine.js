// PortfolioEngine.js
// Lightweight in-memory portfolio simulator with localStorage persistence.
// Exposes: getPositions, getOrders, openPosition, closePosition, updateUnrealizedPrices, computeSimulatorKPIs

export default function createPortfolioEngine() {
  const KEY = "qd_sim_v1";
  let state = { positions: [], orders: [] };

  // load from localStorage
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.positions = parsed.positions || [];
      state.orders = parsed.orders || [];
    }
  } catch {}

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  function _computeAvgEntry(existingAvg, existingQty, newPrice, newQty) {
    const totQty = existingQty + newQty;
    if (totQty === 0) return 0;
    return ((existingAvg * existingQty) + (newPrice * newQty)) / totQty;
  }

  function getPositions() {
    return state.positions;
  }
  function getOrders() {
    return state.orders;
  }

  function openPosition({ symbol, side = "long", qty = 1, price, timestamp = new Date().toISOString() }) {
    if (!symbol || !price || qty <= 0) throw new Error("Invalid openPosition args");
    const found = state.positions.find((p) => p.symbol === symbol && p.side === side);
    if (found) {
      const newAvg = _computeAvgEntry(found.avgEntry, found.qty, price, qty);
      found.qty = found.qty + qty;
      found.avgEntry = newAvg;
      found.updatedAt = timestamp;
    } else {
      state.positions.push({
        id: `${symbol}-${Date.now()}`,
        symbol,
        side,
        qty,
        avgEntry: price,
        openPrice: price,
        openTime: timestamp,
        unrealizedPL: 0,
      });
    }
    persist();
    return getPositions();
  }

  function closePosition({ id, symbol, qty = null, price, timestamp = new Date().toISOString() }) {
    const found = id ? state.positions.find((p) => p.id === id) : state.positions.find((p) => p.symbol === symbol);
    if (!found) return getPositions();
    const closeQty = qty == null ? found.qty : Math.min(found.qty, qty);
    const realized = (price - found.avgEntry) * (found.side === "long" ? 1 : -1) * closeQty;
    // append order
    state.orders.push({
      id: `sim-${Date.now()}`,
      symbol: found.symbol,
      side: found.side,
      qty: closeQty,
      entry: found.avgEntry,
      exit: price,
      pl: realized,
      openTime: found.openTime,
      closeTime: timestamp,
    });
    if (closeQty >= found.qty) {
      state.positions = state.positions.filter((p) => p.id !== found.id);
    } else {
      found.qty -= closeQty;
      found.updatedAt = timestamp;
    }
    persist();
    return { positions: getPositions(), orders: getOrders() };
  }

  function updateUnrealizedPrices(symbol, latestPrice) {
    state.positions = state.positions.map((p) => {
      if (p.symbol !== symbol) return p;
      const upnl = (latestPrice - p.avgEntry) * (p.side === "long" ? 1 : -1) * p.qty;
      return { ...p, unrealizedPL: upnl };
    });
    persist();
    return getPositions();
  }

  function computeSimulatorKPIs() {
    const totalPL = state.orders.reduce((s, o) => s + (o.pl || 0), 0) + state.positions.reduce((s, p) => s + (p.unrealizedPL || 0), 0);
    const wins = state.orders.filter((o) => o.pl > 0).length;
    const winRate = state.orders.length ? wins / state.orders.length : 0;
    return { totalPL, winRate, totalTrades: state.orders.length };
  }

  return {
    getPositions,
    getOrders,
    openPosition,
    closePosition,
    updateUnrealizedPrices,
    computeSimulatorKPIs,
  };
}
