# The owner's playbook for the effects skill

The owner follows the guide "40 Claude Commands to Edit Better Videos" (by @AttentionHQ, 5 Nov 2026)
for this skill. This file turns that guide into a working plan. **Read it whenever the owner gives a
video to edit with effects**, together with `SKILL.md`. The owner is not technical: do the work, keep
replies short and plain.

## What the owner expects from every effects edit (from the guide)
1. **Vertical 9:16** MP4, their face and main message always clear.
2. **Captions on every spoken word**: clean, readable and correctly spelled.
3. **Subtle sound effects** on transitions, captions popping in and big visual changes. Not on everything.
4. **3 to 5 effects** per video, each placed where it makes the idea easier to follow. Never add
   effects just to fill time. Each one stays on screen long enough to understand (1.5-4 s).
5. **Check before exporting:** spelling, nothing cut off at the edges, every effect visible, no
   effect covering the face, no abrupt audio.
6. Tell them where the file is, and remind them to watch it before posting.

Optional, only when they ask for a "finished Reel": about 30 s, open with the strongest shot, fast
cuts, and a final line of text such as "Comment your keyword and I'll send you the commands" (use
their wording).

## How to make that happen (this skill alone adds visuals only)
1. **Get timings:** transcribe with ElevenLabs Scribe (the key is injected by the proxy; see
   `.claude/skills/blue-explainer-video/references/uploaded-footage.md`) or with `scripts/words.py`.
   Scribe is more accurate.
2. **Choose 3-5 effects** using the map below and the words. Match each effect to the line it
   illustrates: a number goes with `liquid-glass-graph`, a list with `checklist`, "no" or "wrong" with
   `reject-stamp`, the key word with `backdrop-word` or `huge-strike`, a punch line with `lean-in`.
   Unless the owner named the effects, say which ones you picked and why in one line each.
3. **Draft and check** with `scripts/fx.py --plan … --still …`, as in `SKILL.md`. Look at every still.
4. **Render the effects pass** with `scripts/fx.py --plan …`. It keeps their audio.
5. **Captions and sound:** run a short Remotion pass on top of the effects render, using the
   blue-explainer-video template's `Lockup` captions (word timings from step 1) and its `make_sfx.py`
   effects (`whoosh`, `pop`, `tap`, `strike`, `stamp`…). Captions here are **plain readable captions**
   (white, small dark shadow, lower third or in the dark empty part of the frame), *not* the blue
   explainer cut-away style, unless the owner asks for that look. Keep the speaker's voice on top,
   effects quiet (0.2-0.4), and normalise to -14 LUFS.
6. Save the final to `videos/<project>/final/` and commit, like the explainer videos.

## The guide's 40 commands, mapped to this installed version
**Same name (use directly):** orbit, glass-widgets, scribble, tier-list, checklist, spotlight,
headline-wall, profile-wall, timeline, moody, red-collage, phone-fan, shortcut-rain, reject-stamp,
dot-reveal, backdrop-word, countdown (= `countdown-flip`), liquid-glass (= `liquid-glass-graph`).

**Different name in this version (use the one on the right):**

| Guide command | Use | Notes |
|---|---|---|
| magazine-cover | `cover-star` | `look=editorial` for the classy version |
| before-after | `swipe` | `grade` sets the "after" look |
| chart-grow | `liquid-glass-graph` | or `over-the-shoulder-zoom` for two numbers |
| digital-zoom, snap-zoom | `lean-in` | `zoom` up to 2 |
| reel-wall | `noise` or `profile-wall` | needs a folder of the owner's reel covers (`images`) |
| zoom-through-cut, zoom-portal | `rabbit-hole` | |
| chat-takeover | `messages` | or `comment-box` |
| phone-mockup | `reel-frame` | |
| kallaway-split | `split-headline` | or `broll-split` with b-roll |
| documentary | `moody` with `grade=bw` or `warm` | plus `slow-push` |
| giant-captions | captions step above with the key word set big | the blue-explainer `Lockup` does this |

**Not in this version** (say so plainly, never fake it): dolly-zoom, vertigo, pullback, frame-break,
frame-escape, green-screen, paper-cutout, couch-wall, ui-world, ascii-me. Offer the closest installed
effect, or offer to build it as a new effect. The face tracker and selfie segmenter in `models/` can
support dolly-zoom/vertigo, pullback, green-screen, paper-cutout and ascii-me. Build only if the owner
says yes.

## Things the guide warns about
- An effect looks different on different clips, lighting and prompts. These are starter versions:
  be honest if it doesn't match a reel the owner saw.
- If an edit feels busy, keep 3 effects and remove the rest.
- The owner may paste commands from the guide as `/effects <name>`. Map them with the table above
  before running.
