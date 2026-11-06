import { z } from "zod";
import { ROW_MOTIONS } from "./rowMotion";

// Everything editable lives here. Remotion Studio turns this schema into a form,
// and src/ranking.json holds the default values.
export const songSchema = z.object({
  rank: z.number().int().min(1).max(10),
  title: z.string(),
  artist: z.string(),
  streams: z.string(), // shown as written, e.g. "412.6M"
  cover: z.string(), // path inside public/, e.g. "covers/01.png"
  video: z.string(), // path inside public/, e.g. "videos/01.mp4"
  clipStart: z.number().min(0), // seconds into the video where the clip starts
});

// The look, adjustable from the same form.
export const designSchema = z.object({
  searchTextSize: z.number().min(24).max(80), // size of the search-bar text, in pixels
  typingFramesPerLetter: z.number().min(1).max(8), // typing speed: higher is slower (30 frames = 1 second)
  listTextScale: z.number().min(0.7).max(1.4), // 1 = as designed; 1.1 = 10% bigger list text
  rowMotion: z.enum(ROW_MOTIONS).optional(), // how the song part of each list row moves (rank numbers never move)
});

export const rankingSchema = z.object({
  topic: z.string(),
  footnote: z.string(),
  clipSeconds: z.number().min(1).max(60), // every song plays exactly this long; a shorter video loops to fill it
  accent: z.string(), // the one functional colour: active row, play state
  videoVolume: z.number().min(0).max(1),
  design: designSchema,
  songs: z.array(songSchema).length(10),
});

export type Song = z.infer<typeof songSchema>;
export type RankingProps = z.infer<typeof rankingSchema>;

// Filled in by calculateMetadata from the real video lengths. Not edited by hand.
// start: the clip begins coming in. length: TRANSITION + clipSeconds (fully visible part).
// source: frames of footage playable from clipStart (looped if shorter than the clip needs).
export type Segment = { rank: number; start: number; length: number; source: number };
export type Timeline = {
  typeStart: number;
  typeEnd: number;
  dockStart: number;
  dockEnd: number;
  listStart: number;
  playStart: number;
  segments: Segment[]; // in playing order: #10 first, #1 last
  outroStart: number;
  total: number;
};
export type MainProps = RankingProps & { timeline?: Timeline };
