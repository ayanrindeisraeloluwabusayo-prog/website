// Round three: four wilder takes on "The Control Room" (200 x 200 box). ink = main, hot = accent, bg = backdrop.
const HEAD = "M70,182 L70,150 C44,138 30,112 34,84 C38,50 66,26 100,26 C134,26 158,50 160,82 L174,108 C176,112 174,115 170,116 L160,118 L160,134 C160,146 152,152 140,152 L118,152 L118,182 Z";
const L = (pts, col, w) => `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** a tiny person: head at (x, y), hands at h1 / h2, feet at f1 / f2, hip at (hx, hy) */
const man = (x, y, col, hip, h1, h2, f1, f2, w = 5, r = 6.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>` +
  L([[x, y + r], hip], col, w) + L([[(x + hip[0]) / 2, (y + r + hip[1]) / 2 - 2], h1], col, w * 0.8) + L([[(x + hip[0]) / 2, (y + r + hip[1]) / 2 - 2], h2], col, w * 0.8) + L([hip, f1], col, w) + L([hip, f2], col, w);
let uid = 0;
export const MARKS3 = {
  // A. two tiny people fight over the lever: heart against head
  fight: (ink, hot, bg) => `
    <path d="${HEAD}" fill="${ink}"/>
    <rect x="46" y="40" width="96" height="76" rx="16" fill="${bg}"/>
    <rect x="84" y="102" width="20" height="10" rx="3" fill="${ink}"/>${L([[94, 102], [94, 62]], ink, 6)}<circle cx="94" cy="58" r="8" fill="${ink}"/>
    ${man(64, 66, ink, [58, 92], [88, 60], [88, 66], [50, 108], [66, 108])}
    ${man(124, 66, hot, [130, 92], [100, 60], [100, 66], [122, 108], [138, 108])}
    ${L([[84, 44], [80, 36]], hot, 4)}${L([[94, 42], [94, 32]], hot, 4)}${L([[104, 44], [108, 36]], hot, 4)}
    <circle cx="146" cy="122" r="5" fill="${bg}"/>
    ${L([[30, 60], [20, 54]], hot, 4)}${L([[28, 74], [16, 74]], hot, 4)}`,
  // B. the head is a three-storey building: control room, hamster wheel, furnace
  tower: (ink, hot, bg) => { const a = ++uid; return `
    <defs><clipPath id="t${a}"><path d="M56,150 C42,138 38,112 42,86 C46,56 70,36 100,36 C128,36 148,56 150,84 L150,146 Z"/></clipPath></defs>
    <path d="${HEAD}" fill="${ink}"/>
    <g clip-path="url(#t${a})"><rect x="30" y="30" width="130" height="125" fill="${bg}"/>
      <rect x="30" y="72" width="130" height="6" fill="${ink}"/><rect x="30" y="110" width="130" height="6" fill="${ink}"/>
      ${man(84, 48, ink, [84, 64], [98, 56], [98, 60], [78, 71], [90, 71], 4, 5)}<rect x="100" y="60" width="22" height="12" rx="3" fill="${hot}"/>${L([[112, 60], [118, 46]], hot, 4)}<circle cx="119" cy="44" r="4.5" fill="${hot}"/>
      <circle cx="92" cy="94" r="14" fill="none" stroke="${hot}" stroke-width="4.5"/>${man(92, 86, ink, [92, 98], [98, 92], [86, 94], [86, 105], [99, 104], 3.6, 4)}
      ${L([[128, 78], [128, 110]], ink, 3)}${L([[138, 78], [138, 110]], ink, 3)}${[84, 92, 100].map((y) => L([[128, y], [138, y]], ink, 3)).join("")}
      <path d="M70,146 C60,134 72,128 70,118 C82,126 80,134 86,130 C94,138 90,146 84,150 Z" fill="${hot}"/>
      ${man(112, 124, ink, [112, 138], [100, 134], [98, 138], [106, 148], [118, 148], 4, 5)}${L([[98, 136], [88, 142]], ink, 3.5)}
    </g>
    <circle cx="160" cy="124" r="4.5" fill="${bg}"/>
    <circle cx="24" cy="44" r="7" fill="${ink}" opacity=".85"/><circle cx="14" cy="30" r="5" fill="${ink}" opacity=".6"/><circle cx="8" cy="18" r="3.5" fill="${ink}" opacity=".4"/>`; },
  // C. the pilot has a pilot, who has a pilot
  pilots: (ink, hot, bg) => {
    const one = (s, tx, ty, c1, c2) => `<g transform="translate(${tx} ${ty}) scale(${s})"><path d="${HEAD}" fill="${c1}"/><rect x="52" y="44" width="88" height="70" rx="16" fill="${c2}"/><circle cx="146" cy="124" r="6" fill="${c2}"/></g>`;
    return one(1, 0, 0, ink, bg) + one(0.42, 54, 36, ink, bg) + `<g transform="translate(76.5 51) scale(0.165)"><path d="${HEAD}" fill="${hot}"/><circle cx="138" cy="92" r="12" fill="${bg}"/></g>`
      + L([[128, 96], [136, 80]], hot, 4.5) + `<circle cx="137" cy="78" r="5" fill="${hot}"/>`;
  },
  // D. meltdown: alarm on, steam out of the ears, the tiny pilot in a panic
  meltdown: (ink, hot, bg) => `
    <path d="${HEAD}" fill="${ink}"/>
    <rect x="46" y="40" width="96" height="76" rx="16" fill="${bg}"/>
    <path d="M82,40 a12,12 0 0 0 24,0 Z" fill="${hot}"/>${L([[72, 50], [64, 56]], hot, 4)}${L([[116, 50], [124, 56]], hot, 4)}${L([[94, 58], [94, 66]], hot, 4)}
    ${man(72, 74, ink, [72, 94], [60, 66], [84, 66], [64, 110], [80, 110])}
    <rect x="92" y="96" width="44" height="16" rx="4" fill="${hot}"/>${L([[102, 96], [96, 80]], hot, 4.5)}${L([[114, 96], [116, 78]], hot, 4.5)}${L([[126, 96], [134, 82]], hot, 4.5)}
    <circle cx="95" cy="78" r="4.5" fill="${hot}"/><circle cx="116" cy="76" r="4.5" fill="${hot}"/><circle cx="135" cy="80" r="4.5" fill="${hot}"/>
    ${L([[140, 116], [152, 128]], bg, 5)}${L([[152, 116], [140, 128]], bg, 5)}
    <circle cx="22" cy="96" r="9" fill="${ink}"/><circle cx="10" cy="80" r="7" fill="${ink}" opacity=".7"/><circle cx="6" cy="62" r="5" fill="${ink}" opacity=".45"/>
    <circle cx="180" cy="134" r="5" fill="${ink}" opacity=".8"/><circle cx="190" cy="124" r="3.5" fill="${ink}" opacity=".5"/>
    <path d="M124,150 q8,10 16,0" fill="none" stroke="${bg}" stroke-width="0"/>`,
};
