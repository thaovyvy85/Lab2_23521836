/** @jsx createElement */
// src/chart.tsx
import { createElement, useState } from './jsx-runtime';

type ChartType = 'bar' | 'line' | 'pie';

export interface ChartDatum { label: string; value: number; }
interface ChartProps {
  type: ChartType;
  data: ChartDatum[];
  width?: number;
  height?: number;
  onBarClick?: (index: number) => void;
}

export const Chart = ({ type, data, width = 560, height = 280, onBarClick }: ChartProps) => {
  const [getHover, setHover] = useState<number | null>(null);
  let canvasRef: HTMLCanvasElement | null = null;

  // draw helper (call only when canvasRef is set)
  const draw = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    const hover = getHover;
    if (type === 'bar') drawBar(ctx, data, width, height, hover);
    else if (type === 'line') drawLine(ctx, data, width, height, hover);
    else drawPie(ctx, data, width, height, hover);
  };

  // ----- Helpers -----
  const getBarRects = () => {
    const pad = 24, gap = 12;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const max = Math.max(1, ...data.map(d => d.value));
    const barW = (w - gap * Math.max(0, data.length - 1)) / Math.max(1, data.length);
    return data.map((d, i) => {
      const bh = (d.value / max) * h;
      const x = pad + i * (barW + gap);
      const y = height - pad - bh;
      return { x, y, w: barW, h: bh };
    });
  };

  const drawBar = (ctx: CanvasRenderingContext2D, d: ChartDatum[], w: number, h: number, hover: number | null) => {
    const rects = getBarRects();
    ctx.font = '12px system-ui';
    d.forEach((item, i) => {
      ctx.fillStyle = i === hover ? '#d44d78' : 'palevioletred';
      const r = rects[i];
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#333';
      ctx.fillText(item.label, r.x, h - 6);
    });
  };

  const drawLine = (ctx: CanvasRenderingContext2D, d: ChartDatum[], w: number, h: number, hover: number | null) => {
    const pad = 24;
    const max = Math.max(1, ...d.map(x => x.value));
    const stepX = (w - pad * 2) / Math.max(1, d.length - 1);
    ctx.lineWidth = 2;
    ctx.beginPath();
    d.forEach((pt, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (pt.value / max) * (h - pad * 2);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = 'palevioletred';
    ctx.stroke();

    d.forEach((pt, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (pt.value / max) * (h - pad * 2);
      ctx.beginPath();
      ctx.arc(x, y, i === hover ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === hover ? '#d44d78' : 'palevioletred';
      ctx.fill();
    });
  };

  const drawPie = (ctx: CanvasRenderingContext2D, d: ChartDatum[], w: number, h: number, hover: number | null) => {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.35;
    const total = Math.max(1, d.reduce((s, x) => s + x.value, 0));
    let start = -Math.PI / 2;
    d.forEach((pt, i) => {
      const angle = (pt.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, i === hover ? r + 6 : r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = i === hover ? '#d44d78' : 'palevioletred';
      ctx.fill();
      start += angle;
    });
  };

  // ----- Events -----
  const handleMove = (e: MouseEvent) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const x = (e as any).clientX - rect.left;
    const y = (e as any).clientY - rect.top;

    if (type === 'bar') {
      const i = getBarRects().findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
      setHover(i >= 0 ? i : null);
    } else if (data.length > 0) {
      const i = Math.round((x / rect.width) * (data.length - 1));
      setHover(Math.min(Math.max(i, 0), data.length - 1));
    } else {
      setHover(null);
    }

    // draw immediately for smooth hover
    draw();
  };

  const handleLeave = () => { setHover(null); draw(); };

  const handleClick = () => {
    const i = getHover;
    if (i != null && onBarClick) onBarClick(i);
  };

  return (
    <canvas
      width={width}
      height={height}
      onMousemove={handleMove as any}
      onMouseleave={handleLeave as any}
      onClick={handleClick as any}
      ref={(el: HTMLCanvasElement) => { canvasRef = el; draw(); }}
      style="max-width: 100%; border-radius: 12px; background: #fff"
    />
  );
};
