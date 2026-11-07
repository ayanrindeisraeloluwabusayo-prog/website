// Fig 1 · The skeleton of a Drah Charts video: a cam-track sequencer.
// One carriage (the playhead) rides one bench (the timeline). Every part of the screen is a follower on
// its own cam track; it rises while a block is under it, so every part reads the same clock. A card rack
// (the song list) feeds the machine at the left; a film reel (the rendered video) takes it up at the right.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";
import { schedule, tracks, phaseAt, FPS } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const ranking = JSON.parse(readFileSync(process.argv.find((a) => a.endsWith(".json")) ?? join(HERE, "ranking.json"), "utf8"));
const T = schedule(ranking);
const TRACKS = tracks(T);

const WIDTH = 960;
const HEIGHT = 470;
const RUN = 240; // bench length in world units for the whole video
const U = RUN / T.total; // world units per frame
const X = (f) => f * U;

const PLATE = { x: -52, y: -70, w: 350, d: 124, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;
const TRACK_Y = [-42, -30, -18, -6, 4, 16]; // stage, search, list, video A, video B, player
const TRACK_D = 8;
const CH_TOP = 1.2; // channel top
const CAM_H = 3; // cam block height: the lift
const RAIL_BACK = -58;
const RAIL_FRONT = 30;
const RAIL_X = [-5, RUN + 5];
const BAR_Z = 36;
const BAR_TOP = 42;
const DIAL_Y = 28;
const DIAL_R = 7.5;
const DIAL_Z = 46;
const DIAL_TOP = DIAL_Z + 3;
const RACK = { x: -48, y: -48, w: 28, d: 52, r: 2 };
const REEL = [274, -14];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, RAIL_BACK, BAR_TOP + 10], [RUN, RAIL_FRONT + 8, DIAL_TOP + 4], [RACK.x, RACK.y, 30], [REEL[0] + 22, REEL[1], 14]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 62 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);

// ---------- bench ----------
function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = k.corners(PLATE, 20).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // the time ruler: a tick every second, a major every 10 s, along the front
  const strip = { x: -3, y: 40, w: RUN + 6, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(0, RUN, U * FPS, 10, strip.y + 0.8, 0.6, [1.8, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 1.5, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 1.5, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // label plate, engraved
  const plate = { x: 252, y: 36, w: 40, d: 12, r: 1.2 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 3, 0.3), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([plate.x + 20, plate.y + 7.4], 0.8, P, "x"), "DRAH CHARTS", { size: 3.4, tone: "mid", anchor: "middle" }));
  out.push(D([at([plate.x + 2.2, plate.y + 2.2, 0.8]), at([plate.x + plate.w - 2.2, plate.y + 2.2, 0.8]), at([plate.x + 2.2, plate.y + plate.d - 2.2, 0.8]), at([plate.x + plate.w - 2.2, plate.y + plate.d - 2.2, 0.8])], { size: 0.4 }));
  return out.join("");
}

