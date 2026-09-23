import { DEFAULT_SUPPLY, ETH_USD, GRADUATION_MCAP, SEED_COINS, STARTING_ETH_BALANCE } from "./data.js";
import { randomHex } from "./format.js";
import { priceFromMcap, pushCandle } from "./chart.js";

const SCHEMA = 3;
const KEYS = {
  schema: "lf_schema",
  wallet: "lf_wallet",
  coins: "lf_coins",
  holdings: "lf_holdings",
  trades: "lf_trades",
  eth: "lf_eth",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function listeners() {
  if (!window.__lfListeners) window.__lfListeners = new Set();
  return window.__lfListeners;
}

export function subscribe(fn) {
  listeners().add(fn);
  return () => listeners().delete(fn);
}

function emit() {
  listeners().forEach((fn) => fn());
}

function ensureSeeded() {
  if (read(KEYS.schema, 0) !== SCHEMA) {
    ["lf_wallet", "lf_profile", "lf_members", "lf_coins", "lf_holdings", "lf_trades", "lf_eth", "lf_schema"].forEach(
      (k) => localStorage.removeItem(k),
    );
    write(KEYS.schema, SCHEMA);
    write(KEYS.coins, SEED_COINS);
    write(KEYS.holdings, {});
    write(KEYS.trades, []);
    write(KEYS.eth, STARTING_ETH_BALANCE);
    return;
  }
  if (!read(KEYS.coins, null)) write(KEYS.coins, SEED_COINS);
  if (!read(KEYS.holdings, null)) write(KEYS.holdings, {});
  if (!read(KEYS.trades, null)) write(KEYS.trades, []);
  if (read(KEYS.eth, null) == null) write(KEYS.eth, STARTING_ETH_BALANCE);
}

ensureSeeded();

export function getState() {
  ensureSeeded();
  return {
    wallet: read(KEYS.wallet, null),
    coins: read(KEYS.coins, SEED_COINS),
    holdings: read(KEYS.holdings, {}),
    trades: read(KEYS.trades, []),
    eth: Number(read(KEYS.eth, STARTING_ETH_BALANCE)),
  };
}

export async function connectDemoWallet() {
  try {
    if (typeof window !== "undefined" && window.ethereum?.request) {
      const accounts = await Promise.race([
        window.ethereum.request({ method: "eth_requestAccounts" }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("wallet timeout")), 1200)),
      ]);
      if (accounts?.[0]) {
        connectWallet(accounts[0]);
        return getState();
      }
    }
  } catch {
    /* demo wallet */
  }
  connectWallet();
  return getState();
}

export function connectWallet(existing) {
  write(KEYS.wallet, existing || randomHex(20));
  emit();
  return getState();
}

export function disconnectWallet() {
  write(KEYS.wallet, null);
  emit();
}

export function resetDemo() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ["lf_profile", "lf_members"].forEach((k) => localStorage.removeItem(k));
  ensureSeeded();
  emit();
}

export function quoteBuy(coin, ethIn) {
  const feePct = Math.min(10, Math.max(0, Number(coin.creatorFee) || 0)) / 100;
  const feeEth = ethIn * feePct;
  const tradeEth = Math.max(0, ethIn - feeEth);
  const usd = tradeEth * ETH_USD;
  const price = priceFromMcap(coin.mcap || 1200, coin.supply || DEFAULT_SUPPLY);
  const tokens = usd / price;
  const nextMcap = (coin.mcap || 0) + usd;
  return { tokens, usd, nextMcap, price, feeEth, tradeEth };
}

export function quoteSell(coin, tokenIn) {
  const price = priceFromMcap(coin.mcap || 1200, coin.supply || DEFAULT_SUPPLY);
  const usd = tokenIn * price * 0.97;
  const ethOut = usd / ETH_USD;
  const nextMcap = Math.max(400, (coin.mcap || 0) - usd);
  return { ethOut, usd, nextMcap, price };
}

export function trade({ coinId, side, ethAmount, tokenAmount }) {
  const state = getState();
  if (!state.wallet) throw new Error("Connect a wallet first.");
  const coins = state.coins.map((c) => ({ ...c }));
  const coin = coins.find((c) => c.id === coinId);
  if (!coin) throw new Error("Coin not found.");
  if (coin.status === "upcoming") throw new Error("This slot is not live yet.");
  if (coin.status === "graduated" && side === "buy") {
    throw new Error("Graduated coins trade on the pool, not the pulse.");
  }

  const holdings = { ...state.holdings };
  const mine = { ...(holdings[state.wallet] || {}) };
  const pos = { tokens: 0, spentEth: 0, ...(mine[coinId] || {}) };
  const wasEmpty = !pos.tokens;

  let eth = state.eth;
  let tradeRow;

  if (side === "buy") {
    const amt = Number(ethAmount);
    if (!amt || amt <= 0) throw new Error("Enter an ETH amount.");
    if (amt > eth + 1e-9) throw new Error("Not enough demo ETH.");
    const q = quoteBuy(coin, amt);
    eth -= amt;
    pos.tokens += q.tokens;
    pos.spentEth += q.tradeEth;
    coin.mcap = q.nextMcap;
    coin.volume = (coin.volume || 0) + q.usd;
    coin.creatorFeesEth = (coin.creatorFeesEth || 0) + q.feeEth;
    if (wasEmpty) coin.holders = (coin.holders || 0) + 1;
    if (coin.mcap >= GRADUATION_MCAP) coin.status = "graduated";
    const px = priceFromMcap(coin.mcap, coin.supply);
    coin.candles = pushCandle(coin.candles, px, q.usd);
    tradeRow = {
      id: randomHex(8),
      coinId,
      ticker: coin.ticker,
      side: "buy",
      eth: amt,
      feeEth: q.feeEth,
      tokens: q.tokens,
      usd: q.usd,
      wallet: state.wallet,
      at: Date.now(),
    };
  } else {
    const amt = Number(tokenAmount);
    if (!amt || amt <= 0) throw new Error("Enter a token amount.");
    if (amt > pos.tokens + 1e-6) throw new Error("Not enough tokens.");
    const q = quoteSell(coin, amt);
    pos.tokens -= amt;
    eth += q.ethOut;
    coin.mcap = q.nextMcap;
    coin.volume = (coin.volume || 0) + q.usd;
    const px = priceFromMcap(coin.mcap, coin.supply);
    coin.candles = pushCandle(coin.candles, px, q.usd);
    tradeRow = {
      id: randomHex(8),
      coinId,
      ticker: coin.ticker,
      side: "sell",
      eth: q.ethOut,
      tokens: amt,
      usd: q.usd,
      wallet: state.wallet,
      at: Date.now(),
    };
  }

  mine[coinId] = pos;
  holdings[state.wallet] = mine;
  const trades = [tradeRow, ...state.trades].slice(0, 80);

  write(KEYS.coins, coins);
  write(KEYS.holdings, holdings);
  write(KEYS.trades, trades);
  write(KEYS.eth, eth);
  emit();
  return getState();
}

