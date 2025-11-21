const dummyData = {
  kpis: {
    total_pl: 15432.45,
    trades: 124,
    win_rate: 0.67,
    avg_pl: 124.5
  },
  equityData: [
    { date: '2025-01-01', equity: 10000 },
    { date: '2025-02-01', equity: 10450 },
    { date: '2025-03-01', equity: 10900 },
    { date: '2025-04-01', equity: 11300 },
    { date: '2025-05-01', equity: 12000 },
  ],
  drawdownData: [
    { date: '2025-01', value: -5 },
    { date: '2025-02', value: -3 },
    { date: '2025-03', value: -7 },
    { date: '2025-04', value: -2 },
    { date: '2025-05', value: -1 },
  ],
  tradeVolume: [
    { date: '2025-01', buy: 120, sell: 80 },
    { date: '2025-02', buy: 150, sell: 95 },
    { date: '2025-03', buy: 180, sell: 130 },
    { date: '2025-04', buy: 210, sell: 170 },
    { date: '2025-05', buy: 250, sell: 200 },
  ],
  orders: [
    { id: 1, instrument: 'AAPL', side: 'Buy', from: '2025-04-01', to: '2025-04-05', open: 182.3, close: 195.67, pl: 134.4 },
    { id: 2, instrument: 'TSLA', side: 'Sell', from: '2025-05-01', to: '2025-05-04', open: 780.1, close: 765.8, pl: -120.7 },
  ],
  residuals: [ /* for analytics */ ],
  tradeDistribution: []
};

export default dummyData;
