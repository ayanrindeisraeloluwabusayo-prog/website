// Deterministic physics for "Pick Your Ball": balls bounce under gravity inside a shrinking ring.
// Two red spike zones spin around the ring; touching one costs 1 life. 0 lives = knocked out.
export const COLORS: [string, string][] = [
  ["RED", "#ff3b3b"], ["ORANGE", "#ff8a1f"], ["YELLOW", "#ffd60a"], ["LIME", "#a3e635"], ["GREEN", "#22c55e"], ["TEAL", "#14b8a6"],
  ["CYAN", "#22d3ee"], ["BLUE", "#3b82f6"], ["PURPLE", "#a855f7"], ["PINK", "#f472b6"], ["WHITE", "#f5f5f5"], ["BLACK", "#26262e"],
];
export const CX = 540, CY = 1030, R = 34, LIVES = 3;
export const SPIKE_W = 0.5; // radians per spike zone
export type BallState = { x: number; y: number; hp: number; alive: boolean; hit: number; out: number };
export type Frame = { balls: BallState[]; ring: number; spin: number };
export type Ev = { f: number; kind: "hit" | "out" | "bounce"; i: number; x: number; y: number };

const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

export const simulate = (start: number, frames: number, seed: number) => {
  const r = rng(seed);
  const n = COLORS.length;
  const b = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: CX + Math.cos(a) * 200, y: CY + Math.sin(a) * 200, vx: (r() - 0.5) * 22, vy: (r() - 0.5) * 22, hp: LIVES, alive: true, hit: -99, out: -99, cool: 0 };
  });
  const out: Frame[] = [];
  const ev: Ev[] = [];
  const SUB = 4, g = 0.55 / SUB;
  for (let f = 0; f < frames; f++) {
    const t = f / frames;
    const ring = 440 - 110 * t;
    const spin = f * 0.045;
    for (let s = 0; s < SUB; s++) {
      for (const p of b) {
        if (!p.alive) continue;
        p.vy += g; p.x += p.vx / SUB; p.y += p.vy / SUB;
        if (p.cool > 0) p.cool -= 1 / SUB;
        const dx = p.x - CX, dy = p.y - CY, d = Math.hypot(dx, dy);
        if (d + R > ring) {
          const nx = dx / d, ny = dy / d;
          p.x = CX + nx * (ring - R); p.y = CY + ny * (ring - R);
          const vn = p.vx * nx + p.vy * ny;
          if (vn > 0) {
            p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny;
            const sp = Math.hypot(p.vx, p.vy), want = Math.min(26, Math.max(15, sp * 1.03));
            p.vx *= want / sp; p.vy *= want / sp;
            const ang = Math.atan2(ny, nx);
            const inSpike = [0, Math.PI].some((o) => { let a = (ang - spin - o) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a < SPIKE_W; });
            const i = b.indexOf(p);
            if (inSpike && p.cool <= 0) {
              p.hp -= 1; p.hit = f; p.cool = 8;
              if (p.hp <= 0) { p.alive = false; p.out = f; ev.push({ f: start + f, kind: "out", i, x: p.x, y: p.y }); }
              else ev.push({ f: start + f, kind: "hit", i, x: p.x, y: p.y });
            } else if (s === 0 && f % 3 === 0) ev.push({ f: start + f, kind: "bounce", i, x: p.x, y: p.y });
          }
        }
      }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const p = b[i], q = b[j];
        if (!p.alive || !q.alive) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        if (d < 2 * R && d > 0) {
          const nx = dx / d, ny = dy / d, o = (2 * R - d) / 2;
          p.x -= nx * o; p.y -= ny * o; q.x += nx * o; q.y += ny * o;
          const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
          if (rv < 0) { p.vx += rv * nx; p.vy += rv * ny; q.vx -= rv * nx; q.vy -= rv * ny; }
        }
      }
    }
    out.push({ ring, spin, balls: b.map((p) => ({ x: p.x, y: p.y, hp: p.hp, alive: p.alive, hit: p.hit, out: p.out })) });
  }
  return { frames: out, events: ev };
};
