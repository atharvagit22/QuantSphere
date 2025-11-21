// src/components/ui/ReplayChart.jsx
import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { createSimpleReplay } from "../../utils/replayEngine";

export default function ReplayChart({ equityData = [] }) {
  const seriesRef = useRef([]);
  const engineRef = useRef(null);
  const [shown, setShown] = useState([]);
  const [speed, setSpeed] = useState(600);

  useEffect(() => {
    if (!Array.isArray(equityData) || equityData.length === 0) {
      seriesRef.current = [];
      setShown([]);
      if (engineRef.current) engineRef.current.reset();
      return;
    }

    seriesRef.current = equityData.map((d) => ({
      x: d.date ?? d.time ?? d.timestamp ?? "",
      y: Number(d.equity ?? d.close ?? d.value ?? 0),
    }));

    setShown([]);
    engineRef.current = createSimpleReplay(seriesRef.current, speed, (slice) =>
      setShown(slice)
    );

    return () => {
      engineRef.current && engineRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equityData]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setSpeed(speed);
  }, [speed]);

  const data = {
    labels: shown.map((s) => s.x),
    datasets: [
      {
        label: "Equity (replay)",
        data: shown.map((s) => s.y),
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.06)",
        pointRadius: 0,
        tension: 0.2,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded bg-emerald-500 text-white"
          onClick={() => engineRef.current && engineRef.current.start()}
        >
          Play
        </button>
        <button
          className="px-3 py-2 rounded bg-rose-500 text-white"
          onClick={() => engineRef.current && engineRef.current.stop()}
        >
          Pause
        </button>
        <button
          className="px-3 py-2 rounded bg-gray-700 text-white"
          onClick={() => {
            engineRef.current && engineRef.current.reset();
            setShown([]);
          }}
        >
          Reset
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
          <label>Speed</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-[#071018] p-2 rounded text-white"
          >
            <option value={1000}>1x</option>
            <option value={600}>2x</option>
            <option value={300}>4x</option>
            <option value={150}>8x</option>
          </select>
        </div>
      </div>

      <div className="glass-card p-4" style={{ height: 360 }}>
        <Line data={data} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
