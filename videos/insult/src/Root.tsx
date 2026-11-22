import { Composition } from "remotion";
import { InsultShot, WAIT_FRAMES } from "./InsultShot";
import { FRAMES, Insult } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Insult" component={Insult} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="InsultShot" component={InsultShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
  </>
);
