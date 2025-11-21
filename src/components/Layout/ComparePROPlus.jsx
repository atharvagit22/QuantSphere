// src/components/Layout/ComparePROPlus.jsx
import React, { useMemo, useRef } from "react";
import { Line, Scatter } from "react-chartjs-2";
import { useData } from "../../context/DataContext.jsx";
import "../../utils/chartSetup.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function computeReturns(equityData = []) {
  const out = [];
  for (let i = 1; i < equityData.length; i++) {
    const prev = Number(equityData[i - 1].equity || 0);
    const cur = Number(equityData[i].equity || 0);
    out.push(prev === 0 ? 0 : (cur - prev) / prev);
  }
  return out;
}

function rollingStd(arr = [], window = 20) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const slice = arr.slice(Math.max(0, i - window + 1), i + 1);
    if (slice.length < 2) out.push(0);
    else {
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const sd = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length);
      out.push(sd);
    }
  }
  return out;
}

function correlation(a = [], b = []) {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const a0 = a.slice(0, n);
  const b0 = b.slice(0, n);
  const mean = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const ma = mean(a0),
    mb = mean(b0);
  let num = 0,
    da = 0,
    db = 0;
  for (let i = 0; i < n; i++) {
    num += (a0[i] - ma) * (b0[i] - mb);
    da += (a0[i] - ma) ** 2;
    db += (b0[i] - mb) ** 2;
  }
  return num / Math.sqrt((da * db) || 1);
}

function sharpe(returns = []) {
  if (!returns.length) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const sd = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length);
  return sd === 0 ? 0 : (mean / sd) * Math.sqrt(252);
}

function cagr(equityData = []) {
  if (!equityData.length) return 0;
  const start = Number(equityData[0].equity || 0);
  const end = Number(equityData[equityData.length - 1].equity || 0);
  if (start <= 0) return 0;
  const years = Math.max(1, equityData.length / 252);
  return Math.pow(end / start, 1 / years) - 1;
}

