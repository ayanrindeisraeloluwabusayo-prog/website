import { Composition } from "remotion";
import { FRAMES, Game } from "./Game";
import { Shell, SHELL_FRAMES } from "./Shell";
import { Duel, DUEL_FRAMES } from "./Duel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Game" component={Game} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="Shell" component={Shell} width={1080} height={1920} fps={30} durationInFrames={SHELL_FRAMES} />
    <Composition id="Duel" component={Duel} width={1080} height={1920} fps={30} durationInFrames={DUEL_FRAMES} />
  </>
);
