import { staticFile } from "remotion";
import { parseMedia } from "@remotion/media-parser";
import type { RankingProps, Segment, Timeline } from "./schema";

export const FPS = 30;

// Fixed beats of the sequence, in frames. Change these to retime the whole template.
export const BEATS = {
  intro: 66, // SaaS opening: headline, then the app rises in (only when design.saas is on)
  barIn: 18, // search bar slides in
  perChar: 2, // typewriter speed
  typeHold: 20, // pause after the topic is typed
  dock: 22, // search bar moves up into the header
  listIn: 30, // ranking list appears
  firstLoad: 24, // row #10 shimmers before the first clip starts
  outro: 75, // hold on the finished list after #1
  endCard: 120, // SaaS end card: logo, name, call to action (only when design.saas is on)
};

// The hand-off between two songs, in frames (18 = 0.6 s). It is added on top of clipSeconds:
// each song is fully visible for exactly clipSeconds, and the transitions live between those windows.
export const TRANSITION = 18;

// Builds the whole schedule. A song's slot = TRANSITION (its clip comes in) + clipSeconds (fully visible).
// Its clip keeps playing for one more TRANSITION while it hands off to the next song, so it needs
// slot + TRANSITION of footage; a video shorter than that loops instead of cutting anything short.
export const buildTimeline = (props: RankingProps, clipFrames: Record<number, number>): Timeline => {
  const saas = props.design?.saas ?? false;
  const introEnd = saas ? BEATS.intro : 0;
  const typeStart = introEnd + BEATS.barIn;
  const typeEnd = typeStart + props.topic.length * (props.design?.typingFramesPerLetter ?? BEATS.perChar);
  const dockStart = typeEnd + BEATS.typeHold;
  const dockEnd = dockStart + BEATS.dock;
  const listStart = dockEnd - 6;
  const playStart = listStart + BEATS.listIn + BEATS.firstLoad;

  const order = [...props.songs].sort((a, b) => b.rank - a.rank); // #10 first
  const segments: Segment[] = [];
  let t = playStart;
  const length = TRANSITION + Math.round(props.clipSeconds * FPS);
  const needed = length + TRANSITION;
  for (const s of order) {
    segments.push({ rank: s.rank, start: t, length, source: Math.min(needed, clipFrames[s.rank] ?? needed) });
    t += length;
  }
  const endStart = t + BEATS.outro;
  return { introEnd, typeStart, typeEnd, dockStart, dockEnd, listStart, playStart, segments, outroStart: t, endStart, total: endStart + (saas ? BEATS.endCard : 0) };
};

// Measures how much of every video is playable from its clipStart, so a short one can loop.
export const measureClips = async (props: RankingProps): Promise<Record<number, number>> => {
  const out: Record<number, number> = {};
  await Promise.all(
    props.songs.map(async (s) => {
      let available = 600; // unknown length: assume long enough, no loop
      try {
        const src = new URL(staticFile(s.video), window.location.origin).href;
        const { durationInSeconds } = await parseMedia({ src, fields: { durationInSeconds: true }, acknowledgeRemotionLicense: true });
        if (durationInSeconds) available = Math.max(1, durationInSeconds - s.clipStart);
      } catch {
        // Missing or unreadable video: keep the default slot so the template still renders.
      }
      out[s.rank] = Math.round(available * FPS);
    }),
  );
  return out;
};

// Where a rank stands at a given frame.
export type RowState = "hidden" | "waiting" | "loading" | "active" | "done";
export const rowState = (tl: Timeline, rank: number, frame: number): RowState => {
  if (frame < tl.listStart) return "hidden";
  const i = tl.segments.findIndex((s) => s.rank === rank);
  const seg = tl.segments[i];
  if (frame >= seg.start + seg.length) return "done";
  if (frame >= seg.start) return "active";
  // The next song shimmers while the one before it plays (and #10 shimmers just before playback).
  const loadFrom = i === 0 ? tl.playStart - BEATS.firstLoad : tl.segments[i - 1].start;
  return frame >= loadFrom ? "loading" : "waiting";
};

export const activeSegment = (tl: Timeline, frame: number) => tl.segments.find((s) => frame >= s.start && frame < s.start + s.length);