export function launchCoin({ name, ticker, description, twitter, image, supply, creatorFee, devBuyEth }) {
  const state = getState();
  if (!state.wallet) throw new Error("Connect a wallet to launch.");
  const cleanTicker = (ticker || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
  const cleanName = (name || "").trim();
  if (!cleanName) throw new Error("Name is required.");
  if (cleanTicker.length < 2) throw new Error("Ticker is too short.");
  if (!image) throw new Error("Upload a logo like pump.fun.");
  if (state.coins.some((c) => c.ticker === cleanTicker)) throw new Error("Ticker already exists.");

  const totalSupply = Math.max(1_000_000, Number(supply) || DEFAULT_SUPPLY);
  const fee = Math.min(10, Math.max(0, Number(creatorFee) || 0));
  const buy = Math.max(0, Number(devBuyEth) || 0);
  if (buy > state.eth + 1e-9) throw new Error("Not enough demo ETH for the launch buy.");

  const startMcap = 1200;
  const coin = {
    id: `${cleanTicker.toLowerCase()}-${Date.now().toString(36)}`,
    name: cleanName,
    ticker: cleanTicker,
    description: (description || "").trim() || "A new pulse on 404 Launch Fun.",
    status: "live",
    mcap: startMcap,
    volume: 0,
    holders: 0,
    createdAt: Date.now(),
    creator: state.wallet,
    twitter: (twitter || "").replace(/^@/, ""),
    replies: 0,
    supply: totalSupply,
    creatorFee: fee,
    creatorFeesEth: 0,
    image,
    candles: [
      {
        t: Date.now(),
        o: priceFromMcap(startMcap, totalSupply),
        h: priceFromMcap(startMcap, totalSupply),
        l: priceFromMcap(startMcap, totalSupply),
        c: priceFromMcap(startMcap, totalSupply),
        v: 0,
      },
    ],
  };

  write(KEYS.coins, [coin, ...state.coins]);
  const holdings = { ...state.holdings };
  const mine = { ...(holdings[state.wallet] || {}) };
  mine[coin.id] = { tokens: 0, spentEth: 0 };
  holdings[state.wallet] = mine;
  write(KEYS.holdings, holdings);

  if (buy > 0) {
    trade({ coinId: coin.id, side: "buy", ethAmount: buy });
  } else {
    emit();
  }
  return getState().coins.find((c) => c.id === coin.id) || coin;
}

export function addReply(coinId, text) {
  const state = getState();
  if (!state.wallet) throw new Error("Connect first.");
  const msg = (text || "").trim();
  if (!msg) throw new Error("Write something.");
  const coins = state.coins.map((c) =>
    c.id === coinId ? { ...c, replies: (c.replies || 0) + 1 } : c,
  );
  write(KEYS.coins, coins);
  const trades = [
    {
      id: randomHex(8),
      coinId,
      ticker: coins.find((c) => c.id === coinId)?.ticker,
      side: "reply",
      text: msg.slice(0, 180),
      wallet: state.wallet,
      at: Date.now(),
    },
    ...state.trades,
  ].slice(0, 80);
  write(KEYS.trades, trades);
  emit();
}

export function progressOf(coin) {
  if (!coin) return 0;
  if (coin.status === "graduated") return 100;
  if (coin.status === "upcoming") return 0;
  return Math.min(100, ((coin.mcap || 0) / GRADUATION_MCAP) * 100);
}

export function tickOpenings() {
  const state = getState();
  let changed = false;
  const coins = state.coins.map((c) => {
    if (c.status === "upcoming" && c.opensAt && Date.now() >= c.opensAt) {
      changed = true;
      const mcap = Math.max(c.mcap || 0, 1200);
      const supply = c.supply || DEFAULT_SUPPLY;
      const px = priceFromMcap(mcap, supply);
      return {
        ...c,
        status: "live",
        mcap,
        candles: c.candles?.length ? c.candles : [{ t: Date.now(), o: px, h: px, l: px, c: px, v: 0 }],
      };
    }
    return c;
  });
  if (changed) {
    write(KEYS.coins, coins);
    emit();
  }
}
