import { Composition } from "remotion";
import { FRAMES, Video } from "./Video";
import { BODY_FRAMES, BodyTest } from "./Body3D";
import { AvatarLook, CAST, Casting } from "./Avatar";
import { GripCheck } from "./Grip";
import { AvatarShot, HEAD_A, HEAD_B, HeadShot, SHOT_FRAMES } from "./AvatarShot";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OwnVoice" component={Video} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="BodyTest" component={BodyTest} width={1080} height={1920} fps={30} durationInFrames={BODY_FRAMES} />
    <Composition id="AvatarLook" component={AvatarLook} width={1080} height={1920} fps={30} durationInFrames={30} />
    <Composition id="AvatarShot" component={AvatarShot} width={1080} height={1920} fps={30} durationInFrames={SHOT_FRAMES} />
    <Composition id="Casting" component={Casting} width={1080} height={1920} fps={30} durationInFrames={CAST.length * 2} />
    <Composition id="GripCheck" component={GripCheck} width={1080} height={1920} fps={30} durationInFrames={6} />
    <Composition id="HeadShot" component={HeadShot} width={1080} height={1920} fps={30} durationInFrames={HEAD_A + HEAD_B} />
  </>
);
