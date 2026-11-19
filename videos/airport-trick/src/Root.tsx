import { Composition } from "remotion";
import { WaitShot, WAIT_FRAMES } from "./WaitShot";
import { FRAMES, Airport } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Airport" component={Airport} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="WaitShot" component={WaitShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
  </>
);
