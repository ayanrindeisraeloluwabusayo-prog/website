// "Why does the journey back home always feel shorter?", about 65 s, Brian's voice, blue explainer edit + 3D.
// Feeling = picture, mechanism = graphic, inside the head = 3D. A new shot about every 2 s.
// Facts: van de Ven, van Rijswijk & Roy (2011), Psychonomic Bulletin & Review 18(5), 827-832 (the return trip
// effect held on a different road of the same length; explained by violated expectations). Ozawa, Fujii &
// Kouzaki (2015), PLOS ONE (the effect appears when people judge the trip afterwards, not during it).
// Pictures: Pixabay (Pixabay Content License); 3D person: Microsoft Rocketbox (MIT). See CREDITS.md.
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";
import { EndCard } from "./graphics3";
import { Hindsight, RoadMap, TimeBars, TwoRoads } from "./graphics5";
import { BACK_AT } from "./TripShot";
import { fr, say, WORDS } from "./speech";

export const FRAMES = 1975;
const END = 1885;
const HEAD_AT = 893;     // the 3D head clip starts on "Here's the trick"

const talking = (f: number) => {
  for (let i = 0; i < WORDS.length; i++) {
    const a = WORDS[i].at, b = i + 1 < WORDS.length ? WORDS[i + 1].at : a + 20;
    if (f >= a - 4 && f < Math.min(b, a + 20) + 4) return true;
  }
  return false;
};
/** Music bed: present in the pauses, tucked under the voice, out at the end. */
const musicLevel = (f: number) => {
  let duck = 0;
  for (let d = -6; d <= 6; d += 2) duck += talking(f + d) ? 1 : 0;
  duck /= 7;
  let v = 0.32 - 0.16 * duck;
  if (f < 12) v *= f / 12;
  if (f > END + 5) v *= Math.max(0, 1 - (f - END - 5) / 85);
  return v;
};

