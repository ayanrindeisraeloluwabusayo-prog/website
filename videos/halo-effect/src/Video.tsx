// "The halo effect" (mosquito-style graphics), Full Blend.
// Facts: Thorndike (1920) J Appl Psychol 4(1):25-29; Nisbett & Wilson (1977) JPSP 35(4):250-256. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Decided, Denied, Judged, Named, Pull, Ratings, Reverse, Split } from "./hag";
import { KEY_AT } from "./HaloShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p77";
type G = "blue" | PaperId | "decided" | "ratings" | "pull" | "named" | "split" | "judged" | "denied" | "reverse";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "halo3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p77: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1977", title: "The halo effect: Evidence for unconscious alteration of judgments", authors: "Richard E. Nisbett & Timothy DeCamp Wilson" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D halo lights up on "shines" */
const LEAD = KEY_AT - (W[99].at - W[96].at);

const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-walkin.mp4" }, { from: 5, to: 9, pic: "v-smile.mp4", pos: "50% 30%" }, { from: 9, to: 26, g: "decided", cues: [19, 20, 22] },
  { from: 26, to: 36, pic: "v-office.mp4" }, { from: 36, to: 46, pic: "v-man.mp4", pos: "50% 30%" }, { from: 46, to: 53, pic: "v-soldier.mp4" },
  { from: 53, to: 77, g: "ratings", cues: [69] }, { from: 77, to: 90, g: "pull", cues: [85] }, { from: 90, to: 96, g: "named" },
  { from: 96, to: 106, clip: "halo3d.mp4", start: 96, lead: LEAD }, { from: 106, to: 109, g: "blue" }, { from: 109, to: 117, g: "p77" },
  { from: 117, to: 129, pic: "v-classroom.mp4" }, { from: 129, to: 145, g: "split", cues: [129, 136] }, { from: 145, to: 174, g: "judged", cues: [160, 173] },
  { from: 174, to: 178, g: "blue" }, { from: 178, to: 195, g: "denied" }, { from: 195, to: 214, g: "reverse", cues: [204] },
  { from: 214, to: 228, pic: "v-street.mp4" }, { from: 228, to: 238, pic: "v-dress.mp4", pos: "50% 30%" }, { from: 238, to: 999, pic: "v-model.mp4", pos: "50% 30%" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 6, 6], [7, 8, 8], [9, 14, 14], [15, 19, 19], [20, 21, 20], [22, 25, 25], [26, 30, 30], [31, 34, 34],
  [35, 38, 38], [39, 45, 43], [46, 47, 47], [48, 52, 52], [53, 56, 55], [57, 59, 59], [60, 66, 63], [67, 70, 70], [71, 76, 76],
  [77, 80, 80], [81, 82, 82], [83, 86, 86], [87, 89, 89], [90, 95, 94], [96, 99, 99], [100, 102, 101], [103, 105, 105], [106, 108, 108],
  [109, 110, 110], [111, 116, 116], [117, 120, 120], [121, 124, 123], [125, 128, 128], [129, 135, 133], [136, 140, 140], [141, 144, 142],
  [145, 151, 150], [152, 156, 156], [157, 160, 160], [161, 167, 166], [168, 173, 173], [174, 177, 177], [178, 184, 184], [185, 189, 187],
  [190, 194, 190], [195, 203, 202], [204, 209, 209], [210, 213, 212], [214, 216, 216], [217, 220, 220], [221, 227, 227], [228, 232, 232], [233, 238, 238],
  [239, 244, 240], [245, 248, 245],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 5, kind: "flash" }, { at: 9, kind: "burn" }, { at: 26, kind: "flash" }, { at: 36, kind: "burn" }, { at: 46, kind: "flash" },
  { at: 53, kind: "glitch" }, { at: 77, kind: "flash" }, { at: 90, kind: "burn" }, { at: 96, kind: "flash" }, { at: 106, kind: "glitch" },
  { at: 109, kind: "burn" }, { at: 117, kind: "flash" }, { at: 129, kind: "burn" }, { at: 145, kind: "flash" }, { at: 178, kind: "burn" },
  { at: 195, kind: "flash" }, { at: 214, kind: "burn" }, { at: 228, kind: "flash" }, { at: 238, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [19, "pop", 0.2], [20, "pop", 0.2], [22, "pop", 0.2], [53, "paper", 0.2], [69, "chime", 0.2], [85, "riser", 0.2],
  [90, "spark", 0.25], [-(F(96) - LEAD + KEY_AT), "spark", 0.4], [109, "paper", 0.3], [129, "pop", 0.2], [136, "pop", 0.2], [160, "chime", 0.25],
  [173, "drop", 0.25], [178, "paper", 0.2], [204, "glitch-a", 0.2],
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
const { musicGain: MUSIC_GAIN = 0.85 } = getInputProps() as { musicGain?: number };

export const HaloEffect: React.FC = () => {

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
                {l.g === "decided" ? <Decided at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} /> : null}
                {l.g === "ratings" ? <Ratings from={a} stuckAt={F(l.cues![0])} /> : null}
                {l.g === "pull" ? <Pull from={a} upAt={F(l.cues![0])} /> : null}
                {l.g === "named" ? <Named from={a} /> : null}
                {l.g === "split" ? <Split warmAt={F(l.cues![0])} coldAt={F(l.cues![1])} /> : null}
                {l.g === "judged" ? <Judged from={a} warmAt={F(l.cues![0])} coldAt={F(l.cues![1])} /> : null}
                {l.g === "denied" ? <Denied from={a} /> : null}
                {l.g === "reverse" ? <Reverse from={a} claimAt={F(l.cues![0])} /> : null}
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
