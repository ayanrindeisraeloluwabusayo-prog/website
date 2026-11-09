// "Burna Boy is bigger than one song": the owner's talking-to-camera footage, cut of stumbles (34.8 s),
// in the blue serif explainer style. Every word appears on the frame it is spoken (src/speech.ts).
// The speaker is on screen about half the time; cut-aways are pictures (feeling) and graphics (the point).
// Pictures: Wikimedia Commons (CC BY-SA 2.0, credited in CREDITS.md) and Pixabay. No music or footage of the artist.
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BlueField, FilmBurn, Grain, InvertFlash, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";
import { BlueStage, Panel } from "./motion";
import { Catalog, ChartRocket, NotLuck, SetList, Untied } from "./burna";
import { say } from "./speech";

export const FRAMES = 1088;
const TALK_END = 1045;

/** Music sits low under the voice and dips a little more under the biggest moments. */
const DIPS = [96, 430, 778];
const musicLevel = (f: number) => {
  let v = f < TALK_END ? 0.2 : 0.5;
  for (const d of DIPS) {
    const k = f < d - 3 ? 0 : f < d ? (f - d + 3) / 3 : Math.max(0, 1 - (f - d) / 30);
    v = Math.min(v, v - 0.08 * k);
  }
  return v * Math.min(1, (FRAMES - f) / 20);
};

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** The speaker. Static; the one jump cut inside a speaker shot (frame 1005) is hidden by cutting tighter. */
const Speaker: React.FC = () => {
  const f = useCurrentFrame();
  const tight = f >= 1005 && f < TALK_END ? 1.14 : 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ scale: String(tight), transformOrigin: "50% 38%" }}>
        <OffthreadVideo src={staticFile("media/talk.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.05)" }} />
      </AbsoluteFill>
      <Scrim side="top" strength={0.55} />
    </AbsoluteFill>
  );
};

