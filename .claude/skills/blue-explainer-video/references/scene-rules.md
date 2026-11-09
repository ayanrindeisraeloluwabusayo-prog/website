# Deciding what each line shows

## The core rule: feeling → picture, mechanism → motion graphic

Ask of each phrase: **is it about how something feels, or how something works?**

| The line is… | Use | Why |
|---|---|---|
| a hook, a sensation, an emotion ("That chill down your spine") | **picture**: art, sculpture, a close human moment | the viewer must *feel* it before they'll listen |
| a turn from feeling to explanation ("isn't magic. It's chemistry.") | picture for the first half, **graphic** for the answer | the cut itself shows the switch from mystery to mechanism |
| a process, cause and effect, something building, a curve ("builds toward its peak") | **graphic**: a line or curve that draws itself | movement over time *is* the explanation |
| a metaphor or a big emotional beat ("the peak", "the drop") | **picture**: the great wave, a diver mid-air | a strong image lands the metaphor instantly |
| a substance, part of the body, a place in the brain ("dopamine", "one region") | **graphic**: a molecule, a head diagram with a spot lighting up, labels | it shows *where* and *what*, which a photo can't |
| timing or comparison ("before", "more than", "twice as") | **graph**: two lines over time, bars, a marker | the gap between two lines is the point |
| evidence ("In 2011, researchers scanned…") | picture (a scan, a lab), then **the study page** on paper with a highlighter wipe | it proves the claim is real |
| the payoff ("It's the reward.") | **picture**: a person on a summit, a sunrise | it ends on emotion |
| the call to action | **blue card** with the heavy grotesk words | it's clean and branded |

## Rhythm rules
- Most scenes are **two shots**: picture then graphic (feeling, then explanation), or graphic then
  picture (explanation, then payoff). Put the shot change where the words turn.
- Aim for about **half pictures, half graphics** across the video. Never three pictures in a row
  without a graphic between them, and never three graphics in a row.
- A new shot about every 2 s (1.3-3 s per shot). Hold a diagram longer (up to ~4 s) while its parts
  light up one by one.
- Moving clips (Pixabay video) are pictures too. Use them for energy moments: a firework for a release,
  a storm sea for tension.
- Graphics follow the words: each part appears or lights up **on the word that names it** (region one
  on "region", region two on "another").

## How to design a new motion graphic
When the topic needs something the template doesn't have (a heart, a timeline, a bar chart, a map), draw
it in the same visual language so it matches:
- white lines 4-7 px on `BlueStage`, drawing themselves (`pathLength={1}` with a dash offset that animates)
- one accent colour: yellow `#F3C21D` for "the thing that matters", with a soft glow
- labels in Inter Tight, 30-46 px, white; small caps with letter-spacing for axis titles
- a dot travelling at the drawing tip, so the eye follows the line
- important parts pop in with a pulse ring
- optionally inside a `Panel` that rises with a small 3D tilt that settles
- keep the top ~40 % of the frame free for the words

## Worked example: the chills video (v3), 30 s

| Time | Words (key word in **bold**) | Shot A | Shot B |
|---|---|---|---|
| 0-3.4 | That **chill** down your spine | Rodin head thrown back, blue tint (picture) | grain head blowing away (graphic) |
| 3.4-6.8 | isn't magic. It's **chemistry.** | alchemist painting (picture) | dopamine molecule drawing itself (graphic) |
| 6.8-10.4 | When a song you love builds toward its **peak,** | loudness curve on a panel (graphic) | Hokusai's Great Wave, push in (picture) |
| 10.4-14 | your brain releases **dopamine** | gold firework clip (picture) | head diagram, lights rising (graphic) |
| 14-17.5 | **before** the drop even lands. | diver frozen mid-air (picture) | graph: dopamine peaks before "the drop" (graphic) |
| 17.5-22.5 | In 2011, researchers **scanned** listeners' brains. | brain scan (picture) | study page with highlighter (graphic, on paper) |
| 22.5-26.5 | **Anticipation** lit up one region. The **peak,** lit up another. | brain cells clip (picture) | head diagram, two regions lighting up (graphic) |
| 26.5-28.9 | The build-up isn't the wait. It's the **reward.** | Friedrich's Wanderer (picture) | hiker on a summit (picture) |
| 28.9-30 | Follow for more **music science** | blue end card | |
