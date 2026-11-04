Vendored from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (commit ccce51c, v2.15.0), MIT licensed.
Only the core `.claude/skills/ui-ux-pro-max/` skill is included; the repo's other skills
(banner-design, brand, design, design-system, slides, ui-styling) are not.

Local change: in SKILL.md, `${CLAUDE_PLUGIN_ROOT}/.claude/skills/` was rewritten to
`.claude/skills/` (as the official `uipro init --ai claude` installer does), so the
script paths resolve from the project root.

To update: re-copy `.claude/skills/ui-ux-pro-max/` from that repository and reapply the path change.
