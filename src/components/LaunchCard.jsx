import { Link } from "react-router-dom";
import { formatNum, formatUsd, timeAgo } from "../lib/format.js";
import { GRADUATION_MCAP } from "../lib/data.js";
import { progressOf } from "../lib/store.js";
import Sparkline from "./Sparkline.jsx";

const STATUS = {
  live: { label: "LIVE", className: "text-neon border-neon/40 bg-neon/10" },
  upcoming: { label: "UPCOMING", className: "text-mint border-mint/40 bg-mint/10" },
  graduated: { label: "GRADUATED", className: "text-zinc-300 border-white/20 bg-white/5" },
};

export default function LaunchCard({ coin }) {
  const status = STATUS[coin.status] || STATUS.live;
  const pct = progressOf(coin);
  const remaining = coin.status === "upcoming" && coin.opensAt ? Math.max(0, coin.opensAt - Date.now()) : 0;
  const mins = Math.floor(remaining / 60000);

  return (
    <Link
      to={`/coin/${coin.id}`}
      className="glass pixel-corners p-4 sm:p-5 flex flex-col gap-4 hover:border-neon/50 hover:shadow-glow transition-all group h-full"
    >
      <div className="flex items-start gap-3">
        <img
          src={coin.image}
          alt={coin.ticker}
          className="h-16 w-16 shrink-0 pixel-corners border border-white/10 bg-black object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-white truncate">{coin.name}</h3>
            <span className="text-neon text-xs font-bold">${coin.ticker}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{coin.description}</p>
        </div>
        <span className={`shrink-0 px-2 py-1 text-[9px] font-bold tracking-wider border ${status.className}`}>
          {status.label}
        </span>
      </div>

      {coin.candles?.length > 2 && <Sparkline candles={coin.candles} />}

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] tracking-widest uppercase text-zinc-500">
          <span>Pulse to graduate</span>
          <span className="text-zinc-300">{pct.toFixed(1)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="label-mono">Mcap</div>
          <div className="text-zinc-100 font-bold mt-1">{coin.status === "upcoming" ? "—" : formatUsd(coin.mcap)}</div>
        </div>
        <div>
          <div className="label-mono">Vol</div>
          <div className="text-zinc-100 font-bold mt-1">{coin.status === "upcoming" ? "—" : formatUsd(coin.volume)}</div>
        </div>
        <div>
          <div className="label-mono">Fee</div>
          <div className="text-zinc-100 font-bold mt-1">{coin.creatorFee || 0}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-widest pt-1 border-t border-white/5">
        <span>
          {formatNum(coin.holders, 0)} holders
          {coin.status === "upcoming" ? ` · Opens in ${mins}m` : ` · ${timeAgo(coin.createdAt)}`}
        </span>
        <span className="group-hover:text-neon">
          {coin.status === "graduated" ? `Locked · ${formatUsd(GRADUATION_MCAP)}` : "Chart →"}
        </span>
      </div>
    </Link>
  );
}
