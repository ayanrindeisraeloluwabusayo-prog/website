import { Composition } from "remotion";
import { Aphantasia, FRAMES } from "./Video";
import { AppleShot, WAIT_FRAMES } from "./AppleShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Aphantasia" component={Aphantasia} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="AppleShot" component={AppleShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
