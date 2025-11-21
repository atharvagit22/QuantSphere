// PortfolioSimulator.jsx (polish)
import React, { useState, useEffect } from "react";

export default function PortfolioSimulator({ open, onClose, onOpenPosition, onClosePosition, positions = [], orders = [] }) {
  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState("long");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  useEffect(() => {
    const found = positions.find((p) => p.symbol === symbol);
    if (found) setPrice(found.avgEntry);
  }, [symbol, positions]);

  if (!open) return null;

  function submitOpen() {
    const p = parseFloat(price);
    if (!symbol || !p || qty <= 0) { alert("Invalid"); return; }
    onOpenPosition?.({ symbol, side, qty: Number(qty), price: p });
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-50 w-[560px] max-w-full bg-[#0b0f14] rounded-xl border border-[#111827] p-6 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Portfolio Simulator</h3>
          <button className="text-gray-400" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Symbol</label>
            <input className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Side</label>
            <select className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={side} onChange={(e) => setSide(e.target.value)}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Qty</label>
            <input type="number" className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-xs text-gray-400">Price</label>
            <input className="w-full px-3 py-2 bg-[#071022] rounded mt-1" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={submitOpen} className="px-4 py-2 bg-emerald-600 text-white rounded">Open Position</button>
          <button onClick={() => {
            if (positions.length === 0) { alert("No positions"); return; }
            const pos = positions[0];
            const exitPrice = price ? Number(price) : pos.avgEntry;
            onClosePosition?.({ id: pos.id, price: exitPrice });
          }} className="px-4 py-2 bg-rose-600 text-white rounded">Close First</button>
        </div>

        <div className="mt-5">
          <div className="text-sm text-gray-400">Open Positions</div>
          <div className="mt-2 space-y-1">
            {positions.length === 0 ? <div className="text-gray-500">No open positions</div> :
              positions.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-[#07121a] p-2 rounded">
                  <div>
                    <div className="font-medium">{p.symbol} • {p.side}</div>
                    <div className="text-xs text-gray-400">{p.qty} @ {p.avgEntry}</div>
                  </div>
                  <div className={`text-sm ${p.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>${(p.unrealizedPL || 0).toFixed(2)}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm text-gray-400">Closed Trades</div>
          <div className="mt-2 text-xs">
            {orders.length === 0 ? <div className="text-gray-500">No closed trades</div> :
              orders.slice().reverse().slice(0, 6).map((o) => (
                <div key={o.id} className="flex justify-between items-center py-1">
                  <div>{o.symbol} {o.side} {o.qty}</div>
                  <div className={`font-medium ${o.pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>${o.pl.toFixed(2)}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
