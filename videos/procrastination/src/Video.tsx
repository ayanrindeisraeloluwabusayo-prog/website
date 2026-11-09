// "You're not lazy": why we procrastinate, 30 s, in the blue serif explainer style.
// Facts: Sirois & Pychyl, Social and Personality Psychology Compass 7(2), 115-127 (2013): procrastination as
// short-term mood repair. Ersner-Hershfield, Wimmer & Knutson, Social Cognitive and Affective Neuroscience 4(1),
// 85-92 (2009), Stanford: in the scanner, the future self looked less like the self, more like other people.
// Pictures: Art Institute of Chicago (public domain) and Pixabay; see CREDITS.md.
// Text colour rule: white on pictures and blue, black on paper, blue only as an accent.
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueField, FilmBurn, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { ws } from "./type";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";
import { BlueStage, Panel } from "./motion";
import { BlockSplit, ClockCross, MoodGraph, ThreeHeads, Timeline } from "./procrast";

export const FRAMES = 900;

/** Music level: steady, dipping briefly under the big hits so they land clearly. */
const DIPS = [24, 290, 844];
const musicLevel = (f: number) => {
  let v = 0.6;
  for (const d of DIPS) {
    const k = f < d - 3 ? 0 : f < d ? (f - d + 3) / 3 : Math.max(0, 1 - (f - d) / 30);
    v = Math.min(v, 0.6 - 0.3 * k);
  }
  return v * Math.min(1, (900 - f) / 20);
};

