// "I thought they said I didn't have fans in Nigeria": Tems' own words from Spotify Surround Sound in Lagos
// (the owner's clip), then the owner's narration of how she got there. About 71 s.
// Facts: Spotify Surround Sound, Livespot Lagos, 25-26 Sep 2026, no ticket sales, Premium listeners invited by
// listening activity (Pulse, Techeconomy, MyJoyOnline). "No one wanted to produce for me back then" (Tems,
// interview). Quit her marketing job in 2018 to release Mr. Rebel. Try Me 2019; Essence (Wizkid) 2020; Fountains
// (Drake) 2021; Wait for U (Future ft. Drake) samples her "Higher", No. 1 on the Billboard Hot 100 in 2022; Grammy
// Feb 2023. Debut EP past 888 million Spotify streams (Premium Times, Nov 2026).
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim } from "./media";
import { CreatorCard, Climb, Counter, Doors, FlatLine, InviteGrid, Resign, Ticket, Tutorials } from "./graphics6";
import { CLIP, fr, say, V0, WORDS } from "./speech";
import { SANS2, SERIF2 } from "./type";

export const FRAMES = 2150;
const END = 2062;
const CLIP_END = 518;

const talking = (f: number) => {
  for (let i = 0; i < WORDS.length; i++) {
    const a = WORDS[i].at, b = i + 1 < WORDS.length ? WORDS[i + 1].at : a + 20;
    if (f >= a - 4 && f < Math.min(b, a + 20) + 4) return true;
  }
  return false;
};
/** Music: silent under Tems' own clip, rises as the narration starts, tucked under the voice, out at the end. */
const musicLevel = (f: number) => {
  let duck = 0;
  for (let d = -6; d <= 6; d += 2) duck += talking(f + d) ? 1 : 0;
  duck /= 7;
  let v = 0.3 - 0.16 * duck;
  if (f < V0 - 30) v = 0;
  else if (f < V0 + 10) v *= (f - (V0 - 30)) / 40;
  if (f > END + 5) v *= Math.max(0, 1 - (f - END - 5) / 85);
  return v;
};

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.4 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.4} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** A piece of the Spotify clip: shown from `from` to `to`, starting at `src` frames into the clip, slowly pushing in. */
const Footage: React.FC<{ from: number; to: number; src: number; sound?: boolean; zoom?: [number, number]; pos?: string }> = ({ from, to, src, sound = false, zoom = [1.0, 1.08], pos = "50% 50%" }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const z = zoom[0] + (zoom[1] - zoom[0]) * ((f - from) / Math.max(1, to - from));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ scale: String(z), transformOrigin: pos }}>
        <Sequence from={from} layout="none">
          <OffthreadVideo src={staticFile("media/tems-spotify-lagos.mp4")} startFrom={src} muted={!sound} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Tems' words in the clip, as subtitles near the bottom. */
