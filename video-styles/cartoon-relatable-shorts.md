# Relatable cartoon shorts (study of 9 reference videos, 17 Nov 2026)

Technique only: never reuse the reference creator's scripts, drawings, characters, channel name or watermark. The
owner's version uses the owner's own cast (videos/cartoon-cast) and original topics and scripts.

## The niche
Everyday life, told funny and short, for teens and young adults: school tricks, friends, family, gaming, body myths,
"your brain is weird" facts, and the odd short kindness story. Every video answers a small question the viewer has
lived through. 23-37 s, 70-110 words, about 3 words a second.

## The four script shapes
1. **Ranked list of three** (most common: sit next to your best friend, being short, brain tricks, strict teacher,
   gaming excuses):
   "Here's how/why [topic]." -> "First is the [named trick]." [1-2 sentence scene] -> "Next is the [named trick]."
   [scene] -> "But the ultimate [trick] is the [named trick]." [scene + punchline].
   Each item gets a catchy name ("the fake enemy hack", "the echo effect", "the phantom itch").
2. **Myth buster** (shaving): the myth stated flat -> who believes it -> "scientists proved it wrong" -> the simple
   reason it feels true -> a cheeky last line.
3. **Mini story with a moral** (kindness, farting corner): a named person, a problem, an unexpected move, the result,
   the moral in one line. Opens mid-action ("He walked to the corner and farted loudly, but nobody reacted.").
4. **What if** (hummingbird heart): a weird question about the body -> what really happens -> what it would take ->
   the funny cost. (The reference used 3D AI clips for this one.)

## How it looks
- Flat hand-drawn cartoon, thick outlines, one solid background colour per shot that changes almost every shot.
- A new shot about every 1.5 s, each one illustrating the words being said (a chalkboard, a diner, a sweaty face).
- Lots of close-ups for reactions; props and symbols (speech and thought bubbles, anger marks, sweat drops, shake
  lines, "!!", hearts, a clock, a thumbs-up "100%").
- Captions: ONE word at a time, large, white with a black outline, in the middle of the screen.
- No title card, no intro: the first word is the hook. Some end on the narrator still mid-sentence (looping cut).

## How the characters move (checked frame by frame at 10 fps)
- Limited animation: each action is 2-3 drawings, each held for 2-4 frames (about 8-12 drawings a second), not smooth.
- Moves are pose swaps: arm down -> arm up, head turned -> head facing, calm face -> shouting face.
- Mouth flaps between 2-3 shapes while a character talks; eyebrows and eyes carry the emotion.
- Emphasis: a quick shake (anger), a small scale pulse, shake lines drawn around the body.
- Walking: the whole character slides with a small bob; the camera hardly ever moves.

## Mapping to the owner's cast
The cut-out puppet method (videos/cartoon-cast/tools/puppet_sample.py) already works this way (held poses, pose
swaps, mouth shapes). To match and beat the reference: more poses per character from ChatGPT (point, shrug, shout,
laugh, sit, walk steps), a new framing every ~1.5 s, solid colour or simple painted backgrounds, one-word captions, and
the "more lively" extras the reference lacks: small camera push-ins, squash-and-stretch on pose changes, eased moves.
