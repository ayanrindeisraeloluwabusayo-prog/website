import { Composition } from "remotion";
import { TheDress, FRAMES } from "./Video";
import { LightShot, WAIT_FRAMES } from "./LightShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TheDress" component={TheDress} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="LightShot" component={LightShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