const Sub: React.FC<{ from: number; to: number; text: string; key2?: string }> = ({ from, to, text, key2 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1430, textAlign: "center", color: "#fff", fontFamily: SANS2, fontWeight: 700, fontSize: 52, lineHeight: 1.2,
      textShadow: "0 4px 24px rgba(0,0,0,0.85)" }}>
      {text}{key2 ? <> <span style={{ fontFamily: SERIF2, fontWeight: 500, fontSize: 92, color: FLASH, letterSpacing: "-0.03em" }}>{key2}</span></> : null}
    </div>
  );
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. Tems in her own words (the owner's clip, with its own sound) */}
      <Scene from={0} to={CLIP_END}>
        <Footage from={0} to={CLIP_END} src={0} sound zoom={[1.0, 1.12]} />
        <Scrim side="bottom" strength={0.7} />
        <Scrim side="top" strength={0.5} />
        <Grain amount={0.12} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: SANS2, fontWeight: 800, fontSize: 30, letterSpacing: "0.22em", color: "#fff", opacity: 0.9 }}>
          <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, background: "#ff3b3b", marginRight: 16, opacity: 0.5 + 0.5 * Math.sin(f / 5) }} />
          TEMS · LAGOS · SEPTEMBER
        </div>
        <Sub from={CLIP[1].at} to={CLIP[7].at} text="You guys, I didn't expect this." />
        <Sub from={CLIP[7].at} to={CLIP[18].at} text="You know, Spotify told me they were gonna invite my fans," />
        <Sub from={CLIP[18].at} to={CLIP[25].at} text="and I was like, “Are you sure?”" />
        <Sub from={CLIP[25].at} to={CLIP[33].at} text="They said I don't have fans in" key2="Nigeria." />
        <Sub from={CLIP[33].at} to={CLIP_END} text="So I was… I'm a bit" key2="confused." />
      </Scene>

      {/* 2. "She really thought that." (the crowd)  "But here's the twist." (blue) */}
      <Scene from={CLIP_END} to={fr(4)}>
        <Footage from={CLIP_END} to={fr(4)} src={350} zoom={[1.1, 1.2]} />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.18} />
        <Lockup top={260} lines={[{ words: say(0, 1), align: "flex-start", indent: 80 }, { kind: "serif", words: say(2, 3) }]} />
      </Scene>
      <Scene from={fr(4)} to={fr(8)}>
        <BlueStage glowY={50} />
        <Grain amount={0.18} />
        <Lockup top={760} lines={[{ words: say(4, 6), align: "flex-start", indent: 120 }, { kind: "serif", words: say(7), size: 260 }]} />
      </Scene>

      {/* 3. "Nobody in that crowd bought a ticket." */}
      <Scene from={fr(8)} to={fr(15)}>
        <BlueStage glowY={58} />
        <Ticket from={fr(8)} stampAt={fr(14)} />
        <Grain amount={0.18} />
        <Lockup top={240} lines={[{ words: say(8, 11), align: "flex-start", indent: 40 }, { kind: "serif", words: say(12, 14) }]} />
      </Scene>

      {/* 4. "Spotify invited every one of them, picked by what they're actually listening to. The proof was in the data," */}
      <Scene from={fr(15)} to={fr(34)}>
        <BlueStage glowY={60} />
        <InviteGrid from={fr(15)} lightAt={fr(16)} labelAt={fr(21)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(21) - 1} lines={[{ words: say(15, 16), align: "flex-start", indent: 40 }, { kind: "serif", words: say(17, 20) }]} />
        <Lockup top={220} until={fr(28) - 1} lines={[{ words: say(21, 24), align: "flex-start" }, { kind: "serif", words: say(25, 26) }, { words: say(27), align: "flex-end", indent: 120 }]} />
        <Lockup top={220} lines={[{ words: say(28, 32), align: "flex-start", indent: 80 }, { kind: "serif", words: say(33), size: 240 }]} />
      </Scene>

      {/* 5. "which is funny, because years earlier, almost nobody wanted to hear her." */}
      <Scene from={fr(34)} to={fr(46)}>
        <BlueStage glowY={62} />
        <Doors from={fr(37)} xAt={fr(41)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(40) - 1} lines={[{ words: say(34, 35), align: "flex-start", indent: 80 }, { kind: "serif", words: say(36) }, { words: say(37, 39), align: "flex-end" }]} />
        <Lockup top={220} lines={[{ words: say(40, 41), align: "flex-start", indent: 40 }, { kind: "serif", words: say(42, 43) }, { words: say(44, 45), align: "flex-end", indent: 80 }]} />
      </Scene>

      {/* 6. Her own words, on paper */}
      <Scene from={fr(46)} to={fr(57)}>
        <Paper />
        <Grain amount={0.12} />
        <div style={{ position: "absolute", left: 120, top: 1500, fontFamily: SANS2, fontWeight: 800, fontSize: 32, letterSpacing: "0.18em", color: "#111", opacity: f >= fr(55) ? 1 : 0 }}>— TEMS</div>
        <Lockup top={620} color="#111" shadow={false} lines={[
          { kind: "serif", words: say(46, 47), align: "flex-start" },
          { kind: "serif", words: say(48, 50), align: "flex-start" },
          { words: say(51, 54), align: "flex-start", indent: 60 },
        ]} />
      </Scene>

      {/* 7. "So she did it herself. Hours of YouTube tutorials, learning to produce in her room" */}
      <Scene from={fr(57)} to={fr(72)}>
        <BlueStage glowY={58} />
        <Tutorials from={fr(57)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(62) - 1} lines={[{ words: say(57, 60), align: "flex-start", indent: 60 }, { kind: "serif", words: say(61), size: 220 }]} />
        <Lockup top={220} lines={[{ words: say(62, 63), align: "flex-start" }, { kind: "serif", words: say(64, 65) }, { words: say(66, 71), align: "flex-end" }]} />
      </Scene>

      {/* 8. "in 2018. She quit her marketing job to release her first single, Mr. Rebel." */}
      <Scene from={fr(72)} to={fr(86)}>
        <BlueStage glowY={60} />
        <Resign from={fr(72)} stampAt={fr(75)} songAt={fr(83)} />
        <Grain amount={0.18} />
        <Lockup top={200} until={fr(79) - 1} lines={[{ words: say(72), align: "flex-start", indent: 80 }, { kind: "serif", words: say(73), size: 220 }, { words: say(74, 78), align: "flex-end" }]} />
        <Lockup top={200} lines={[{ words: say(79, 82), align: "flex-start", indent: 40 }, { kind: "serif", words: say(83, 85), size: 140 }]} />
      </Scene>

      {/* 9. "She hadn't even finished making it yet. It didn't blow up." */}
      <Scene from={fr(86)} to={fr(97)}>
        <BlueStage glowY={62} />
        <Scene from={fr(93)} to={fr(97)}><FlatLine from={fr(93)} /></Scene>
        <Scene from={fr(86)} to={fr(93)}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: SANS2, fontWeight: 800, fontSize: 40, letterSpacing: "0.16em", color: "rgba(255,255,255,0.85)" }}>
            MR. REBEL · <span style={{ color: FLASH }}>NOT FINISHED</span>
          </div>
          <div style={{ position: "absolute", left: 150, top: 1200, width: 780, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.15)" }}>
            <div style={{ width: `${Math.min(62, (f - fr(86)) * 1.6)}%`, height: "100%", borderRadius: 13, background: FLASH }} />
          </div>
        </Scene>
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(93) - 1} lines={[{ words: say(86, 88), align: "flex-start", indent: 40 }, { kind: "serif", words: say(89) }, { words: say(90, 92), align: "flex-end", indent: 80 }]} />
        <Lockup top={220} lines={[{ words: say(93, 94), align: "flex-start", indent: 80 }, { kind: "serif", words: say(95, 96), size: 220 }]} />
      </Scene>

      {/* 10. "Then came Try Me, then Wizkid Essence, then Drake, then a song sampling her voice went to number one in America, and she walked away with a Grammy." */}
      <Scene from={fr(97)} to={fr(125)}>
        <BlueStage glowY={56} />
        <Climb steps={[
          { at: fr(99), year: "2019", title: "Try Me", sub: "HER BREAKOUT" },
          { at: fr(102), year: "2020", title: "Essence", sub: "WITH WIZKID" },
          { at: fr(105), year: "2021", title: "Fountains", sub: "WITH DRAKE" },
          { at: fr(114), year: "2022", title: "Wait for U", sub: "SAMPLES HER SONG · No. 1 IN THE US", gold: true },
          { at: fr(124) - 6, year: "2023", title: "Grammy", sub: "BEST MELODIC RAP PERFORMANCE", gold: true },
        ]} />
        <Grain amount={0.16} />
        <Lockup top={200} until={fr(106) - 1} lines={[{ words: say(97, 98), align: "flex-start", indent: 80 }, { kind: "serif", words: say(99, 100) }]} />
        <Lockup top={200} until={fr(118) - 1} lines={[{ words: say(106, 111), align: "flex-start" }, { words: say(112, 113), align: "flex-start", indent: 120 }, { kind: "serif", words: say(114, 115) }, { words: say(116, 117), align: "flex-end", indent: 80 }]} />
        <Lockup top={200} lines={[{ words: say(118, 123), align: "flex-start", indent: 40 }, { kind: "serif", words: say(124), size: 220 }]} />
      </Scene>

      {/* 11. "So when she says she is a bit confused, we get it." (back to her on stage) */}
      <Scene from={fr(125)} to={fr(137)}>
        <Footage from={fr(125)} to={fr(137)} src={240} zoom={[1.15, 1.3]} />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.18} />
        <Lockup top={240} lines={[{ words: say(125, 132), align: "flex-start" }, { kind: "serif", words: say(133) }, { words: say(134, 136), align: "flex-end", indent: 80 }]} />
      </Scene>

      {/* 12. "The fans were always there. They were just quiet, until someone counted them." */}
      <Scene from={fr(137)} to={END}>
        <BlueStage glowY={58} />
        <Scene from={fr(137)} to={fr(146)}><InviteGrid from={fr(137) - 20} lightAt={fr(137) - 200} labelAt={1e9} allOn={0} /></Scene>
        <Scene from={fr(146)} to={END}><Counter from={fr(147)} dur={36} /></Scene>
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(142) - 1} lines={[{ words: say(137, 139), align: "flex-start", indent: 80 }, { kind: "serif", words: say(140, 141) }]} />
        <Lockup top={220} until={fr(146) - 1} lines={[{ words: say(142, 144), align: "flex-start", indent: 80 }, { kind: "serif", words: say(145) }]} />
        <Lockup top={220} lines={[{ words: say(146, 147), align: "flex-start", indent: 60 }, { kind: "serif", words: say(148, 149) }]} />
      </Scene>

      {/* 13. End card: the owner's music page, Drahcir_The_Creator */}
      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <CreatorCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {/* transitions */}
      <InvertFlash at={fr(4) - 2} />
      <FilmBurn at={fr(34) - 5} />
      <PixelGlitch at={fr(97) - 4} />
      <FilmBurn at={fr(125) - 5} />

      {/* sound: Tems' clip keeps its own sound; the owner's narration; a driving bed; quiet effects */}
      <Sequence from={V0} layout="none">
        <Audio src={staticFile("media/voice.mp3")} />
      </Sequence>
      <Audio src={staticFile("music_drive.wav")} volume={(x) => musicLevel(x)} />
      <Sfx at={fr(4) - 3} src="glitch-a" volume={0.3} />      {/* the twist */}
      <Sfx at={fr(14)} src="drop" volume={0.45} />            {/* TICKETS SOLD: 0 */}
      <Sfx at={fr(16)} src="spark" volume={0.3} />            {/* the crowd lights up */}
      <Sfx at={fr(41)} src="glitch-b" volume={0.25} />        {/* doors close */}
      <Sfx at={fr(46)} src="paper" volume={0.3} />            {/* her quote on paper */}
      <Sfx at={fr(75)} src="drop" volume={0.4} />             {/* QUIT stamp */}
      <Sfx at={fr(83)} src="pop" volume={0.3} />              {/* Mr. Rebel */}
      <Sfx at={fr(97) - 5} src="glitch-b" volume={0.25} />
      <Sfx at={fr(99)} src="pop" volume={0.25} />
      <Sfx at={fr(102)} src="pop" volume={0.25} />
      <Sfx at={fr(105)} src="pop" volume={0.25} />
      <Sfx at={fr(114)} src="spark" volume={0.35} />          {/* No. 1 */}
      <Sfx at={fr(124) - 6} src="chime" volume={0.35} />      {/* Grammy */}
      <Sfx at={fr(147)} src="riser" volume={0.3} />           {/* the count climbs */}
      <Sfx at={END + 2} src="pop" volume={0.4} />             {/* logo lands */}
    </AbsoluteFill>
  );
};
