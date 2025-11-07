/** @jsx createElement */
// src/dashboard.tsx
import { createElement, useState } from "./jsx-runtime";
import { DataService, type DataPoint } from "./data-service";
import { Chart } from "./chart";
import { Card, Button } from "./components";

type ChartType = "bar" | "line" | "pie";

/* keep one timer across renders */
let liveTimer: any = null;
let liveStarted = false;

export const Dashboard = () => {
  const [getAll, setAll] = useState<DataPoint[]>(
    DataService.generateMockData()
  );
  const [getType, setType] = useState<ChartType>("bar");
  const [getCat, setCat] = useState<string>("all");
  const [getLive, setLive] = useState<boolean>(true);
  const [getMinutes, setMinutes] = useState<number>(60);

  /* start live once if enabled by default */
  if (getLive && !liveStarted) {
    liveTimer = setInterval(() => setAll(DataService.nextTick(getAll)), 1500);
    liveStarted = true;
  }

  const toggleLive = () => {
    const current = getLive;
    setLive(!current);
    if (current) {
      if (liveTimer) clearInterval(liveTimer);
      liveTimer = null;
      liveStarted = false;
    } else {
      if (!liveTimer)
        liveTimer = setInterval(
          () => setAll(DataService.nextTick(getAll)),
          1500
        );
      liveStarted = true;
    }
  };

  /* filtering */
  const to = Date.now();
  const from = to - getMinutes * 60 * 1000;
  const cat = getCat;
  const filtered = DataService.filter(getAll, {
    from,
    to,
    category: cat === "all" ? undefined : cat,
  });

  /* --- DROP-IN FIX: always give each category a numeric value --- */
  const categories = DataService.categories();
  const allData = getAll;
  const latestAll = categories.map((c) => {
    // try current window first
    const recent = [...filtered].reverse().find((p) => p.category === c);
    if (recent) return { label: c, value: recent.value };
    // fallback: most recent overall
    const past = [...allData].reverse().find((p) => p.category === c);
    return { label: c, value: past ? past.value : 0 };
  });

  const latestForChart = latestAll;
  const latestForTable = latestAll;
  const total = filtered.length;

  /* handlers */
  const handleType = (e: any) => setType(e.target.value as ChartType);
  const handleCat = (e: any) => setCat(e.target.value);
  const handleMinutes = (e: any) =>
    setMinutes(Math.max(5, Math.min(240, Number(e.target.value))));

  return (
    <div className="dash-root">
      <header className="dash-header">
        <h1>📊 Dashboard</h1>
        <div className="controls">
          <div className="row">
            <label>Chart</label>
            <select className="select" value={getType} onChange={handleType}>
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
            </select>
          </div>

          <div className="row">
            <label>Category</label>
            <select className="select" value={getCat} onChange={handleCat}>
              <option value="all">All</option>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <label>Window (min)</label>
            <input
              className="select"
              type="number"
              min="5"
              max="240"
              value={getMinutes}
              onInput={handleMinutes}
            />
          </div>

          <div className="row">
            <Button
              variant={getLive ? "danger" : "primary"}
              onClick={toggleLive}
            >
              {getLive ? "Pause" : "Start"} Live
            </Button>
          </div>
        </div>
      </header>

      <div className="grid">
        <Card title="Overview">
          <p className="muted">
            Points in window: <strong>{total}</strong>
          </p>
          <Chart type={getType} data={latestForChart} />
        </Card>

        <Card title="Table (latest)">
          <table className="mini">
            <thead>
              <tr>
                <th>Category</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {latestForTable.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
