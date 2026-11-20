// "The airport trick" in the blue explainer edit, Full Blend script.
// Facts: Alex Stone, NYT 2012 ("Why Waiting Is Torture"); Maister (1985) "The Psychology of Waiting Lines";
// Wilson et al. (2014) Science 345(6192). See SCRIPT.md. 3D man: the current three.js style (the owner's choice).
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Complaints, Journey, ShockRoom, TwoBars, WaitDown } from "./graphics";
import { TICKS } from "./WaitShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "nyt" | "p85" | "p14";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "wait" | "complaints" | "journey" | "journey2" | "drop" | "room" | "bars"; cues?: number[] }
  | { from: number; to: number; clip: "wait.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  nyt: { journal: "THE NEW YORK TIMES · SUNDAY REVIEW · 2012", title: "Why Waiting Is Torture", authors: "Alex Stone" },
  p85: { journal: "THE SERVICE ENCOUNTER · 1985", title: "The Psychology of Waiting Lines", authors: "David H. Maister" },
  p14: { journal: "SCIENCE · 2014", title: "Just think: The challenges of the disengaged mind", authors: "Timothy D. Wilson et al. · University of Virginia" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...feel shorter", on the music's final hit */
export const END = 2537;
export const FRAMES = END + 92;
const WAIT_AT = 142;

const LAYERS: Layer[] = [
  { from: 0, to: 2, pic: "v-land.mp4" }, { from: 2, to: 4, pic: "v-tired.mp4" },
  { from: 4, to: 12, pic: "v-belt.mp4", zoom: [1.0, 1.15] }, { from: 12, to: 22, pic: "v-belt2.mp4", zoom: [1.15, 1.0] },
  { from: 22, to: 26, g: "blue" }, { from: 26, to: 35, g: "nyt" },
  { from: 35, to: 41, pic: "a-claim.jpg" }, { from: 41, to: 48, pic: "a-crowd.jpg", pos: "60% 50%" },
  { from: 48, to: 56, g: "wait" }, { from: 56, to: 61, g: "complaints" },
  { from: 61, to: 68, pic: "v-watch.mp4" }, { from: 68, to: 84, g: "journey", cues: [70] },
  { from: 84, to: 93, pic: "v-walk.mp4" }, { from: 93, to: 101, pic: "v-walk2.mp4" },
  { from: 101, to: 107, g: "journey2", cues: [103] }, { from: 107, to: 114, g: "drop", cues: [110] },
  { from: 114, to: 120, pic: "v-bags.mp4" }, { from: 120, to: 127, g: "blue" }, { from: 127, to: 135, g: "p85" },
  { from: 135, to: WAIT_AT, pic: "v-clock.mp4" }, { from: WAIT_AT, to: 158, clip: "wait.mp4", start: WAIT_AT },
  { from: 158, to: 162, g: "blue" }, { from: 162, to: 170, g: "p14" }, { from: 170, to: 194, g: "room", cues: [187] },
  { from: 194, to: 207, pic: "v-bench.mp4", pos: "70% 50%" }, { from: 207, to: 220, g: "bars", cues: [210, 215] },
  { from: 220, to: 230, pic: "v-belt.mp4", zoom: [1.0, 1.12] }, { from: 230, to: 237, pic: "v-walk.mp4" },
  { from: 237, to: 243, pic: "v-watch.mp4" }, { from: 243, to: 252, pic: "v-feet.mp4" },
  { from: 252, to: 999, pic: "v-sunset.mp4", zoom: [1.15, 1.0] },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 3, 3], [4, 10, 11], [12, 17, 17], [18, 19, 21], [22, 23, 23], [26, 29, 31], [32, 33, 34], [35, 37, 37], [38, 40, 40],
  [41, 45, 46], [47, 54, 55], [56, 59, 60], [61, 67, 67], [68, 73, 74], [75, 76, 77], [78, 83, 83], [84, 89, 90], [91, 91, 92], [93, 99, 100],
  [101, 104, 106], [107, 112, 113], [114, 118, 119], [120, 122, 122], [123, 127, 128], [129, 134, 134], [135, 135, 136], [137, 138, 138],
  [139, 140, 141], [142, 146, 147], [148, 151, 151], [154, 155, 157], [158, 161, 161], [162, 163, 163], [164, 167, 169], [170, 172, 172],
  [173, 175, 176], [177, 178, 179], [180, 184, 184], [185, 187, 187], [188, 192, 193], [194, 201, 202], [203, 204, 206], [207, 210, 211],
  [212, 215, 216], [217, 217, 219], [220, 222, 223], [224, 225, 226], [227, 228, 229], [230, 235, 236], [237, 242, 242], [243, 245, 245],
  [246, 248, 248], [249, 249, 251], [252, 256, 257],
].map(([from, a, b]) => ({ from, key: [a, b] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 22, kind: "flash" }, { at: 26, kind: "burn" }, { at: 48, kind: "glitch" }, { at: 68, kind: "burn" }, { at: 101, kind: "flash" },
  { at: 120, kind: "flash" }, { at: 127, kind: "burn" }, { at: WAIT_AT, kind: "flash" }, { at: 158, kind: "glitch" }, { at: 162, kind: "burn" },
  { at: 207, kind: "flash" }, { at: 220, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [26, "paper", 0.3], [37, "pop", 0.25], [54, "chime", 0.25], [58, "pop", 0.2], [73, "pop", 0.25],
  [104, "spark", 0.3], [110, "subdrop", 0.35], [127, "paper", 0.3], [162, "paper", 0.3], [187, "pop", 0.3], [192, "glitch-a", 0.3],
  [210, "pop", 0.25], [215, "pop", 0.25], [229, "chime", 0.25], [245, "whoosh", 0.25],
  ...TICKS.filter((t) => F(WAIT_AT) + t < F(158)).map((t): [number, string, number] => [-(F(WAIT_AT) + t), "marker", 0.18]),
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

export const Airport: React.FC = () => {

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
                <Shot src={l.pic} video={l.pic.endsWith(".mp4")} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade={l.grade ?? "contrast(1.06)"} />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start) - (l.lead ?? 0)} />
            ) : l.g === "nyt" || l.g === "p85" || l.g === "p14" ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g].journal} title={PAPERS[l.g].title} authors={PAPERS[l.g].authors} hlHeight={l.g === "p14" ? 120 : 60} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "wait" ? <WaitDown from={a} /> : null}
                {l.g === "complaints" ? <Complaints from={a} /> : null}
                {l.g === "drop" ? <Complaints from={a} startFull dropAt={F(l.cues![0])} /> : null}
                {l.g === "journey" ? <Journey from={a} at1={F(l.cues![0])} at2={1e9} /> : null}
                {l.g === "journey2" ? <Journey from={a - 100} at1={a - 100} at2={F(l.cues![0])} /> : null}
                {l.g === "room" ? <ShockRoom from={a} buttonAt={F(l.cues![0])} /> : null}
                {l.g === "bars" ? <TwoBars from={a} at1={F(l.cues![0])} at2={F(l.cues![1])} title="PRESSED THE SHOCK BUTTON" footer="WILSON ET AL. · SCIENCE · 2014"
                  rows={[{ label: "MEN", pct: 67, people: 0, gold: true }, { label: "WOMEN", pct: 25, people: 0, gold: false }]} /> : null}
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
        const dark = k === "nyt" || k === "p85" || k === "p14";
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
