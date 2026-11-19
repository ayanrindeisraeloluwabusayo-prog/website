// "Why yawns spread" in the blue explainer edit, Full Blend script.
// Facts: Problemata (attributed to Aristotle), Book VII; Provine (1986) Ethology 72; Provine (1989);
// Norscia & Palagi (2011) PLoS ONE 6(12) e28472. See SCRIPT.md. 3D man: the current three.js style (the owner's choice).
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { HalfYawn } from "./graphics";
import { CATCH_AT, JOIN_AT } from "./SpreadShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "arist" | "p86" | "p11";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "half"; cues?: number[] }
  | { from: number; to: number; clip: "spread.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  arist: { journal: "PROBLEMATA · BOOK VII · ANCIENT GREECE", title: "Why do people yawn when they see others yawn?", authors: "A book of questions credited to Aristotle" },
  p86: { journal: "ETHOLOGY · 1986", title: "Yawning as a stereotyped action pattern and releasing stimulus", authors: "Robert R. Provine" },
  p11: { journal: "PLOS ONE · 2011", title: "Yawn contagion and empathy in Homo sapiens", authors: "Ivan Norscia & Elisabetta Palagi" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...closest to you", on the music's final hit */
export const END = 2167;
export const FRAMES = END + 92;
const SPREAD_AT = 145;

const LAYERS: Layer[] = [
  { from: 0, to: 3, pic: "y-student.jpg", pos: "50% 30%" }, { from: 3, to: 10, pic: "y-man.jpg", pos: "50% 40%", zoom: [1.0, 1.2] },
  { from: 10, to: 20, pic: "y-woman.jpg", pos: "35% 50%" }, { from: 20, to: 33, pic: "y-lion.jpg", pos: "55% 50%", zoom: [1.0, 1.15] },
  { from: 33, to: 37, g: "blue" }, { from: 37, to: 46, pic: "y-bust.jpg", pos: "65% 40%" }, { from: 46, to: 60, g: "arist" },
  { from: 60, to: 69, g: "p86" }, { from: 69, to: 92, g: "half", cues: [83] }, { from: 92, to: 107, pic: "y-reading.jpg", pos: "45% 40%" },
  { from: 107, to: 118, pic: "y-dog.jpg", pos: "50% 50%" }, { from: 118, to: 122, g: "blue" }, { from: 122, to: 132, g: "p11" },
  { from: 132, to: SPREAD_AT, pic: "y-subway.jpg", pos: "50% 50%" }, { from: SPREAD_AT, to: 172, clip: "spread.mp4", start: SPREAD_AT },
  { from: 172, to: 180, pic: "y-bust.jpg", pos: "60% 40%", zoom: [1.15, 1.0] }, { from: 180, to: 193, pic: "y-family.jpg", pos: "45% 50%" },
  { from: 193, to: 201, pic: "y-friends.jpg", pos: "60% 50%" }, { from: 201, to: 999, pic: "y-mother.jpg", pos: "40% 45%", zoom: [1.15, 1.0] },
];

const BEATS: Beat[] = [
  [0, 2, 2], [3, 4, 4], [5, 8, 9], [10, 13, 13], [14, 19, 19], [20, 24, 25], [26, 32, 32], [33, 34, 34], [37, 39, 42], [43, 46, 46],
  [47, 49, 49], [50, 54, 54], [55, 59, 59], [60, 63, 63], [64, 67, 68], [69, 70, 70], [71, 78, 79], [80, 85, 85], [86, 88, 88], [89, 90, 91],
  [92, 98, 98], [99, 104, 104], [105, 106, 106], [107, 109, 109], [112, 115, 117], [118, 121, 121], [122, 123, 123], [124, 125, 126],
  [127, 128, 131], [132, 136, 137], [138, 139, 140], [141, 143, 144], [145, 149, 150], [151, 152, 152], [153, 156, 156], [157, 158, 158],
  [159, 160, 160], [161, 164, 165], [166, 171, 171], [172, 173, 174], [175, 178, 179], [180, 183, 183], [184, 186, 186], [187, 191, 192],
  [193, 196, 196], [197, 199, 200], [201, 205, 205], [206, 207, 207],
].map(([from, a, b]) => ({ from, key: [a, b] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 33, kind: "flash" }, { at: 46, kind: "burn" }, { at: 60, kind: "burn" }, { at: 69, kind: "glitch" }, { at: 92, kind: "flash" },
  { at: 118, kind: "glitch" }, { at: 122, kind: "burn" }, { at: SPREAD_AT, kind: "flash" }, { at: 172, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [3, "whoosh-film", 0.25], [32, "subdrop", 0.3], [46, "paper", 0.3], [60, "paper", 0.3], [85, "pop", 0.25], [104, "marker", 0.25],
  [122, "paper", 0.3], [185, "chime", 0.25], [205, "chime", 0.25],
  ...JOIN_AT.map((a): [number, string, number] => [-(F(SPREAD_AT) + a), "pop", 0.12]),
  ...CATCH_AT.map((a): [number, string, number] => [-(F(SPREAD_AT) + a), "spark", 0.25]),
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
const { musicGain: MUSIC_GAIN = 0.83 } = getInputProps() as { musicGain?: number };

export const Yawn: React.FC = () => {

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
            ) : l.g in PAPERS ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g as PaperId].journal} title={PAPERS[l.g as PaperId].title} authors={PAPERS[l.g as PaperId].authors} hlHeight={120} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "half" ? <HalfYawn from={a} at={F(l.cues![0])} /> : null}
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
        const dark = k in PAPERS;
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
