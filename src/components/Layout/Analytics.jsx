// src/components/Layout/Analytics.jsx
import React from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import '../../utils/chartSetup';
import * as dd from '../../utils/dummyData.js';
const dummyData = dd.default || dd.dummyData || dd || {};

export default function Analytics() {
  const { residuals = [], equityData = [] } = dummyData;

  const scatterData = {
    labels: residuals.map((_, i) => i),
    datasets: [{
      label: 'Residuals',
      data: residuals.map(r => ({ x: r.x ?? Math.random()*10, y: r.y ?? Math.random()*10 })),
      pointBackgroundColor: '#fb923c'
    }]
  };

  const rolling = {
    labels: equityData.map(e => e.date).slice(-40),
    datasets: [
      { label: 'Equity', data: equityData.map(e => e.equity).slice(-40), borderColor: '#60a5fa', tension: 0.3, fill:false },
      { label: 'Model', data: equityData.map((e,i) => Number(e.equity)*0.98).slice(-40), borderColor: '#a78bfa', tension: 0.3, fill:false }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <div className="text-sm text-gray-400">Deeper statistical views</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Correlation Heatmap</div>
          <div className="h-48 flex items-center justify-center text-gray-500">Heatmap placeholder — will render correlation matrix</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Trade Frequency Heatmap</div>
          <div className="h-48 flex items-center justify-center text-gray-500">Frequency grid placeholder</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Residuals Scatter</div>
          <div className="h-48 mt-3">
            <Scatter data={scatterData} options={{ maintainAspectRatio:false }} />
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm text-gray-400">Rolling Equity Comparison</div>
          <div className="h-48 mt-3">
            <Line data={rolling} options={{ maintainAspectRatio:false }} />
          </div>
        </div>
      </div>
    </div>
  );
}
