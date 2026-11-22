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

Reddit is not wired in yet: anonymous reading is blocked from cloud sessions. It needs a free Reddit "script" app
key (saved through the environment's credential form) and `oauth.reddit.com` allowed.
