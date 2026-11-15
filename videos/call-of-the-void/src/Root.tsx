import { Composition } from "remotion";
import { ALARM_FRAMES, SAVED_FRAMES, VoidAlarm, VoidSaved } from "./VoidShot";
import { FRAMES, VoidVideo } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Void" component={VoidVideo} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="VoidAlarm" component={VoidAlarm} width={1080} height={1920} fps={30} durationInFrames={ALARM_FRAMES} />
    <Composition id="VoidSaved" component={VoidSaved} width={1080} height={1920} fps={30} durationInFrames={SAVED_FRAMES} />
  </>
);
