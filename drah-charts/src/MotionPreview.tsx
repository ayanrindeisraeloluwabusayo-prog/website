// Preview only: the seven list-row motion styles side by side, all at the same moment of the video
// (song #6 arriving and playing, then #5 arriving). Not part of the final video.
import { AbsoluteFill, Sequence } from "remotion";
import type { MainProps } from "./schema";
import { buildTimeline } from "./timeline";
import { LAYOUTS, LayoutCtx } from "./layout";
import { RankingList } from "./RankingList";
import type { RowMotion } from "./rowMotion";
import { AccentCtx, C, FONT } from "./ui";

const OPTIONS: { id: RowMotion; name: string; note: string }[] = [
  { id: "breathe", name: "1 · Breathe", note: "Cover swells and settles" },
  { id: "beat", name: "2 · Beat bounce", note: "Pops in, presses on the beat" },
  { id: "vinyl", name: "3 · Vinyl", note: "Record slides out and spins" },
  { id: "flip", name: "4 · Card flip", note: "Flips in, sways in 3D" },
  { id: "shine", name: "5 · Shine", note: "Light sweeps across" },
  { id: "cascade", name: "6 · Cascade + count", note: "Words rise, streams count up" },
  { id: "float", name: "7 · Float wave", note: "Rows drift in a slow wave" },
];
const SAMPLE_STREAMS = ["612.4M", "498.1M", "455.7M", "401.2M", "377.9M", "342.5M", "318.0M", "296.3M", "271.8M", "250.6M"];
const S = 0.55;
const L = LAYOUTS.portrait.list;
const COL_W = (L.colW + 64) * S;
const COL_H = (L.rowH * 10 + 20) * S;

export const MotionPreview: React.FC<MainProps> = (props) => {
  const songs = props.songs.map((s) => ({ ...s, streams: SAMPLE_STREAMS[s.rank - 1] }));
  const tl = buildTimeline(props, {});
  const six = tl.segments.find((s) => s.rank === 6)!;
  const offset = six.start - 20;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0b", fontFamily: FONT, color: C.text, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}>
      {OPTIONS.map((o) => (
        <div key={o.id} style={{ width: COL_W }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{o.name}</div>
          <div style={{ fontSize: 15, color: C.muted, margin: "2px 0 10px" }}>{o.note}</div>
          <div style={{ width: COL_W, height: COL_H, overflow: "hidden", position: "relative", backgroundColor: C.bg, borderRadius: 12 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, scale: String(S), transformOrigin: "0 0", translate: `${-(L.x - 30) * S}px ${-(L.y - 12) * S}px` }}>
              <LayoutCtx.Provider value={LAYOUTS.portrait}>
                <AccentCtx.Provider value={props.accent}>
                  <Sequence from={-offset} layout="none">
                    <RankingList songs={songs} tl={tl} motion={o.id} />
                  </Sequence>
                </AccentCtx.Provider>
              </LayoutCtx.Provider>
            </div>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
