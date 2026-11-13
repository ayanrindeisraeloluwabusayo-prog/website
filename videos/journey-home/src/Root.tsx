import { Composition } from "remotion";
import { FRAMES, Video } from "./Video";
import { HEAD_FRAMES, LOOK_FRAMES, TripHead, TripLook } from "./TripShot";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Journey" component={Video} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="TripLook" component={TripLook} width={1080} height={1920} fps={30} durationInFrames={LOOK_FRAMES} />
    <Composition id="TripHead" component={TripHead} width={1080} height={1920} fps={30} durationInFrames={HEAD_FRAMES} />
  </>
);
