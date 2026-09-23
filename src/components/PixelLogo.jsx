const ROWS = ["11101", "00101", "00101", "11111", "00001", "00001", "00001"];

export default function PixelLogo({ className = "" }) {
  return (
    <span
      className={`relative grid h-9 w-9 place-items-center border border-neon/40 bg-neon/10 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 28" width="20" height="28" shapeRendering="crispEdges" className="block">
        {ROWS.map((row, y) =>
          row.split("").map((bit, x) =>
            bit === "1" ? <rect key={`${x}-${y}`} x={x * 4} y={y * 4} width="4" height="4" fill="#ccff00" /> : null,
          ),
        )}
      </svg>
      <span className="absolute -top-px -right-px h-1 w-1 bg-neon" />
    </span>
  );
}
