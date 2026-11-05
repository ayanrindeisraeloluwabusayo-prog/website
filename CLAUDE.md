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

## Impeccable

The `impeccable` skill is installed but not set up yet: the owner had no site plan when it was
added. Before the first real build, run `/impeccable init` to interview the owner and write
`PRODUCT.md`. Use its commands (`critique`, `audit`, `polish`, …) to review and refine pages, and
since its design hook is off, run `.claude/skills/impeccable/scripts/impeccable detect --json
<changed files>` once a UI change is finished.
