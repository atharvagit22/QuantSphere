// src/utils/demoData.js

export const demoMainData = {
  equityData: [
    { date: "2025-01-01", equity: 10000 },
    { date: "2025-02-01", equity: 10400 },
    { date: "2025-03-01", equity: 10900 },
    { date: "2025-04-01", equity: 11500 },
    { date: "2025-05-01", equity: 12200 },
  ],

  drawdownData: [
    { date: "2025-01", value: -5 },
    { date: "2025-02", value: -3 },
    { date: "2025-03", value: -6 },
    { date: "2025-04", value: -2 },
    { date: "2025-05", value: -1 },
  ],

  prices: [
    { date: "2025-01-01", close: 100 },
    { date: "2025-02-01", close: 103 },
    { date: "2025-03-01", close: 107 },
    { date: "2025-04-01", close: 112 },
    { date: "2025-05-01", close: 118 },
  ],

  tradeVolume: [
    { date: "2025-01", buy: 20, sell: 12 },
    { date: "2025-02", buy: 10, sell: 16 },
    { date: "2025-03", buy: 14, sell: 9 },
    { date: "2025-04", buy: 18, sell: 20 },
  ],

  orders: [
    { id: 1, instrument: "AAPL", side: "Buy", open: 100, close: 105, pl: 50 },
    { id: 2, instrument: "TSLA", side: "Sell", open: 200, close: 190, pl: 100 },
  ],

  kpis: {
    total_pl: 15432,
    win_rate: 0.67,
    max_drawdown: -0.06,
    total_trades: 12,
  },

  compare: [],
};

export const demoCompareSets = [
  {
    id: "set1",
    name: "Strategy A",
    equityData: [
      { date: "2025-01-01", equity: 10000 },
      { date: "2025-02-01", equity: 10150 },
      { date: "2025-03-01", equity: 10400 },
      { date: "2025-04-01", equity: 10850 },
      { date: "2025-05-01", equity: 11300 },
    ],
    kpis: { win_rate: 0.62 },
    orders: [],
  },
  {
    id: "set2",
    name: "Strategy B",
    equityData: [
      { date: "2025-01-01", equity: 10000 },
      { date: "2025-02-01", equity: 10500 },
      { date: "2025-03-01", equity: 11200 },
      { date: "2025-04-01", equity: 11800 },
      { date: "2025-05-01", equity: 12100 },
    ],
    kpis: { win_rate: 0.71 },
    orders: [],
  },
  {
    id: "set3",
    name: "Strategy C",
    equityData: [
      { date: "2025-01-01", equity: 10000 },
      { date: "2025-02-01", equity: 9800 },
      { date: "2025-03-01", equity: 10200 },
      { date: "2025-04-01", equity: 10800 },
      { date: "2025-05-01", equity: 11600 },
    ],
    kpis: { win_rate: 0.58 },
    orders: [],
  },
];
