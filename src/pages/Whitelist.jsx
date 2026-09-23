import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import { connectDemoWallet, connectWallet, updateProfile } from "../lib/store.js";
import { shorten } from "../lib/format.js";

export default function Whitelist() {
  const { wallet, profile, members } = useLaunchStore();
  const [handle, setHandle] = useState(profile?.handle || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [manual, setManual] = useState("");
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");

  const clearance = profile?.clearance || 0;
  const verified = members.filter((m) => m.clearance === 100).length;

  useEffect(() => {
    if (profile?.handle) setHandle(profile.handle);
    if (profile?.email) setEmail(profile.email);
  }, [profile]);

  async function connect() {
    await connectDemoWallet();
  }

  function pasteWallet(e) {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{6,}$/.test(manual.trim())) {
      setMsg("Paste a public 0x address.");
      return;
    }
    connectWallet(manual.trim());
    setManual("");
    setMsg("");
  }

  function verify(e) {
    e.preventDefault();
    if (!wallet) {
      setMsg("Connect a wallet first.");
      return;
    }
    if (!handle.trim()) {
      setMsg("Add an X handle to reach 100%.");
      return;
    }
    updateProfile({ handle, email });
    setMsg("Clearance 100%. Your card is on the board.");
  }

  async function copyCode() {
    if (!profile?.code) return;
    await navigator.clipboard.writeText(`Boarding 404 Launch Fun with code ${profile.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-10">
      <div className="border-b border-white/10 pb-6">
        <div className="glass pixel-corners inline-flex items-center gap-2 px-3 py-1.5 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-glow" />
          <span className="label-mono">Whitelist terminal</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          JOIN THE <span className="gradient-text">BOARD</span>
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-xl">
          Front-of-line access to every launch and featured slot. Two quick cards: wallet, then X. Hold your numbered spot before it opens to everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ClearanceStat label="Your clearance" value={`${clearance}%`} hint={clearance === 100 ? "Verified board" : "Still boarding"} />
        <ClearanceStat label="Your spot" value={profile?.spot ? `#${profile.spot}` : "—"} hint="One entry per wallet" />
        <ClearanceStat label="Verified cards" value={String(verified)} hint="Public board" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`glass-strong pixel-corners p-6 ${clearance >= 50 ? "border-neon/40" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="label-mono">Step 01 · Wallet</div>
            <span className="text-neon font-display font-bold">{clearance >= 50 ? "50%" : "0%"}</span>
          </div>
          <h2 className="font-display text-2xl font-bold">Add your wallet</h2>
          <p className="text-xs text-zinc-500 mt-2">
            Paste any Robinhood or EVM address, or connect to sign it yourself. Non-custodial — we only keep the public key.
          </p>
          {wallet ? (
            <div className="mt-6 space-y-3">
              <div className="glass pixel-corners p-4 text-sm">
                <div className="label-mono mb-1">Connected</div>
                <div className="text-neon break-all">{wallet}</div>
                <div className="text-zinc-500 mt-2 text-xs">Spot #{profile?.spot} · code {profile?.code}</div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button type="button" data-testid="whitelist-connect" onClick={connect} className="btn-neon w-full">
                Connect wallet
              </button>
              <form onSubmit={pasteWallet} className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="0x public address"
                  className="input-terminal"
                />
                <button type="submit" className="btn-ghost shrink-0">
                  Board
                </button>
              </form>
            </div>
          )}
        </div>

        <div className={`glass-strong pixel-corners p-6 ${clearance === 100 ? "border-neon/40" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="label-mono">Step 02 · Verify X</div>
            <span className="text-neon font-display font-bold">
              {clearance === 100 ? "100%" : clearance >= 50 ? "50%" : "0%"}
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold">Lock the card</h2>
          <p className="text-xs text-zinc-500 mt-2">
            Follow the 404 signal, then attach your handle. Copy the clearance tweet with your unique 4L code to reach 100%.
          </p>
          <form onSubmit={verify} className="mt-6 space-y-3">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@handle"
              className="input-terminal"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for launch alerts (optional)"
              className="input-terminal"
              type="email"
            />
            <button type="button" onClick={copyCode} className="btn-ghost w-full" disabled={!profile?.code}>
              {copied ? "Copied tweet copy" : "Copy clearance tweet"}
            </button>
            <button type="submit" className="btn-neon w-full">
              Verify & join board
            </button>
          </form>
        </div>
      </div>

      {msg && <div className="glass pixel-corners p-4 text-sm text-neon">{msg}</div>}

      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="label-mono mb-2">Why board early</div>
            <h2 className="font-display text-2xl font-bold">Clearance perks</h2>
          </div>
          <Link to="/board" className="text-[11px] tracking-widest uppercase text-neon">
            Open board →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: "Front of line", d: "Featured slots and first prints on every live pulse." },
            { t: "Public card", d: "Your handle sits on the verified board before the crowd." },
            { t: "Fee-share later", d: "First dibs on pad points, fee-share, and 404 Origin drops." },
          ].map((card) => (
            <div key={card.t} className="glass pixel-corners p-5">
              <h3 className="font-display font-bold text-white">{card.t}</h3>
              <p className="text-xs text-zinc-500 mt-2">{card.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClearanceStat({ label, value, hint }) {
  return (
    <div className="glass pixel-corners p-5">
      <div className="label-mono">{label}</div>
      <div className="font-display text-3xl font-bold text-neon mt-3">{value}</div>
      <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">{hint}</div>
    </div>
  );
}
