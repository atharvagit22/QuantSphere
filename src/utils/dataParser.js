import Papa from "papaparse";

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data;

          // -------------------------
          // 1. EQUITY DATA
          // -------------------------
          const equityData = rows.map((r) => ({
            date: r.date,
            equity: r.funds ?? r.equity ?? 0,
          }));

          // -------------------------
          // 2. ORDERS TABLE
          // -------------------------
          const orders = rows
            .filter((r) => r.instrument || r.side)
            .map((r, i) => ({
              id: r.id ?? i + 1,
              instrument: r.instrument,
              side: r.side,
              open: r.open ?? r.entry,
              close: r.close ?? r.exit,
              pl: r.pl ?? 0,
            }));

          // -------------------------
          // 3. DRAWDOWN DATA
          // -------------------------
          const drawdownData = rows.map((r) => ({
            date: r.date,
            value: r.error ?? r.drawdown ?? 0,
          }));

          // -------------------------
          // 4. KPIs
          // -------------------------
          const totalPL = orders.reduce((a, o) => a + (o.pl || 0), 0);
          const wins = orders.filter((o) => o.pl > 0).length;
          const winRate = orders.length ? wins / orders.length : 0;

          const kpis = {
            total_pl: totalPL,
            win_rate: winRate,
            max_drawdown: Math.min(...drawdownData.map((d) => d.value)) || 0,
            total_trades: orders.length,
          };

          // -------------------------
          // 5. TRADE VOLUME
          // -------------------------
          const tradeVolume = rows.map((r) => ({
            date: r.date,
            buy: r.side === "Buy" ? 1 : 0,
            sell: r.side === "Sell" ? 1 : 0,
          }));

          // -------------------------
          // final structured output
          // -------------------------
          resolve({
            equityData,
            orders,
            drawdownData,
            tradeVolume,
            kpis,
          });
        } catch (err) {
          console.error("CSV PARSE ERROR", err);
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}
