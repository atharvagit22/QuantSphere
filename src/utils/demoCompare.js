export const demoCompareSets = [
  {
    id: "A",
    name: "Strategy A",
    equityData: [
      { date: "2025-01-01", equity: 10000 },
      { date: "2025-02-01", equity: 10250 },
      { date: "2025-03-01", equity: 10800 },
      { date: "2025-04-01", equity: 11500 },
      { date: "2025-05-01", equity: 12300 }
    ],
    kpis: { win_rate: 0.62, total_trades: 12 }
  },
  {
    id: "B",
    name: "Strategy B",
    equityData: [
      { date: "2025-01-01", equity: 10000 },
      { date: "2025-02-01", equity: 10100 },
      { date: "2025-03-01", equity: 10500 },
      { date: "2025-04-01", equity: 11100 },
      { date: "2025-05-01", equity: 12500 }
    ],
    kpis: { win_rate: 0.71, total_trades: 11 }
  },
  {
    id: "C",
    name: "Strategy C",
    equityData: [
      { date: "2025-01-01", equity: 10000 },
      { date: "2025-02-01", equity: 9900 },
      { date: "2025-03-01", equity: 10300 },
      { date: "2025-04-01", equity: 10700 },
      { date: "2025-05-01", equity: 10900 }
    ],
    kpis: { win_rate: 0.58, total_trades: 9 }
  }
];
