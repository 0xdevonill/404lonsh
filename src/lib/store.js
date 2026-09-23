import { ETH_USD, GRADUATION_MCAP, SEED_COINS, SEED_MEMBERS, STARTING_ETH_BALANCE } from "./data.js";
import { makeClearanceCode, randomHex } from "./format.js";
import { punkAvatarSvg } from "./punkAvatar.js";

const KEYS = {
  wallet: "lf_wallet",
  profile: "lf_profile",
  members: "lf_members",
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
  if (!read(KEYS.coins, null)) write(KEYS.coins, SEED_COINS);
  if (!read(KEYS.members, null)) write(KEYS.members, SEED_MEMBERS);
  if (!read(KEYS.holdings, null)) write(KEYS.holdings, {});
  if (!read(KEYS.trades, null)) write(KEYS.trades, []);
  if (read(KEYS.eth, null) == null) write(KEYS.eth, STARTING_ETH_BALANCE);
}

ensureSeeded();

export function getState() {
  ensureSeeded();
  return {
    wallet: read(KEYS.wallet, null),
    profile: read(KEYS.profile, null),
    members: read(KEYS.members, SEED_MEMBERS),
    coins: read(KEYS.coins, SEED_COINS),
    holdings: read(KEYS.holdings, {}),
    trades: read(KEYS.trades, []),
    eth: Number(read(KEYS.eth, STARTING_ETH_BALANCE)),
  };
}

export function connectWallet(existing) {
  const address = existing || randomHex(20);
  write(KEYS.wallet, address);
  let profile = read(KEYS.profile, null);
  if (!profile || profile.address !== address) {
    const members = read(KEYS.members, SEED_MEMBERS);
    const found = members.find((m) => m.address.toLowerCase() === address.toLowerCase());
    profile = found
      ? { ...found }
      : {
          address,
          handle: "",
          email: "",
          spot: members.length + 1,
          clearance: 50,
          joinedAt: Date.now(),
          code: makeClearanceCode(address),
        };
    write(KEYS.profile, profile);
    if (!found) {
      write(KEYS.members, [profile, ...members]);
    }
  }
  emit();
  return getState();
}

export function disconnectWallet() {
  write(KEYS.wallet, null);
  emit();
}

export function updateProfile(patch) {
  const state = getState();
  if (!state.profile) return state;
  const profile = { ...state.profile, ...patch };
  if (profile.handle && profile.handle.replace("@", "").trim()) {
    profile.clearance = 100;
    profile.handle = profile.handle.replace(/^@/, "").trim();
  }
  write(KEYS.profile, profile);
  const members = state.members.map((m) =>
    m.address.toLowerCase() === profile.address.toLowerCase() ? profile : m,
  );
  if (!members.some((m) => m.address.toLowerCase() === profile.address.toLowerCase())) {
    members.unshift(profile);
  }
  write(KEYS.members, members);
  emit();
  return getState();
}

export function resetDemo() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ensureSeeded();
  emit();
}

function priceFromMcap(mcap) {
  const supply = 1_000_000_000;
  const cap = Math.max(mcap, 800);
  return cap / supply;
}

export function quoteBuy(coin, ethIn) {
  const usd = ethIn * ETH_USD;
  const price = priceFromMcap(coin.mcap || 1200);
  const tokens = usd / price;
  const nextMcap = (coin.mcap || 0) + usd;
  return { tokens, usd, nextMcap, price };
}

export function quoteSell(coin, tokenIn) {
  const price = priceFromMcap(coin.mcap || 1200);
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
    pos.spentEth += amt;
    coin.mcap = q.nextMcap;
    coin.volume = (coin.volume || 0) + q.usd;
    if (wasEmpty) coin.holders = (coin.holders || 0) + 1;
    if (coin.mcap >= GRADUATION_MCAP) coin.status = "graduated";
    tradeRow = {
      id: randomHex(8),
      coinId,
      ticker: coin.ticker,
      side: "buy",
      eth: amt,
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

export function launchCoin({ name, ticker, description, twitter }) {
  const state = getState();
  if (!state.wallet) throw new Error("Connect a wallet to launch.");
  const cleanTicker = (ticker || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
  const cleanName = (name || "").trim();
  if (!cleanName) throw new Error("Name is required.");
  if (cleanTicker.length < 2) throw new Error("Ticker is too short.");
  if (state.coins.some((c) => c.ticker === cleanTicker)) throw new Error("Ticker already exists.");

  const featured = state.profile?.clearance === 100;
  const coin = {
    id: `${cleanTicker.toLowerCase()}-${Date.now().toString(36)}`,
    name: cleanName,
    ticker: cleanTicker,
    description: (description || "").trim() || "A new pulse on 404 Launch Fun.",
    status: "live",
    mcap: 1400,
    volume: 0,
    holders: 1,
    createdAt: Date.now(),
    creator: state.wallet,
    twitter: (twitter || "").replace(/^@/, ""),
    replies: 0,
    featured,
    image: punkAvatarSvg(cleanTicker + cleanName),
  };

  write(KEYS.coins, [coin, ...state.coins]);
  const holdings = { ...state.holdings };
  const mine = { ...(holdings[state.wallet] || {}) };
  mine[coin.id] = { tokens: 20_000_000, spentEth: 0.02 };
  holdings[state.wallet] = mine;
  write(KEYS.holdings, holdings);
  write(KEYS.eth, Math.max(0, state.eth - 0.02));
  emit();
  return coin;
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
      return { ...c, status: "live", mcap: Math.max(c.mcap || 0, 1200) };
    }
    return c;
  });
  if (changed) {
    write(KEYS.coins, coins);
    emit();
  }
}
