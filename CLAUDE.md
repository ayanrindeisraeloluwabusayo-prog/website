# Website

The owner is new to web design. Explain choices in plain words and avoid jargon.

## Design work

Whenever the owner needs a design (a new site, page, section, redesign or restyle):

1. Ask what it's for, who it's for, and any sites or brands they like, unless they've already said.
2. Offer several options to choose from (3–6 by default, more on request), never a single
   unasked-for pick. Draw them from all three project skills in `.claude/skills/`:
   - `design-inspo`: brand-inspired styles from the getdesign.md library (always include some)
   - `taste-skill`: art-directed directions dealt by its script
   - `ui-ux-pro-max`: a recommended style, palette and font pairing from its database
3. Show each option as a quick mockup of the top of the page, then let the owner pick, ask for
   more, or mix parts of different options. Build the full page only after they choose.
4. Use brand-inspired styles as inspiration only: no brand names, logos or proprietary fonts.

## Motion and polish

Emil Kowalski's skills (`animate`, `choreograph`, `review-animations`, `emil-design-eng`,
`mobile-native`, `break-ui` and others, listed in `skills-lock.json`) cover animation, UI polish,
mobile feel and edge-case testing. Use them once a chosen design is being built and refined.

## Studying other sites (REA)

The `reverse-engineer-anything` skill (REA, from github.com/morluto/rea) explains how a feature
on an existing site or app works. Only its instructions are installed; its tools run on demand via
`npx rea-agents`. Use it to learn techniques, then build the owner's own version: never copy
another site's content, branding or code wholesale.

## Explainer illustrations (Anatomy)

The `anatomy` skill (from github.com/wheresryan22/anatomy) builds interactive isometric
illustrations that explain an idea as a working object. Use it for explainer visuals on the
site. Never run its `publish.mjs --submit` (it posts to the author's public gallery) unless the
owner asks.

## Impeccable

The `impeccable` skill is installed but not set up yet: the owner had no site plan when it was
added. Before the first real build, run `/impeccable init` to interview the owner and write
`PRODUCT.md`. Use its commands (`critique`, `audit`, `polish`, …) to review and refine pages, and
since its design hook is off, run `.claude/skills/impeccable/scripts/impeccable detect --json
<changed files>` once a UI change is finished.

## Video (Remotion)

The official Remotion skills (`remotion-best-practices` routes to the rest: `remotion-create`,
`remotion-markup`, `remotion-render`, `remotion-studio`, `remotion-captions`, `remotion-license`, …,
from github.com/remotion-dev/skills, listed in `skills-lock.json`) cover making videos in code.
Use them for the owner's music videos, such as the Drah Charts template in `drah-charts/`.

## Editing real footage (video-use)

The `video-use` skill (from github.com/browser-use/video-use) edits existing footage by
conversation: transcribe, cut, colour grade, overlays, burned-in subtitles. Its helpers in
`.claude/skills/video-use/helpers/` need Python packages (`pip install requests librosa matplotlib
pillow numpy`) and ffmpeg. Transcription uses the ElevenLabs Scribe API: ask the owner for an
`ELEVENLABS_API_KEY` through the environment's credential form, never in chat or in a committed file.
Use Remotion (above) to build videos from data and templates; use video-use to cut and polish footage.

## HyperFrames (HTML rendered to video)

The HyperFrames skills (from github.com/heygen-com/hyperframes, by HeyGen; start with `hyperframes`,
plus `hyperframes-cli`, `hyperframes-registry` with ~450 ready-made blocks, `media-use`, `figma`,
`remotion-to-hyperframes`, `reverse-any-video`, `slideshow`, `style-sampling`) are a second way to
make videos, from web pages. They run through `npx hyperframes`. Many media features are optional
paid services (HeyGen, ElevenLabs, Gemini…): ask for any key through the environment's credential
form, never in chat or a committed file. The CLI sends usage telemetry unless turned off
(`HYPERFRAMES_NO_TELEMETRY=1`). When rebuilding someone else's video, learn the technique and make
the owner's own version: never copy another creator's content or branding.

## Cartoon story shorts (cartoon-3d-short)

The `cartoon-3d-short` skill (from github.com/mromidev/claude-animated-shorts) makes ~60 s vertical
cartoon story shorts: flat cartoon characters in a painted 3D world, with narration, sound effects
and music, built with three.js inside Remotion. Its style notes come from a creator it studied: make
the owner's own stories, characters and shots, never copy theirs, and never publish its reference
frames (kept out of git on purpose). Some of its "user rules" (2K export, no captions, the original
author's mix levels) were the original author's preferences: confirm them with the owner first.
Before writing any cartoon script, read `.claude/skills/cartoon-3d-short/OWNER-STORY-PLAYBOOK.md` (the owner's
six-beat story formula, do's and don'ts, the look notes and the Nigerian story bank).

## The owner's video style: SaaS motion design in every video

Every video made for the owner gets a SaaS motion design treatment (the style software companies use
for product launches), with real depth: a hook headline in the first second, the "product" (the
chart, app or screen) floating on a layered stage (glow, dot grid, long soft shadow, a 3D tilt that
settles), a large cursor whose clicks cause the next thing, camera push-ins on the key moment and a
pull-back after, kinetic type, numbers that count up, UI sounds on visible actions, and a performed
end card (logo lands, name wipes in, the cursor clicks a call to action). Keep it calm while the
music and footage play: the product stays the star. Show real screens and real numbers, never an
invented UI. In the Drah Charts template this is `design.saas` (`src/Saas.tsx`).

## Keep projects separate

Drah Charts is a finished project. Don't link new work to it (its template, data, branding or
songs) unless the owner names it. Treat each new request as its own project.

## Reference editing styles

`video-styles/` holds frame-by-frame studies of editing styles the owner wants to use (technique
only, never the source footage, wording or branding). `blue-serif-explainer.md` is the first.

## Explainer videos (blue-explainer-video skill)

The `blue-explainer-video` skill in `.claude/skills/` turns the owner's favourite edit (the "Why a song
gives you chills" video, `videos/chills-style-test`) into a repeatable process. It covers when to use a
picture and when to use a motion graphic, the fonts and colours, picture sourcing, and designed sound
effects. Use it whenever the owner uploads a video or gives a topic for a short explainer.

## Talking-head effects (effects skill)

The `effects` skill (from github.com/Vibha-Ramprakash/claude-video-effects, MIT licence, by
@vibha.in.progress) adds 51 ready-made effects on top of a talking-to-camera video (words behind the
head, orbiting reels, spotlight, glass widgets, checklists, stamps, zooms and more), tracking the face.
It is separate from the `blue-explainer-video` skill:
- `effects`: the owner asks for a named effect (or `/effects …`) on their footage. It changes the shot
  itself and keeps their audio.
- `blue-explainer-video`: the owner wants the blue serif explainer edit (word-by-word captions, cut-aways
  to pictures and motion graphics, designed sound).
They can be combined (effects first on the footage, then the explainer edit around it) only when the
owner asks for both. For every effects edit, follow `.claude/skills/effects/OWNER-PLAYBOOK.md` (the owner's
guide: captions on every word, subtle sound, 3-5 effects, checks, and the guide's effect names mapped
to this version).

Setup in a cloud session: run `bash .claude/skills/effects/scripts/setup.sh` (creates its `.venv`, kept out
of git), and install the graphics libraries its face tracking needs: `apt-get install -y libegl1 libgles2
libgl1`. A `TypeError: 'NoneType' object is not callable` printed at the very end of a run is a harmless
shutdown message from mediapipe; check that the output file exists.
