// "The more people who see you in trouble, the less likely anyone is to help" (the bystander effect) in the blue
// explainer edit. Pictures carry the feeling, motion graphics the facts, the real study pages the proof, the 3D man
// the inside of the head. Facts: Darley & Latane (1968) JPSP; Manning, Levine & Collins (2007) American Psychologist;
// The New York Times (2016). See SCRIPT.md. Kitty Genovese was a real person: her name only, no picture of her.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Claim38, Crack38, HelpBars, Quote16, Rooms } from "./graphics10";
import { JOIN_AT } from "./ShareShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p68" | "p07";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "claim" | "rooms" | "bars" | "crack" | "quote"; cues?: number[] }
  | { from: number; to: number; clip: "share.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p68: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1968", title: "Bystander intervention in emergencies: Diffusion of responsibility", authors: "John M. Darley & Bibb Latané" },
  p07: { journal: "AMERICAN PSYCHOLOGIST · 2007", title: "The Kitty Genovese murder and the social psychology of helping: The parable of the 38 witnesses", authors: "Manning, Levine & Collins" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...point at one person", on the music's final hit */
export const END = 2101;
export const FRAMES = END + 92;
/** the 3D clip starts this many frames before its layer, so the other heads start arriving straight away */
const LEAD = 20;


const LAYERS: Layer[] = [
  { from: 0, to: 6, pic: "b-crossing.jpg" }, { from: 6, to: 14, pic: "b-feet.jpg", pos: "60% 50%" },
  { from: 14, to: 22, pic: "b-crowd.jpg" }, { from: 22, to: 32, pic: "b-shadows.jpg" },
  { from: 32, to: 37, pic: "b-alley.jpg", zoom: [1.0, 1.15] }, { from: 37, to: 40, g: "blue" },
  { from: 40, to: 51, pic: "b-building.jpg", pos: "38% 50%", zoom: [1.0, 1.18] }, { from: 51, to: 66, g: "claim", cues: [58, 61] },
  { from: 66, to: 71, pic: "b-bundles.jpg", pos: "70% 50%" }, { from: 71, to: 76, g: "p68" },
  { from: 76, to: 94, g: "rooms", cues: [86] }, { from: 94, to: 122, g: "bars", cues: [103, 109, 119] },
  { from: 122, to: 134, clip: "share.mp4", start: 122, lead: LEAD }, { from: 134, to: 138, pic: "b-alley.jpg", pos: "70% 60%", zoom: [1.25, 1.1] },
  { from: 138, to: 146, g: "p07" }, { from: 146, to: 158, g: "crack", cues: [148, 152] },
  { from: 158, to: 166, pic: "b-windows.jpg" }, { from: 166, to: 175, pic: "b-warm.jpg", pos: "45% 50%" },
  { from: 175, to: 186, g: "quote", cues: [184] }, { from: 186, to: 195, g: "blue" },
  { from: 195, to: 208, pic: "b-people.jpg", pos: "55% 50%" }, { from: 208, to: 999, pic: "b-point.jpg", pos: "32% 50%", zoom: [1.0, 1.2] },
];

const BEATS: Beat[] = [
  { from: 0, key: [1, 1] }, { from: 6, key: [6, 6] }, { from: 11, key: [12, 13] }, { from: 14, key: [15, 16] }, { from: 22, key: [23, 24] },
  { from: 32, key: [36, 36] }, { from: 37, key: [39, 39] }, { from: 40, key: [44, 45], note: "KEW GARDENS, QUEENS · 13 MARCH 1964" }, { from: 46, key: [47, 47] },
  { from: 51, key: [51, 52] }, { from: 54, key: [55, 55] }, { from: 57, key: [58, 59] }, { from: 61, key: [62, 62] },
  { from: 66, key: [68, 68] }, { from: 71, key: [73, 73] }, { from: 76, key: [80, 81] }, { from: 82, key: [85, 85] }, { from: 86, key: [93, 93] },
  { from: 94, key: [100, 101] }, { from: 103, key: [103, 104] }, { from: 109, key: [112, 113] }, { from: 118, key: [119, 120] },
  { from: 122, key: [124, 125] }, { from: 128, key: [132, 133] }, { from: 134, key: [137, 137] }, { from: 138, key: [145, 145] },
  { from: 146, key: [148, 148] }, { from: 149, key: [149, 149] }, { from: 152, key: [154, 154] }, { from: 158, key: [160, 160] },
  { from: 161, key: [162, 162] }, { from: 166, key: [170, 170] }, { from: 172, key: [173, 174] }, { from: 175, key: [176, 176] },
  { from: 177, key: [180, 180] }, { from: 181, key: [184, 185] }, { from: 186, key: [190, 190] }, { from: 191, key: [193, 193] },
  { from: 195, key: [203, 203] }, { from: 204, key: [205, 205] }, { from: 208, key: [210, 211] },
];

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 32, kind: "flash" }, { at: 51, kind: "burn" }, { at: 76, kind: "glitch" }, { at: 122, kind: "flash" },
  { at: 134, kind: "burn" }, { at: 146, kind: "glitch" }, { at: 175, kind: "burn" }, { at: 208, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [12, "subdrop", 0.4], [51, "paper", 0.3], [58, "pop", 0.3], [71, "paper", 0.3], [86, "shiver", 0.3], [103, "riser", 0.2], [119, "pop", 0.25],
  ...JOIN_AT.map((a): [number, string, number] => [-(F(122) - LEAD + a), "pop", 0.2]),
  [138, "paper", 0.3], [148, "glitch-a", 0.3], [152, "chime", 0.25], [175, "paper", 0.3], [184, "marker", 0.3], [208, "subdrop", 0.3],
];

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.4} />
  </Sequence>
);

