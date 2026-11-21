import { Composition } from "remotion";
import { FRAMES, Game } from "./Game";
import { Shell, SHELL_FRAMES } from "./Shell";
import { Duel, DUEL_FRAMES } from "./Duel";
import { Rhythm, RHYTHM_FRAMES } from "./Rhythm";
import { Escape, ESCAPE_FRAMES } from "./Escape";
import { Whodunit, WHO_FRAMES } from "./Whodunit";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Game" component={Game} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="Shell" component={Shell} width={1080} height={1920} fps={30} durationInFrames={SHELL_FRAMES} />
    <Composition id="Duel" component={Duel} width={1080} height={1920} fps={30} durationInFrames={DUEL_FRAMES} />
    <Composition id="Rhythm" component={Rhythm} width={1080} height={1920} fps={30} durationInFrames={RHYTHM_FRAMES} />
    <Composition id="Escape" component={Escape} width={1080} height={1920} fps={30} durationInFrames={ESCAPE_FRAMES} />
    <Composition id="Whodunit" component={Whodunit} width={1080} height={1920} fps={30} durationInFrames={WHO_FRAMES} />
  </>
);
