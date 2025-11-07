// src/data-service.ts
export interface DataPoint {
  category: string;
  value: number;
  timestamp: number; // ms since epoch
}

const CATEGORIES = ['Alpha', 'Beta', 'Gamma', 'Delta'];

export class DataService {
  static categories() { return CATEGORIES.slice(); }

  /** Generate N points per category over the last `minutes` minutes */
  static generateMockData(n = 12, minutes = 60): DataPoint[] {
    const now = Date.now();
    const out: DataPoint[] = [];
    for (const cat of CATEGORIES) {
      for (let i = n - 1; i >= 0; i--) {
        out.push({
          category: cat,
          value: Math.max(0, Math.round(20 + 15 * Math.sin(i / 2) + (Math.random() * 10 - 5))),
          timestamp: now - Math.round((minutes * 60 * 1000 / n) * i),
        });
      }
    }
    return out.sort((a, b) => a.timestamp - b.timestamp);
  }

  /** Simulate one new point for each category (real-time tick) */
  static nextTick(prev: DataPoint[]): DataPoint[] {
    const now = Date.now();
    const latestByCat = new Map<string, DataPoint>();
    for (const p of prev) latestByCat.set(p.category, p);
    const next: DataPoint[] = [];
    for (const cat of CATEGORIES) {
      const last = latestByCat.get(cat);
      const lastVal = last ? last.value : 20;
      const jitter = Math.round((Math.random() - 0.5) * 8);
      next.push({ category: cat, value: Math.max(0, lastVal + jitter), timestamp: now });
    }
    return [...prev, ...next];
  }

  /** Filter by category and time range */
  static filter(
    data: DataPoint[],
    opts: { category?: string; from?: number; to?: number } = {}
  ) {
    return data.filter(d =>
      (opts.category ? d.category === opts.category : true) &&
      (opts.from ? d.timestamp >= opts.from : true) &&
      (opts.to ? d.timestamp <= opts.to : true)
    );
  }

  /** Aggregate latest value per category (for bar/pie) */
  static latestPerCategory(data: DataPoint[]) {
    const map = new Map<string, DataPoint>();
    for (const p of data) map.set(p.category, p);
    return Array.from(map.entries()).map(([category, p]) => ({ label: category, value: p.value }));
  }
}
