// Display 2: the top 10, in one column (portrait) or two columns of five (landscape). Rank numbers never move.
// Each row waits as a still skeleton, shimmers while the song before it plays,
// fills in when its own clip starts, and stays filled.
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Segment, Song, Timeline } from "./schema";
import { useLayout } from "./layout";
import { rowState, type RowState } from "./timeline";
import { countUp, hasCascade, rowMotion, type RowMotion } from "./rowMotion";
import { Bar, C, Equalizer, p01, textWidth, useAccent } from "./ui";

// The playing song's sticker (cover, vinyl, title, artist, streams) pops out toward the viewer, in place:
// a punchy zoom with one overshoot and a forward tilt, held while the song plays, then it sinks back as the
// next one pops. The rank number never moves or resizes. Other rows dim while one is out.
const POP_IN = 16; // frames
const POP_OUT = 12;
const POP_SCALE = 0.1; // the playing sticker is 10% bigger than the rest
const POP_PEAK = 1 + POP_SCALE * 1.3; // the overshoot's highest point
const STICKER_PAD_L = 6;
const STICKER_PAD_R = 16;
const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);
const SINK = Easing.bezier(0.77, 0, 0.175, 1);
const popOf = (seg: Segment, frame: number) => {
  if (frame < seg.start) return { amount: 0, rise: 0 };
  const rise = interpolate(frame, [seg.start, seg.start + POP_IN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OVERSHOOT });
  const sink = interpolate(frame, [seg.start + seg.length, seg.start + seg.length + POP_OUT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: SINK });
  const tilt = interpolate(frame, [seg.start, seg.start + POP_IN], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { amount: rise * (1 - sink), rise: tilt * (1 - sink) };
};

const Row: React.FC<{ song: Song; tl: Timeline; order: number; motion: RowMotion }> = ({ song, tl, order, motion }) => {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const L = useLayout().list;
  const col = L.cols === 2 && song.rank > 5 ? 1 : 0;
  const line = L.cols === 2 ? (song.rank - 1) % 5 : song.rank - 1;
  const state: RowState = rowState(tl, song.rank, frame);
  const seg = tl.segments.find((s) => s.rank === song.rank)!;
  const appear = p01(frame, tl.listStart + order * 2, 14); // appears once, then holds still
  const filled = state === "active" || state === "done";
  const fill = filled ? p01(frame, seg.start, 10) : 0;
  const isActive = state === "active";
  const glow = isActive ? p01(frame, seg.start, 8) * (1 - p01(frame, seg.start + seg.length - 8, 8)) : 0;
  const pop = L.cols === 1 ? popOf(seg, frame) : { amount: 0, rise: 0 };
  const lift = Math.max(0, Math.min(1, pop.amount));
  // How much another row is popped out right now, to dim this one.
  const others = L.cols === 1 ? Math.max(0, ...tl.segments.filter((s) => s.rank !== song.rank).map((s) => Math.min(1, popOf(s, frame).amount))) : 0;
  const dim = 1 - 0.38 * others * (1 - lift);
  const numW = L.rank * 1.5;
  // Widest the sticker may be so that, popped and at the top of its bounce, it stays left of the video panel.
  const panelX = useLayout().panel.x;
  const stickerMax = Math.floor((panelX - 14 - (L.x + numW + 16)) / POP_PEAK) + STICKER_PAD_L;
  const pad = 14;
  const coverX = pad + numW + 16;
  const textX = coverX + L.cover + 16;
  const shimmer = state === "loading";
  const since = frame - seg.start;
  const mv = rowMotion({
    motion,
    frame,
    since,
    active: isActive,
    filled,
    playLength: seg.length,
    sinceEnd: frame - (seg.start + seg.length),
    rank: song.rank,
    cover: L.cover,
  });
  const words = song.title.split(" ");
  // Fit long names in the sticker (measured at its narrowest, with the record slid out) instead of cutting them:
  // a long single word shrinks the title a little; a one-line title leaves room for the artist to use two lines.
  const textRoom = stickerMax - STICKER_PAD_L - STICKER_PAD_R - L.cover - 14 - 4 - (motion === "vinyl" || motion === "vinyl-cascade" ? L.cover * 0.4 : 0);
  const longestWord = Math.max(...words.map((w) => textWidth(w, L.title, 700)));
  const wordFit = Math.max(L.title * 0.72, Math.min(L.title, Math.floor((L.title * textRoom) / longestWord)));
  // If the artist needs two lines and a slightly smaller title (down to 75%) fits on one line, use that.
  const artistLong = textWidth(song.artist, L.artist, 400) > textRoom;
  const oneLine = Math.floor((L.title * textRoom) / textWidth(song.title, L.title, 700));
  const titleSize = artistLong && oneLine < wordFit && oneLine >= L.title * 0.75 ? oneLine : wordFit;
  const titleLines = textWidth(song.title, titleSize, 700) > textRoom ? 2 : 1;
  const artistLines = titleLines === 1 ? 2 : 1;
  const streamsShown = hasCascade(motion) ? countUp(song.streams, p01(frame, seg.start + 6, 30)) : song.streams;

  return (
    <div
      style={{
        position: "absolute",
        left: L.x - pad + col * (L.colW + L.colGap),
        top: L.y + line * L.rowH,
        width: L.colW + pad * 2,
        height: L.rowH - 10,
        padding: `0 ${pad}px`,
        borderRadius: 14,
        // The row's own highlight gives way to the sticker's card as it pops out.
        backgroundColor: `rgba(42,42,42,${glow * (1 - lift)})`,
        zIndex: lift > 0.01 ? 5 : 1,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: appear * dim,
      }}
    >
      <div style={{ width: numW, textAlign: "center", fontSize: L.rank, fontWeight: 800, color: isActive ? accent : filled ? C.text : C.dim, fontVariantNumeric: "tabular-nums", flex: "none" }}>
        {song.rank}
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          height: L.cols === 1 ? L.rowH - 24 : L.cover,
          transform: pop.amount !== 0 ? `perspective(900px) rotateX(${pop.rise * 9}deg) scale(${1 + POP_SCALE * pop.amount})` : undefined,
          transformOrigin: "0% 50%", // grows rightward only, away from the rank number
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 16, opacity: 1 - fill }}>
          <Bar x={coverX} w={L.cover} h={L.cover} shimmer={shimmer} rowWidth={L.colW} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <Bar x={textX} w={(L.colW - textX) * 0.62} h={L.title * 0.62} shimmer={shimmer} rowWidth={L.colW} />
            <Bar x={textX} w={(L.colW - textX) * 0.4} h={L.artist * 0.62} shimmer={shimmer} rowWidth={L.colW} />
            {L.cols === 1 ? <Bar x={textX} w={(L.colW - textX) * 0.32} h={L.streams * 0.62} shimmer={shimmer} rowWidth={L.colW} /> : null}
          </div>
        </div>
        {filled ? (
          // The sticker: as wide as its content needs (never wider than the list column allows, even at the
          // top of the pop's bounce), on a slim rounded card while it is popped out.
          <div
            style={{
              position: "absolute",
              left: -STICKER_PAD_L,
              top: -8,
              bottom: -8,
              width: "fit-content",
              maxWidth: stickerMax,
              padding: `8px ${STICKER_PAD_R}px 8px ${STICKER_PAD_L}px`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderRadius: 24,
              backgroundColor: lift > 0.01 ? `rgba(50,50,50,${0.96 * lift})` : undefined,
              border: lift > 0.01 ? `1px solid rgba(255,255,255,${0.08 * lift})` : "1px solid transparent",
              boxShadow: lift > 0.01 ? `rgba(0,0,0,${0.5 * lift}) 0px ${14 * lift}px ${30 * lift}px` : undefined,
              opacity: fill,
              translate: `${interpolate(fill, [0, 1], [8, 0])}px 0px`,
            }}
          >
            {mv.progress !== undefined && L.cols === 1 ? (
              // A thin line along the bottom of the sticker, filling over the song's 7 seconds.
              <div style={{ position: "absolute", left: STICKER_PAD_L + 2, right: STICKER_PAD_R, bottom: 6, height: 3, borderRadius: 2, backgroundColor: "#3a3a3a" }}>
                <div style={{ width: `${mv.progress * 100}%`, height: "100%", borderRadius: 2, backgroundColor: accent }} />
              </div>
            ) : null}
            <div style={{ position: "relative", width: L.cover, height: L.cover, flex: "none" }}>
              {mv.vinyl && mv.vinyl.out > 0 ? (
                // A record sliding out from behind the sleeve, spinning while the song plays.
                <div
                  style={{
                    position: "absolute",
                    top: L.cover * 0.04,
                    left: mv.vinyl.out * L.cover * 0.42,
                    width: L.cover * 0.92,
                    height: L.cover * 0.92,
                    borderRadius: "50%",
                    background: "repeating-radial-gradient(circle, #1b1b1b 0 2px, #3a3a3a 2px 3px, #1b1b1b 3px 5px)",
                    border: "2px solid #5a5a5a",
                    rotate: `${mv.vinyl.turn}deg`,
                    boxShadow: "rgba(0,0,0,0.5) 0px 4px 10px",
                  }}
                >
                  <Img src={staticFile(song.cover)} style={{ position: "absolute", inset: "32%", width: "36%", height: "36%", borderRadius: "50%" }} />
                </div>
              ) : null}
              <Img src={staticFile(song.cover)} style={{ position: "absolute", inset: 0, width: L.cover, height: L.cover, borderRadius: 6, ...mv.cover }} />
              {mv.shine !== undefined ? (
                <div style={{ position: "absolute", inset: 0, borderRadius: 6, overflow: "hidden", pointerEvents: "none" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      bottom: -20,
                      width: L.cover * 0.5,
                      left: `${-60 + mv.shine * 220}%`,
                      rotate: "20deg",
                      background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                </div>
              ) : null}
            </div>
            {L.cols === 1 ? (
              // One tall column: title (up to two lines), artist, streams, each with the full width.
              <div style={{ flex: 1, minWidth: 0, position: "relative", ...mv.text }}>
                <div
                  style={{
                    fontSize: titleSize,
                    fontWeight: 700,
                    lineHeight: 1.08,
                    color: isActive ? accent : C.text,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {hasCascade(motion)
                    ? words.map((w, i) => (
                        // Each word rises in, one after another; real spaces between words keep normal wrapping.
                        <span key={i}>
                          {i > 0 ? " " : null}
                          <span style={{ display: "inline-block", opacity: p01(frame, seg.start + i * 3, 10), translate: `0px ${(1 - p01(frame, seg.start + i * 3, 10)) * 14}px` }}>{w}</span>
                        </span>
                      ))
                    : song.title}
                </div>
                <div
                  style={{
                    fontSize: L.artist,
                    lineHeight: 1.15,
                    color: C.muted,
                    marginTop: 4,
                    display: "-webkit-box",
                    WebkitLineClamp: artistLines,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {song.artist}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  {isActive ? <Equalizer size={L.streams * 0.8} /> : null}
                  <span style={{ fontSize: L.streams, fontWeight: 700, color: isActive ? C.text : C.muted, fontVariantNumeric: "tabular-nums" }}>{streamsShown}</span>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isActive ? <Equalizer size={L.title * 0.75} /> : null}
                  <div style={{ fontSize: L.title, fontWeight: 700, color: isActive ? accent : C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: L.artist, color: C.muted }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.artist}</span>
                  <span style={{ fontSize: L.streams, fontWeight: 700, color: isActive ? C.text : C.muted, fontVariantNumeric: "tabular-nums", flex: "none" }}>{song.streams}</span>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const RankingList: React.FC<{ songs: Song[]; tl: Timeline; motion?: RowMotion }> = ({ songs, tl, motion = "none" }) => {
  const sorted = [...songs].sort((a, b) => a.rank - b.rank);
  return (
    <>
      {sorted.map((s, i) => (
        <Row key={s.rank} song={s} tl={tl} order={i} motion={motion} />
      ))}
    </>
  );
};
