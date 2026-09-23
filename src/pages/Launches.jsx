import { useMemo, useState } from "react";
import LaunchCard from "../components/LaunchCard.jsx";
import { useLaunchStore } from "../hooks/useLaunchStore.js";

const FILTERS = [
  { id: "all", label: "All cards" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "graduated", label: "Graduated" },
];

export default function Launches() {
  const { coins } = useLaunchStore();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return coins.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.ticker.toLowerCase().includes(s);
    });
  }, [coins, filter, q]);

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6">
        <div className="label-mono mb-3">Launch board</div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          SEE THE <span className="gradient-text">COINS</span>
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-xl">
          Every launch is a card. Filter the pulse, hunt a ticker, and open a coin to trade the curve.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`pixel-corners px-4 py-2 text-[11px] font-bold tracking-[0.16em] uppercase ${
                filter === f.id ? "bg-neon text-black" : "glass text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or ticker"
          className="input-terminal max-w-sm"
        />
      </div>

      {list.length === 0 ? (
        <div className="glass pixel-corners p-10 text-center text-zinc-500 text-sm">Nothing has launched in this filter yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((coin) => (
            <LaunchCard key={coin.id} coin={coin} />
          ))}
        </div>
      )}
    </div>
  );
}
