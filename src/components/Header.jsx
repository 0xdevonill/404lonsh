import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { connectDemoWallet, disconnectWallet } from "../lib/store.js";
import { shorten } from "../lib/format.js";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import PixelLogo from "./PixelLogo.jsx";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/launches", label: "Launches" },
  { to: "/create", label: "Launch" },
  { to: "/docs", label: "How it works" },
];

export default function Header() {
  const { wallet, eth } = useLaunchStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active =
    LINKS.find((l) => (l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to))) ||
    (location.pathname.startsWith("/coin") ? { label: "Launches" } : { label: "Menu" });

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-void/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <NavLink to="/" className="group flex items-center gap-3" aria-label="404 Launch Fun home">
          <PixelLogo className="transition-transform duration-500 group-hover:rotate-6" />
          <span className="font-display text-sm font-bold tracking-[0.18em] uppercase">
            404<span className="text-neon">Launch</span>Fun
          </span>
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-3">
          {wallet && (
            <div className="hidden md:flex glass pixel-corners items-center gap-2 px-3 py-2 text-[10px] tracking-widest uppercase text-zinc-400">
              <span className="text-neon tabular-nums">{eth.toFixed(3)} ETH</span>
            </div>
          )}

          {wallet ? (
            <button
              type="button"
              onClick={() => disconnectWallet()}
              className="hidden sm:inline-flex bg-neon text-black pixel-corners font-mono px-5 py-2.5 text-[11px] font-bold tracking-[0.16em] uppercase transition-transform duration-300 hover:scale-[1.03]"
            >
              {shorten(wallet)}
            </button>
          ) : (
            <button
              type="button"
              onClick={connectDemoWallet}
              className="hidden sm:inline-flex bg-neon text-black pixel-corners font-mono px-5 py-2.5 text-[11px] font-bold tracking-[0.16em] uppercase transition-transform duration-300 hover:scale-[1.03]"
            >
              Connect Wallet
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="glass pixel-corners flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-[0.16em] uppercase text-zinc-300 hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-glow" />
              {active?.label || "Menu"}
              <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
            </button>
            <div
              className={`absolute right-0 mt-2 w-64 glass-strong pixel-corners overflow-hidden origin-top-right transition-all duration-300 ${
                open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="p-2">
                {LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-3 py-2.5 text-xs tracking-widest transition-all flex items-center gap-2 pixel-corners ${
                        isActive ? "bg-white/[0.05] text-neon font-bold" : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="border-t border-white/10 p-3 sm:hidden">
                {wallet ? (
                  <button type="button" onClick={() => disconnectWallet()} className="w-full py-2.5 bg-neon text-black font-bold text-xs tracking-widest pixel-corners">
                    {shorten(wallet)} · disconnect
                  </button>
                ) : (
                  <button type="button" onClick={connectDemoWallet} className="w-full py-2.5 bg-neon text-black font-bold text-xs tracking-widest pixel-corners">
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