function rails() {
  const out = [];
  for (const y of [RAIL_BACK, RAIL_FRONT]) {
    out.push(S(k.slabOf({ x: RAIL_X[0], y, w: RAIL_X[1] - RAIL_X[0], d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([20, 80, 140, 200].map((x) => at([x, y + 2.5, 3])), { size: 0.38, tone: "lo" }));
    for (const x of [RAIL_X[0] - 4, RAIL_X[1]]) {
      out.push(S(k.slabOf({ x, y: y - 1.5, w: 4, d: 8, r: 1 }, 0, 6, P, 3, 0.4), { tone: "mid" }));
      out.push(D([at([x + 2, y + 2.5, 6])], { size: 0.42 }));
    }
  }
  return out.join("");
}

// ---------- cam tracks ----------
function camTracks() {
  const out = [];
  TRACKS.forEach((track, i) => {
    const y = TRACK_Y[i];
    const channel = { x: -3, y: y - TRACK_D / 2 - 1, w: RUN + 6, d: TRACK_D + 2, r: 1 };
    out.push(S(k.slabOf(channel, 0, CH_TOP, P, 3, 0.3), { tone: "lo", crease: "none" }));
    out.push(L(k.lineOnTop([channel.x + 1.5, y], [channel.x + channel.w - 1.5, y], CH_TOP, P), { tone: "faint" }));
    out.push(D([at([channel.x + 1, y, CH_TOP]), at([channel.x + channel.w - 1, y, CH_TOP])], { size: 0.35, tone: "lo" }));
    const video = track.id.startsWith("video");
    for (const [a, b] of track.blocks) {
      const plan = { x: X(a) + 0.25, y: y - TRACK_D / 2, w: Math.max(0.8, X(b) - X(a) - 0.5), d: TRACK_D, r: 0.7 };
      out.push(S(k.slabOf(plan, CH_TOP, CAM_H, P, 3, 0.35), { tone: video ? "hi" : "mid", crease: "lo" }));
      if (plan.w > 6) out.push(L(k.planOutline(k.insetPlan(plan, 1.4), CH_TOP + CAM_H, P, 3), { tone: "faint" }));
    }
  });
  return out.join("");
}

// ---------- input: the song list as a rack of 10 cards ----------
function rack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(RACK, 0, 6, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(RACK, 0, 6, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(RACK, 2.5), 6, P), { tone: "faint" }));
  const side = (y) => ({ x: RACK.x + 1, y, w: RACK.w - 2, d: 3, r: 0.8 });
  out.push(S(k.slabOf(side(RACK.y + 1), 6, 16, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([RACK.x + 4, RACK.y + 2.5, 22]), at([RACK.x + RACK.w - 4, RACK.y + 2.5, 22])], { size: 0.42 }));
  // ten cards, one per song, #10 at the back
  for (let i = 0; i < 10; i++) {
    const card = { x: RACK.x + 3 + i * 2.3, y: RACK.y + 5, w: 0.9, d: RACK.d - 10, r: 0.2 };
    const tall = 18 + (i % 2) * 1.5;
    out.push(S(k.slabOf(card, 6, tall, P, 2), { tone: i === 9 ? "hi" : "mid", crease: "none" }));
  }
  out.push(S(k.slabOf(side(RACK.y + RACK.d - 4), 6, 16, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([RACK.x + 4, RACK.y + RACK.d - 2.5, 22]), at([RACK.x + RACK.w - 4, RACK.y + RACK.d - 2.5, 22])], { size: 0.42 }));
  // thumb screw that clamps the stack
  const knob = [RACK.x + RACK.w - 3, RACK.y + RACK.d + 2.4];
  out.push(S(k.cylinder(knob[0], knob[1], 2.6, 2, 4, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 2.6, 2, 6, 18, P), { tone: "lo" }));
  return out.join("");
}

// ---------- output: the take-up reel ----------
function reel() {
  const [x, y] = REEL;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 21, y: y - 21, w: 42, d: 42, r: 21 }, 0, 4, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.cylinder(x, y, 6, 0, 4, P, 32, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 21, 4, 1.2, P, 64, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 15, 5.2, 6, P, 64), { tone: "lo", crease: "none" }));
  out.push(L([7, 9, 11].map((z) => k.sideArc(x, y, 15, z, P, 40)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 21, 11.2, 1.2, P, 64, 0.4), { tone: "hi", crease: "lo" }));
  const holes = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    return [x + Math.cos(a) * 12.5, y + Math.sin(a) * 12.5];
  });
  out.push(L(holes.map(([hx, hy]) => k.ring(hx, hy, 4, 12.4, P, 24)).join(""), { tone: "lo" }));
  out.push(L(k.ring(x, y, 19.2, 12.4, P, 64), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 4.2, 12.4, 2.2, P, 28), { tone: "mid" }));
  out.push(D([at([x, y, 14.6])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

// ---------- the carriage (playhead), built at x = 0 and slid along ----------
const lowerOf = (y) => {
  const out = [];
  out.push(S(k.cylinder(0, y, 2, CH_TOP, 1.2, P, 24), { tone: "hi" }));
  out.push(S(k.cylinder(0, y, 0.9, CH_TOP + 1.2, BAR_Z + 2 - CH_TOP - 1.2, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(0, y, 1.8, 16, 1.6, P, 20), { tone: "mid" }));
  return out.join("");
};
const upperRod = (y, lift) => S(k.cylinder(0, y, 0.9, BAR_TOP + 2.5, 3.5 + lift, P, 16), { tone: "mid", crease: "none" });
const capOf = (y) => S(k.cylinder(0, y, 1.9, BAR_TOP + 6, 1.2, P, 20), { tone: "hi" });
const needleAt = (turn) => {
  const angle = turn * Math.PI * 2;
  return k.lineOnTop([-Math.sin(angle) * 1.8, DIAL_Y + Math.cos(angle) * 1.8], [Math.sin(angle) * (DIAL_R - 2), DIAL_Y - Math.cos(angle) * (DIAL_R - 2)], DIAL_TOP + 0.2, P);
};

function carriage() {
  const out = [];
  const bush = (y) => ({ x: -6, y: y - 2, w: 12, d: 9, r: 1.5 });
  const post = (y) => ({ x: -3.5, y: y - 0.5, w: 7, d: 6, r: 1 });
  // back runner and post
  out.push(S(k.slabOf(bush(RAIL_BACK), 3, 5, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([-3.5, RAIL_BACK + 2.5, 8]), at([3.5, RAIL_BACK + 2.5, 8])], { size: 0.38, tone: "lo" }));
  out.push(S(k.slabOf(post(RAIL_BACK), 8, BAR_Z - 8, P, 3, 0.4), { tone: "mid" }));
  // followers, back to front
  TRACKS.forEach((_, i) => out.push(`<g data-lower="${i}">${lowerOf(TRACK_Y[i])}</g>`));
  // front runner, post and the time pointer
  out.push(S(k.slabOf(bush(RAIL_FRONT), 3, 5, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([-3.5, RAIL_FRONT + 2.5, 8]), at([3.5, RAIL_FRONT + 2.5, 8])], { size: 0.38, tone: "lo" }));
  out.push(S(k.slabOf({ x: -0.7, y: RAIL_FRONT + 7, w: 1.4, d: 6.5, r: 0.3 }, 3.4, 0.8, P, 2), { tone: "hi", lit: true }));
  out.push(S(k.slabOf(post(RAIL_FRONT), 8, BAR_Z - 8, P, 3, 0.4), { tone: "mid" }));
  // the crossbar
  const bar = { x: -4.5, y: RAIL_BACK - 2.5, w: 9, d: RAIL_FRONT - RAIL_BACK + 10, r: 1.4 };
  out.push(S(k.slabOf(bar, BAR_Z, BAR_TOP - BAR_Z, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.lineOnTop([0, bar.y + 1.5], [0, TRACK_Y[0] - 5], BAR_TOP, P), { tone: "faint" }));
  out.push(D([at([0, bar.y + 1.6, BAR_TOP]), at([0, bar.y + bar.d - 1.6, BAR_TOP])], { size: 0.42 }));
  // guide bushings, rods and caps on top
  TRACKS.forEach((_, i) => {
    const y = TRACK_Y[i];
    out.push(S(k.cylinder(0, y, 2.3, BAR_TOP, 2.5, P, 24), { tone: "mid" }));
    out.push(`<g data-upper="${i}">${upperRod(y, 0)}</g>`);
    out.push(`<g data-cap="${i}">${capOf(y)}</g>`);
  });
  // the slot dial: one turn per 7.6 s song slot
  out.push(S(k.cylinder(0, DIAL_Y, 2.4, BAR_TOP, DIAL_Z - BAR_TOP, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(0, DIAL_Y, DIAL_R, DIAL_Z, DIAL_TOP - DIAL_Z, P, 56, 0.5), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(0, DIAL_Y, DIAL_R, DIAL_TOP - 1.6, DIAL_TOP, 60, P, 0.25), { tone: "lo" }));
  out.push(L(k.ring(0, DIAL_Y, DIAL_R - 1.2, DIAL_TOP, P, 56), { tone: "lo" }));
  const slotSeconds = T.length / FPS; // 7.6
  const dialTicks = k.radialTicks(0, DIAL_Y, DIAL_R - 1.4, Math.round(slotSeconds * 5), 5, DIAL_TOP, [0.8, 1.7], P);
  out.push(L(dialTicks.minor, { tone: "lo" }), L(dialTicks.major, { tone: "mid" }));
  out.push(`<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(0)}" style="stroke-width:1"/>`);
  out.push(L(k.ring(0, DIAL_Y, 0.9, DIAL_TOP, P, 12), { tone: "mid" }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A cam-track sequencer that stands for one Drah Charts video. A rack of ten song cards feeds a long bench whose ruler is the video's 92 seconds. Six cam tracks run along the bench, one per part of the screen; raised blocks mark when each part acts. A carriage is the playhead: its six followers rise over the blocks, and a dial turns once per 7.6 second song slot. A film reel takes up the finished video at the far end.",
  body: [bench(), rails(), rack(), camTracks(), `<g data-part="carriage" transform="${k.translateAlong(P, [X(T.segments[3].start + 60), 0, 0])}">${carriage()}</g>`, reel()],
});

const modelSource = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const live = `
const P = ${JSON.stringify(P)};
const RANKING = ${JSON.stringify({ topic: ranking.topic, clipSeconds: ranking.clipSeconds, songs: ranking.songs.map(({ rank, title, artist }) => ({ rank, title, artist })) })};
const T = schedule(RANKING);
const TRACKS = tracks(T);
const TRACK_Y = ${JSON.stringify(TRACK_Y)};
const U = ${U}, CAM_H = ${CAM_H}, BAR_TOP = ${BAR_TOP}, DIAL_Y = ${DIAL_Y}, DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const car = svg.querySelector('[data-part="carriage"]');
const needle = svg.querySelector('[data-part="needle"]');
const lowers = [...svg.querySelectorAll("[data-lower]")];
const uppers = [...svg.querySelectorAll("[data-upper]")];
const caps = [...svg.querySelectorAll("[data-cap]")];
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const upperRod = (y, lift) => solidSvg(cylinder(0, y, 0.9, BAR_TOP + 2.5, 3.5 + lift, P, 16), { tone: "mid", crease: "none" });
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};
const TIP = 2 / U; // the follower tip's radius, in frames
const want = (track, f) => (track.blocks.some(([a, b]) => f + TIP > a && f - TIP < b) ? CAM_H : 0);
const lift = TRACKS.map((t) => ({ at: want(t, 0), rate: 0 }));
const stops = [0, T.introEnd, T.typeStart, T.dockStart, T.listStart, ...T.segments.map((s) => s.start + 40), T.outroStart + 30, T.endStart + 40];
let f = T.segments[3].start + 60, target = f, frame = 0, last = 0, touring = !still.matches, visible = false, idle = 0, tourClock = 0;
const TOUR = 7; // the tour plays the video at 7x
const drawn = lift.map(() => -1);
function draw() {
  car.setAttribute("transform", translateAlong(P, [f * U, 0, 0]));
  lift.forEach((l, i) => {
    lowers[i].setAttribute("transform", translateAlong(P, [0, 0, l.at]));
    caps[i].setAttribute("transform", translateAlong(P, [0, 0, l.at]));
    const q = Math.round(l.at * 20) / 20;
    if (q !== drawn[i]) { uppers[i].innerHTML = upperRod(TRACK_Y[i], q); drawn[i] = q; }
  });
  needle.setAttribute("d", needleAt(slotTurn(T, f)));
  const text = phaseAt(T, f);
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(f / ${FPS})));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) {
    tourClock += dt;
    const loop = T.total / ${FPS} / TOUR + 1.6;
    const t = tourClock % loop;
    target = Math.min(T.total - 1, t * ${FPS} * TOUR);
    if (t < dt) f = target;
  }
  f = touring ? target : f + (target - f) * (1 - Math.exp(-dt / 0.22));
  if (Math.abs(target - f) < 0.2) f = target;
  let moving = false;
  TRACKS.forEach((track, i) => {
    const l = lift[i], goal = want(track, f);
    for (let s = 0; s < 4; s++) { l.rate += ((goal - l.at) * 700 - l.rate * 32) * dt / 4; l.at += l.rate * dt / 4; }
    if (Math.abs(goal - l.at) < 0.003 && Math.abs(l.rate) < 0.003) { l.at = goal; l.rate = 0; } else moving = true;
  });
  draw();
  const settled = !touring && f === target && !moving;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, 0, T.total - 1); clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; tourClock = target / ${FPS} / TOUR; run(); }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const x0 = iso([0, 0, 0], P)[0], x1 = iso([T.total * U, 0, 0], P)[0];
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const sx = ((event.clientX - box.left) / box.width) * ${WIDTH};
  steer(((sx - x0) / (x1 - x0)) * T.total);
});
stage.addEventListener("keydown", (event) => {
  const here = stops.reduce((best, s, i) => (Math.abs(s - target) < Math.abs(stops[best] - target) ? i : best), 0);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(stops.length - 1, here + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = stops.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(stops[to]);
});
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Skeleton of a Drah Charts video",
  hint: "Hover or use arrow keys to move the playhead",
  readout: phaseAt(T, T.segments[3].start + 60),
  keys: [
    { mark: "lit", label: "The playhead pointer and the slot dial: one clock for everything" },
    { mark: "raised", label: "Cam blocks: when each part of the screen acts" },
    { mark: "flat", label: "Tracks, back to front: SaaS stage · search bar · ranking list · video (two hands) · player and next up" },
  ],
  caption: `The song list (ten cards, left) feeds one timeline: ${(T.total / FPS).toFixed(1)} s at ${FPS} fps. Each song owns a ${(T.length / FPS).toFixed(1)} s slot, ${ranking.clipSeconds} s fully on screen plus a 0.6 s hand-off; the two video tracks overlap by that hand-off so one clip fades out while the next fades in. Every part of the screen reads the same playhead, which is why picture, sound and stats never drift. The finished video winds onto the reel at the right.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Playhead: arrow keys step through the video's beats" aria-valuemin="0" aria-valuemax="${Math.round(T.total / FPS)}" aria-valuenow="0">${svg}</div>`,
});

const name = theme === "light" ? "drah-charts-anatomy-light.html" : "drah-charts-anatomy.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Skeleton of a Drah Charts video", theme, body, width: 1000, script: kitScript() + modelSource + live }));
console.log("wrote", name, "total frames", T.total);
