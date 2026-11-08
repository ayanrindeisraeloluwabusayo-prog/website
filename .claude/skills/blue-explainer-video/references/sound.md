# Sound

## Rules
- **A sound only where something visibly happens:** a stylised transition, a graphic part switching on,
  a big metaphor image landing, the key word of the hook or the payoff. Plain picture changes stay silent.
  The chills video had 18 effects in 30 s, and that's about the upper limit.
- Match the sound to the thing on screen: a wave gets a boom and a wash, a highlighter gets a felt-tip
  drag, a light gets a switch click.
- Whooshes reach their loudest point 0.5 s (15 frames) after they start, so start them 15 frames
  before the cut.
- A riser climbs through the "building" line and **cuts dead** on the hit.
- The music bed dips by about 50 % under the 2-3 biggest hits, then recovers over 1 s (`musicLevel` in
  `Video.tsx`), and fades out over the last 20 frames.
- Final mix at **-14 LUFS**, true peak about -1.5 dB (use the ffmpeg loudnorm line in SKILL.md).
- Effect volumes that worked: whooshes 0.45-0.55, big hits 0.7-0.75, small UI sounds 0.25-0.45,
  the hook shimmer 0.45, and the music bed 0.6.

## The effect kit (`make_sfx.py` writes `public/sfx2/*.wav`; place with `<Sfx at src volume />`)
| Effect | Use it for |
|---|---|
| `shiver` | the hook: a cold breath and a trembling shimmer |
| `whoosh`, `whoosh-film` | transitions (film-burn version has projector flutter) |
| `riser` | a "building" line, 1.9 s, ends exactly on the hit |
| `wave-hit` | a big metaphor image landing: a boom and a wash |
| `subdrop` | a "before" or "suddenly" moment: the floor drops out |
| `firework` | a release or reward burst: a thump, then crackle |
| `glitch-a`, `glitch-b` | invert flash or pixel glitch transitions |
| `spark` | a diagram part or neuron lighting up |
| `lamp` | something switching on: a click and a hum |
| `paper`, `marker` | a panel or page sliding in; a highlighter stroke |
| `shutter` | the flash-frame montage (one click per frame) |
| `drop` | a single water plink |
| `chime` | the payoff word: a warm bell |
| `pop` | the end card or a small UI moment |
| `stamp` | a hook word slammed down ("lazy.") |
| `ticks` | a clock on screen |
| `strike` | something crossed out |
| `lift` | relief or a lift in mood: an airy rise into a soft chord |
| `tap` | a phone or touchscreen tap, a tick on a checklist |
| `eerie` | an unsettling turn ("someone else") |

To make a new effect, add a function to `make_sfx.py`. Shape noise and tones with filters, envelopes and
the room `reverb()`, then add it to `jobs`. Before using it, check a spectrogram (a picture of the
sound). If the owner wants AI-generated sounds or music, that needs a paid service, so ask them first.
