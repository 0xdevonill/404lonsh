import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import { DEFAULT_SUPPLY, ETH_USD, GRADUATION_MCAP } from "../lib/data.js";
import { formatNum, formatTokens, formatUsd, shorten, timeAgo } from "../lib/format.js";
import { addReply, connectDemoWallet, progressOf, quoteBuy, quoteSell, setContractAddress, trade } from "../lib/store.js";
import { priceFromMcap } from "../lib/chart.js";
import TradingChart from "../components/TradingChart.jsx";

export default function Coin() {
  const { id } = useParams();
  const { coins, wallet, holdings, trades, eth } = useLaunchStore();
  const coin = coins.find((c) => c.id === id);
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("0.05");
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [contract, setContract] = useState("");
  const [contractError, setContractError] = useState("");

  const pos = wallet ? holdings[wallet]?.[id] : null;
  const pct = coin ? progressOf(coin) : 0;
  const tape = trades.filter((t) => t.coinId === id);
  const price = coin ? priceFromMcap(coin.mcap || 0, coin.supply || DEFAULT_SUPPLY) : 0;

  const quote = useMemo(() => {
    if (!coin) return null;
    const n = Number(amount);
    if (!n || n <= 0) return null;
    if (side === "buy") return quoteBuy(coin, n);
    return quoteSell(coin, n);
  }, [coin, amount, side]);

  if (!coin) {
    return (
      <div className="glass pixel-corners p-10 text-center space-y-4">
        <p className="text-zinc-400">Token page not found.</p>
        <Link to="/launches" className="btn-neon inline-flex">
          Back to launches
        </Link>
      </div>
    );
  }

  async function onTrade(e) {
    e.preventDefault();
    setError("");
    try {
      if (!wallet) await connectDemoWallet();
      trade({
        coinId: coin.id,
        side,
        ethAmount: side === "buy" ? amount : undefined,
        tokenAmount: side === "sell" ? amount : undefined,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  function onReply(e) {
    e.preventDefault();
    setError("");
    try {
      addReply(coin.id, reply);
      setReply("");
    } catch (err) {
      setError(err.message);
    }
  }

  function onContract(e) {
    e.preventDefault();
    setContractError("");
    try {
      setContractAddress(coin.id, contract);
      setContract("");
    } catch (err) {
      setContractError(err.message);
    }
  }

  const isCreator = Boolean(wallet && coin.creator && wallet.toLowerCase() === coin.creator.toLowerCase());

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="glass-strong pixel-corners p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <img src={coin.image} alt="" className="h-20 w-20 border border-white/10 bg-black object-cover" />
              <div className="min-w-0">
                <div className="label-mono mb-2">{coin.status} · Robinhood Chain</div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">
                  {coin.name} <span className="text-neon">${coin.ticker}</span>
                </h1>
                <p className="text-sm text-zinc-400 mt-3 max-w-2xl">{coin.description}</p>
                <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-zinc-500 uppercase tracking-widest">
                  <span>Creator {shorten(coin.creator)}</span>
                  <span>{timeAgo(coin.createdAt)}</span>
                  {coin.twitter && <span>@{coin.twitter}</span>}
                  <span className="text-neon">{coin.creatorFee || 0}% creator fee</span>
                  {coin.contractAddress && <span className="text-neon">{shorten(coin.contractAddress, 6)}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <Metric label="Market cap" value={formatUsd(coin.mcap)} />
              <Metric label="Volume" value={formatUsd(coin.volume)} />
              <Metric label="Holders" value={formatNum(coin.holders, 0)} />
              <Metric label="Progress" value={`${pct.toFixed(1)}%`} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <Metric label="Price" value={price ? price.toExponential(2) : "—"} />
              <Metric label="Supply" value={formatTokens(coin.supply || DEFAULT_SUPPLY)} />
              <Metric label="Creator fee" value={`${coin.creatorFee || 0}%`} />
              <Metric label="Fees earned" value={`${(coin.creatorFeesEth || 0).toFixed(4)} ETH`} />
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-[10px] tracking-widest uppercase text-zinc-500 mb-2">
                <span>Pulse curve → graduate at {formatUsd(GRADUATION_MCAP)}</span>
                <span>{formatUsd(coin.mcap)}</span>
              </div>
              <div className="progress-track h-3">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <TradingChart candles={coin.candles || []} ticker={coin.ticker} />

          <div className="glass pixel-corners p-5">
            <div className="label-mono mb-4">Thread</div>
            <form onSubmit={onReply} className="flex gap-2 mb-4">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Drop a reply on this card"
                className="input-terminal"
              />
              <button type="submit" className="btn-ghost shrink-0">
                Post
              </button>
            </form>
            <div className="space-y-3">
              {tape.filter((t) => t.side === "reply").length === 0 && (
                <p className="text-xs text-zinc-600">No replies yet. Be the first print on the card.</p>
              )}
              {tape
                .filter((t) => t.side === "reply")
                .map((t) => (
                  <div key={t.id} className="border border-white/5 pixel-corners p-3 text-xs text-zinc-400">
                    <span className="text-neon">{shorten(t.wallet)}</span>
                    <span className="text-zinc-600"> · {timeAgo(t.at)}</span>
                    <p className="text-zinc-200 mt-1">{t.text}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[360px] space-y-4">
          {(coin.status === "deployed" || coin.contractAddress) && (
            <div className="glass-strong pixel-corners p-5 space-y-3">
              <div className="label-mono">Contract address</div>
              {coin.contractAddress ? (
                <p className="text-xs break-all text-neon">{coin.contractAddress}</p>
              ) : isCreator ? (
                <form onSubmit={onContract} className="space-y-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Name, ticker, description, market cap, chart, and history stay. Adding the contract address sends this coin live and pins it first.
                  </p>
                  <input
                    value={contract}
                    onChange={(e) => setContract(e.target.value.trim())}
                    placeholder="0x…"
                    spellCheck={false}
                    autoComplete="off"
                    className="input-terminal"
                  />
                  {contractError && <p className="text-xs text-red-400">{contractError}</p>}
                  <button type="submit" className="btn-neon w-full">
                    Add address & go live
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500">
                    {wallet
                      ? "Waiting on the creator to add the contract address."
                      : "Connect the creator wallet to add the contract address."}
                  </p>
                  {!wallet && (
                    <button type="button" onClick={() => connectDemoWallet()} className="btn-ghost w-full">
                      Connect wallet
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="glass-strong pixel-corners p-5">
            <div className="flex gap-2 mb-4">
              {["buy", "sell"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSide(s);
                    setAmount(s === "buy" ? "0.05" : String(Math.max(0, Math.floor(pos?.tokens || 0))));
                  }}
                  className={`flex-1 py-2.5 text-[11px] font-bold tracking-[0.16em] uppercase pixel-corners ${
                    side === s ? "bg-neon text-black" : "glass text-zinc-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={onTrade} className="space-y-4">
              <div>
                <div className="label-mono mb-2">{side === "buy" ? "ETH in" : `${coin.ticker} in`}</div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-terminal"
                  inputMode="decimal"
                />
                <div className="flex gap-2 mt-2">
                  {(side === "buy" ? ["0.02", "0.05", "0.1"] : ["25", "50", "100"]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setAmount(side === "buy" ? v : String(((pos?.tokens || 0) * Number(v)) / 100))
                      }
                      className="glass pixel-corners px-2 py-1 text-[10px] tracking-widest uppercase text-zinc-400"
                    >
                      {side === "buy" ? `${v} ETH` : `${v}%`}
                    </button>
                  ))}
                </div>
              </div>
              {quote && (
                <div className="text-xs text-zinc-400 space-y-1">
                  {side === "buy" ? (
                    <>
                      <p>
                        You receive <span className="text-neon">{formatTokens(quote.tokens)}</span> ${coin.ticker}
                      </p>
                      <p>
                        Creator fee {coin.creatorFee || 0}% · {quote.feeEth.toFixed(4)} ETH
                      </p>
                      <p>Fills curve by {formatUsd(quote.usd)} · ETH/USD {ETH_USD}</p>
                    </>
                  ) : (
                    <>
                      <p>
                        You receive <span className="text-neon">{quote.ethOut.toFixed(4)} ETH</span>
                      </p>
                      <p>3% pulse spread on sells</p>
                    </>
                  )}
                </div>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                data-testid="trade-submit"
                className="btn-neon w-full disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={coin.status === "upcoming" || coin.status === "deployed"}
              >
                {!wallet
                  ? "Connect to trade"
                  : coin.status === "deployed"
                    ? "Add contract to go live"
                    : coin.status === "upcoming"
                      ? "Not live yet"
                      : `${side} $${coin.ticker}`}
              </button>
              <p className="text-[10px] text-zinc-600">
                Demo ETH balance {eth.toFixed(4)} · This terminal does not broadcast chain txs.
              </p>
            </form>
          </div>

          <div className="glass pixel-corners p-5">
            <div className="label-mono mb-3">Your position</div>
            {pos && pos.tokens > 0 ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-zinc-500">Tokens</span>{" "}
                  <span className="text-white font-bold">{formatTokens(pos.tokens)}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Spent</span> {pos.spentEth.toFixed(4)} ETH
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-600">No bag on this card yet.</p>
            )}
          </div>

          <div className="glass pixel-corners p-5">
            <div className="label-mono mb-3">Tape</div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {tape.filter((t) => t.side !== "reply").length === 0 && (
                <p className="text-xs text-zinc-600">No prints yet.</p>
              )}
              {tape
                .filter((t) => t.side !== "reply")
                .map((t) => (
                  <div key={t.id} className="flex justify-between text-[11px] gap-2">
                    <span className={t.side === "buy" ? "text-neon" : "text-red-400"}>{t.side.toUpperCase()}</span>
                    <span className="text-zinc-400 truncate">{shorten(t.wallet)}</span>
                    <span className="text-zinc-200">{formatUsd(t.usd)}</span>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="font-display text-xl font-bold text-white mt-1 tabular-nums">{value}</div>
    </div>
  );
}
