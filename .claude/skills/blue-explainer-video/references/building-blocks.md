# Building blocks in the template

All timings are in frames (30 fps). `p(f, start, dur)` returns 0 to 1 with an ease-out, and is handy for
any animated value. Wrap each scene in `<Scene from to>`. Layer order is back to front: background,
picture or graphic, scrim, grain, words.

## Look and type (`src/kit.tsx`, `src/type.tsx`, `src/lockup.tsx`)
- Colours: `BLUE #0243F1`, `BLUE_DEEP #011A8C`, `PAPER #ECEBEF`, `FLASH #F3C21D` (yellow accent).
- Frame 1080×1920. Small words: Inter Tight 400, 51 px. Key word: Newsreader 500, condensed, about 200 px.
  Statement word on cards: Inter Tight 800. Quotes: Newsreader italic.
- `Lockup({ top, x?, width?, color?, until?, shadow?, lines })`. Each line is
  `{ kind?: "s" | "serif" | "bold" | "quote", words: ws("text", startFrame, gapFrames), align?, indent?, size? }`.
  - Each word fades in from a blur on its frame.
  - Small words never collide with the big word, because the lockup measures the letters itself.
  - Use `until` to clear one phrase before the next starts in the same place.
  - On paper, pass `color="#111"` and `shadow={false}`.
- `Grain({ amount })`: 0.12 on paper, about 0.2 on pictures.
- `Drift`, `BlueField({ crumple?, glow? })`, `Paper`.

## Pictures (`src/media.tsx`)
- `<Filters />` once, at the top of the video. It defines the blue tints `duo-blue` and `duo-ink`.
- `Shot({ src, from, to, video?, pos?, zoom?, duo?, grade?, shiftY?, fill? })`: a full-screen picture or
  clip.
  - `zoom=[start, end]` gives the slow push-in (default 1.03 to 1.12). Use a big push (1.0 to 1.35) for
    a metaphor moment.
  - `pos` is the anchor when the picture is cropped.
  - `shiftY` + `fill` move the picture down and fill the gap with a colour, blended. Use this to clear
    space for words above a face.
  - `grade` is a CSS filter, e.g. `"brightness(0.8) contrast(1.1)"`.
- `Card({ src, from, to, ratio, width?, y?, tilt?, grade?, duo? })`: a photo floating on a stage, popping
  in with a tilt that settles and a long shadow. Good for small photos and evidence.
- `Scrim({ side: "top" | "bottom" | "all", strength })`: shading so white words read.
- `Vignette`, `Stage` (a dark blue stage).

## Motion graphics (`src/motion.tsx`, `src/art.tsx`)
- `BlueStage({ glowY })`: electric blue, a glow and a drifting dot grid. The default background for graphics.
- `Panel({ from, x, y, w, h })`: a floating glass panel that rises in. Put graphs on it.
- `BuildCurve({ from, dur, color, y, height, stroke, zoom })`: a song's loudness drawn as a mirrored line
  rising to a peak.
- `BeforeGraph({ from })`: "the music" (white) and "dopamine" (yellow) over time, with "the drop" marked.
  Copy it and change the two functions and labels for any "A happens before / after B" idea.
- `Molecule({ from, cx, cy, r })`: dopamine drawn bond by bond, with atom labels and a formula. To draw
  another molecule, change the bond list.
- `LineHead({ draw, brain, x?, y? })`: a head outline that draws itself, with a stippled brain dome.
  Keep the default `y` when it's used with `Regions`, because their positions match.
- `Regions({ a, b })`: two spots pulse on with leader lines and labels. Edit the labels and positions
  for other body or brain parts.
- `Rising({ from })`: glowing particles rising (a chemical being released).
- `StippleHead({ from, y })`: a head made of grain that blows away like sand (a shiver, a thought fading).
- `StudyPage({ from, highlightAt })`: the research paper card with a yellow highlighter wipe. Edit its
  title, journal and authors to match the real study.

## Transitions (`src/kit.tsx`, plus `FlashMontage` in `Video.tsx`)
- `FilmBurn({ at })`: a warm light leak. It covers the cut at about `at + 5`.
- `InvertFlash({ at })`: negative image, then yellow, then the next shot.
- `PixelGlitch({ at })`: blocky glitch.
- `FlashMontage({ at })`: four pictures for 2 frames each. Edit its picture list.

Use about one stylised transition per 4 cuts, on the biggest turns of the story.
