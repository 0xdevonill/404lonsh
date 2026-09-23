import { Link } from "react-router-dom";
import { FAQ, HOW_IT_WORKS } from "../lib/data.js";
import { resetDemo } from "../lib/store.js";

export default function Docs() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div className="border-b border-white/10 pb-6">
        <div className="label-mono mb-3">Docs</div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          HOW <span className="gradient-text">404 LAUNCH FUN</span> WORKS
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3">
          A launchpad on Robinhood Chain, rebuilt as a card terminal for the 404 Origin look. Creators launch tokens. The pulse curve fills. Fees have a job instead of sitting idle.
        </p>
      </div>

      <div className="space-y-4">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.n} className="glass pixel-corners p-5">
            <div className="text-neon font-display font-bold">{step.n}</div>
            <h2 className="font-display text-xl font-bold mt-1">{step.title}</h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold">FAQ</h2>
        {FAQ.map((item) => (
          <details key={item.q} className="glass pixel-corners p-5 group">
            <summary className="cursor-pointer font-display font-bold text-white list-none flex justify-between gap-4">
              {item.q}
              <span className="text-neon group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/whitelist" className="btn-neon">
          Join whitelist
        </Link>
        <Link to="/create" className="btn-ghost">
          Launch a coin
        </Link>
        <button
          type="button"
          onClick={() => {
            resetDemo();
            window.location.href = "/";
          }}
          className="btn-ghost"
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}
