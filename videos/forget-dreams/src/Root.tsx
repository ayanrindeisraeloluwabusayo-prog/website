import { Composition } from "remotion";
import { DreamShot, WAIT_FRAMES } from "./DreamShot";
import { ForgetDreams, FRAMES } from "./Video";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ForgetDreams" component={ForgetDreams} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="DreamShot" component={DreamShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
