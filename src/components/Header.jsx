import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { connectWallet, disconnectWallet } from "../lib/store.js";
import { shorten } from "../lib/format.js";
import { useLaunchStore } from "../hooks/useLaunchStore.js";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/launches", label: "Launches" },
  { to: "/whitelist", label: "Whitelist" },
  { to: "/board", label: "Board" },
  { to: "/create", label: "Launch" },
  { to: "/docs", label: "How it works" },
];

export default function Header() {
  const { wallet, profile, eth } = useLaunchStore();
  const [open, setOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [manual, setManual] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const active = LINKS.find((l) => (l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to)));

  useEffect(() => {
    setOpen(false);
    setConnectOpen(false);
  }, [location.pathname]);

  async function onConnectInjected() {
    try {
      if (window.ethereum?.request) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts?.[0]) {
          connectWallet(accounts[0]);
          setConnectOpen(false);
          return;
        }
      }
    } catch {
      /* fall through to demo wallet */
    }
    connectWallet();
    setConnectOpen(false);
  }

  function onManual(e) {
    e.preventDefault();
    const addr = manual.trim();
    if (!/^0x[a-fA-F0-9]{6,}$/.test(addr)) return;
    connectWallet(addr);
    setManual("");
    setConnectOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-void/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <NavLink to="/" className="group flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center border border-neon/40 bg-neon/10 text-neon text-[11px] font-bold font-mono transition-transform duration-500 group-hover:rotate-6">
            4L
            <span className="absolute -top-px -right-px h-1.5 w-1.5 bg-neon" />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.18em] uppercase">
            404<span className="text-neon">Launch</span>Fun
          </span>
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-3">
          {wallet && (
            <button
              type="button"
              onClick={() => navigate("/whitelist")}
              className="hidden md:flex glass pixel-corners items-center gap-2 px-3 py-2 text-[10px] tracking-widest uppercase text-zinc-400"
            >
              <span className="text-neon tabular-nums">{eth.toFixed(3)} ETH</span>
              <span className="text-zinc-600">·</span>
              <span>{profile?.clearance || 0}% WL</span>
            </button>
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
              onClick={() => setConnectOpen((v) => !v)}
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
                  <button type="button" onClick={onConnectInjected} className="w-full py-2.5 bg-neon text-black font-bold text-xs tracking-widest pixel-corners">
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {connectOpen && !wallet && (
        <div className="mx-auto max-w-7xl px-4 sm:px-8 pb-4">
          <div className="glass-strong pixel-corners p-4 sm:p-5 max-w-lg ml-auto space-y-3">
            <div className="label-mono">Robinhood Chain · Demo terminal</div>
            <p className="text-xs text-zinc-400">
              Connect an injected wallet, or paste any 0x address. Demo ETH is credited locally — nothing leaves your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={onConnectInjected} className="btn-neon flex-1">
                Injected / demo wallet
              </button>
              <form onSubmit={onManual} className="flex flex-1 gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="0x…"
                  className="input-terminal"
                />
                <button type="submit" className="btn-ghost shrink-0">
                  Paste
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
