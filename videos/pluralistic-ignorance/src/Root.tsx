import { Composition } from "remotion";
import { DoubtShot, SHARE_FRAMES } from "./DoubtShot";
import { FRAMES, Plural } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Plural" component={Plural} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="DoubtShot" component={DoubtShot} width={1080} height={1920} fps={30} durationInFrames={SHARE_FRAMES} />
  </>
);
