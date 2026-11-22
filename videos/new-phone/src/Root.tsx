import { Composition } from "remotion";
import { NoveltyShot, WAIT_FRAMES } from "./NoveltyShot";
import { FRAMES, NewPhone } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NewPhone" component={NewPhone} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="NoveltyShot" component={NoveltyShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
  </>
);
