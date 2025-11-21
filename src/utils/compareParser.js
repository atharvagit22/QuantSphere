// src/utils/compareParser.js

// --- Convert equity → returns series ---
export function returnsSeriesFromEquity(equity) {
  const out = [];
  for (let i = 1; i < equity.length; i++) {
    const prev = Number(equity[i - 1].equity || 0);
    const cur = Number(equity[i].equity || 0);
    out.push(prev === 0 ? 0 : (cur - prev) / prev);
  }
  return out;
}

// --- Normalize compare sets for optimizer ---
export function normalizeCompareSets(compareSets) {
  if (!compareSets || !Array.isArray(compareSets)) return [];

  return compareSets.map((set, idx) => ({
    id: set.id || `set_${idx}`,
    name: set.name || `Strategy ${idx + 1}`,
    equityData: set.equityData || [],
    orders: set.orders || [],
    kpis: set.kpis || {},
    trades: set.orders?.length || 0
  }));
}

// --- Convert normalized sets to returns arrays for optimizer ---
export function returnsSeriesForOptimizer(normalized) {
  if (!normalized || !Array.isArray(normalized)) return [];

  return normalized.map((s) => returnsSeriesFromEquity(s.equityData));
}

// --- NEW: compare metrics for CompareEnhanced.jsx ---
export function compareMetrics(setA, setB) {
  if (!setA || !setB) return null;

  const equityA = setA.equityData || [];
  const equityB = setB.equityData || [];

  const lastA = equityA[equityA.length - 1]?.equity || 0;
  const lastB = equityB[equityB.length - 1]?.equity || 0;

  const startA = equityA[0]?.equity || 1;
  const startB = equityB[0]?.equity || 1;

  // % Return
  const retA = ((lastA - startA) / startA) * 100;
  const retB = ((lastB - startB) / startB) * 100;

  // Sharpe estimate (simple daily returns)
  const ra = returnsSeriesFromEquity(equityA);
  const rb = returnsSeriesFromEquity(equityB);

  const sharpe = (arr) => {
    if (!arr.length) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
    return sd === 0 ? 0 : (mean / sd) * Math.sqrt(252);
  };

  return {
    equityDiff: lastA - lastB,
    returnA: retA,
    returnB: retB,
    sharpeA: sharpe(ra),
    sharpeB: sharpe(rb),
    tradesA: setA.orders?.length || 0,
    tradesB: setB.orders?.length || 0,
  };
}

export default {
  returnsSeriesFromEquity,
  normalizeCompareSets,
  returnsSeriesForOptimizer,
  compareMetrics,
};
