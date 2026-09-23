import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import { connectDemoWallet, launchCoin } from "../lib/store.js";
import { DEFAULT_SUPPLY } from "../lib/data.js";
import { formatTokens } from "../lib/format.js";

const SUPPLY_PRESETS = [
  { label: "1B", value: 1_000_000_000 },
  { label: "500M", value: 500_000_000 },
  { label: "100M", value: 100_000_000 },
  { label: "10M", value: 10_000_000 },
];

export default function Create() {
  const { wallet, eth } = useLaunchStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState(DEFAULT_SUPPLY);
  const [creatorFee, setCreatorFee] = useState("1");
  const [devBuy, setDevBuy] = useState("0.05");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  async function onFile(file) {
    if (!file) return;
    try {
      setImage(await readLogo(file));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (!wallet) await connectDemoWallet();
      const coin = launchCoin({
        name,
        ticker,
        description,
        twitter,
        image,
        supply,
        creatorFee,
        devBuyEth: devBuy,
      });
      navigate(`/coin/${coin.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6">
        <div className="label-mono mb-3">Create screen</div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          LAUNCH A <span className="gradient-text">COIN</span>
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-xl">
          Pump-style launch on the 404 terminal. Upload a logo, set supply, lock creator commission, and buy your own coin as it goes live.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <label
          className={`glass-strong pixel-corners p-4 text-center cursor-pointer transition-colors ${
            drag ? "border-neon" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <div className="label-mono mb-3">Logo · required</div>
          {image ? (
            <img src={image} alt="Logo preview" className="w-full aspect-square bg-black border border-white/10 object-cover" />
          ) : (
            <div className="aspect-square border border-dashed border-white/15 grid place-items-center text-zinc-500 px-4">
              <div>
                <div className="font-display text-neon text-lg mb-2">+</div>
                <p className="text-[11px] tracking-widest uppercase">Drop image or click</p>
                <p className="text-[10px] mt-2 text-zinc-600">PNG / JPG · 2 MB max · square</p>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <p className="text-[10px] text-zinc-600 mt-3">Same as pump.fun — the logo is the coin.</p>
        </label>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={name} onChange={setName} placeholder="Vault Cat" />
            <Field label="Ticker" value={ticker} onChange={(v) => setTicker(v.toUpperCase().slice(0, 10))} placeholder="VCAT" />
          </div>
          <div>
            <div className="label-mono mb-2">What is this coin about?</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-terminal resize-none"
              placeholder="One or two sentences. Keep it terminal."
            />
          </div>
          <Field label="X handle" value={twitter} onChange={setTwitter} placeholder="@project" />

          <div className="glass pixel-corners p-4 space-y-3">
            <div className="label-mono">Token supply</div>
            <div className="flex flex-wrap gap-2">
              {SUPPLY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSupply(p.value)}
                  className={`pixel-corners px-3 py-2 text-[11px] font-bold tracking-widest uppercase ${
                    supply === p.value ? "bg-neon text-black" : "glass text-zinc-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1000000"
              value={supply}
              onChange={(e) => setSupply(Number(e.target.value))}
              className="input-terminal"
            />
            <p className="text-[10px] text-zinc-600">Total supply minted on the curve: {formatTokens(supply)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass pixel-corners p-4 space-y-3">
              <div className="label-mono">Creator commission</div>
              <input
                value={creatorFee}
                onChange={(e) => setCreatorFee(e.target.value)}
                className="input-terminal"
                inputMode="decimal"
              />
              <div className="flex flex-wrap gap-2">
                {["0", "0.5", "1", "2", "5"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCreatorFee(v)}
                    className={`pixel-corners px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase ${
                      creatorFee === v ? "bg-neon text-black" : "glass text-zinc-400"
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600">Skimmed from every buy. Max 10%.</p>
            </div>

            <div className="glass pixel-corners p-4 space-y-3">
              <div className="label-mono">Buy at launch</div>
              <input
                value={devBuy}
                onChange={(e) => setDevBuy(e.target.value)}
                className="input-terminal"
                inputMode="decimal"
              />
              <div className="flex flex-wrap gap-2">
                {["0", "0.05", "0.1", "0.25"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDevBuy(v)}
                    className={`pixel-corners px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase ${
                      devBuy === v ? "bg-neon text-black" : "glass text-zinc-400"
                    }`}
                  >
                    {v} ETH
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600">Dev buy seeds your bag and the first candle. Balance {eth.toFixed(3)} ETH.</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="btn-neon">
            {wallet ? "Launch coin" : "Connect & launch"}
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

function readLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Choose a PNG or JPG logo."));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image too large. 2 MB max."));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0a0b0d";
      ctx.fillRect(0, 0, size, size);
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}
