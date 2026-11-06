// Portrait: the player panel under the video. It fills the right column down to the bottom edge and always
// shows the song whose clip is playing: rank, title, artist, a progress bar moving with the clip,
// the stream count, and a still "Next up" row showing the song that comes next.
import { Img, staticFile, useCurrentFrame } from "remotion";
import type { Song, Timeline } from "./schema";
import { useLayout } from "./layout";
import { activeSegment, TRANSITION } from "./timeline";
import { Bar, C, Equalizer, p01, rise, useAccent } from "./ui";

const time = (frames: number) => {
  const s = Math.max(0, Math.floor(frames / 30));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const NowPlayingStack: React.FC<{ songs: Song[]; tl: Timeline }> = ({ songs, tl }) => {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const K = useLayout().card;
  const appear = p01(frame, tl.listStart + 4, 14);
  const seg = activeSegment(tl, frame);
  const finished = frame >= tl.outroStart;
  const doneSeg = finished ? tl.segments[tl.segments.length - 1] : undefined;
  const cur = seg ?? doneSeg;
  const song = cur ? songs.find((s) => s.rank === cur.rank) : undefined;
  const since = seg ? frame - seg.start : finished ? frame - tl.outroStart + 20 : 0;
  const idx = cur ? tl.segments.indexOf(cur) : -1;
  const nextSeg = !finished && idx >= 0 ? tl.segments[idx + 1] : !cur ? tl.segments[0] : undefined;
  const nextSong = nextSeg ? songs.find((s) => s.rank === nextSeg.rank) : undefined;
  // The bar runs over the fully visible part only: 0:00 → 0:07.
  const full = cur ? cur.length - TRANSITION : 1;
  const elapsed = seg ? Math.max(0, frame - seg.start - TRANSITION) : cur ? full : 0;
  const progress = cur ? Math.min(1, elapsed / full) : 0;
  // The next song just sits there, still. It only changes with a soft fade timed with the video's own hand-off.
  const nextShow = nextSeg ? Math.min(seg ? p01(frame, seg.start, 10) : 1, 1 - p01(frame, nextSeg.start - 8, 8)) : 0;

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
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Title block */}
      <div style={{ minHeight: K.rank + K.title * 2.2 + K.artist * 1.4 }}>
        {song ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...rise(since, 0, 10, 12) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: K.rank, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: accent, fontVariantNumeric: "tabular-nums" }}>#{song.rank}</span>
                {finished ? null : <Equalizer size={K.rank * 0.45} />}
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: accent, display: "grid", placeItems: "center" }}>
                <svg viewBox="0 0 24 24" width={32} height={32}>
                  <path d="M5 12.5l4.2 4.2L19 7" stroke="#000" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div
              style={{
                fontSize: K.title,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.06,
                marginTop: 16,
                textWrap: "balance",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                ...rise(since, 2, 12, 12),
              }}
            >
              {song.title}
            </div>
            <div style={{ fontSize: K.artist, color: C.muted, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...rise(since, 4, 10, 12) }}>{song.artist}</div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Bar x={0} w={120} h={K.rank * 0.8} shimmer rowWidth={K.w} />
            <Bar x={0} w={K.w * 0.85} h={K.title * 0.8} shimmer rowWidth={K.w} />
            <Bar x={0} w={K.w * 0.5} h={K.artist * 0.8} shimmer rowWidth={K.w} />
          </div>
        )}
      </div>

      {/* Progress bar, moving with the clip */}
      <div>
        <div style={{ height: 8, borderRadius: 4, backgroundColor: "#4d4d4d", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, backgroundColor: "#fff", borderRadius: 4 }} />
          {cur ? <div style={{ position: "absolute", top: -8, left: `calc(${progress * 100}% - 12px)`, width: 24, height: 24, borderRadius: "50%", backgroundColor: "#fff" }} /> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 24, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
          <span>{time(elapsed)}</span>
          <span>{cur ? time(full) : "0:00"}</span>
        </div>
      </div>

      {/* Stream count */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        {song ? (
          <>
            <span style={{ fontSize: K.streams, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", ...rise(since, 6, 10, 12) }}>{song.streams}</span>
            <span style={{ fontSize: K.artist * 0.85, color: C.muted, ...rise(since, 6, 10, 12) }}>streams</span>
          </>
        ) : (
          <Bar x={0} w={K.w * 0.55} h={K.streams * 0.8} shimmer rowWidth={K.w} />
        )}
      </div>

      {/* Next up: the next song's cover, title and artist, shown still */}
      <div style={{ backgroundColor: C.s1, borderRadius: 18, padding: "20px 22px", minHeight: K.cover + 40 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: C.muted, marginBottom: 14 }}>
          {finished ? "THE FULL TOP 10" : nextSeg ? `NEXT UP · #${nextSeg.rank}` : "LAST SONG"}
        </div>
        {nextSeg && nextSong && !finished ? (
          <div style={{ display: "flex", gap: 18, alignItems: "center", height: K.cover, opacity: nextShow }}>
            <Img src={staticFile(nextSong.cover)} style={{ width: K.cover, height: K.cover, borderRadius: 8, flexShrink: 0, objectFit: "cover" }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nextSong.title}</div>
              <div style={{ fontSize: 22, color: C.muted, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nextSong.artist}</div>
            </div>
          </div>
        ) : (
          <div style={{ height: K.cover, display: "flex", alignItems: "center", fontSize: 28, fontWeight: 700, color: C.muted, lineHeight: 1.3 }}>
            {finished ? "All ten songs, #10 to #1." : "Here comes the No. 1."}
          </div>
        )}
      </div>
    </div>
  );
};
