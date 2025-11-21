// src/components/OrdersTable.jsx
import React from "react";

export default function OrdersTable({ orders = [] }) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return <div className="text-sm text-gray-400">No orders available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400">
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">Instrument</th>
            <th className="px-2 py-2">Side</th>
            <th className="px-2 py-2">From</th>
            <th className="px-2 py-2">To</th>
            <th className="px-2 py-2">Open</th>
            <th className="px-2 py-2">Close</th>
            <th className="px-2 py-2">P/L</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-gray-800">
              <td className="px-2 py-2">{o.id}</td>
              <td className="px-2 py-2">{o.instrument}</td>
              <td className="px-2 py-2">{o.side}</td>
              <td className="px-2 py-2">{o.from}</td>
              <td className="px-2 py-2">{o.to}</td>
              <td className="px-2 py-2">{o.open ?? "-"}</td>
              <td className="px-2 py-2">{o.close ?? "-"}</td>
              <td className={`px-2 py-2 ${ (o.pl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400" }`}>
                {(o.pl ?? 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
