// Six logo marks for "Human Nature Explained", each drawn in a 200 x 200 box. ink = main colour, hot = accent.
const P = (n) => n.toFixed(1);
const HEAD = "M70,182 L70,150 C44,138 30,112 34,84 C38,50 66,26 100,26 C134,26 158,50 160,82 L174,108 C176,112 174,115 170,116 L160,118 L160,134 C160,146 152,152 140,152 L118,152 L118,182 Z";
export const MARKS = {
  // 1. the lid of the skull lifts and a question curls out
  openHead: (ink, hot, bg) => `
    <defs><clipPath id="oh-low"><rect x="0" y="74" width="200" height="130"/></clipPath><clipPath id="oh-top"><rect x="0" y="0" width="200" height="66"/></clipPath></defs>
    <path d="${HEAD}" fill="${ink}" clip-path="url(#oh-low)"/>
    <g transform="rotate(-24 40 70) translate(-2 -6)"><path d="${HEAD}" fill="${ink}" clip-path="url(#oh-top)"/></g>
    <path d="M96,70 C96,52 122,54 122,38 C122,22 98,18 90,34" fill="none" stroke="${hot}" stroke-width="11" stroke-linecap="round"/>
    <circle cx="97" cy="92" r="0" fill="${hot}"/>
    <circle cx="138" cy="92" r="7" fill="${bg}"/>`,
  // 2. a fingerprint whose middle ridge is a question mark
  fingerprint: (ink, hot) => {
    let s = "";
    for (let i = 0; i < 6; i++) {
      const rx = 22 + i * 13, ry = 28 + i * 15, a0 = 200 - i * 6, a1 = 520 + i * 4, pts = [];
      for (let a = a0; a <= a1; a += 6) { const r = (a * Math.PI) / 180; pts.push(`${P(100 + rx * Math.cos(r))},${P(108 + ry * Math.sin(r) * (Math.sin(r) > 0 ? 0.82 : 1))}`); }
      s += `<polyline points="${pts.join(" ")}" fill="none" stroke="${ink}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" ${i % 2 ? 'stroke-dasharray="70 14"' : 'stroke-dasharray="120 16"'}/>`;
    }
    return s + `<path d="M82,84 C82,62 118,62 118,86 C118,102 100,102 100,122" fill="none" stroke="${hot}" stroke-width="13" stroke-linecap="round"/><circle cx="100" cy="146" r="8.5" fill="${hot}"/>`;
  },
  // 3. H and N joined by a heartbeat
  pulse: (ink, hot) => `
    <text x="100" y="150" text-anchor="middle" font-family="'Inter Tight'" font-weight="800" font-size="150" letter-spacing="-10" fill="${ink}">HN</text>
    <polyline points="-4,104 34,104 48,104 60,70 76,138 90,88 100,104 126,104 138,84 150,120 160,104 204,104" fill="none" stroke="${hot}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`,
  // 4. an eye whose iris is a spiral
  eye: (ink, hot) => {
    const pts = [];
    for (let a = 0; a < 360 * 3.2; a += 8) { const r = 4 + a * 0.027, t = (a * Math.PI) / 180; pts.push(`${P(100 + r * Math.cos(t))},${P(100 + r * Math.sin(t))}`); }
    let lash = "";
    for (let i = 0; i < 7; i++) { const a = (-150 + i * 20) * Math.PI / 180; lash += `<line x1="${P(100 + 70 * Math.cos(a) * 1.25)}" y1="${P(100 + 62 * Math.sin(a))}" x2="${P(100 + 88 * Math.cos(a) * 1.25)}" y2="${P(100 + 84 * Math.sin(a))}" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>`; }
    return `<path d="M8,100 C44,44 156,44 192,100 C156,156 44,156 8,100 Z" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>${lash}
      <circle cx="100" cy="100" r="40" fill="${ink}"/><polyline points="${pts.join(" ")}" fill="none" stroke="${hot}" stroke-width="6.5" stroke-linecap="round"/>`;
  },
  // 5. an asterisk made of six little people (a footnote on being human)
  asterisk: (ink, hot) => {
    let s = "";
    for (let i = 0; i < 6; i++) {
      const col = i === 0 ? hot : ink;
      s += `<g transform="rotate(${i * 60} 100 100)"><line x1="100" y1="92" x2="100" y2="44" stroke="${col}" stroke-width="15" stroke-linecap="round"/><circle cx="100" cy="24" r="14" fill="${col}"/>
        <line x1="100" y1="62" x2="80" y2="46" stroke="${col}" stroke-width="8" stroke-linecap="round"/><line x1="100" y1="62" x2="120" y2="46" stroke="${col}" stroke-width="8" stroke-linecap="round"/></g>`;
    }
    return s + `<circle cx="100" cy="100" r="13" fill="${ink}"/>`;
  },
  // 6. a head with a tree growing inside it: nature in the human
  tree: (ink, hot, bg) => {
    let s = "", leaves = "";
    const grow = (x, y, a, len, w, d) => {
      const x2 = x + len * Math.cos(a), y2 = y + len * Math.sin(a);
      s += `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x2)}" y2="${P(y2)}" stroke="${bg}" stroke-width="${P(w)}" stroke-linecap="round"/>`;
      if (d === 0) { leaves += `<circle cx="${P(x2)}" cy="${P(y2)}" r="5.5" fill="${hot}"/>`; return; }
      grow(x2, y2, a - 0.5, len * 0.72, w * 0.7, d - 1); grow(x2, y2, a + 0.42, len * 0.74, w * 0.7, d - 1);
    };
    grow(94, 182, -Math.PI / 2 + 0.02, 52, 12, 4);
    return `<path d="${HEAD}" fill="${ink}"/>${s}${leaves}`;
  },
};
