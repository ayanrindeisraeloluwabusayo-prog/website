// The Drah Charts schedule, the same rules as the template's src/timeline.ts (buildTimeline) with the
// SaaS layer on. Pure: everything the figure shows (block lengths, the dial, the readout) comes from here.
export const FPS = 30;
export const BEATS = { intro: 66, barIn: 18, perChar: 2, typeHold: 20, dock: 22, listIn: 30, firstLoad: 24, outro: 75, endCard: 120 };
export const TRANSITION = 18;

export function schedule({ topic, clipSeconds, songs, typingFramesPerLetter = BEATS.perChar }) {
  const introEnd = BEATS.intro;
  const typeStart = introEnd + BEATS.barIn;
  const typeEnd = typeStart + topic.length * typingFramesPerLetter;
  const dockStart = typeEnd + BEATS.typeHold;
  const dockEnd = dockStart + BEATS.dock;
  const listStart = dockEnd - 6;
  const playStart = listStart + BEATS.listIn + BEATS.firstLoad;
  const length = TRANSITION + Math.round(clipSeconds * FPS);
  const order = [...songs].sort((a, b) => b.rank - a.rank);
  const segments = order.map((s, i) => ({ rank: s.rank, title: s.title, artist: s.artist, start: playStart + i * length, length }));
  const outroStart = playStart + order.length * length;
  const endStart = outroStart + BEATS.outro;
  return { introEnd, typeStart, typeEnd, dockStart, dockEnd, listStart, playStart, segments, outroStart, endStart, total: endStart + BEATS.endCard, length };
}

/** The cam tracks, back to front: each is a list of [from, to] frame windows when that part of the screen acts. */
export function tracks(t) {
  const songs = t.segments;
  return [
    { id: "stage", name: "SaaS stage", blocks: [[0, t.introEnd], [t.endStart, t.total]] },
    { id: "search", name: "Search bar", blocks: [[t.introEnd, t.dockEnd]] },
    { id: "list", name: "Ranking list", blocks: [[t.listStart, t.endStart]] },
    { id: "videoA", name: "Video, odd hand", blocks: songs.filter((_, i) => i % 2 === 0).map((s) => [s.start, s.start + s.length + TRANSITION]) },
    { id: "videoB", name: "Video, even hand", blocks: songs.filter((_, i) => i % 2 === 1).map((s) => [s.start, s.start + s.length + TRANSITION]) },
    { id: "player", name: "Player and next up", blocks: songs.map((s) => [s.start, s.start + s.length]) },
  ];
}

const clock = (f) => {
  const s = Math.max(0, Math.floor(f / FPS));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** What the video is doing at frame f, in plain words. */
export function phaseAt(t, f) {
  if (f < t.introEnd) return `${clock(f)} · opening headline`;
  if (f < t.typeEnd) return `${clock(f)} · cursor clicks, search types`;
  if (f < t.dockEnd) return `${clock(f)} · search docks, camera pushes in`;
  if (f < t.playStart) return `${clock(f)} · list loads`;
  const i = t.segments.findIndex((s) => f >= s.start && f < s.start + s.length);
  if (i >= 0) {
    const s = t.segments[i];
    if (i > 0 && f < s.start + TRANSITION) return `${clock(f)} · hand-off #${t.segments[i - 1].rank} → #${s.rank}`;
    return `${clock(f)} · #${s.rank} ${s.title}`;
  }
  if (f < t.endStart) return `${clock(f)} · the full Top 10`;
  return `${clock(f)} · end card: Follow`;
}

/** Seconds into the current song's slot (the dial on the carriage: one turn per 7.6 s slot). */
export function slotTurn(t, f) {
  const s = t.segments.find((x) => f >= x.start && f < x.start + x.length);
  return s ? (f - s.start) / s.length : 0;
}
