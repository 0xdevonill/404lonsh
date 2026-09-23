import { hashString } from "./format.js";

export function priceFromMcap(mcap, supply = 1_000_000_000) {
  const s = Math.max(Number(supply) || 1_000_000_000, 1);
  const cap = Math.max(Number(mcap) || 800, 400);
  return cap / s;
}

export function generateCandles(seedInput, currentPrice, count = 48) {
  const seed = hashString(String(seedInput || "404"));
  const candles = [];
  let price = currentPrice * 0.42;
  const now = Date.now();
  const step = 5 * 60 * 1000;
  for (let i = 0; i < count; i += 1) {
    const t = now - (count - i) * step;
    const wave = Math.sin((i + (seed % 9)) / 4.2) * 0.04;
    const drift = (currentPrice - price) / Math.max(1, count - i);
    const noise = (((seed >> (i % 12)) & 255) / 255 - 0.5) * 0.03;
    const o = price;
    const c = Math.max(currentPrice * 0.08, o * (1 + wave + noise) + drift);
    const h = Math.max(o, c) * (1.008 + ((seed >> ((i + 3) % 8)) & 7) / 900);
    const l = Math.min(o, c) * (0.992 - ((seed >> ((i + 5) % 8)) & 7) / 1100);
    const v = 80 + ((seed * (i + 3)) % 420);
    candles.push({ t, o, h, l, c, v });
    price = c;
  }
  if (candles.length) candles[candles.length - 1].c = currentPrice;
  return candles;
}

export function pushCandle(candles, price, usdVolume, at = Date.now()) {
  const list = Array.isArray(candles) ? [...candles] : [];
  const bucket = 60 * 1000;
  const t = Math.floor(at / bucket) * bucket;
  const last = list[list.length - 1];
  if (last && last.t === t) {
    list[list.length - 1] = {
      ...last,
      h: Math.max(last.h, price),
      l: Math.min(last.l, price),
      c: price,
      v: last.v + usdVolume,
    };
  } else {
    const o = last ? last.c : price;
    list.push({
      t,
      o,
      h: Math.max(o, price),
      l: Math.min(o, price),
      c: price,
      v: usdVolume,
    });
  }
  return list.slice(-120);
}

export function changePct(candles) {
  if (!candles || candles.length < 2) return 0;
  const first = candles[0].o || candles[0].c;
  const last = candles[candles.length - 1].c;
  if (!first) return 0;
  return ((last - first) / first) * 100;
}
