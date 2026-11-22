"""Collect what real people type into Google after everyday "why do I..." starters, keep the
psychology/behaviour ones, drop medical ones and topics already made, and print them ranked.

usage: python3 scout.py [extra seed ...]   (no API key needed; uses Google's public suggestion endpoint)
"""
import json, re, string, sys, time, urllib.parse, urllib.request, pathlib

SEEDS = ["why do i", "why do we", "why do people", "why do i always", "why do i feel", "why do i keep",
         "why does my brain", "why can't i stop", "is it normal to", "why do humans", "why do we all"] + sys.argv[1:]
MEDICAL = re.compile(r"sweat|pee|poop|diarr|fart|nause|dizz|headache|bruis|blood|pain|hurt|itch|rash|cough|vomit|"
                     r"period|pregnan|discharge|chest|stomach|bloat|cramp|hair loss|acne|fever|tired all|allerg|"
                     r"constipat|ache|swollen|numb|hiccup|urin|smell bad|bad breath|lump|kidney|liver", re.I)
HERE = pathlib.Path(__file__).resolve().parents[3]
DONE = (HERE / "video-styles" / "topics-done.md").read_text().lower() if (HERE / "video-styles" / "topics-done.md").exists() else ""

def suggest(q):
    u = "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=" + urllib.parse.quote(q)
    try:
        return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=10))[1]
    except Exception:
        return []

score = {}
for seed in SEEDS:
    for i, s in enumerate(suggest(seed)):
        score[s] = score.get(s, 0) + 30 - i          # higher in the list = searched more
    for ch in string.ascii_lowercase:
        for i, s in enumerate(suggest(f"{seed} {ch}")):
            score[s] = score.get(s, 0) + 10 - i
        time.sleep(0.05)

keep = [(v, s) for s, v in score.items() if not MEDICAL.search(s) and len(s.split()) >= 4]
keep = [(v, s) for v, s in keep if not any(w in DONE for w in re.findall(r"[a-z]{6,}", s) if w not in {"always", "people", "really", "things", "someone"})]
for v, s in sorted(keep, reverse=True)[:120]:
    print(f"{v:4d}  {s}")
