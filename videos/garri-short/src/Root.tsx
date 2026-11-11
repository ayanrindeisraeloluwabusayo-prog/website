import { Composition } from "remotion";
import { FILM_FRAMES, GarriFilm } from "./g/Film";
import { Final, FinalSlow, FinalOwn } from "./Final";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={GarriFilm} width={1080} height={1920} fps={30} durationInFrames={FILM_FRAMES} />
    <Composition id="Final" component={Final} width={1080} height={1920} fps={30} durationInFrames={FILM_FRAMES} />
    <Composition id="FinalSlow" component={FinalSlow} width={1080} height={1920} fps={30} durationInFrames={2758} />
    <Composition id="FinalOwn" component={FinalOwn} width={1080} height={1920} fps={30} durationInFrames={2954} />
  </>
);
