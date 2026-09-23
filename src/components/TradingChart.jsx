import { useMemo, useState } from "react";
import { changePct } from "../lib/chart.js";
import { formatNum } from "../lib/format.js";

export default function TradingChart({ candles = [], ticker }) {
  const [hover, setHover] = useState(null);
  const data = candles.length ? candles : [];
  const stats = useMemo(() => {
    if (!data.length) return null;
    const highs = data.map((c) => c.h);
    const lows = data.map((c) => c.l);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const pad = (max - min) * 0.08 || max * 0.04;
    return { max: max + pad, min: Math.max(0, min - pad), last: data[data.length - 1], pct: changePct(data) };
  }, [data]);

  if (!stats) {
    return (
      <div className="glass pixel-corners h-72 grid place-items-center text-xs text-zinc-600">
        No prints on the chart yet.
      </div>
    );
  }

  const w = 720;
  const h = 280;
  const volH = 52;
  const chartH = h - volH - 8;
  const maxVol = Math.max(...data.map((c) => c.v), 1);
  const span = stats.max - stats.min || 1;
  const gap = 2;
  const slot = (w - 16) / Math.max(data.length, 36);
  const cw = Math.max(3, Math.min(11, slot - gap));

  function y(price) {
    return 8 + ((stats.max - price) / span) * (chartH - 16);
  }

  const line = data
    .map((c, i) => {
      const x = 4 + i * (cw + gap) + cw / 2;
      return `${i === 0 ? "M" : "L"} ${x} ${y(c.c)}`;
    })
    .join(" ");

  const area = `${line} L ${4 + (data.length - 1) * (cw + gap) + cw / 2} ${chartH} L 4 ${chartH} Z`;
  const up = stats.pct >= 0;
  const shown = hover || stats.last;

  return (
    <div className="glass-strong pixel-corners p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="label-mono">Trading chart · 5m</div>
          <div className="font-display text-2xl font-bold text-white mt-1 tabular-nums">
            {formatSci(shown.c)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            ${ticker} price · O {formatSci(shown.o)} · H {formatSci(shown.h)} · L {formatSci(shown.l)}
          </div>
        </div>
        <div className={`font-display font-bold tabular-nums ${up ? "text-neon" : "text-red-400"}`}>
          {up ? "+" : ""}
          {stats.pct.toFixed(2)}%
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-56 sm:h-72"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1="0"
            x2={w}
            y1={8 + p * (chartH - 16)}
            y2={8 + p * (chartH - 16)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        <path d={area} fill="url(#pulseFill)" opacity="0.35" />
        <path d={line} fill="none" stroke="#ccff00" strokeWidth="1.6" />
        {data.map((c, i) => {
          const x = 4 + i * (cw + gap);
          const bull = c.c >= c.o;
          const color = bull ? "#ccff00" : "#f87171";
          const top = y(Math.max(c.o, c.c));
          const bot = y(Math.min(c.o, c.c));
          const bodyH = Math.max(1.2, bot - top);
          return (
            <g
              key={c.t}
              onMouseEnter={() => setHover(c)}
              className="cursor-crosshair"
            >
              <line x1={x + cw / 2} x2={x + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1" />
              <rect x={x} y={top} width={cw} height={bodyH} fill={color} />
              <rect
                x={x}
                y={h - volH}
                width={cw}
                height={(c.v / maxVol) * (volH - 8)}
                fill={color}
                opacity="0.35"
              />
            </g>
          );
        })}
        <defs>
          <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ccff00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-between text-[10px] text-zinc-600 tracking-widest uppercase mt-1">
        <span>Vol {formatNum(shown.v, 0)}</span>
        <span>{data.length} candles</span>
      </div>
    </div>
  );
}

function formatSci(n) {
  if (!n) return "0";
  if (n >= 0.01) return n.toFixed(6);
  return n.toExponential(2);
}
