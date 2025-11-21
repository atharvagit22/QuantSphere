export function computeReturnsFromEquity(equitySeries) {
  const returns = [];
  for (let i = 1; i < equitySeries.length; i++) {
    const prev = equitySeries[i - 1].equity || 0;
    const cur = equitySeries[i].equity || 0;
    returns.push(prev === 0 ? 0 : (cur - prev) / prev);
  }
  return returns;
}

export function randomWeights(n) {
  const arr = Array.from({ length: n }, () => Math.random());
  const s = arr.reduce((a, b) => a + b, 0);
  return arr.map((v) => v / s);
}

export function simulateFrontier(assetsReturns, points = 200) {
  if (!assetsReturns || assetsReturns.length === 0) return [];

  const n = assetsReturns.length;
  const T = assetsReturns[0].length;
  const results = [];

  for (let p = 0; p < points; p++) {
    const w = randomWeights(n);
    const port = new Array(T).fill(0);

    for (let t = 0; t < T; t++) {
      let r = 0;
      for (let i = 0; i < n; i++) {
        r += (assetsReturns[i][t] || 0) * w[i];
      }
      port[t] = r;
    }

    const mean = port.reduce((a, b) => a + b, 0) / port.length;
    const variance =
      port.reduce((a, b) => a + (b - mean) ** 2, 0) / port.length;
    const sd = Math.sqrt(variance);
    const sharpe = sd === 0 ? 0 : mean / sd;

    results.push({ weights: w, ret: mean, risk: sd, sharpe });
  }

  return results.sort((a, b) => a.risk - b.risk);
}

export function pickBestSharpe(frontier) {
  if (!frontier || frontier.length === 0) return null;
  return frontier.reduce((best, cur) =>
    cur.sharpe > (best?.sharpe ?? -Infinity) ? cur : best
  );
}
