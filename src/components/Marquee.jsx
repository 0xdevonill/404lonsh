import { formatUsd } from "../lib/format.js";
import { progressOf } from "../lib/store.js";

export default function Marquee({ coins }) {
  const row = [...coins, ...coins];
  return (
    <div className="marquee-row overflow-hidden">
      <div className="flex gap-3 w-max animate-marquee">
        {row.map((coin, i) => {
          const pct = progressOf(coin);
          return (
            <div key={`${coin.id}-${i}`} className="glass pixel-corners flex items-center gap-3 px-4 py-3 shrink-0">
              <img src={coin.image} alt={coin.ticker} className="h-6 w-6 shrink-0 object-cover bg-black" />
              <span className="font-display text-sm font-bold text-white whitespace-nowrap">${coin.ticker}</span>
              <span className="text-[10px] text-zinc-500 whitespace-nowrap hidden sm:inline">{coin.name}</span>
              <span className="font-mono text-xs text-zinc-300 whitespace-nowrap uppercase">{coin.status}</span>
              <span className="font-mono text-[10px] whitespace-nowrap text-neon">
                {coin.status === "upcoming" ? "TBD" : formatUsd(coin.mcap)}
              </span>
              {coin.status === "live" && (
                <span className="font-mono text-[10px] text-mint">{pct.toFixed(0)}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
