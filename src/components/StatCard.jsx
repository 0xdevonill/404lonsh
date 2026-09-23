export default function StatCard({ label, value, hint, accent = "neon" }) {
  const dot = accent === "cyan" ? "bg-cyan-400" : accent === "red" ? "bg-red-500" : "bg-neon";
  return (
    <div className="glass pixel-corners p-5 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot} animate-pulse-glow`} />
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-4">
        <div className="font-display text-2xl sm:text-3xl font-bold text-neon tabular-nums">{value}</div>
        {hint && <div className="label-mono mt-1 normal-case tracking-[0.12em]">{hint}</div>}
      </div>
    </div>
  );
}
