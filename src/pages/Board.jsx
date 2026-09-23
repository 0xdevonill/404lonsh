import { Link } from "react-router-dom";
import { useLaunchStore } from "../hooks/useLaunchStore.js";
import { punkAvatarSvg } from "../lib/punkAvatar.js";
import { shorten, timeAgo } from "../lib/format.js";

export default function Board() {
  const { members, profile } = useLaunchStore();
  const verified = members.filter((m) => m.clearance === 100);
  const boarding = members.filter((m) => m.clearance < 100);

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6">
        <div className="label-mono mb-3">Verified board</div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          WHITELIST <span className="gradient-text">CARDS</span>
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-xl">
          100% clearance lives here. Boarding wallets sit in the holding pattern until they verify X.
        </p>
      </div>

      <div className="flex gap-3 text-[11px] tracking-widest uppercase">
        <span className="glass pixel-corners px-3 py-2 text-neon">{verified.length} verified</span>
        <span className="glass pixel-corners px-3 py-2 text-zinc-400">{boarding.length} boarding</span>
        <Link to="/whitelist" className="btn-neon ml-auto">
          Join whitelist
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {verified.map((m) => (
          <MemberCard
            key={m.address}
            member={m}
            mine={profile?.address?.toLowerCase() === m.address.toLowerCase()}
          />
        ))}
      </div>

      {boarding.length > 0 && (
        <section>
          <div className="label-mono mb-4">Holding pattern · 50%</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {boarding.map((m) => (
              <MemberCard
                key={m.address}
                member={m}
                mine={profile?.address?.toLowerCase() === m.address.toLowerCase()}
                dim
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MemberCard({ member, mine, dim }) {
  return (
    <div className={`glass pixel-corners p-4 ${mine ? "border-neon/50 shadow-glow" : ""} ${dim ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-3">
        <img src={punkAvatarSvg(member.handle || member.address)} alt="" className="h-12 w-12 border border-white/10 bg-black" />
        <div className="min-w-0">
          <div className="font-display font-bold text-white truncate">
            {member.handle ? `@${member.handle}` : "anon"}
          </div>
          <div className="text-[10px] text-zinc-500 truncate">{shorten(member.address, 5)}</div>
        </div>
      </div>
      <div className="flex justify-between mt-4 text-[10px] tracking-widest uppercase text-zinc-500">
        <span className="text-neon">Spot #{member.spot}</span>
        <span>{member.clearance}%</span>
      </div>
      <div className="text-[10px] text-zinc-600 mt-2">{timeAgo(member.joinedAt)}</div>
      {mine && <div className="mt-3 text-[10px] tracking-widest uppercase text-neon">This is your card</div>}
    </div>
  );
}