/** Sound effects stay quiet (owner's note: felt, never louder than the voice). */
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.4 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.4} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** A rendered clip that started playing at `at`, shown only between `from` and `to` (so one clip can be cut into). */
const Clip: React.FC<{ src: string; at: number; from: number; to: number }> = ({ src, at, from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <AbsoluteFill>
      <Sequence from={at} layout="none">
        <OffthreadVideo src={staticFile(`media/${src}`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. HOOK: night drive, then the jam that takes forever, then a bored face at a rainy window */}
      <Scene from={0} to={116}>
        <Shot src="j-hook.jpg" from={0} to={49} pos="50% 50%" zoom={[1.18, 1.04]} grade="contrast(1.1)" />
        <Shot src="j-jam.jpg" from={49} to={90} pos="55% 50%" zoom={[1.0, 1.12]} grade="contrast(1.08)" />
        <Shot src="j-rain.jpg" from={90} to={116} pos="65% 50%" zoom={[1.04, 1.1]} grade="contrast(1.05) saturate(0.85)" />
        <Scrim side="top" strength={0.72} />
        <Vignette amount={0.4} />
        <Grain amount={0.2} />
        <Lockup top={250} until={fr(4) - 1} lines={[
          { words: say(0, 1), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(2, 3) },
        ]} />
        <Lockup top={250} lines={[
          { words: say(4, 6), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(7), size: 210 },
        ]} />
      </Scene>

      {/* 2. "Coming back? Gone in a blink.": light streaks rushing past */}
      <Scene from={116} to={195}>
        <Shot src="j-streaks.jpg" from={116} to={195} pos="50% 60%" zoom={[1.0, 1.35]} grade="contrast(1.12) saturate(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={260} until={fr(10) - 1} lines={[
          { words: say(8), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(9) },
        ]} />
        <Lockup top={260} lines={[
          { words: say(10, 12), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(13), size: 230 },
        ]} />
      </Scene>

      {/* 3. "Same road. Same distance." (motion): the road draws itself; out slowly, back fast */}
      <Scene from={195} to={273}>
        <BlueStage glowY={60} />
        <RoadMap from={195} sameAt={fr(14)} distAt={fr(16)} />
        <Grain amount={0.18} />
        <Lockup top={250} until={fr(16) - 1} lines={[
          { words: say(14), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(15) },
        ]} />
        <Lockup top={250} lines={[
          { words: say(16), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(17) },
        ]} />
      </Scene>

      {/* 4. "So what changed?" (picture: a road into fog)  "Not the road. You." (3D: the man on his phone) */}
      <Scene from={273} to={324}>
        <Shot src="j-fog.jpg" from={273} to={324} pos="50% 50%" zoom={[1.02, 1.14]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={280} lines={[
          { words: say(18, 19), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(20) },
        ]} />
      </Scene>
      <Scene from={324} to={391}>
        <Clip src="trip3d_look.mp4" at={322} from={324} to={391} />
        <Grain amount={0.14} />
        <Lockup top={1560} until={fr(24) - 1} lines={[
          { words: say(21, 22), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(23) },
        ]} />
        <Lockup top={1540} lines={[{ kind: "serif", words: say(24), size: 260 }]} />
      </Scene>

      {/* 5. "Most people think it's because you know the way back." (picture: a winding road from above) */}
      <Scene from={391} to={476}>
        <Shot src="j-winding.jpg" from={391} to={476} pos="50% 50%" zoom={[1.2, 1.05]} grade="contrast(1.08)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[
          { words: say(25, 28), align: "flex-start" },
          { words: say(29, 31), align: "flex-start", indent: 80 },
          { words: say(32, 33), align: "flex-start", indent: 160 },
          { kind: "serif", words: say(34) },
        ]} />
      </Scene>

      {/* 6. The 2011 study, on paper */}
      <Scene from={476} to={584}>
        <Paper />
        <StudyPage from={476} highlightAt={fr(41)} journal="PSYCHONOMIC BULLETIN & REVIEW · 2011" title="The return trip effect: Why the return trip often seems to take less time"
          authors="van de Ven, van Rijswijk & Roy" hlHeight={176} />
        <Grain amount={0.12} />
        <Lockup top={240} color="#111" shadow={false} until={fr(37) - 1} lines={[{ words: say(35), align: "flex-start", indent: 80 }, { kind: "serif", words: say(36) }]} />
        <Lockup top={240} color="#111" shadow={false} lines={[
          { words: say(37, 40), align: "flex-start" },
          { kind: "serif", words: say(41, 42) },
        ]} />
      </Scene>

      {/* 7. "They sent people home on a different road. Same length. And the trip home... still felt shorter." */}
      <Scene from={584} to={787}>
        <BlueStage glowY={62} />
        <TwoRoads from={586} secondAt={fr(49)} lengthAt={fr(51)} stampAt={fr(58)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(51) - 1} lines={[
          { words: say(43, 46), align: "flex-start" },
          { words: say(47, 48), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(49, 50) },
        ]} />
        <Lockup top={220} until={fr(53) - 1} lines={[{ kind: "serif", words: say(51, 52) }]} />
        <Lockup top={220} lines={[
          { words: say(53, 56), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(57) },
          { words: say(58, 59), align: "flex-end", indent: 80 },
        ]} />
      </Scene>

      {/* 8. "So it's not the road you know. It's the one you expect." */}
      <Scene from={787} to={893}>
        <Shot src="j-sunset.jpg" from={787} to={842} pos="50% 50%" zoom={[1.0, 1.1]} grade="contrast(1.05)" />
        <Shot src="j-tunnel.jpg" from={842} to={893} pos="50% 50%" zoom={[1.0, 1.25]} grade="contrast(1.08)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={240} until={fr(67) - 1} lines={[
          { words: say(60, 63), align: "flex-start" },
          { words: say(64, 65), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(66) },
        ]} />
        <Lockup top={240} lines={[
          { words: say(67, 70), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(71), size: 220 },
        ]} />
      </Scene>

      {/* 9. THE TRICK (3D): he checks his phone, his head turns to glass; the brain's clock and the bars */}
      <Scene from={HEAD_AT} to={1373}>
        <Clip src="trip3d_head.mp4" at={HEAD_AT} from={HEAD_AT} to={1051} />
        <Shot src="j-cheated.jpg" from={1051} to={1101} pos="50% 50%" zoom={[1.0, 1.1]} grade="contrast(1.12) saturate(0.8)" />
        <Scene from={1051} to={1101}>
          <Scrim side="top" strength={0.6} />
        </Scene>
        <Clip src="trip3d_head.mp4" at={HEAD_AT} from={1101} to={1373} />
        <TimeBars from={HEAD_AT + 96} expAt={fr(86) - 4} actAt={fr(88)} backAt={HEAD_AT + BACK_AT} backExpAt={fr(102)} backActAt={fr(107)} gapAt={fr(113)} until={1051} />
        <TimeBars from={1101} expAt={0} actAt={0} backAt={1101} backExpAt={fr(102)} backActAt={fr(107)} gapAt={fr(113)} />
        <Grain amount={0.14} />
        <Lockup top={170} until={fr(75) - 1} lines={[{ words: say(72, 73), align: "flex-start", indent: 80 }, { kind: "serif", words: say(74) }]} />
        <Lockup top={170} until={fr(87) - 1} lines={[
          { words: say(75, 82), align: "flex-start" },
          { words: say(83, 84), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(85, 86) },
        ]} />
        <Lockup top={170} until={fr(90) - 1} lines={[{ words: say(87, 88), align: "flex-start", indent: 100 }, { kind: "serif", words: say(89) }]} />
        <Lockup top={240} until={fr(94) - 1} lines={[{ words: say(90, 92), align: "flex-start", indent: 60 }, { kind: "serif", words: say(93), size: 220 }]} />
        <Lockup top={170} until={fr(102) - 1} lines={[
          { words: say(94, 98), align: "flex-start" },
          { words: say(99), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(100, 101) },
        ]} />
        <Lockup top={170} until={fr(106) - 1} lines={[{ kind: "serif", words: say(102, 103) }, { words: say(104, 105), align: "flex-end", indent: 100 }]} />
        <Lockup top={170} until={fr(112) - 1} lines={[{ words: say(106, 110), align: "flex-start", indent: 60 }, { kind: "serif", words: say(111) }]} />
        <Lockup top={170} lines={[{ words: say(112, 113), align: "flex-start", indent: 60 }, { kind: "serif", words: say(114, 115) }]} />
      </Scene>

      {/* 10. "But here's the twist." (picture: a giant clock) */}
      <Scene from={1373} to={1412}>
        <Shot src="j-clock.jpg" from={1373} to={1412} pos="70% 50%" zoom={[1.0, 1.12]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[{ words: say(116, 118), align: "flex-start", indent: 80 }, { kind: "serif", words: say(119), size: 240 }]} />
      </Scene>

      {/* 11. The 2015 study, then the hindsight bars */}
      <Scene from={1412} to={1511}>
        <Paper />
        <StudyPage from={1412} highlightAt={fr(123)} journal="PLOS ONE · 2015" title="The return trip is felt shorter only postdictively"
          authors="Ozawa, Fujii & Kouzaki" hlHeight={120} />
        <Grain amount={0.12} />
        <Lockup top={240} color="#111" shadow={false} lines={[
          { words: say(120, 121), align: "flex-start", indent: 60 },
          { words: say(122, 123), align: "flex-start" },
          { words: say(124, 126), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(127) },
        ]} />
      </Scene>
      <Scene from={1511} to={1697}>
        <BlueStage glowY={58} />
        <Hindsight from={1511} sameAt={fr(139)} afterAt={fr(145)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(135) - 1} lines={[{ words: say(128, 130), align: "flex-start", indent: 40 }, { kind: "serif", words: say(131, 134) }]} />
        <Lockup top={220} until={fr(140) - 1} lines={[{ words: say(135, 136), align: "flex-start", indent: 80 }, { kind: "serif", words: say(137, 139) }]} />
        <Lockup top={220} lines={[
          { words: say(140), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(141) },
          { words: say(142, 147), align: "flex-end" },
        ]} />
      </Scene>

      {/* 12. "when you look back." (picture: old photographs)  "So the trip home was never shorter." (picture: a front door) */}
      <Scene from={1697} to={1812}>
        <Shot src="j-photos.jpg" from={1697} to={1744} pos="50% 50%" zoom={[1.05, 1.15]} grade="contrast(1.05) sepia(0.2)" />
        <Shot src="j-door.jpg" from={1744} to={1812} pos="50% 55%" zoom={[1.12, 1.02]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={260} until={fr(152) - 1} lines={[{ words: say(148, 149), align: "flex-start", indent: 80 }, { kind: "serif", words: say(150, 151) }]} />
        <Lockup top={260} lines={[
          { words: say(152, 155), align: "flex-start", indent: 40 },
          { words: say(156), align: "flex-start", indent: 140 },
          { kind: "serif", words: say(157, 158) },
        ]} />
      </Scene>

      {/* 13. "Your memory just tells it that way." (picture: arriving home, a hug) */}
      <Scene from={1812} to={END}>
        <Shot src="j-hug.jpg" from={1812} to={END} pos="60% 45%" zoom={[1.0, 1.1]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.18} />
        <Lockup top={250} lines={[
          { words: say(159), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(160), size: 220 },
          { words: say(161, 165), align: "flex-end", indent: 60 },
        ]} />
      </Scene>

      {/* 14. End card */}
      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {/* transitions */}
      <FilmBurn at={386} />
      <PixelGlitch at={888} />
      <InvertFlash at={1371} />
      <FilmBurn at={1739} />

      {/* sound */}
      <Audio src={staticFile("voice/voice.mp3")} />
      <Audio src={staticFile("music.wav")} volume={(x) => musicLevel(x)} />
      <Sfx at={101} src="whoosh" volume={0.4} />             {/* into the rushing lights */}
      <Sfx at={fr(13)} src="shutter" volume={0.45} />        {/* "blink." */}
      <Sfx at={fr(16) + 4} src="whoosh" volume={0.3} />      {/* the fast trip back along the road */}
      <Sfx at={371} src="whoosh-film" volume={0.4} />        {/* film burn */}
      <Sfx at={476} src="paper" volume={0.35} />             {/* the 2011 study */}
      <Sfx at={fr(41) - 2} src="marker" volume={0.3} />
      <Sfx at={fr(49)} src="spark" volume={0.3} />           {/* the new road draws */}
      <Sfx at={fr(58)} src="drop" volume={0.45} />           {/* STILL SHORTER stamp */}
      <Sfx at={887} src="glitch-b" volume={0.3} />
      <Sfx at={HEAD_AT + 90} src="lamp" volume={0.35} />     {/* the clock lights up inside his head */}
      <Sfx at={fr(89)} src="glitch-a" volume={0.2} />        {/* ACTUAL runs past EXPECTED */}
      <Sfx at={fr(93)} src="subdrop" volume={0.45} />        {/* "cheated." */}
      <Sfx at={fr(100)} src="riser" volume={0.3} />          {/* bracing for a long trip */}
      <Sfx at={fr(113)} src="whoosh" volume={0.35} />        {/* "normal feels fast" */}
      <Sfx at={1370} src="glitch-a" volume={0.3} />          {/* invert flash: the twist */}
      <Sfx at={1412} src="paper" volume={0.3} />             {/* the 2015 study */}
      <Sfx at={fr(123) - 2} src="marker" volume={0.3} />
      <Sfx at={fr(145)} src="spark" volume={0.35} />         {/* the way back shrinks in hindsight */}
      <Sfx at={1724} src="whoosh-film" volume={0.35} />      {/* film burn */}
      <Sfx at={fr(165)} src="chime" volume={0.4} />          {/* "that way." */}
      <Sfx at={END + 2} src="pop" volume={0.4} />            {/* logo lands */}
    </AbsoluteFill>
  );
};
