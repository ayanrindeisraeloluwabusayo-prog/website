---
name: blue-explainer-video
description: Makes short vertical (9:16) explainer videos in the owner's "blue serif explainer" edit, the style of the "Why a song gives you chills" video. Words build on screen one at a time, with one key word set huge in a narrow serif. Real pictures (public-domain art, Pixabay footage, NASA) carry the feeling, and moving graphics (diagrams that draw themselves, graphs, a line-drawn head lighting up, a molecule, a highlighted study) carry the explanation. Electric blue and paper white, film grain, stylised transitions, and sound effects only where something happens. Use this whenever the owner uploads a video or footage to edit "in this style", gives a topic or script for a short explainer, reel, TikTok or Short, says "use the explainer skill", "make it like the chills video", "blue explainer", or asks for a psychology, science or fact video with pictures and motion graphics, even if they don't name the skill.
---

# Blue serif explainer video

This skill rebuilds the edit the owner loved in `videos/chills-style-test` (v3). The style itself is
measured frame by frame in `video-styles/blue-serif-explainer.md`. This skill turns it into a repeatable
process. The owner is new to video work, so explain each step in plain words and show them things
(contact sheets, frame sheets, the video) rather than describing them.

The heart of the style, and the reason the owner chose it: **every line gets the right kind of visual.**
A picture where the line is about a feeling. A moving graphic where the line explains how something
works. Most scenes use one of each. Read `references/scene-rules.md` before planning any video: it holds
the decision rules and a worked example.

## What the owner may give you

1. **A topic or a script** ("make one about why we procrastinate"). You write a ~30 s script (70-85
   words, about 8-9 phrases), and the words on screen carry it. There's no voice unless the owner asks
   for one.
2. **An uploaded video** (a talking head, a clip of them speaking, or other footage). Its speech becomes
   the words on screen. The speaker stays on screen about half the time, and every 2-3 s the edit cuts
   away to a picture or a motion graphic for the line being spoken. See
   `references/uploaded-footage.md` for transcription and cutting.
3. **Changes to an earlier video** ("swap the wave", "louder whoosh"). Edit that project in place.

If the brief is unclear (what is the video for, who is it for), ask once. Otherwise make sensible
choices and say what you chose.

Each video is its own project: never link it to Drah Charts or to another video unless the owner asks.

## The process

Work through these steps in order. After steps 3 and 7, show the owner the result and wait for their
answer before going on.

### 1. Script and beats
Split the words into phrases of 3-8 words, one phrase per scene. A scene runs 2.5-5 s, and a new picture
appears about every 2 s (never one held longer than about 7 s). Pick the **one key word** in each phrase:
the word that carries the meaning or the surprise ("chill", "chemistry", "peak", "before"), never a filler
word. Facts must be true: name the real study, year and journal, and double-check them.

### 2. Mood brief and visual plan
For each scene, write what it says, what it should feel like, and **which shots are pictures and which are
moving graphics** (rules in `references/scene-rules.md`). Save the brief as `MOOD-BRIEF.md` in the
project folder.

### 3. Find pictures, then let the owner choose
Search the Art Institute of Chicago, Wikimedia Commons, NASA and Pixabay (videos and photos) with
`scripts/search_media.py`. Build thumbnail sheets with `scripts/grid.py` and **look at every candidate
yourself**. Keep only the ones that truly carry the scene's feeling. Then send the owner a contact
sheet: 3-4 picks per picture slot, each with a one-line reason and its licence. Details, sources, licences
and network quirks are in `references/sourcing.md`. If the owner says "just choose", pick the strongest
and say so.

### 4. Set up the project
Copy `template/` (next to this file) to `videos/<short-name>/`, run `npm install`, and put the chosen
media in `public/media/`. Crop clips to 1080×1920 at 30 fps with ffmpeg first, keeping only the
seconds you use. `src/Video.tsx` is the finished chills video: a working example to copy patterns from.
Rewrite it for the new script.

### 5. Build the edit
Use the building blocks (all documented in `references/building-blocks.md`):
- **Pictures:** `Shot` (full screen, slow push-in, optional blue tint), `Card` (a photo floating on the
  stage), `Scrim` (shading so white words read), `Vignette`.
- **Motion graphics:** `BlueStage` (blue, glow, drifting dot grid), `Panel` (a floating glass panel),
  `LineHead` + `Regions` + `Rising` (a head diagram with spots lighting up), `StippleHead` (grain head that
  blows away), `BuildCurve` (a curve that draws itself), `BeforeGraph` (two lines over time),
  `Molecule`, `StudyPage` (paper card with highlighter). For a new idea, draw a **new** graphic in the
  same language: white lines on blue that draw themselves, one yellow accent, small Inter Tight labels.
- **Words:** `Lockup` with `ws("words", startFrame, gap)`. Put them in the empty part of the picture.
- **Transitions** (about one cut in four): `FilmBurn`, `InvertFlash`, `PixelGlitch`, a flash-frame
  montage. All other cuts are hard cuts on the beat of the words.

Text colour rule (the owner's): **white** on pictures, footage and blue; **black** on white or paper;
blue only as an accent.

### 6. Sound
Run `python3 make_sfx.py` (needs `pip install scipy`) to build the effects, then place them only where
something visibly happens. Rules and the effect list are in `references/sound.md`. Run
`python3 make_music.py public/music.wav` for the placeholder bed, or use music the owner supplies. Dip the
music under the 2-3 biggest hits, and normalise the final mix to -14 LUFS.

### 7. Check, render, deliver
1. Type-check (`npx tsc --noEmit -p .`), then render a half-size draft.
2. Pull one frame per shot into a sheet (`scripts/frame_sheet.py`) and **look at it**:
   - Is any text sitting on a face, or hard to read?
   - Do any small words touch the big word?
   - Does every diagram spot sit in the right place?
   - Is there an edge or seam from a moved picture?
   - Are there 3 pictures in a row with no graphic between them?
3. Fix what you find, then render the full-size video. In a cloud session add
   `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`,
   because Remotion can't download its own browser there.
4. Normalise loudness:
   `ffmpeg -i out/raw.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=7 -c:v copy -c:a aac -b:a 320k out/final.mp4`.
5. Send the video with a short table: time, words, what you see.
6. Write `CREDITS.md` with every picture's source and licence, plus a ready-to-paste description line.

Commit the project, but not `node_modules`, `out/` or the generated audio. Media under ~25 MB is fine
to commit.

## Things that went wrong before (avoid them)
- **All pictures, no graphics.** The owner rejected this. The motion graphics are half the style.
- **Words on a face.** Move the picture (`Shot` `shiftY` + `fill`) or move the words.
- **White words on a bright picture.** Add a `Scrim` or darken with `grade="brightness(0.8)"`.
- **A sound on every cut.** Too much. Sound only on visible actions and the stylised transitions.
- **Wrong facts on screen** (e.g. "Nature" when the journal was *Nature Neuroscience*). Check them.
