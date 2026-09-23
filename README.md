# 404 Launch Fun

Card-based token launchpad and whitelist board for the 404 Origin ecosystem. Visual language follows [404 Punks](https://www.404punks.xyz/) (void background, neon lime, glass pixel cards, Chakra Petch + JetBrains Mono). Launch flow is a different take on a bliss.fun-style pad: whitelist clearance cards, pulse curve trading, and featured slots.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## What it includes

- Home terminal with live stats, marquee, and launch cards
- Launches board with live / upcoming / graduated filters
- Coin pages with buy/sell on a demo pulse curve
- Whitelist join: wallet (50%) then X handle (100%)
- Public verified board of member cards
- Create-a-coin flow with auto punk tile art

All state is local to the browser (localStorage). Demo ETH is credited on connect. No private keys are requested beyond a standard injected `eth_requestAccounts` if a wallet is present.
