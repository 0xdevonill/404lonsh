import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import { launchCoin } from "../lib/store.js";
import { punkAvatarSvg } from "../lib/punkAvatar.js";

export default function Create() {
  const { wallet, profile } = useLaunchStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [error, setError] = useState("");

  const preview = punkAvatarSvg((ticker || "NEW") + name);

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const coin = launchCoin({ name, ticker, description, twitter });
      navigate(`/coin/${coin.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <div className="label-mono mb-3">Create screen</div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          LAUNCH A <span className="gradient-text">COIN</span>
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3">
          Name it. Ticker it. Seed the pulse. Verified whitelist members get a featured slot badge on the card.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
        <div className="glass pixel-corners p-4 text-center">
          <div className="label-mono mb-3">Coin image</div>
          <img src={preview} alt="" className="w-full aspect-square bg-black border border-white/10" />
          <p className="text-[10px] text-zinc-600 mt-3">Auto-generated punk tile from ticker + name.</p>
        </div>

        <div className="space-y-4">
          <Field label="Name" value={name} onChange={setName} placeholder="Vault Cat" />
          <Field label="Ticker" value={ticker} onChange={(v) => setTicker(v.toUpperCase())} placeholder="VCAT" />
          <div>
            <div className="label-mono mb-2">What is this coin about?</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-terminal resize-none"
              placeholder="One or two sentences. Keep it terminal."
            />
          </div>
          <Field label="X handle" value={twitter} onChange={setTwitter} placeholder="@project" />

          <div className="glass pixel-corners p-4 text-xs text-zinc-500 space-y-1">
            <p>Launch fee: 0.02 demo ETH (seeded into your creator bag).</p>
            <p>Wallet: {wallet ? "connected" : "not connected"}</p>
            <p>Whitelist: {profile?.clearance === 100 ? "featured slot unlocked" : "public slot (join whitelist for featured)"}</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="btn-neon">
            Launch coin
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="label-mono mb-2">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-terminal" />
    </div>
  );
}
