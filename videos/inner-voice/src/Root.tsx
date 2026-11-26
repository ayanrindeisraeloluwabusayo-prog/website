import { Composition } from "remotion";
import { InnerVoice, FRAMES } from "./Video";
import { QuietShot, WAIT_FRAMES } from "./QuietShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="InnerVoice" component={InnerVoice} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="QuietShot" component={QuietShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
