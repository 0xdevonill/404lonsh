export default function Sparkline({ candles = [], className = "" }) {
  if (!candles.length) return null;
  const w = 120;
  const h = 36;
  const closes = candles.map((c) => c.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const d = closes
    .map((p, i) => {
      const x = (i / Math.max(1, closes.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const up = closes[closes.length - 1] >= closes[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full h-9 ${className}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={up ? "#ccff00" : "#f87171"} strokeWidth="1.6" />
    </svg>
  );
}
