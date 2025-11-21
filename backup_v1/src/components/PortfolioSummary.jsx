import React from "react";

export default function PortfolioSummary({ portfolio }) {
  if (!portfolio) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div>
        <div className="text-sm text-gray-500">Total Value</div>
        <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Invested Capital</div>
        <div className="text-2xl font-bold">${portfolio.invested.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Total Returns</div>
        <div className="text-2xl font-bold text-emerald-500">
          +${portfolio.returns.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
