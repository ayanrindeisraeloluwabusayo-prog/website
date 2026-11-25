import { Composition } from "remotion";
import { ZapShot, WAIT_FRAMES } from "./ZapShot";
import { AloneThoughts, FRAMES } from "./Video";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AloneThoughts" component={AloneThoughts} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="ZapShot" component={ZapShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
