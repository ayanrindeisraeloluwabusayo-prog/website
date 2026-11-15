import { Composition } from "remotion";
import { BACK_FRAMES, DoorBack, DoorFile, FILE_FRAMES } from "./DoorShot";
import { Doorway, FRAMES } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Doorway" component={Doorway} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="DoorFile" component={DoorFile} width={1080} height={1920} fps={30} durationInFrames={FILE_FRAMES} />
    <Composition id="DoorBack" component={DoorBack} width={1080} height={1920} fps={30} durationInFrames={BACK_FRAMES} />
  </>
);
