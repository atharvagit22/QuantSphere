// src/utils/dummyData.js
export const dummyData = {
  kpis: {
    total_pl: 15432.45,
    win_rate: 0.678,
    sharpe: 1.42,
    max_drawdown: -8.6,
  },

  equityData: [
    { date: "2025-01-01", equity: 10000 },
    { date: "2025-02-01", equity: 10450 },
    { date: "2025-03-01", equity: 10900 },
    { date: "2025-04-01", equity: 11300 },
    { date: "2025-05-01", equity: 12000 },
  ],

  drawdownData: [
    { date: "2025-01", value: -5 },
    { date: "2025-02", value: -3 },
    { date: "2025-03", value: -7 },
    { date: "2025-04", value: -2 },
    { date: "2025-05", value: -1 },
  ],

  tradeVolume: [
    { date: "2025-01", buy: 120, sell: 80 },
    { date: "2025-02", buy: 150, sell: 95 },
    { date: "2025-03", buy: 180, sell: 130 },
    { date: "2025-04", buy: 210, sell: 170 },
    { date: "2025-05", buy: 250, sell: 200 },
  ],

  tradeDistribution: [
    { bucket: "-5% to 0%", count: 10 },
    { bucket: "0% to 5%", count: 45 },
    { bucket: "5% to 10%", count: 30 },
    { bucket: ">10%", count: 15 },
  ],

  residuals: [
    { date: "2025-01-01", residual: 0.2 },
    { date: "2025-02-01", residual: -0.1 },
    { date: "2025-03-01", residual: 0.05 },
  ],

  performance: {
    sharpe: 1.42,
    annualisedReturn: 0.18,
    winRate: 0.678,
  },

  orders: [
    { id: 1, instrument: "AAPL", side: "Buy", from: "2025-02-01", to: "2025-03-01", open: 170, close: 185, pl: 150.5 },
    { id: 2, instrument: "TSLA", side: "Sell", from: "2025-03-05", to: "2025-04-02", open: 720, close: 700, pl: -100.0 },
    { id: 3, instrument: "AMZN", side: "Buy", from: "2025-04-10", to: "2025-04-28", open: 3100, close: 3200, pl: 300.0 },
  ],
};

export default dummyData;
