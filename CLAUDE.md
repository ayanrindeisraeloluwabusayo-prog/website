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

## Drah Charts (music chart videos)

`drah-charts/` is the backup of the finished Drah Charts video template (built with Remotion), and
`anatomy/drah-charts-skeleton/` is an explainer figure of how it works. It is a separate project from
the explainer videos.

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
