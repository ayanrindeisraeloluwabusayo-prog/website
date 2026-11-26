import { Composition } from "remotion";
import { FakeSmile, FRAMES } from "./Video";
import { EyeShot, WAIT_FRAMES } from "./EyeShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FakeSmile" component={FakeSmile} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="EyeShot" component={EyeShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
