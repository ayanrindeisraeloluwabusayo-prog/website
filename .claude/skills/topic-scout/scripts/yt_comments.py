#!/usr/bin/env python3
"""Read top YouTube comments where people describe everyday feelings ("this is so me", "I thought I was the only one").

Usage: python3 yt_comments.py [extra search phrases ...]  > out.tsv
Needs YOUTUBE_API_KEY in the environment (free key from Google Cloud, YouTube Data API v3).
Quota: a search costs 100 units, a page of 100 comments costs 1 unit; the free daily quota is 10,000 units,
so one run (~20 searches + comments) uses about 2,200.
Prints: likes <TAB> video title <TAB> comment, best first, only comments that sound like a shared feeling.
"""
import html, json, os, re, sys, urllib.parse, urllib.request

KEY = os.environ.get("YOUTUBE_API_KEY")
if not KEY:
    sys.exit("YOUTUBE_API_KEY is not set (add it in the environment settings, then start a new session)")
API = "https://youtube.googleapis.com/youtube/v3/"

SEEDS = [
    "relatable things everyone does", "things we all do but never talk about", "why do I do this psychology",
    "relatable school moments", "relatable office moments", "relatable university life", "relatable work life",
    "awkward moments everyone has", "things introverts do", "overthinking relatable", "anxiety relatable moments",
    "relatable public transport", "things you do when you are alone", "psychology facts about yourself",
    "nigerian relatable skits", "relatable family moments", "relatable friendship moments", "adulting is hard relatable",
]
FEEL = re.compile(r"\b(this is (so )?me|literally me|i thought i was the only|anyone else|why do i|i do this|"
                  r"felt that|so relatable|too real|called out|every single time|i hate when|why is it that|"
                  r"nobody talks about|is it just me|me when|the way i)\b", re.I)


def get(path, **params):
    params["key"] = KEY
    with urllib.request.urlopen(API + path + "?" + urllib.parse.urlencode(params), timeout=30) as r:
        return json.load(r)


def main():
    seeds = SEEDS + sys.argv[1:]
    seen, rows = set(), []
    for q in seeds:
        try:
            res = get("search", part="snippet", q=q, type="video", maxResults=5, order="relevance", relevanceLanguage="en")
        except Exception as e:  # quota or network: keep what we have
            print(f"# search failed for {q!r}: {e}", file=sys.stderr)
            break
        for it in res.get("items", []):
            vid = it["id"]["videoId"]
            if vid in seen:
                continue
            seen.add(vid)
            title = html.unescape(it["snippet"]["title"])
            try:
                cm = get("commentThreads", part="snippet", videoId=vid, maxResults=100, order="relevance", textFormat="plainText")
            except Exception:
                continue  # comments off
            for c in cm.get("items", []):
                s = c["snippet"]["topLevelComment"]["snippet"]
                text = " ".join(s["textDisplay"].split())
                if FEEL.search(text) and 25 < len(text) < 400:
                    rows.append((s.get("likeCount", 0), title, text))
    rows.sort(key=lambda r: -r[0])
    for likes, title, text in rows:
        print(f"{likes}\t{title[:60]}\t{text}")
    print(f"# {len(seen)} videos, {len(rows)} feeling comments", file=sys.stderr)


if __name__ == "__main__":
    main()
