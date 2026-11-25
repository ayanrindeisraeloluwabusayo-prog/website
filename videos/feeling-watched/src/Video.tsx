// "Why you feel like someone is watching you" (gaze prior) in the blue explainer edit, Full Blend script.
// Facts: Mareschal, Calder & Clifford (2013) Current Biology 23:717-721 and the university press release (Clifford on
// threat; babies prefer direct gaze). See SCRIPT.md. The thumbnail (Thumbs.tsx, option C) is added as the first frames.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Blur, Careful, Clifford, Cost, Gap, Lean, Prior, Proof, Safe, Turn } from "./fwg";
import { WORDS } from "./speech";
import { LOOK_AT } from "./WatchedShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p13";
type G = "blue" | PaperId | "turn" | "blur" | "lean" | "prior" | "gap" | "careful" | "clifford" | "cost" | "proof" | "safe";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "watched.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p13: { journal: "CURRENT BIOLOGY · 2013", title: "Humans have an expectation that gaze is directed toward them", authors: "Isabelle Mareschal, Andrew J. Calder & Colin W. G. Clifford" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...the answer.", on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D shot starts this far in, so every eye turns to stare on "watched" */
const LEAD = LOOK_AT - (W[127].at - W[122].at);

const NIGHT = "brightness(1.15) contrast(1.08)";
const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-road.mp4", grade: NIGHT }, { from: 5, to: 9, pic: "v-alley.mp4", grade: NIGHT }, { from: 9, to: 18, pic: "v-darkface.mp4", grade: NIGHT },
  { from: 18, to: 23, pic: "v-camera.mp4" }, { from: 23, to: 36, g: "turn", cues: [33] }, { from: 36, to: 39, g: "blue" }, { from: 39, to: 52, g: "p13" },
  { from: 52, to: 66, g: "blur", cues: [53] }, { from: 66, to: 89, g: "lean", cues: [71, 83] }, { from: 89, to: 101, g: "prior" },
  { from: 101, to: 107, pic: "v-city.mp4", grade: NIGHT }, { from: 107, to: 112, pic: "v-alley.mp4", grade: "brightness(0.8) contrast(1.1)" }, { from: 112, to: 117, pic: "v-sunglasses.mp4" },
  { from: 117, to: 122, g: "gap", cues: [120] }, { from: 122, to: 128, clip: "watched.mp4", start: 122, lead: LEAD }, { from: 128, to: 132, g: "blue" },
  { from: 132, to: 143, g: "careful", cues: [137, 142] }, { from: 143, to: 151, g: "clifford" }, { from: 151, to: 161, pic: "v-wolf.mp4" },
  { from: 161, to: 174, pic: "v-deer.mp4" }, { from: 174, to: 189, g: "cost", cues: [176, 181] }, { from: 189, to: 199, pic: "v-child.mp4" },
  { from: 199, to: 208, pic: "v-girl.mp4", pos: "50% 30%" }, { from: 208, to: 223, g: "proof", cues: [217] }, { from: 223, to: 230, g: "safe", cues: [227] },
  { from: 230, to: 238, pic: "v-road.mp4", grade: NIGHT }, { from: 238, to: 999, pic: "v-bulb.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [3, 4, 4], [5, 8, 8], [9, 10, 10], [11, 15, 17], [18, 21, 22], [23, 26, 27], [28, 31, 31], [32, 33, 35],
  [36, 38, 38], [39, 40, 40], [41, 43, 45], [46, 48, 48], [49, 53, 53], [54, 55, 55], [56, 65, 65], [66, 69, 69], [70, 73, 73],
  [74, 75, 75], [76, 82, 82], [83, 86, 88], [89, 94, 94], [95, 96, 100], [101, 102, 102], [103, 106, 106], [107, 109, 111],
  [112, 116, 116], [117, 120, 120], [121, 124, 124], [125, 127, 127], [128, 131, 131], [132, 137, 137], [138, 142, 142],
  [143, 148, 149], [150, 153, 153], [154, 160, 160], [161, 167, 167], [168, 172, 173], [174, 177, 177], [178, 179, 180],
  [181, 184, 184], [185, 188, 188], [189, 190, 190], [191, 193, 193], [194, 198, 196], [199, 203, 204], [205, 207, 207],
  [208, 210, 210], [211, 216, 216], [217, 218, 218], [219, 222, 222], [223, 226, 226], [227, 229, 229], [230, 234, 234],
  [235, 237, 237], [238, 241, 241], [242, 245, 245], [246, 250, 250],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 5, kind: "flash" }, { at: 18, kind: "glitch" }, { at: 23, kind: "burn" }, { at: 36, kind: "glitch" }, { at: 39, kind: "burn" },
  { at: 52, kind: "flash" }, { at: 66, kind: "glitch" }, { at: 89, kind: "flash" }, { at: 101, kind: "burn" }, { at: 117, kind: "glitch" },
  { at: 122, kind: "flash" }, { at: 132, kind: "glitch" }, { at: 143, kind: "burn" }, { at: 151, kind: "flash" }, { at: 174, kind: "glitch" },
  { at: 189, kind: "burn" }, { at: 208, kind: "flash" }, { at: 230, kind: "burn" }, { at: 238, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [15, "shiver", 0.3], [21, "shutter", 0.25], [26, "whoosh", 0.25], [33, "drop", 0.35], [39, "paper", 0.3],
  [53, "glitch-b", 0.2], [71, "pop", 0.25], [83, "chime", 0.25], [89, "pop", 0.2], [120, "pop", 0.3], [-(F(122) - LEAD + LOOK_AT), "spark", 0.45],
  [137, "glitch-a", 0.2], [142, "chime", 0.25], [143, "paper", 0.25], [176, "subdrop", 0.3], [181, "pop", 0.25], [217, "drop", 0.3],
  [227, "pop", 0.3], [238, "lamp", 0.4],
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
const { musicGain: MUSIC_GAIN = 1.04 } = getInputProps() as { musicGain?: number };

export const FeelingWatched: React.FC = () => {

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
            ) : l.g in PAPERS ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g as PaperId].journal} title={PAPERS[l.g as PaperId].title} authors={PAPERS[l.g as PaperId].authors} hlHeight={120} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "turn" ? <Turn from={a} nobodyAt={F(l.cues![0])} /> : null}
                {l.g === "blur" ? <Blur from={a} blurAt={F(l.cues![0])} /> : null}
                {l.g === "lean" ? <Lean from={a} leanAt={F(l.cues![0])} meAt={F(l.cues![1])} /> : null}
                {l.g === "prior" ? <Prior from={a} /> : null}
                {l.g === "gap" ? <Gap from={a} fillAt={F(l.cues![0])} /> : null}
                {l.g === "careful" ? <Careful brokenAt={F(l.cues![0]) - 4} carefulAt={F(l.cues![1])} /> : null}
                {l.g === "clifford" ? <Clifford from={a} /> : null}
                {l.g === "cost" ? <Cost missAt={F(l.cues![0])} turnAt={F(l.cues![1])} /> : null}
                {l.g === "proof" ? <Proof from={a} notAt={F(l.cues![0])} /> : null}
                {l.g === "safe" ? <Safe from={a} tipAt={F(l.cues![0])} /> : null}
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
      <Audio src={staticFile("music_spooky_sounds.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
