import { Composition } from "remotion";
import { TONY_FRAMES, TonyFilm } from "./tony/Tony";
import { Final } from "./Final";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={TonyFilm} width={1080} height={1920} fps={30} durationInFrames={TONY_FRAMES} />
    <Composition id="Final" component={Final} width={1080} height={1920} fps={30} durationInFrames={TONY_FRAMES} />
  </>
);