/** Words of one beat as a lockup: lead-in words on short lines, the key word(s) big in the serif, the rest after. */
const BeatText: React.FC<{ words: Word[]; key0: number; key1: number; from: number; top: number; dark: boolean; until: number }> = ({ words, key0, key1, from, top, dark, until }) => {
  const before = words.slice(0, key0 - from), key = words.slice(key0 - from, key1 - from + 1), after = words.slice(key1 - from + 1);
  const lines: { kind?: "serif"; words: Word[]; align?: "flex-start" | "flex-end"; indent?: number; size?: number }[] = [];
  for (let i = 0; i < before.length; i += 4) lines.push({ words: before.slice(i, i + 4), align: "flex-start", indent: (i / 4) % 2 ? 140 : 40 });
  const chars = key.map((w) => w.w).join(" ").length;
  lines.push({ kind: "serif", words: key, size: chars > 18 ? 118 : chars > 13 ? 140 : chars > 9 ? 170 : undefined });
  for (let i = 0; i < after.length; i += 5) lines.push({ words: after.slice(i, i + 5), align: "flex-end", indent: 60 });
  return <Lockup top={top} until={until} color={dark ? "#111" : "#fff"} shadow={!dark} lines={lines} />;
};

const Clip: React.FC<{ src: string; at: number }> = ({ src, at }) => (
  <AbsoluteFill>
    <Sequence from={at} layout="none">
      <OffthreadVideo src={staticFile(`media/${src}`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
  </AbsoluteFill>
);

// music level: "musicGain" input prop lets a listening test override it
const { musicGain: MUSIC_GAIN = 0.71 } = getInputProps() as { musicGain?: number };

export const Bystander: React.FC = () => {

  const talking = (x: number) => W.some((w, i) => x >= w.at - 4 && x < Math.min(i + 1 < W.length ? W[i + 1].at : w.at + 20, w.at + 20) + 4);
  const musicLevel = (x: number) => {
    let duck = 0;
    for (let d = -6; d <= 6; d += 2) duck += talking(x + d) ? 1 : 0;
    let lv = 0.3 - 0.08 * (duck / 7);   // gentle ducking: the owner wants to hear the track under the voice
    if (x < 6) lv *= x / 6;
    if (x > END + 40) lv *= Math.max(0, 1 - (x - END - 40) / 50);
    return lv * MUSIC_GAIN;
  };
  const layerAt = (x: number) => LAYERS.find((l) => x >= F(l.from) && x < F(l.to));
  const kindOf = (l?: Layer) => (!l ? "none" : "pic" in l ? "pic" : "clip" in l ? "clip" : l.g);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />
      {LAYERS.map((l, i) => {
        const a = F(l.from), b = F(l.to);
        return (
          <Scene key={i} from={a} to={b}>
            {"pic" in l ? (
              <>
                <Shot src={l.pic} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade={l.grade ?? "contrast(1.06)"} />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start) - (l.lead ?? 0)} />
            ) : l.g === "p68" || l.g === "p07" ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g].journal} title={PAPERS[l.g].title} authors={PAPERS[l.g].authors} hlHeight={176} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "claim" ? <Claim38 from={a} countAt={F(l.cues![0])} nobodyAt={F(l.cues![1])} /> : null}
                {l.g === "rooms" ? <Rooms from={a} seizureAt={F(l.cues![0])} /> : null}
                {l.g === "bars" ? <HelpBars from={a} aloneAt={F(l.cues![0])} groupAt0={F(l.cues![1])} groupAt={F(l.cues![2])} /> : null}
                {l.g === "crack" ? <Crack38 from={a} strikeAt={F(l.cues![0])} handfulAt={F(l.cues![1])} /> : null}
                {l.g === "quote" ? <Quote16 from={a} hlAt={F(l.cues![0])} /> : null}
              </>
            )}
          </Scene>
        );
      })}
      <Grain amount={0.15} />

      {BEATS.map((bt, i) => {
        const end = i + 1 < BEATS.length ? BEATS[i + 1].from : W.length;
        const a = F(bt.from), b = Math.min(F(end), END);
        const k = kindOf(layerAt(a + 1));
        const dark = k === "p68" || k === "p07";
        return (
          <Scene key={i} from={a} to={b}>
            <BeatText words={W.slice(bt.from, end)} key0={bt.key[0]} key1={bt.key[1]} from={bt.from} top={k === "clip" ? 150 : 220} dark={dark} until={b} />
            {bt.note ? <div style={{ position: "absolute", left: 0, right: 0, top: 1720, textAlign: "center", fontFamily: SANS2, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: FLASH }}>{bt.note}</div> : null}
          </Scene>
        );
      })}

      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {CUTS.map((c, i) => (c.kind === "burn" ? <FilmBurn key={i} at={F(c.at) - 5} /> : c.kind === "flash" ? <InvertFlash key={i} at={F(c.at) - 2} /> : <PixelGlitch key={i} at={F(c.at) - 4} />))}

      <Audio src={staticFile("media/voice.mp3")} />
      <Audio src={staticFile("music_slow_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
