import { hashString } from "./format.js";

const PALETTES = [
  ["#0a0b0d", "#ccff00", "#7fe7d8", "#f4f4f5"],
  ["#0a0b0d", "#baf25a", "#ff6b6b", "#e4e4e7"],
  ["#0a0b0d", "#7fe7d8", "#ccff00", "#ffffff"],
  ["#111318", "#ffb703", "#ccff00", "#8ecae6"],
  ["#0a0b0d", "#fb7185", "#ccff00", "#a1a1aa"],
  ["#0c1014", "#38bdf8", "#ccff00", "#fafafa"],
];

function pick(seed, arr) {
  return arr[seed % arr.length];
}

export function punkAvatarSvg(seedInput) {
  const seed = hashString(String(seedInput || "404"));
  const [bg, accent, alt, skin] = pick(seed, PALETTES);
  const hair = (seed >> 3) % 4;
  const glasses = (seed >> 5) % 3 === 0;
  const beard = (seed >> 7) % 3 === 0;
  const smoke = (seed >> 9) % 4 === 0;

  const hairPath =
    hair === 0
      ? `<rect x="8" y="4" width="16" height="6" fill="${accent}"/>`
      : hair === 1
        ? `<rect x="7" y="3" width="18" height="8" fill="${alt}"/>`
        : hair === 2
          ? `<rect x="9" y="5" width="14" height="5" fill="${accent}"/><rect x="6" y="8" width="4" height="8" fill="${accent}"/><rect x="22" y="8" width="4" height="8" fill="${accent}"/>`
          : `<rect x="8" y="4" width="16" height="4" fill="${skin}"/>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
    <rect width="32" height="32" fill="${bg}"/>
    <rect x="1" y="1" width="30" height="30" fill="none" stroke="${accent}" stroke-width="1"/>
    ${hairPath}
    <rect x="10" y="10" width="12" height="12" fill="${skin}"/>
    <rect x="12" y="14" width="3" height="3" fill="#111"/>
    <rect x="18" y="14" width="3" height="3" fill="#111"/>
    ${glasses ? `<rect x="11" y="13" width="10" height="5" fill="none" stroke="${accent}" stroke-width="1"/>` : ""}
    <rect x="14" y="18" width="4" height="2" fill="#111"/>
    ${beard ? `<rect x="12" y="21" width="8" height="3" fill="#3f3f46"/>` : ""}
    ${smoke ? `<rect x="18" y="19" width="6" height="1" fill="${alt}"/><rect x="24" y="16" width="2" height="2" fill="${alt}" opacity=".6"/>` : ""}
  </svg>`)}`;
}
