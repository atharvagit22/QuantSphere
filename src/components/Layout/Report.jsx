import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useData } from "../../context/DataContext";

export default function Report() {
  const { data } = useData();
  const reportRef = useRef(null);

  const generatePDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save("QuantDash_Report.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Generate Report</h1>

      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-purple-600 rounded"
      >
        Download PDF
      </button>

      <div ref={reportRef} className="glass-card p-6 space-y-6">

        <h2 className="text-xl font-semibold">Quant Report</h2>

        <div>
          <p>Total P/L: ${data?.kpis?.total_pl?.toFixed(2) || 0}</p>
          <p>Win Rate: {(data?.kpis?.win_rate * 100).toFixed(1)}%</p>
          <p>Max Drawdown: {data?.kpis?.max_drawdown}%</p>
          <p>Total Trades: {data?.kpis?.total_trades}</p>
        </div>

        <h3 className="text-lg mt-4">Orders</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th>Date</th>
              <th>Instrument</th>
              <th>Side</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {data?.orders?.slice(0, 20).map((o, i) => (
              <tr key={i} className="border-t border-gray-800">
                <td>{o.date || "—"}</td>
                <td>{o.instrument}</td>
                <td>{o.side}</td>
                <td>${o.pl}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
