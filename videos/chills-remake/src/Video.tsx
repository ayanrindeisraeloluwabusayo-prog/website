// "Why a song gives you chills", remade: 56 s, Brian's voice, in the blue serif explainer style.
// Rule of the edit: a feeling gets a picture, a mechanism gets a motion graphic, and a new shot about every 2 s.
// Facts: Salimpoor et al., Nature Neuroscience 14, 257-262 (2011), McGill University, Montreal (PET scans:
// dopamine in the caudate during anticipation, in the nucleus accumbens at the peak).
// Sachs, Ellis, Schlaug & Loui, Social Cognitive and Affective Neuroscience 11(6), 884-891 (2016): people who
// get chills have more white-matter connections from the auditory cortex to areas that process emotion.
// Pictures: public domain and Pixabay (Pixabay Content License); see CREDITS.md.
// Text colour rule: white on pictures and blue, black on paper. Every word appears as Brian says it (speech.ts).
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { LineHead, Regions, Rising, StippleHead, StudyPage } from "./art";
import { BeforeGraph, BlueStage, Molecule, Panel } from "./motion";
import { BlueField, FilmBurn, Grain, InvertFlash, p, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";
import { Connections, EndCard, Playlist, RewardCards } from "./graphics3";
import { fr, say, WORDS } from "./speech";

export const FRAMES = 1690;

/** Brian is talking at frame f (a word started less than ~0.6 s ago and the next one follows soon). */
const talking = (f: number) => {
  for (let i = 0; i < WORDS.length; i++) {
    const a = WORDS[i].at, b = i + 1 < WORDS.length ? WORDS[i + 1].at : a + 20;
    if (f >= a - 4 && f < Math.min(b, a + 20) + 4) return true;
  }
  return false;
};
/** Music bed: present in the pauses, tucked under the voice, gently up through the build, out at the end. */
const musicLevel = (f: number) => {
  let duck = 0;
  for (let d = -6; d <= 6; d += 2) duck += talking(f + d) ? 1 : 0;
  duck /= 7;
  let v = 0.32 - 0.16 * duck;
  if (f >= 840 && f < 1019) v += 0.08 * ((f - 840) / 179);
  if (f < 12) v *= f / 12;
  if (f > 1600) v *= Math.max(0, 1 - (f - 1600) / 90);
  return v;
};

/** One designed sound effect from public/sfx2, at ~70% of the levels used in the silent version. */
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.4 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.7} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. HOOK (picture): someone lost in a song, then skin rising in goosebumps */}
      <Scene from={0} to={92}>
        <Shot src="n-listen.jpg" from={0} to={55} pos="50% 35%" zoom={[1.12, 1.02]} grade="contrast(1.1) saturate(0.85)" />
        <Shot src="1E.jpg" from={55} to={92} pos="50% 50%" zoom={[1.0, 1.12]} duo="blue" grade="contrast(1.2)" />
        <Scrim side="top" strength={0.7} />
        <Vignette amount={0.45} />
        <Grain amount={0.22} />
        <Lockup top={260} lines={[
          { words: say(0, 5), align: "flex-start" },
          { words: say(6, 7), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(8), size: 168 },
        ]} />
      </Scene>

      {/* 2. "Not just any song. That one song." (motion): a playlist scrolls, one row lifts out */}
      <Scene from={92} to={182}>
        <BlueStage glowY={62} />
        <Playlist from={92} pickAt={fr(14)} />
        <Grain amount={0.18} />
        <Lockup top={260} until={fr(13) - 1} lines={[
          { words: say(9, 10), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(11, 12) },
        ]} />
        <Lockup top={260} lines={[
          { words: say(13), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(14) },
          { words: say(15), align: "flex-end", indent: 120 },
        ]} />
      </Scene>

      {/* 3. "you know exactly what's coming" (picture), "and your skin still reacts" (motion: grain head blows) */}
      <Scene from={182} to={308}>
        <Shot src="n-listen2.jpg" from={182} to={251} pos="50% 40%" zoom={[1.02, 1.12]} grade="contrast(1.08) saturate(0.85)" />
        <Scene from={182} to={251}>
          <Scrim side="top" strength={0.7} />
        </Scene>
        <Scene from={251} to={308}>
          <BlueStage glowY={55} />
          <StippleHead from={240} y={860} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup top={250} until={fr(24) - 1} lines={[
          { words: say(16, 20), align: "flex-start" },
          { kind: "serif", words: say(21) },
          { words: say(22, 23), align: "flex-end" },
        ]} />
        <Lockup top={250} lines={[
          { words: say(24, 27), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(28) },
        ]} />
      </Scene>

      {/* 4. "It isn't magic" (picture: the alchemist). "It's chemistry" (motion: dopamine molecule) */}
      <Scene from={308} to={386}>
        <Shot src="2A.jpg" from={308} to={338} pos="50% 70%" zoom={[1.05, 1.12]} grade="brightness(0.95) contrast(1.1) saturate(0.9)" />
        <Scene from={308} to={338}>
          <Scrim side="top" strength={0.65} />
        </Scene>
        <Scene from={338} to={386}>
          <BlueStage />
          <Molecule from={340} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup top={300} until={fr(32) - 1} lines={[
          { words: say(29, 30), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(31) },
        ]} />
        <Lockup top={300} lines={[
          { words: say(32), align: "flex-start", indent: 120 },
          { kind: "bold", words: say(33) },
        ]} />
      </Scene>

      {/* 5. The 2011 study: a brain scan (picture), then the real paper with the highlighter (on paper) */}
      <Scene from={386} to={458}>
        <Shot src="6E.jpg" from={386} to={458} pos="55% 50%" zoom={[1.04, 1.15]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.72} />
        <Grain amount={0.2} />
        <Lockup top={250} lines={[
          { words: say(34, 36), align: "flex-start" },
          { kind: "serif", words: say(37, 38), align: "flex-end" },
        ]} />
      </Scene>
      <Scene from={458} to={572}>
        <Paper />
        <StudyPage from={458} highlightAt={fr(51)} />
        <Grain amount={0.12} />
        <Lockup top={250} color="#111" shadow={false} until={fr(42) - 1} lines={[
          { kind: "serif", words: say(39) },
          { words: say(40, 41), align: "flex-end", indent: 60 },
        ]} />
        <Lockup top={250} color="#111" shadow={false} lines={[
          { words: say(42, 44), align: "flex-start", indent: 40 },
          { words: say(45, 50), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(51) },
        ]} />
      </Scene>

      {/* 6. "They found dopamine." (motion): the line head fills with rising gold lights */}
      <Scene from={572} to={620}>
        <BlueStage glowY={62} />
        <LineHead draw={p(f, 572, 14)} brain={p(f, 580, 12)} y={760} />
        <Rising from={585} />
        <Grain amount={0.22} />
        <Lockup top={250} lines={[
          { words: say(52, 53), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(54) },
        ]} />
      </Scene>

      {/* 7. "the same chemical your brain releases" (picture: a gold burst), "for food, for love, for winning" (cards) */}
      <Scene from={620} to={783}>
        <Shot src="firework.mp4" video from={620} to={681} zoom={[1.0, 1.1]} grade="brightness(0.85)" />
        <Scene from={620} to={681}>
          <Scrim side="top" strength={0.8} />
        </Scene>
        <Scene from={681} to={783}>
          <BlueStage glowY={64} />
          <RewardCards at={[fr(62), fr(64), fr(66)]} srcs={["n-food.jpg", "n-love.jpg", "n-win.jpg"]} labels={["FOOD", "LOVE", "WINNING"]} />
        </Scene>
        <Vignette amount={0.45} />
        <Grain amount={0.22} />
        <Lockup top={240} until={fr(61) - 1} lines={[
          { words: say(55, 57), align: "flex-start" },
          { words: say(58, 59), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(60) },
        ]} />
        <Lockup top={240} until={fr(63) - 1} lines={[{ words: say(61), align: "flex-start", indent: 80 }, { kind: "serif", words: say(62) }]} />
        <Lockup top={240} until={fr(65) - 1} lines={[{ words: say(63), align: "flex-start", indent: 80 }, { kind: "serif", words: say(64) }]} />
        <Lockup top={240} lines={[{ words: say(65), align: "flex-start", indent: 80 }, { kind: "serif", words: say(66) }]} />
      </Scene>

      {/* 8. "But here's the strange part." (picture: a diver frozen mid-air) */}
      <Scene from={783} to={837}>
        <Shot src="5E.jpg" from={783} to={837} pos="50% 50%" zoom={[1.0, 1.1]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[
          { words: say(67, 69), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(70) },
          { words: say(71), align: "flex-end", indent: 120 },
        ]} />
      </Scene>

      {/* 9. "didn't wait... started before it" (motion: the graph), "while the music was still building" (picture: the sea) */}
      <Scene from={837} to={1019}>
        <Scene from={837} to={958}>
          <BlueStage glowY={65} />
          <Panel from={837} x={50} y={880} w={980} h={820}>
            <span />
          </Panel>
          <BeforeGraph from={842} mark="the peak" dur={84} />
        </Scene>
        <Shot src="sea.mp4" video from={958} to={1019} zoom={[1.0, 1.18]} grade="contrast(1.08)" />
        <Scene from={958} to={1019}>
          <Scrim side="top" strength={0.7} />
          <Vignette amount={0.45} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup top={220} until={fr(80) - 1} lines={[
          { words: say(72, 74), align: "flex-start" },
          { kind: "serif", words: say(75) },
          { words: say(76, 79), align: "flex-end" },
        ]} />
        <Lockup top={220} until={fr(84) - 1} lines={[
          { words: say(80, 81), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(82), size: 240 },
          { words: say(83), align: "flex-end", indent: 160 },
        ]} />
        <Lockup top={240} lines={[
          { words: say(84, 88), align: "flex-start" },
          { kind: "serif", words: say(89) },
        ]} />
      </Scene>

      {/* 10. "Your brain was predicting the peak" (motion: two regions), "and paying you for the wait" (picture) */}
      <Scene from={1019} to={1128}>
        <Scene from={1019} to={1080}>
          <BlueStage glowY={60} />
          <LineHead draw={p(f, 1019, 14)} brain={p(f, 1026, 12)} />
          <Regions a={fr(93)} b={fr(95)} la="caudate · predicting" lb="nucleus accumbens · the peak" />
        </Scene>
        <Shot src="4A.jpg" from={1080} to={1128} pos="50% 50%" zoom={[1.02, 1.12]} grade="contrast(1.1)" />
        <Scene from={1080} to={1128}>
          <Scrim side="top" strength={0.65} />
        </Scene>
        <Grain amount={0.22} />
        <Lockup top={230} until={fr(96) - 1} lines={[
          { words: say(90, 92), align: "flex-start" },
          { kind: "serif", words: say(93) },
          { words: say(94, 95), align: "flex-end", indent: 80 },
        ]} />
        <Lockup top={250} lines={[
          { words: say(96, 98), align: "flex-start", indent: 40 },
          { words: say(99, 100), align: "flex-start", indent: 200 },
          { kind: "serif", words: say(101) },
        ]} />
      </Scene>

      {/* 11. "And not everyone feels it." (picture: a crowd) */}
      <Scene from={1128} to={1182}>
        <Shot src="n-crowd.jpg" from={1128} to={1182} pos="50% 50%" zoom={[1.12, 1.02]} grade="contrast(1.1) saturate(0.8)" />
        <Scrim side="top" strength={0.65} />
        <Grain amount={0.2} />
        <Lockup top={270} lines={[
          { words: say(102, 103), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(104) },
          { words: say(105, 106), align: "flex-end", indent: 100 },
        ]} />
      </Scene>

      {/* 12. The 2016 study (paper), brain cells (picture), then hears -> feels connections (motion) */}
      <Scene from={1182} to={1268}>
        <Paper />
        <StudyPage from={1182} highlightAt={fr(115)} journal="SOCIAL COGNITIVE AND AFFECTIVE NEUROSCIENCE · 2016"
          title="Brain connectivity reflects human aesthetic responses to music" authors="Sachs, Ellis, Schlaug & Loui" hlHeight={120} />
        <Grain amount={0.12} />
        <Lockup top={240} color="#111" shadow={false} lines={[
          { words: say(107, 110), align: "flex-start" },
          { words: say(111, 114), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(115) },
        ]} />
      </Scene>
      <Scene from={1268} to={1427}>
        <Shot src="neurons.mp4" video from={1268} to={1309} zoom={[1.0, 1.1]} grade="contrast(1.1)" />
        <Scene from={1268} to={1309}>
          <Scrim side="top" strength={0.65} />
        </Scene>
        <Scene from={1309} to={1427}>
          <BlueStage glowY={62} />
          <LineHead draw={p(f, 1309, 14)} brain={p(f, 1316, 12)} />
          <Connections hearsAt={fr(126)} linesAt={fr(127) - 4} feelsAt={fr(131)} />
        </Scene>
        <Grain amount={0.22} />
        <Lockup top={260} until={fr(119) - 1} lines={[
          { words: say(116, 117), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(118), size: 190 },
        ]} />
        <Lockup top={230} until={fr(127) - 1} lines={[
          { words: say(119, 122), align: "flex-start" },
          { words: say(123, 125), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(126) },
        ]} />
        <Lockup top={230} lines={[
          { words: say(127, 130), align: "flex-start" },
          { kind: "serif", words: say(131) },
        ]} />
      </Scene>

      {/* 13. "So the next time a song stops you in your tracks," (picture: a woman standing still in a crowd) */}
      <Scene from={1427} to={1511}>
        <Shot src="n-tracks.jpg" from={1427} to={1511} pos="50% 45%" zoom={[1.02, 1.16]} grade="contrast(1.08) saturate(0.8)" />
        <Scrim side="top" strength={0.7} />
        <Vignette amount={0.4} />
        <Grain amount={0.2} />
        <Lockup top={250} lines={[
          { words: say(132, 135), align: "flex-start" },
          { words: say(136, 138), align: "flex-start", indent: 60 },
          { words: say(139, 141), align: "flex-start", indent: 160 },
          { kind: "serif", words: say(142) },
        ]} />
      </Scene>

      {/* 14. "that's your brain, enjoying the wait." (pictures: the Wanderer, then arms up above the clouds) */}
      <Scene from={1511} to={1597}>
        <Shot src="8A.jpg" from={1511} to={1545} pos="50% 30%" zoom={[1.0, 1.06]} grade="contrast(1.05)" />
        <Shot src="8E.jpg" from={1545} to={1597} pos="50% 50%" zoom={[1.15, 1.04]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.18} />
        <Lockup top={260} lines={[
          { words: say(143, 145), align: "flex-start", indent: 40 },
          { words: say(146, 147), align: "flex-start", indent: 180 },
          { kind: "serif", words: say(148), size: 230 },
        ]} />
      </Scene>

      {/* 15. End card: the channel's logo lands, the name wipes in */}
      <Scene from={1597} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={1599} />
        <Grain amount={0.18} />
      </Scene>

      {/* transitions: about one stylised cut in four */}
      <FilmBurn at={303} />
      <InvertFlash at={780} />
      <PixelGlitch at={1125} />
      <FilmBurn at={1422} />

      {/* sound: voice on top, a soft original music bed under it, and effects only where something happens.
          Whooshes start 15 frames before their cut so the peak lands on it. */}
      <Audio src={staticFile("voice/voice.mp3")} />
      <Audio src={staticFile("music.wav")} volume={(fr_) => musicLevel(fr_)} />
      <Sfx at={fr(8) - 2} src="shiver" volume={0.45} />     {/* goosebumps: cold breath and shimmer */}
      <Sfx at={fr(14)} src="pop" volume={0.35} />           {/* the song is picked */}
      <Sfx at={256} src="shiver" volume={0.3} />            {/* the skin reacts: the grain head blows away */}
      <Sfx at={288} src="whoosh-film" volume={0.5} />       {/* film burn into the alchemist */}
      <Sfx at={340} src="spark" volume={0.3} />             {/* the molecule draws itself */}
      <Sfx at={458} src="paper" volume={0.35} />            {/* the study slides in */}
      <Sfx at={fr(51) - 2} src="marker" volume={0.35} />    {/* highlighter across the title */}
      <Sfx at={585} src="spark" volume={0.35} />            {/* dopamine: lights rise */}
      <Sfx at={621} src="firework" volume={0.5} />          {/* the gold burst */}
      <Sfx at={fr(62)} src="pop" volume={0.3} />            {/* FOOD card */}
      <Sfx at={fr(64)} src="pop" volume={0.3} />            {/* LOVE card */}
      <Sfx at={fr(66)} src="pop" volume={0.35} />           {/* WINNING card */}
      <Sfx at={779} src="glitch-a" volume={0.3} />          {/* invert flash */}
      <Sfx at={fr(70)} src="subdrop" volume={0.6} />        {/* "strange": the floor drops */}
      <Sfx at={840} src="paper" volume={0.25} />            {/* graph panel rises */}
      <Sfx at={958} src="riser" volume={0.35} />            {/* "still building" climbs, ends on the cut */}
      <Sfx at={fr(93)} src="spark" volume={0.35} />         {/* predicting: first region */}
      <Sfx at={fr(95)} src="lamp" volume={0.4} />           {/* the peak: second region */}
      <Sfx at={fr(101)} src="chime" volume={0.25} />        {/* "the wait." paid */}
      <Sfx at={1124} src="glitch-b" volume={0.3} />         {/* pixel glitch into the crowd */}
      <Sfx at={1182} src="paper" volume={0.3} />            {/* the 2016 study */}
      <Sfx at={fr(115) - 2} src="marker" volume={0.3} />    {/* highlighter */}
      <Sfx at={fr(126)} src="spark" volume={0.3} />         {/* HEARS lights */}
      <Sfx at={fr(131)} src="lamp" volume={0.4} />          {/* FEELS lights */}
      <Sfx at={1407} src="whoosh-film" volume={0.45} />     {/* film burn into the last picture */}
      <Sfx at={fr(148)} src="chime" volume={0.4} />         {/* "the wait." rings out */}
      <Sfx at={1599} src="pop" volume={0.4} />              {/* logo lands */}
    </AbsoluteFill>
  );
};
