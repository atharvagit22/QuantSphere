// src/components/Advanced/ReportGenerator.jsx
import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportGenerator() {
  const handleExport = async () => {
    const el = document.querySelector("#report-area") || document.body;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: null });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save(`backtest-report-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-white">Report Generator</h2>
      <div className="bg-[#0f1724] p-4 rounded-2xl border border-[#1f2937]">
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-1 bg-indigo-600 rounded">Export PDF</button>
          <div className="text-sm text-gray-400">Export the current dashboard area (wrap dashboards in an element with id="report-area")</div>
        </div>
      </div>
    </div>
  );
}
