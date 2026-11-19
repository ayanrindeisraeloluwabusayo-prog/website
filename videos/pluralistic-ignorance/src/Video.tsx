// "Why nobody asks questions in class" (pluralistic ignorance) in the blue explainer edit, Full Blend script.
// Facts: Andersen (1837) The Emperor's New Clothes; Latane & Darley (1968) JPSP 10(3); Prentice & Miller (1993) JPSP 64(2).
// See SCRIPT.md. 3D man: the current three.js style (the owner's choice).
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Emperor, SmokeRoom, TwoBars } from "./graphics12";
import { JOIN_AT, REVEAL_AT } from "./DoubtShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p68" | "p93";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "emperor" | "smoke" | "smokebars" | "comfort"; cues?: number[] }
  | { from: number; to: number; clip: "doubt.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p68: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1968", title: "Group inhibition of bystander intervention in emergencies", authors: "Bibb Latané & John M. Darley" },
  p93: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1993", title: "Pluralistic ignorance and alcohol use on campus", authors: "Deborah A. Prentice & Dale T. Miller" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...go first", on the music's final hit */
export const END = 2540;
export const FRAMES = END + 92;
/** the 3D clip starts this many frames before its layer, so the doubt lights up on "hiding" */
const LEAD = 15;

const LAYERS: Layer[] = [
  { from: 0, to: 3, pic: "p-room.jpg" }, { from: 3, to: 11, pic: "p-hall.jpg", zoom: [1.0, 1.15] },
  { from: 11, to: 14, pic: "p-lost.jpg", pos: "55% 30%" }, { from: 14, to: 22, pic: "p-calm.jpg" },
  { from: 22, to: 31, pic: "p-seats.jpg", zoom: [1.15, 1.0] }, { from: 31, to: 40, g: "blue" },
  { from: 40, to: 81, g: "emperor", cues: [64, 70] }, { from: 81, to: 88, pic: "p-crown.jpg", pos: "50% 30%" },
  { from: 88, to: 97, g: "blue" }, { from: 97, to: 113, g: "p68" },
  { from: 113, to: 136, g: "smoke", cues: [128] }, { from: 136, to: 190, g: "smokebars", cues: [144, 153, 168] },
  { from: 190, to: 205, clip: "doubt.mp4", start: 190, lead: LEAD }, { from: 205, to: 213, g: "p93" },
  { from: 213, to: 227, g: "comfort", cues: [215, 222] }, { from: 227, to: 238, g: "emperor", cues: [227, 227] },
  { from: 238, to: 247, pic: "p-hands.jpg", pos: "35% 50%" }, { from: 247, to: 999, pic: "p-hall.jpg", zoom: [1.15, 1.0] },
];

const BEATS: Beat[] = [
  { from: 0, key: [1, 1] }, { from: 3, key: [6, 6] }, { from: 7, key: [9, 10] }, { from: 11, key: [12, 13] }, { from: 14, key: [16, 17] },
  { from: 18, key: [20, 21] }, { from: 22, key: [25, 25] }, { from: 26, key: [29, 30] }, { from: 31, key: [32, 32] }, { from: 35, key: [38, 39] },
  { from: 40, key: [41, 41] }, { from: 42, key: [43, 44] }, { from: 45, key: [48, 48] }, { from: 49, key: [52, 52] }, { from: 53, key: [54, 57] },
  { from: 58, key: [64, 64] }, { from: 65, key: [71, 71] }, { from: 72, key: [80, 80] }, { from: 81, key: [83, 83] }, { from: 84, key: [86, 87] },
  { from: 88, key: [89, 89] }, { from: 90, key: [95, 96] }, { from: 97, key: [99, 99] }, { from: 100, key: [103, 104] }, { from: 108, key: [110, 112] },
  { from: 113, key: [119, 119] }, { from: 120, key: [124, 124] }, { from: 125, key: [129, 129] }, { from: 130, key: [132, 132] },
  { from: 136, key: [143, 143] }, { from: 144, key: [144, 147] }, { from: 148, key: [151, 151] }, { from: 153, key: [159, 159] },
  { from: 160, key: [162, 162] }, { from: 165, key: [166, 166] }, { from: 168, key: [169, 171] }, { from: 172, key: [173, 173] },
  { from: 174, key: [178, 178] }, { from: 179, key: [184, 184] }, { from: 185, key: [186, 186] }, { from: 188, key: [189, 189] },
  { from: 190, key: [193, 193] }, { from: 194, key: [195, 196] }, { from: 199, key: [201, 201] }, { from: 202, key: [204, 204] },
  { from: 205, key: [206, 206] }, { from: 207, key: [211, 212] }, { from: 213, key: [214, 214] }, { from: 215, key: [217, 218] },
  { from: 219, key: [224, 225] }, { from: 227, key: [229, 229] }, { from: 230, key: [231, 231] }, { from: 232, key: [233, 233] },
  { from: 234, key: [236, 237] }, { from: 238, key: [241, 242] }, { from: 243, key: [244, 244] }, { from: 245, key: [245, 246] },
  { from: 247, key: [247, 247] }, { from: 248, key: [251, 251] }, { from: 252, key: [253, 253] }, { from: 254, key: [255, 256] },
];

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 31, kind: "flash" }, { at: 40, kind: "burn" }, { at: 97, kind: "burn" }, { at: 113, kind: "glitch" },
  { at: 190, kind: "flash" }, { at: 205, kind: "burn" }, { at: 238, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [9, "subdrop", 0.35], [40, "paper", 0.3], [64, "pop", 0.25], [83, "chime", 0.25], [97, "paper", 0.3], [128, "shiver", 0.3],
  [144, "pop", 0.25], [168, "pop", 0.3], [-(F(190) - LEAD + REVEAL_AT), "spark", 0.35], [205, "paper", 0.3], [215, "pop", 0.25], [245, "chime", 0.3],
  ...JOIN_AT.map((a): [number, string, number] => [-(F(190) - LEAD + a), "pop", 0.15]),
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
const { musicGain: MUSIC_GAIN = 1.1 } = getInputProps() as { musicGain?: number };

export const Plural: React.FC = () => {

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
            ) : l.g === "p68" || l.g === "p93" ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g].journal} title={PAPERS[l.g].title} authors={PAPERS[l.g].authors} hlHeight={120} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "emperor" ? <Emperor from={a} nakedAt={F(l.cues![0])} silentAt={F(l.cues![1])} /> : null}
                {l.g === "smoke" ? <SmokeRoom from={a} smokeAt={F(l.cues![0])} /> : null}
                {l.g === "smokebars" ? <TwoBars from={a} at1={F(l.cues![0])} at2={F(l.cues![2])} title="REPORTED THE SMOKE" footer="LATANÉ & DARLEY · 1968"
                  rows={[{ label: "ALONE", pct: 75, people: 1, gold: true }, { label: "WITH TWO CALM STRANGERS", pct: 10, people: 3, gold: false }]} /> : null}
                {l.g === "comfort" ? <TwoBars from={a} at1={F(l.cues![0])} at2={F(l.cues![1])} title="COMFORTABLE WITH HEAVY DRINKING?" footer="PRINCETON STUDENTS · 1993"
                  rows={[{ label: "ME", pct: 38, people: 0, gold: true, text: "less" }, { label: "EVERYONE ELSE (I THOUGHT)", pct: 78, people: 0, gold: false, text: "more" }]} /> : null}
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
        const dark = k === "p68" || k === "p93";
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
      <Audio src={staticFile("music_twinkle_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
