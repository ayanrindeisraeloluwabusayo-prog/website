import { Composition } from "remotion";
import { FRAMES, Game } from "./Game";

export const RemotionRoot: React.FC = () => <Composition id="Game" component={Game} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />;
