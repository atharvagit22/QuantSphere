import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import '../../utils/chartSetup';

export default function Portfolio() {
  const portfolioData = {
    labels: ['Tech', 'Auto', 'Retail', 'Energy'],
    datasets: [{ data: [45,25,18,12], backgroundColor: ['#60a5fa','#7c3aed','#06b6d4','#f472b6'] }]
  };

  const holdings = [
    { symbol: 'AAPL', qty: 25, value: 4550 },
    { symbol: 'TSLA', qty: 10, value: 7800 },
    { symbol: 'AMZN', qty: 5, value: 15500 }
  ];

  const mini = { labels: ['Jan','Feb','Mar','Apr','May'], datasets: [{ data: [10,12,9,14,18], borderColor: '#a78bfa', fill: false }] };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Portfolio</h2>
        <div className="text-sm text-gray-400">Holdings summary</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="text-sm text-gray-400">Asset Allocation</div>
          <div className="flex items-center gap-6 mt-4">
            <div className="w-48 h-48">
              <Doughnut data={portfolioData} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-400">Portfolio Value YTD</div>
              <div className="h-24 mt-3">
                <Line data={mini} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="text-sm text-gray-400">Holdings</div>
          <table className="w-full mt-4 text-sm">
            <thead className="text-xs text-gray-400 border-b border-white/6">
              <tr><th className="py-2">Symbol</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Value</th><th className="py-2 text-right">Exposure</th></tr>
            </thead>
            <tbody>
              {holdings.map((h,i) => (
                <tr key={i} className="border-b border-white/4">
                  <td className="py-3">{h.symbol}</td>
                  <td className="py-3 text-right">{h.qty}</td>
                  <td className="py-3 text-right">${h.value.toLocaleString()}</td>
                  <td className="py-3 text-right">{((h.value/holdings.reduce((a,b)=>a+b.value,0))*100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