/** One sound effect from public/sfx2 (made by make_sfx.py), starting at frame `at`. */
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** Four pictures for 2 frames each before landing (the flash-frame montage). */
const FlashMontage: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= 8) return null;
  const pics = ["1A.jpg", "5A.jpg", "2A.jpg", "6A.jpg"];
  const k = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile(`media/${pics[k]}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: k % 2 ? "url(#duo-blue)" : "grayscale(1) contrast(1.2)" }} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. Hook, picture: a tired man, hand on his face (0-3 s) */}
      <Scene from={0} to={90}>
        <Shot src="1A.jpg" from={0} to={90} pos="28% 50%" zoom={[1.05, 1.14]} grade="contrast(1.1) brightness(0.92)" />
        <Scrim side="bottom" strength={0.75} />
        <Grain amount={0.22} />
        <Lockup
          top={1380}
          lines={[
            { words: ws("You're not", 6, 8), align: "flex-start", indent: 120 },
            { kind: "serif", words: ws("lazy.", 24), size: 300 },
          ]}
        />
      </Scene>

      {/* 2. Graphic: a clock crossed out; then picture: the feeling (3-7.2 s) */}
      <Scene from={90} to={216}>
        <Scene from={90} to={150}>
          <BlueStage glowY={64} />
          <ClockCross from={92} crossAt={122} />
        </Scene>
        <Scene from={150} to={216}>
          <Shot src="2A.jpg" from={150} to={216} pos="50% 30%" zoom={[1.0, 1.1]} grade="contrast(1.1) brightness(0.95)" />
          <Scrim side="top" strength={0.75} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup
          top={300}
          until={150}
          lines={[
            { words: ws("Procrastination isn't", 96, 7) },
            { words: ws("a time problem.", 112, 7) },
          ]}
        />
        <Lockup
          top={260}
          lines={[
            { words: ws("It's a", 154, 6), align: "flex-start", indent: 140 },
            { kind: "serif", words: ws("feeling", 166) },
            { words: ws("problem.", 186), align: "flex-end", indent: 140 },
          ]}
        />
      </Scene>

      {/* 3. Picture: the pile of work; then graphic: your mood dips (7.2-11 s) */}
      <Scene from={216} to={270}>
        <Shot src="3A.jpg" from={216} to={270} pos="50% 50%" zoom={[1.0, 1.12]} grade="contrast(1.1) brightness(0.85)" />
        <Scrim side="top" strength={0.7} />
        <Vignette amount={0.5} />
      </Scene>

      {/* 3-4. The mood graph runs on through "relief" (9-12.7 s) */}
      <Scene from={270} to={382}>
        <BlueStage glowY={66} />
        <Panel from={270} x={50} y={880} w={980} h={820}>
          <span />
        </Panel>
        <MoodGraph keys={[272, 288, 300, 348, 366, 381]} taskAt={284} reliefAt={364} />
      </Scene>

      {/* 4. Picture: scrolling the phone in the dark (12.7-14.3 s) */}
      <Scene from={382} to={430}>
        <Shot src="phone.mp4" video from={382} to={430} zoom={[1.0, 1.06]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
      </Scene>

      <Scene from={216} to={430}>
        <Grain amount={0.2} />
        <Lockup
          top={270}
          until={330}
          lines={[
            { words: ws("The task brings", 222, 7) },
            { words: ws("a small dose of", 246, 6), align: "flex-start", indent: 60 },
            { kind: "serif", words: ws("dread,", 274) },
          ]}
        />
        <Lockup
          top={270}
          lines={[
            { words: ws("so your brain picks", 336, 6) },
            { kind: "serif", words: ws("relief", 360), align: "flex-start", indent: 80 },
            { words: ws("now.", 384), align: "flex-end", indent: 160 },
          ]}
        />
      </Scene>

      {/* 5. Graphic: the task slides to future you; then picture: an old face (14.3-17.7 s) */}
      <Scene from={430} to={530}>
        <Scene from={430} to={492}>
          <BlueStage glowY={64} />
          <Timeline from={432} slideAt={456} />
        </Scene>
        <Scene from={492} to={530}>
          <Shot src="5A.jpg" from={492} to={530} pos="50% 25%" zoom={[1.08, 1.0]} grade="contrast(1.12) brightness(1.05)" />
          <Scrim side="bottom" strength={0.8} />
        </Scene>
        <Grain amount={0.2} />
        <Scene from={430} to={492}>
          <Lockup
            top={280}
            lines={[
              { words: ws("and hands the task to", 436, 6) },
              { kind: "serif", words: ws("future", 470) },
              { words: ws("you.", 486), align: "flex-end", indent: 200 },
            ]}
          />
        </Scene>
        <Scene from={492} to={530}>
          <Lockup
            top={1300}
            lines={[
              { kind: "serif", words: [{ w: "future", at: 470 }] },
              { words: [{ w: "you.", at: 486 }], align: "flex-end", indent: 200 },
            ]}
          />
        </Scene>
      </Scene>

      {/* 6. Picture: the brain scan; then the study page on paper (17.7-21.7 s) */}
      <Scene from={530} to={606}>
        <Shot src="6A.jpg" from={530} to={606} pos="55% 50%" zoom={[1.05, 1.15]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup
          top={240}
          lines={[
            { words: ws("In 2009, Stanford researchers", 536, 6) },
            { kind: "serif", words: ws("scanned", 566) },
            { words: ws("people's brains.", 584, 8), align: "flex-end", indent: 120 },
          ]}
        />
      </Scene>
      <Scene from={606} to={650}>
        <Paper />
        <StudyPage
          from={604}
          highlightAt={616}
          journal="SOCIAL COGNITIVE AND AFFECTIVE NEUROSCIENCE · 2009"
          title="Saving for the future self: neural measures of future self-continuity predict temporal discounting"
          authors="Ersner-Hershfield, Wimmer & Knutson · Stanford University"
        />
        <Grain amount={0.12} />
        <Lockup
          top={320}
          color="#111"
          shadow={false}
          lines={[
            { words: ws("Stanford University,", 608, 6), align: "flex-start", indent: 80 },
            { kind: "serif", words: ws("2009", 618) },
          ]}
        />
      </Scene>

      {/* 7. Graphic: three heads; then picture: a faceless figure (21.7-26.3 s) */}
      <Scene from={650} to={790}>
        <Scene from={650} to={742}>
          <BlueStage glowY={64} />
          <ThreeHeads from={652} morphAt={700} />
        </Scene>
        <Scene from={742} to={790}>
          <Shot src="someone.mp4" video from={742} to={790} zoom={[1.0, 1.06]} grade="contrast(1.05)" />
          <Scrim side="top" strength={0.5} />
        </Scene>
        <Grain amount={0.22} />
        <Lockup
          top={240}
          until={722}
          lines={[
            { words: ws("Picturing their future self", 656, 6) },
            { words: ws("looked more like picturing", 688, 6) },
          ]}
        />
        <Scene from={722} to={790}>
          <Lockup
            top={240}
            lines={[
              { words: ws("looked more like picturing", 0, 0), align: "flex-start", indent: 60 },
              { kind: "serif", words: ws("someone else.", 724, 8), size: 170 },
            ]}
          />
        </Scene>
      </Scene>

      {/* 8. Graphic: the task splits into small steps; then picture: first steps (26.3-28.9 s) */}
      <Scene from={790} to={866}>
        <Scene from={790} to={836}>
          <BlueStage glowY={64} />
          <BlockSplit from={790} splitAt={806} tickAt={824} />
        </Scene>
        <Scene from={836} to={866}>
          <Shot src="8A.jpg" from={836} to={866} pos="58% 50%" zoom={[1.06, 1.0]} grade="contrast(1.05) brightness(0.95)" />
          <Scrim side="top" strength={0.65} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup
          top={260}
          lines={[
            { words: ws("The fix isn't more time.", 796, 5) },
            { words: ws("It's starting", 828, 6), align: "flex-start", indent: 120 },
            { kind: "serif", words: ws("smaller.", 844) },
          ]}
        />
      </Scene>

      {/* 9. Call to action on blue (28.9-30 s) */}
      <Scene from={866} to={900}>
        <BlueField glow={0.5} />
        <Grain amount={0.2} />
        <Lockup
          top={760}
          lines={[
            { words: ws("Follow for more", 868, 3) },
            { kind: "bold", words: ws("mind science", 878), size: 118 },
          ]}
        />
      </Scene>

      {/* transitions */}
      <FilmBurn at={85} />
      <InvertFlash at={269} />
      <PixelGlitch at={524} />
      <FlashMontage at={646} />
      <FilmBurn at={785} />

      {/* sound: effects only where something happens (plan in SOUND.md) */}
      <Audio src={staticFile("music.wav")} volume={(f) => musicLevel(f)} />
      <Sfx at={24} src="stamp" volume={0.6} />           {/* "lazy." lands */}
      <Sfx at={75} src="whoosh-film" volume={0.5} />     {/* film burn into the clock */}
      <Sfx at={92} src="ticks" volume={0.35} />          {/* the clock ticks… */}
      <Sfx at={122} src="strike" volume={0.5} />         {/* …and gets crossed out */}
      <Sfx at={268} src="glitch-a" volume={0.35} />      {/* invert flash */}
      <Sfx at={290} src="subdrop" volume={0.65} />       {/* the mood line drops: dread */}
      <Sfx at={350} src="lift" volume={0.5} />           {/* the mood line jumps: relief */}
      <Sfx at={392} src="tap" volume={0.4} />            {/* thumb on the phone */}
      <Sfx at={456} src="paper" volume={0.35} />         {/* the task card slides along */}
      <Sfx at={478} src="pop" volume={0.35} />           {/* …and lands on future you */}
      <Sfx at={523} src="glitch-b" volume={0.3} />       {/* pixel glitch into the scan */}
      <Sfx at={604} src="paper" volume={0.3} />          {/* the study page slides in */}
      <Sfx at={616} src="marker" volume={0.35} />        {/* highlighter */}
      <Sfx at={646} src="shutter" volume={0.45} />       {/* flash frames */}
      <Sfx at={700} src="eerie" volume={0.45} />         {/* future you turns into someone else */}
      <Sfx at={775} src="whoosh-film" volume={0.45} />   {/* film burn into the fix */}
      <Sfx at={806} src="pop" volume={0.35} />           {/* the block splits */}
      <Sfx at={824} src="tap" volume={0.45} />           {/* first step ticked */}
      <Sfx at={844} src="chime" volume={0.4} />          {/* "smaller." rings out */}
      <Sfx at={866} src="pop" volume={0.45} />           {/* end card lands */}
    </AbsoluteFill>
  );
};
