// "Why you can't remember being a baby" in the blue explainer edit (mosquito-style graphics), Full Blend script.
// Facts: Akhtar et al. (2018) Psychological Science; Bauer & Larkina (2014) Memory; Yates et al. (2025) Science. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Age, FourTen, Recall, Scan, Talk } from "./bmg";
import { KEY_AT } from "./BabyShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p18" | "p25";
type G = "blue" | PaperId | "age" | "agefade" | "fourten" | "talk" | "recall" | "scan";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "baby3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p18: { journal: "PSYCHOLOGICAL SCIENCE · 2018", title: "Fictional first memories", authors: "Shazia Akhtar, Lucy V. Justice, Catriona M. Morrison & Martin A. Conway" },
  p25: { journal: "SCIENCE · 2025", title: "Hippocampal encoding of memories in human infants", authors: "Tristan S. Yates, Jared Fel, Dawoon Choi et al. & Nicholas B. Turk-Browne" },
};
const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D shot starts this far in, so the shell closes over the memory on "door" */
const LEAD = KEY_AT - (W[206].at - W[197].at);
const LAYERS: Layer[] = [
  { from: 0, to: 8, pic: "v-feet.mp4" }, { from: 8, to: 21, g: "age", cues: [18] }, { from: 21, to: 29, pic: "v-toddler.mp4" },
  { from: 29, to: 34, pic: "v-mum.mp4", pos: "60% 40%" }, { from: 34, to: 41, g: "agefade" }, { from: 41, to: 51, pic: "v-cake.mp4" },
  { from: 51, to: 66, g: "p18" }, { from: 66, to: 78, g: "fourten", cues: [67] }, { from: 78, to: 89, pic: "v-album.mp4" },
  { from: 89, to: 98, pic: "v-tvroom.mp4" }, { from: 98, to: 101, g: "blue" }, { from: 101, to: 117, g: "talk" },
  { from: 117, to: 150, g: "recall", cues: [130, 140] }, { from: 150, to: 154, g: "blue" }, { from: 154, to: 158, pic: "v-crib.mp4" },
  { from: 158, to: 167, g: "p25" }, { from: 167, to: 191, g: "scan", cues: [176, 184] }, { from: 191, to: 197, pic: "v-record.mp4" },
  { from: 197, to: 211, clip: "baby3d.mp4", start: 197, lead: LEAD }, { from: 211, to: 222, pic: "v-dad.mp4", pos: "50% 30%" },
  { from: 222, to: 999, pic: "v-padlock.mp4" },
];

const BEATS: Beat[] = [
  [0, 4, 5], [6, 7, 7], [8, 12, 12], [13, 20, 20], [21, 26, 26], [27, 28, 28], [29, 33, 33], [34, 40, 40], [41, 44, 44],
  [45, 50, 50], [51, 55, 55], [56, 61, 61], [62, 65, 65], [66, 69, 69], [70, 77, 77], [78, 82, 82], [83, 88, 88], [89, 92, 92],
  [93, 97, 94], [98, 100, 100], [101, 104, 103], [105, 110, 110], [111, 116, 116], [117, 124, 124], [125, 131, 130],
  [132, 134, 134], [135, 138, 138], [139, 142, 140], [143, 149, 149], [150, 153, 153], [154, 157, 157], [158, 159, 159],
  [160, 163, 162], [164, 167, 167], [168, 173, 171], [174, 178, 178], [179, 184, 184], [185, 190, 190], [191, 196, 196],
  [197, 203, 203], [204, 206, 206], [207, 210, 210], [211, 216, 216], [217, 222, 222], [223, 227, 226], [228, 232, 231],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 8, kind: "flash" }, { at: 21, kind: "burn" }, { at: 34, kind: "glitch" }, { at: 41, kind: "flash" }, { at: 51, kind: "burn" },
  { at: 66, kind: "flash" }, { at: 78, kind: "burn" }, { at: 89, kind: "flash" }, { at: 98, kind: "glitch" }, { at: 101, kind: "burn" },
  { at: 117, kind: "flash" }, { at: 154, kind: "burn" }, { at: 158, kind: "burn" }, { at: 167, kind: "flash" }, { at: 191, kind: "glitch" },
  { at: 197, kind: "flash" }, { at: 211, kind: "burn" }, { at: 222, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [18, "chime", 0.25], [34, "subdrop", 0.2], [51, "paper", 0.3], [67, "pop", 0.25], [88, "glitch-a", 0.15],
  [101, "pop", 0.2], [130, "chime", 0.25], [140, "drop", 0.25], [158, "paper", 0.3], [176, "pop", 0.2], [184, "spark", 0.3],
  [-(F(197) - LEAD + KEY_AT), "drop", 0.35], [222, "lamp", 0.3],
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
const { musicGain: MUSIC_GAIN = 1.17 } = getInputProps() as { musicGain?: number };

export const BabyMemory: React.FC = () => {

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
                {l.g === "age" ? <Age from={a} firstAt={F(l.cues![0])} /> : null}
                {l.g === "agefade" ? <Age from={a} firstAt={a} fadeAll /> : null}
                {l.g === "fourten" ? <FourTen from={a} litAt={F(l.cues![0])} /> : null}
                {l.g === "talk" ? <Talk from={a} /> : null}
                {l.g === "recall" ? <Recall from={a} sixtyAt={F(l.cues![0])} dropAt={F(l.cues![1])} /> : null}
                {l.g === "scan" ? <Scan from={a} picsAt={F(l.cues![0])} hippoAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_twinkle_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