/** Words for a speaker shot: on the dark ceiling above his head. */
const TOP = 150;

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />
      {/* the speaker runs underneath everything; his voice is the main audio */}
      <Sequence from={0} durationInFrames={TALK_END} layout="none">
        <Speaker />
      </Sequence>

      {/* 1. Hook title over the speaker (0-40) */}
      <Scene from={0} to={40}>
        <Grain amount={0.14} />
        <Lockup top={TOP} lines={[{ words: [{ w: "Burna Boy is", at: 0 }], align: "flex-start", indent: 60 }, { kind: "serif", words: [{ w: "bigger", at: 4 }] }, { words: [{ w: "than one song.", at: 10 }], align: "flex-end", indent: 60 }]} />
      </Scene>

      {/* 2. Graphic: the song blowing up (40-106) */}
      <Scene from={40} to={106}>
        <BlueStage glowY={66} />
        <Panel from={40} x={50} y={880} w={980} h={820}><span /></Panel>
        <ChartRocket from={40} boomAt={60} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(0, 80) }, { kind: "serif", words: say(80, 100) }]} />
      </Scene>

      {/* 3. Speaker (106-158) */}
      <Scene from={106} to={158}>
        <Grain amount={0.12} />
        <Lockup top={TOP} lines={[{ words: say(106, 129) }, { words: say(129, 158) }]} />
      </Scene>

      {/* 4. Picture: Burna Boy on stage, "incredibly talented" (158-205) */}
      <Scene from={158} to={205}>
        <Shot src="burna1.jpg" from={158} to={205} pos="50% 30%" zoom={[1.08, 1.0]} grade="contrast(1.08)" />
        <Scrim side="bottom" strength={0.85} />
        <Grain amount={0.18} />
        <Lockup top={1330} lines={[{ words: say(158, 175), align: "flex-start", indent: 80 }, { kind: "serif", words: say(175, 200) }]} />
      </Scene>

      {/* 5. Speaker (205-280) */}
      <Scene from={205} to={280}>
        <Grain amount={0.12} />
        <Lockup top={TOP} until={240} lines={[{ words: say(205, 232) }, { words: say(232, 240) }]} />
        <Lockup top={TOP} lines={[{ words: say(240, 262) }, { words: say(262, 280) }]} />
      </Scene>

      {/* 6. Graphic: the catalog, only "Ye" (280-380) */}
      <Scene from={280} to={380}>
        <BlueStage glowY={62} />
        <Catalog from={280} onlyAt={281} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[{ words: say(280, 311), align: "flex-start", indent: 60 }, { kind: "serif", words: say(311, 320) }, { words: say(320, 380), align: "flex-end", indent: 40 }]} />
      </Scene>

      {/* 7. Graphic: the set list without "Ye" (380-466) */}
      <Scene from={380} to={466}>
        <BlueStage glowY={64} />
        <SetList from={380} strikeAt={432} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[{ words: say(380, 405) }, { words: say(405, 445), align: "flex-start", indent: 60 }, { kind: "serif", words: say(445, 466) }]} />
      </Scene>

      {/* 8. Picture: a dancing crowd, "keep the people moving" (466-546) */}
      <Scene from={466} to={546}>
        <Shot src="crowd.mp4" video from={466} to={546} zoom={[1.0, 1.08]} grade="contrast(1.1) brightness(1.1)" />
        <Scrim side="top" strength={0.5} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(466, 520) }, { kind: "serif", words: say(520, 546) }]} />
      </Scene>

      {/* 9-10. Pictures: stadium, then arena (546-578, 578-610) */}
      <Scene from={546} to={578}>
        <Shot src="stadium.jpg" from={546} to={578} pos="50% 50%" zoom={[1.15, 1.05]} grade="contrast(1.05)" />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(546, 550) }, { kind: "serif", words: say(550, 578) }]} />
      </Scene>
      <Scene from={578} to={610}>
        <Shot src="arena.jpg" from={578} to={610} pos="45% 50%" zoom={[1.05, 1.15]} grade="contrast(1.05)" />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(578, 585) }, { kind: "serif", words: say(585, 610) }]} />
      </Scene>

      {/* 11. Picture: Burna Boy and a packed crowd, "sing back to back" (610-648) */}
      <Scene from={610} to={648}>
        <Shot src="burna2.jpg" from={610} to={648} pos="62% 50%" zoom={[1.0, 1.08]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(610, 630) }, { words: say(630, 648), align: "flex-end", indent: 80 }]} />
      </Scene>

      {/* 12. Speaker: "because man have heat for days" (648-711) */}
      <Scene from={648} to={711}>
        <Grain amount={0.12} />
        <Lockup top={TOP} lines={[{ words: say(648, 680) }, { kind: "serif", words: say(680, 690) }, { words: say(690, 711), align: "flex-end", indent: 120 }]} />
      </Scene>

      {/* 13. Graphic: greatness not tied to anybody (711-820) */}
      <Scene from={711} to={820}>
        <BlueStage glowY={64} />
        <Untied from={711} snapAt={778} />
        <Grain amount={0.2} />
        <Lockup top={240} until={746} lines={[{ words: say(711, 746) }]} />
        <Lockup top={240} lines={[{ words: say(746, 776) }, { kind: "serif", words: say(776, 786) }, { words: say(786, 820), align: "flex-end", indent: 120 }]} />
      </Scene>

      {/* 14. Picture: dice, "you can say it's luck" (820-860), then the speaker (860-900) */}
      <Scene from={820} to={860}>
        <Shot src="dice.jpg" from={820} to={860} pos="40% 40%" zoom={[1.0, 1.1]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(820, 845), align: "flex-start", indent: 100 }, { kind: "serif", words: say(845, 856) }]} />
      </Scene>
      <Scene from={860} to={900}>
        <Grain amount={0.12} />
        <Lockup top={TOP} lines={[{ words: say(856, 900) }]} />
      </Scene>

      {/* 15. Graphic: not luck, talent + consistency (900-978) */}
      <Scene from={900} to={978}>
        <BlueStage glowY={62} />
        <NotLuck from={900} talentAt={920} consAt={952} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[{ words: say(900, 920) }, { words: say(920, 978), align: "flex-end", indent: 60 }]} />
      </Scene>

      {/* 16. Speaker: "Give credit where it is due." (978-1045); tighter crop from 1005 hides the cut */}
      <Scene from={978} to={TALK_END}>
        <Grain amount={0.12} />
        <Lockup top={TOP} lines={[{ words: say(978, 1018), align: "flex-start", indent: 80 }, { kind: "serif", words: say(1018, 1040) }]} />
      </Scene>

      {/* 17. End card (1045-1088) */}
      <Scene from={TALK_END} to={FRAMES}>
        <BlueField glow={0.5} />
        <Vignette amount={0.3} />
        <Grain amount={0.2} />
        <Lockup top={760} lines={[{ words: [{ w: "Follow for more", at: TALK_END + 2 }] }, { kind: "bold", words: [{ w: "music talk", at: TALK_END + 10 }], size: 130 }]} />
      </Scene>

      {/* transitions (two of them hide the jump cuts at frames 710 and 977) */}
      <FilmBurn at={276} />
      <FilmBurn at={705} />
      <PixelGlitch at={815} />
      <InvertFlash at={976} />

      {/* sound: the speaker's voice is in the footage; music low; effects only where something happens */}
      <Audio src={staticFile("music.wav")} volume={(f) => musicLevel(f)} />
      <Sfx at={4} src="stamp" volume={0.4} />           {/* hook title lands */}
      <Sfx at={50} src="lift" volume={0.4} />           {/* the line rockets up */}
      <Sfx at={266} src="whoosh-film" volume={0.3} />   {/* film burn into the catalog */}
      <Sfx at={282} src="pop" volume={0.3} />           {/* only "Ye" stays lit */}
      <Sfx at={380} src="paper" volume={0.25} />        {/* the set list slides in */}
      <Sfx at={432} src="strike" volume={0.4} />        {/* "Ye" crossed out */}
      <Sfx at={695} src="whoosh-film" volume={0.3} />   {/* film burn into "not tied" */}
      <Sfx at={778} src="strike" volume={0.35} />       {/* the strings snap */}
      <Sfx at={814} src="glitch-b" volume={0.25} />     {/* glitch into the dice */}
      <Sfx at={902} src="strike" volume={0.35} />       {/* LUCK crossed out */}
      <Sfx at={920} src="pop" volume={0.3} />           {/* TALENT */}
      <Sfx at={952} src="pop" volume={0.3} />           {/* CONSISTENCY */}
      <Sfx at={975} src="glitch-a" volume={0.25} />     {/* invert flash back to the speaker */}
      <Sfx at={1024} src="chime" volume={0.35} />       {/* "due." */}
      <Sfx at={TALK_END} src="pop" volume={0.4} />      {/* end card */}
    </AbsoluteFill>
  );
};
