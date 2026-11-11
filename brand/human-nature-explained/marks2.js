// Round two: stranger, more surreal marks for "Human Nature Explained" (200 x 200 box). ink = main, hot = accent, bg = backdrop.
const HEAD = "M70,182 L70,150 C44,138 30,112 34,84 C38,50 66,26 100,26 C134,26 158,50 160,82 L174,108 C176,112 174,115 170,116 L160,118 L160,134 C160,146 152,152 140,152 L118,152 L118,182 Z";
let uid = 0;
export const MARKS2 = {
  // 1. a puppet head on strings: who is really in control?
  puppet: (ink, hot, bg) => `
    <g stroke="${hot}" stroke-width="3.6" stroke-linecap="round"><line x1="38" y1="12" x2="56" y2="82"/><line x1="162" y1="28" x2="144" y2="82"/><line x1="100" y1="20" x2="100" y2="62"/><line x1="58" y1="34" x2="70" y2="158"/><line x1="142" y1="8" x2="130" y2="158"/></g>
    <g stroke="${ink}" stroke-width="10" stroke-linecap="round"><line x1="34" y1="11" x2="166" y2="29"/><line x1="54" y1="35" x2="146" y2="7"/></g>
    <rect x="46" y="62" width="108" height="80" rx="34" fill="${ink}"/>
    <path d="M62,150 L138,150 L138,160 C138,176 124,186 100,186 C76,186 62,176 62,160 Z" fill="${ink}"/>
    <circle cx="80" cy="100" r="10" fill="${bg}"/><circle cx="120" cy="100" r="10" fill="${bg}"/><circle cx="82" cy="102" r="4" fill="${hot}"/><circle cx="122" cy="102" r="4" fill="${hot}"/>
    <rect x="74" y="160" width="52" height="7" rx="3.5" fill="${bg}"/>`,
  // 2. the iceberg head: what you show is the tip, the rest is under the water
  iceberg: (ink, hot, bg) => { const a = ++uid; return `
    <defs><clipPath id="ia${a}"><rect x="0" y="0" width="200" height="74"/></clipPath><clipPath id="ib${a}"><rect x="0" y="80" width="200" height="130"/></clipPath></defs>
    <g transform="translate(0 14)"><path d="${HEAD}" fill="${ink}" clip-path="url(#ia${a})" transform="translate(0 -14)"/></g>
    <path d="${HEAD}" fill="${ink}" opacity="0.42" clip-path="url(#ib${a})"/>
    <circle cx="138" cy="94" r="7" fill="${bg}" opacity="0.9"/>
    <path d="M2,77 q12,-9 24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0" fill="none" stroke="${hot}" stroke-width="7" stroke-linecap="round"/>
    <line x1="98" y1="28" x2="98" y2="4" stroke="${hot}" stroke-width="4.5" stroke-linecap="round"/><path d="M98,4 L122,11 L98,19 Z" fill="${hot}"/>`; },
  // 3. a head inside a head inside a head
  nested: (ink, hot, bg) => [[1, ink], [0.72, bg], [0.5, ink], [0.3, hot]].map(([s, c]) =>
    `<path d="${HEAD}" fill="${c}" transform="translate(${96 * (1 - s)} ${92 * (1 - s)}) scale(${s})"/>`).join("") + `<circle cx="108" cy="89" r="2.6" fill="${bg}"/>`,
  // 4. the control room: a tiny person at the levers behind your forehead
  control: (ink, hot, bg) => `
    <path d="${HEAD}" fill="${ink}"/>
    <rect x="58" y="46" width="78" height="62" rx="14" fill="${bg}"/>
    <rect x="96" y="84" width="34" height="18" rx="4" fill="${hot}"/><line x1="118" y1="84" x2="126" y2="62" stroke="${hot}" stroke-width="5" stroke-linecap="round"/><circle cx="127" cy="60" r="6" fill="${hot}"/>
    <circle cx="80" cy="66" r="8" fill="${ink}"/><path d="M80,76 L80,96 M80,82 L98,86 M80,96 L70,104 M80,96 L92,102" stroke="${ink}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <circle cx="146" cy="120" r="5" fill="${bg}"/>`,
  // 5. two faces or one cup? the shape between two people
  faces: (ink, hot) => { const a = ++uid; return `
    <defs><clipPath id="f${a}"><rect x="6" y="22" width="188" height="164" rx="26"/></clipPath></defs>
    <g clip-path="url(#f${a})"><rect x="6" y="22" width="188" height="164" fill="${hot}"/>
    <path d="${HEAD}" fill="${ink}" transform="translate(-86 0)"/><rect x="-10" y="20" width="60" height="170" fill="${ink}"/>
    <path d="${HEAD}" fill="${ink}" transform="translate(286 0) scale(-1 1)"/><rect x="150" y="20" width="60" height="170" fill="${ink}"/></g>`; },
  // 6. the face unzips and something is looking out
  zipper: (ink, hot, bg) => { const a = ++uid; let teeth = "";
    for (let y = 122; y < 178; y += 8) teeth += `<rect x="${y % 16 ? 93 : 101}" y="${y}" width="6" height="4" rx="1" fill="${bg}"/>`;
    for (let i = 0; i < 9; i++) { const t = i / 9; teeth += `<rect x="${96 - 46 * (1 - t) - 3}" y="${36 + 76 * t}" width="6" height="4" rx="1" fill="${ink}" transform="rotate(-28 ${96 - 46 * (1 - t)} ${38 + 76 * t})"/><rect x="${104 + 46 * (1 - t) - 3}" y="${36 + 76 * t}" width="6" height="4" rx="1" fill="${ink}" transform="rotate(28 ${104 + 46 * (1 - t)} ${38 + 76 * t})"/>`; }
    return `<defs><clipPath id="z${a}"><ellipse cx="100" cy="104" rx="64" ry="80"/></clipPath></defs>
    <ellipse cx="100" cy="104" rx="64" ry="80" fill="${ink}"/>
    <g clip-path="url(#z${a})"><path d="M100,116 L44,22 L156,22 Z" fill="${bg}"/>
      <path d="M62,64 C80,40 120,40 138,64 C120,88 80,88 62,64 Z" fill="${ink}"/><circle cx="100" cy="64" r="17" fill="${hot}"/><circle cx="100" cy="64" r="7.5" fill="${bg}"/></g>
    <line x1="100" y1="118" x2="100" y2="180" stroke="${bg}" stroke-width="2.5"/>${teeth}
    <rect x="91" y="108" width="18" height="15" rx="4" fill="${hot}"/><rect x="96" y="121" width="8" height="18" rx="4" fill="none" stroke="${hot}" stroke-width="3.5"/>`; },
};
