import { Composition } from "remotion";
import { MagnetShot, WAIT_FRAMES } from "./MagnetShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";
import { FRAMES, Mosquito } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Mosquito" component={Mosquito} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="MagnetShot" component={MagnetShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
