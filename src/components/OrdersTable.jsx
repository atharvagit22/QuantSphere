// src/components/OrdersTable.jsx
import React from 'react';

export default function OrdersTable({ orders = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-white/6">
            <th className="py-2 px-3">ID</th>
            <th className="py-2 px-3">Instrument</th>
            <th className="py-2 px-3">Side</th>
            <th className="py-2 px-3">Entry</th>
            <th className="py-2 px-3">Exit</th>
            <th className="py-2 px-3 text-right">P/L</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="py-6 text-center text-gray-500"
              >
                No trades yet — upload CSV to populate
              </td>
            </tr>
          )}

          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b border-white/4 hover:bg-white/2 transition-colors"
            >
              <td className="py-2 px-3">{o.id}</td>

              <td className="py-2 px-3">
                {o.instrument ?? o.symbol ?? "-"}
              </td>

              <td
                className={`py-2 px-3 ${
                  o.side?.toLowerCase() === "buy"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {o.side}
              </td>

              <td className="py-2 px-3">
                {o.open ?? o.entry ?? ""}
              </td>

              <td className="py-2 px-3">
                {o.close ?? o.exit ?? ""}
              </td>

              <td className="py-2 px-3 text-right">
                {typeof o.pl === "number"
                  ? `$${o.pl.toFixed(2)}`
                  : o.pnl ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
