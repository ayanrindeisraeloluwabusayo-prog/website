import { Composition } from "remotion";
import { NightOwls, FRAMES } from "./Video";
import { OwlShot, WAIT_FRAMES } from "./OwlShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NightOwls" component={NightOwls} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="OwlShot" component={OwlShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
