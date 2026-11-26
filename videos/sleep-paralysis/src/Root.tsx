import { Composition } from "remotion";
import { SleepParalysis, FRAMES } from "./Video";
import { AwakeShot, WAIT_FRAMES } from "./AwakeShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SleepParalysis" component={SleepParalysis} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="AwakeShot" component={AwakeShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
