Installed from https://github.com/pbakaus/impeccable (commit 5af4319, v4.8.0, engine 0.1.18),
Apache 2.0 licensed. Copied from the repo's prebuilt `.claude/skills/impeccable/`, together with
its subagents in `.claude/agents/impeccable-*.md`. This is the same payload `npx impeccable install`
downloads from impeccable.style, which this cloud environment's network policy blocks.

The engine binary is not committed: `scripts/impeccable` downloads it from the project's GitHub
releases on first run, checks it against `scripts/engine-checksums.txt`, and caches it in
`~/.impeccable/bin/`.

The design hook (`impeccable hook` on SessionStart, after Edit/Write, and on Stop) is NOT installed.
The installer would put it in `.claude/settings.local.json`; enable it with `/impeccable hooks on`
if wanted. Without it, run `scripts/impeccable detect --json <changed files>` after UI changes.

To update: `npx impeccable update` where impeccable.style is reachable, or re-copy
`.claude/skills/impeccable/` and `.claude/agents/impeccable-*.md` from that repository.
