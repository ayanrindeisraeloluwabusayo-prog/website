// The active song's card on the left. It always shows the song whose clip is playing on the right.
// The rank itself is the heading's lead (no small label above it): big rank, title, artist, streams.
import { Img, staticFile, useCurrentFrame } from "remotion";
import type { Song, Timeline } from "./schema";
import { useLayout } from "./layout";
import { activeSegment } from "./timeline";
import { Bar, C, Equalizer, p01, rise, useAccent } from "./ui";

export const NowPlaying: React.FC<{ songs: Song[]; tl: Timeline }> = ({ songs, tl }) => {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const K = useLayout().card;
  const row = K.dir === "row";
  const appear = p01(frame, tl.listStart + 4, 14);
  const seg = activeSegment(tl, frame);
  const finished = frame >= tl.outroStart;
  const song = seg ? songs.find((s) => s.rank === seg.rank) : finished ? songs.find((s) => s.rank === 1) : undefined;
  const since = seg ? frame - seg.start : finished ? frame - tl.outroStart : 0;
  const textX = row ? K.cover + K.gap : 0; // where text bars start inside the card, for the shared shimmer sweep

  return (
    <div
      style={{
        position: "absolute",
        left: K.x,
        top: K.y,
        width: K.w,
        height: K.h,
        opacity: appear,
        display: "flex",
        flexDirection: K.dir === "stack" ? "column" : K.dir,
        alignItems: row ? "center" : "stretch",
        gap: K.gap,
      }}
    >
      {song ? (
        <>
          <Img src={staticFile(song.cover)} style={{ width: K.cover, height: K.cover, borderRadius: 14, boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px", flex: "none", ...rise(since, 0, 10, 12) }} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: row ? "center" : "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, ...rise(since, 2, 12, 12) }}>
                <span style={{ fontSize: K.rank, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: accent, fontVariantNumeric: "tabular-nums" }}>#{song.rank}</span>
                {finished ? null : <Equalizer size={K.rank * 0.42} />}
              </div>
              <div
                style={{
                  fontSize: K.title,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  marginTop: row ? 10 : 18,
                  textWrap: "balance",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  ...rise(since, 4, 12, 12),
                }}
              >
                {song.title}
              </div>
              <div style={{ fontSize: K.artist, color: C.muted, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...rise(since, 6, 10, 12) }}>{song.artist}</div>
            </div>
            {row ? null : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, ...rise(since, 8, 10, 12) }}>
                <span style={{ fontSize: K.streams, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{song.streams}</span>
                <span style={{ fontSize: K.artist * 0.8, color: C.muted }}>streams</span>
              </div>
            )}
          </div>
          {row ? (
            // Wide layout: the stream count takes the card's right side, balancing the cover on the left.
            <div style={{ textAlign: "right", flex: "none", ...rise(since, 8, 10, 12) }}>
              <div style={{ fontSize: K.streams * 1.55, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{song.streams}</div>
              <div style={{ fontSize: K.artist * 0.85, color: C.muted, marginTop: 10 }}>streams</div>
            </div>
          ) : null}
        </>
      ) : (
        // Before #10 starts, the card is a shimmering skeleton of the same shape.
        <>
          <Bar x={0} w={K.cover} h={K.cover} r={14} shimmer rowWidth={K.w} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18, justifyContent: "center" }}>
            <Bar x={textX} w={K.rank * 1.6} h={K.rank * 0.8} shimmer rowWidth={K.w} />
            <Bar x={textX} w={row ? 560 : K.w * 0.9} h={K.title * 0.8} shimmer rowWidth={K.w} />
            <Bar x={textX} w={row ? 320 : K.w * 0.6} h={K.artist * 0.8} shimmer rowWidth={K.w} />
            <Bar x={textX} w={row ? 240 : K.w * 0.5} h={K.streams * 0.8} shimmer rowWidth={K.w} />
          </div>
        </>
      )}
    </div>
  );
};
