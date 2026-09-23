import { Link } from "react-router-dom";
import LaunchCard from "../components/LaunchCard.jsx";
import Marquee from "../components/Marquee.jsx";
import StatCard from "../components/StatCard.jsx";
import { HOW_IT_WORKS } from "../lib/data.js";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import { formatUsd } from "../lib/format.js";

export default function Home() {
  const { coins, members, trades } = useLaunchStore();
  const live = coins.filter((c) => c.status === "live");
  const upcoming = coins.filter((c) => c.status === "upcoming");
  const featured = [...live, ...upcoming].slice(0, 6);
  const waitlist = members.length;
  const volume = coins.reduce((s, c) => s + (c.volume || 0), 0);
  const next = upcoming.slice().sort((a, b) => (a.opensAt || 0) - (b.opensAt || 0))[0];
  const nextMins = next?.opensAt ? Math.max(0, Math.ceil((next.opensAt - Date.now()) / 60000)) : 0;

  return (
    <div className="space-y-10">
      <div className="border-b border-white/10 pb-6">
        <div className="glass pixel-corners inline-flex items-center gap-2 px-3 py-1.5 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-glow" />
          <span className="label-mono">Robinhood Chain · Launch Terminal</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          404 <span className="gradient-text">LAUNCH</span> FUN
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-xl">
          Card-based token launchpad for the 404 Origin ecosystem. Join the whitelist, claim a featured slot, and ride the pulse until a coin graduates.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/whitelist" className="btn-neon">
            Join whitelist
          </Link>
          <Link to="/launches" className="btn-ghost">
            See coins
          </Link>
          <Link to="/create" className="btn-ghost">
            Launch a coin
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Waitlist cards" value={waitlist.toString()} hint="Verified + boarding" />
        <StatCard label="Live pulses" value={String(live.length)} hint="Trading on the curve" accent="cyan" />
        <div className="glass pixel-corners p-5 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-glow" />
            <span className="label-mono">Next featured open</span>
          </div>
          <div className="mt-4 flex items-end gap-1.5">
            <div className="flex-1">
              <div className="font-display text-3xl sm:text-4xl font-bold text-neon tabular-nums">
                {String(Math.floor(nextMins / 60)).padStart(2, "0")}
              </div>
              <div className="label-mono mt-1">Hr</div>
            </div>
            <div className="font-display text-2xl text-zinc-600 pb-4">:</div>
            <div className="flex-1">
              <div className="font-display text-3xl sm:text-4xl font-bold text-neon tabular-nums">
                {String(nextMins % 60).padStart(2, "0")}
              </div>
              <div className="label-mono mt-1">Min</div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-4">
            {next ? `$${next.ticker} flips live automatically.` : "No upcoming slots queued."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Pad volume" value={formatUsd(volume)} hint="Curve fills · demo terminal" accent="red" />
        <StatCard
          label="Tape prints"
          value={String(trades.filter((t) => t.side !== "reply").length)}
          hint="Buys, sells, launches"
          accent="cyan"
        />
      </div>

      <Marquee coins={coins} />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="label-mono mb-2">Featured cards</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Live & upcoming launches</h2>
          </div>
          <Link to="/launches" className="text-[11px] tracking-widest uppercase text-neon hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((coin) => (
            <LaunchCard key={coin.id} coin={coin} />
          ))}
        </div>
      </section>

      <section>
        <div className="label-mono mb-2">Protocol</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.n} className="glass pixel-corners p-5 sm:p-6">
              <div className="font-display text-neon text-xl font-bold">{step.n}</div>
              <h3 className="font-display text-lg font-bold mt-2">{step.title}</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
