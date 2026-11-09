# Sound plan: "Why a song gives you chills" (v3)

All effects are designed from scratch in `make_sfx.py` (no samples, free to use) and written to
`public/sfx2/` as 48 kHz stereo WAV. Rule: **a sound only where something visibly happens**; cuts that
are just a new picture stay silent. The music bed dips briefly under the three big hits.

| Time | Frame | Moment on screen | Effect | What it sounds like |
|---|---|---|---|---|
| 0.0 s | 0 | "That chill" | `shiver` | cold breath and a trembling glassy shimmer |
| 2.8 s | 85 | film-burn transition | `whoosh-film` | airy whoosh with projector flutter, peaks on the cut |
| 4.9 s | 148 | molecule starts drawing | `spark` (quiet) | tiny electric crackle |
| 6.7 s | 201 | "builds toward its…" | `riser` | noise and three tones climbing, cut dead on the wave |
| 8.6 s | 258 | the great wave | `wave-hit` | deep boom with the wash of a breaking wave |
| 10.3 s | 310 | invert flash | `glitch-a` | short digital stutter |
| 10.4 s | 313 | gold burst: "dopamine" | `firework` | soft thump, then crackle drifting left-right |
| 14.0 s | 420 | "before" | `subdrop` | the floor drops out: deep falling tone |
| 15.5 s | 466 | graph panel slides up | `paper` | soft slide |
| 17.3 s | 518 | pixel glitch | `glitch-b` | short digital stutter |
| 20.6 s | 618 | highlighter on the study | `marker` | felt tip dragged over paper |
| 22.4 s | 671 | four flash frames | `shutter` | one camera click per frame |
| 24.0 s | 721 | first brain region lights | `spark` | electric crackle |
| 25.7 s | 770 | second region lights | `lamp` | switch click and filament hum |
| 25.9 s | 778 | film-burn transition | `whoosh-film` | as above |
| 28.1 s | 842 | "reward." | `chime` | warm open bell ringing out |
| 28.9 s | 866 | end card lands | `pop` | soft rounded UI pop |

Final mix: normalised to **-14 LUFS** (social media standard), true peak -1.5 dB.
Rebuild the effects with `python3 make_sfx.py` (needs numpy and scipy).
