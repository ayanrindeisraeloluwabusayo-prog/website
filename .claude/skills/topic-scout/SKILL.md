---
name: topic-scout
description: Find fresh, very relatable everyday topics for the owner's psychology videos (Human Nature Explained) from what real people search for. Use whenever the owner asks for new topics, video ideas, "what should we make next", or wants relatable/trending questions, before suggesting any topic.
---

# Topic scout

1. Run `python3 .claude/skills/topic-scout/scripts/scout.py` (add extra seeds as arguments, e.g. `"why do i always forget"`).
   It pulls Google's public search suggestions for everyday "why do I / why do we / is it normal to…" starters,
   ranks them by how high Google lists them, drops medical questions and anything already in
   `video-styles/topics-done.md`.
2. From the list, pick about 10 that are: an everyday moment almost anyone has had, explainable by real psychology
   or behavioural science, not medical, not politics. Group duplicates.
3. For each, find and check a real study before offering it (the owner's rule: everything fact-checked). Drop any
   with no solid research.
4. Offer them with the real search phrase people typed, a one-line hook, and the study behind it. Never repeat a topic
   from `topics-done.md`, and add the ones the owner sees to that file.

## YouTube comments (the owner's preferred source: what people actually say, not what they search)

Run `python3 .claude/skills/topic-scout/scripts/yt_comments.py > /tmp/claude-0/yt.tsv` (needs `YOUTUBE_API_KEY`, a free
YouTube Data API v3 key the owner keeps in the environment variables; host `youtube.googleapis.com` is allowed). It searches
relatable school, work, uni, public and family videos and keeps only top comments that sound like a shared feeling
("literally me", "I thought I was the only one", "why do I…"), sorted by likes. Add seeds as arguments for a theme.
Read the comments, group the ones that describe the same hidden feeling in different words, and name it; only offer a
feeling that comes up again and again, with a few real (short, anonymous) example comments, the like counts, and the
study behind it. One run uses about a fifth of the free daily quota. Never quote usernames.

Reddit is not wired in yet: anonymous reading is blocked from cloud sessions. It needs a free Reddit "script" app
key (saved through the environment's credential form) and `oauth.reddit.com` allowed.

## Engagement scoring and the leaderboard (added 27 Nov 2026)

For a ranked comparison, put candidate topics in a JSON file and run `python3 scripts/yt_engage.py topics.json out.json`
(total views, last-12-months views, likes, comments, best comment per topic; it pauses and retries when YouTube says "too many
requests"). Then `python3 scripts/build_board.py out1.json out2.json ... > board.md` prints the combined leaderboard table.
The current ranked list of every topic tested is `video-styles/topic-leaderboard.md`: check it and `topics-done.md` before
offering topics. Google first: run `scout.py` with "why do we / study shows people who / what happens to your brain when" style
seeds to find what people search, then score the best ones on YouTube. Fact-check every study with web search before offering.
