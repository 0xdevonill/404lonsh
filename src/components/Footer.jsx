import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-display font-bold tracking-[0.18em] uppercase text-sm">
            404<span className="text-neon">Launch</span>Fun
          </div>
          <p className="text-xs text-zinc-500 mt-3 max-w-xs">
            Card-based launchpad for the 404 Origin ecosystem. Logo, supply, creator fee, then pulse the curve.
          </p>
        </div>
        <div className="space-y-2 text-xs tracking-widest uppercase text-zinc-500">
          <Link className="block hover:text-neon" to="/launches">
            Launches
          </Link>
          <Link className="block hover:text-neon" to="/create">
            Launch a coin
          </Link>
          <Link className="block hover:text-neon" to="/docs">
            How it works
          </Link>
        </div>
        <div className="text-xs text-zinc-600 space-y-2">
          <p>Robinhood Chain · demo terminal</p>
          <p>Non-custodial UI. Public addresses only.</p>
          <p className="text-zinc-700">Inspired by Origin Punk Terminal visual language.</p>
        </div>
      </div>
    </footer>
  );
}