function maxDrawdown(equitySeries = []) {
  let peak = -Infinity;
  let maxDD = 0;
  for (const v of equitySeries) {
    if (v > peak) peak = v;
    const dd = (v - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

export default function ComparePROPlus() {
  const { data } = useData();
  const rawSets = Array.isArray(data?.compare) ? data.compare : [];
  const sets = rawSets.filter((s) => s && Array.isArray(s.equityData) && s.equityData.length > 0);

  const pageRefs = {
    equity: useRef(null),
    volatility: useRef(null),
    scatter: useRef(null),
    ranking: useRef(null),
    correlation: useRef(null),
  };

  const COLORS = ["#60a5fa", "#a78bfa", "#fb7185", "#34d399", "#fbbf24", "#fb923c"];

  if (sets.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">ComparePRO+</h1>
        <div className="glass-card p-4 text-gray-400 mt-4">No compare sets loaded. Upload 2+ CSVs or use Load Demo.</div>
      </div>
    );
  }

  const labels = sets[0].equityData.map((p) => p.date);
  const returnsSeries = sets.map((s) => computeReturns(s.equityData));
  const volSeries = returnsSeries.map((r) => rollingStd(r, 20));
  const sharpeSeries = sets.map((s, i) => sharpe(returnsSeries[i]));
  const cagrSeries = sets.map((s) => cagr(s.equityData));
  const ddSeries = sets.map((s) => maxDrawdown(s.equityData.map((d) => d.equity)));
  const winRateSeries = sets.map((s) => s.kpis?.win_rate ?? 0);
  const corr = sets.map((s1, i) => sets.map((s2, j) => correlation(returnsSeries[i], returnsSeries[j])));

  const scatterData = {
    datasets: sets.map((s, i) => {
      const avgReturn = returnsSeries[i].reduce((a, b) => a + b, 0) / Math.max(1, returnsSeries[i].length);
      const avgVol = volSeries[i].reduce((a, b) => a + b, 0) / Math.max(1, volSeries[i].length);
      return {
        label: s.name || `Set ${i + 1}`,
        data: [{ x: avgVol, y: avgReturn }],
        backgroundColor: COLORS[i % COLORS.length],
        pointRadius: 6,
      };
    }),
  };

  const equityChart = {
    labels,
    datasets: sets.map((s, i) => ({
      label: s.name || `Set ${i + 1}`,
      data: s.equityData.map((p) => Number(p.equity || 0)),
      borderColor: COLORS[i % COLORS.length],
      pointRadius: 0,
      tension: 0.25,
      fill: false,
    })),
  };

  const volChart = {
    labels: labels.slice(1),
    datasets: sets.map((s, i) => ({
      label: s.name || `Set ${i + 1}`,
      data: volSeries[i],
      borderColor: COLORS[i % COLORS.length],
      pointRadius: 0,
      tension: 0.2,
      fill: false,
    })),
  };

  const ranking = sets
    .map((s, i) => ({
      name: s.name || `Set ${i + 1}`,
      sharpe: sharpeSeries[i],
      cagr: cagrSeries[i],
      maxDD: ddSeries[i],
      winRate: winRateSeries[i],
    }))
    .sort((a, b) => b.sharpe - a.sharpe);

  const exportCSV = () => {
    const rows = [];
    rows.push(["strategy", "cagr", "sharpe", "max_dd", "win_rate"]);
    for (const r of ranking) rows.push([r.name, r.cagr, r.sharpe, r.maxDD, r.winRate]);
    rows.push([]);
    const equityHeader = ["date", ...sets.map((s) => s.name)];
    rows.push(equityHeader);
    for (let i = 0; i < labels.length; i++) {
      const row = [labels[i]];
      for (let s = 0; s < sets.length; s++) row.push(sets[s].equityData[i] ? sets[s].equityData[i].equity : "");
      rows.push(row);
    }
    const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparepro_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDFMultiPage = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const sections = [
      { ref: pageRefs.equity, title: "Equity Curve Comparison" },
      { ref: pageRefs.volatility, title: "Rolling Volatility (20)" },
      { ref: pageRefs.scatter, title: "Risk-Return Scatter" },
      { ref: pageRefs.ranking, title: "Strategy Ranking" },
      { ref: pageRefs.correlation, title: "Correlation Matrix" },
    ];

    for (let i = 0; i < sections.length; i++) {
      const el = sections[i].ref.current;
      if (!el) continue;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#06060a" });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (i !== 0) doc.addPage();
      doc.setFillColor(6, 6, 10);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("QuantDash — ComparePRO+", 10, 13);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, 13);

      const y = 22;
      const maxHeight = pageHeight - y - 10;
      const drawHeight = Math.min(imgHeight, maxHeight);
      doc.addImage(imgData, "PNG", 0, y, imgWidth, drawHeight, undefined, "FAST");
    }

    doc.save(`ComparePRO_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ComparePRO+</h1>
          <div className="text-sm text-gray-400">Advanced multi-metric strategy comparison</div>
        </div>

        <div className="flex gap-3">
          <button onClick={exportCSV} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Export CSV</button>
          <button onClick={exportPDFMultiPage} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">Export Multi-page PDF</button>
        </div>
      </div>

      <div ref={pageRefs.equity} className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">Equity Curve</div>
          <div className="text-xs text-gray-500">{labels.length} points</div>
        </div>
        <div className="h-72"><Line data={equityChart} options={{ maintainAspectRatio: false }} /></div>
      </div>

      <div ref={pageRefs.volatility} className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Rolling Volatility (20)</div>
        <div className="h-56"><Line data={volChart} options={{ maintainAspectRatio: false }} /></div>
      </div>

      <div ref={pageRefs.scatter} className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Risk-Return Scatter</div>
        <div className="h-48"><Scatter data={scatterData} options={{ maintainAspectRatio: false, plugins: { legend: { display: true } } }} /></div>
      </div>

      <div ref={pageRefs.ranking} className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Strategy Ranking</div>
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-[#111827]">
            <tr>
              <th className="py-2 text-left">Strategy</th>
              <th className="py-2 text-right">CAGR</th>
              <th className="py-2 text-right">Sharpe</th>
              <th className="py-2 text-right">Max DD</th>
              <th className="py-2 text-right">Win %</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => (
              <tr key={i} className="border-b border-[#111827]">
                <td className="py-2">{r.name}</td>
                <td className="py-2 text-right">{(r.cagr * 100).toFixed(2)}%</td>
                <td className="py-2 text-right">{r.sharpe.toFixed(2)}</td>
                <td className="py-2 text-right text-red-400">{(r.maxDD * 100).toFixed(2)}%</td>
                <td className="py-2 text-right text-green-400">{(r.winRate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={pageRefs.correlation} className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-2">Correlation Matrix</div>
        <div className="grid gap-2">
          {corr.map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((c, j) => (
                <div key={j} className="p-3 rounded text-center" style={{ width: 64, height: 40, backgroundColor: `rgba(96,165,250,${Math.min(0.95, Math.abs(c))})`, color: "#0b1220", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
