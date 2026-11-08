"""Build the picture-options contact sheet the owner chooses from (one HTML file, pictures embedded).

Usage: python3 contact_sheet.py picks.json <grid-outdir> out.html "Video title"
picks.json (scene keys match the grid.py scene names; each pick is an index on that scene's sheet):
  {"1_hook": {"time": "0-3 s", "words": "You're not <b>lazy.</b>", "feel": "The hook: slumped, guilty.",
              "picks": [[83, "Why this one fits, in one line."], [12, "..."]]}, ...}
Put your own favourite first: it becomes option A. Also writes chosen.json (label -> item) next to out.html.
"""
import base64, html, json, os, re, sys

picks, gdir, out, title = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3], sys.argv[4]
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()
rows, chosen = [], {}
for n, (scene, sc) in enumerate(picks.items(), 1):
    items = json.load(open(os.path.join(gdir, f"{scene}_items.json")))
    cards = []
    for k, (i, note) in enumerate(sc["picks"]):
        x = items[i]
        label = f"{n}{'ABCDEFGH'[k]}"
        chosen[label] = dict(x, scene=scene, note=note)
        b64 = base64.b64encode(open(x["local"], "rb").read()).decode()
        vid = "video" in x["src"]
        px = "Pixabay" in x["src"]
        name = clean(x["title"]).split(",")[0].capitalize() if px else clean(x["title"])[:80]
        who = clean(x.get("who"))[:60]
        lic = "Pixabay licence: free, no credit needed" if px else x.get("lic", "")
        free = px or any(w in lic.lower() for w in ("public domain", "cc0", "no restrictions"))
        src = "Pixabay" if px else {"AIC": "Art Institute of Chicago", "Wikimedia": "Wikimedia Commons"}.get(x["src"], x["src"])
        credit = "" if free else f'<p class="credit">Credit line: “{html.escape(clean(x["title"]))}” by {html.escape(who or "unknown")}, {html.escape(lic)}, via {src}</p>'
        cards.append(
            f'<figure><div class="ph"><img src="data:image/jpeg;base64,{b64}" alt=""><span class="lab">{label}</span>'
            f'{"<span class=vid>▶ clip</span>" if vid else ""}</div><figcaption><p class="why">{html.escape(note)}</p>'
            f'<p class="meta"><b>{html.escape(name)}</b>{" · " + html.escape(who) if who else ""}{" · " + html.escape(clean(x.get("date"))) if x.get("date") else ""}</p>'
            f'<p class="lic {"pd" if free else "by"}">{html.escape(lic)} · {src}</p>{credit}'
            f'<a href="{html.escape(x["page"] or "")}">{"watch on Pixabay" if vid else "source page"}</a></figcaption></figure>')
    rows.append(f'<section><header><span class="n">{n}</span><div><p class="t">{sc["time"]}</p><h2>{sc["words"]}</h2>'
                f'<p class="feel">{html.escape(sc["feel"])}</p></div></header><div class="cards">{"".join(cards)}</div></section>')
css = """:root{--bg:#f6f5f2;--card:#fff;--ink:#141414;--mute:#666;--blue:#0243F1;--line:#e3e1dc;--pd:#0a7a3d;--by:#a15c00}
@media (prefers-color-scheme:dark){:root{--bg:#121212;--card:#1c1c1c;--ink:#f1f1f1;--mute:#a3a3a3;--line:#2c2c2c;--blue:#6f95ff;--pd:#4fcf88;--by:#f0a94a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 -apple-system,system-ui,Segoe UI,Roboto,sans-serif}
main{max-width:1180px;margin:0 auto;padding:28px 16px 60px}h1{font:600 30px/1.1 Georgia,serif;margin:0 0 8px}.intro{color:var(--mute);max-width:740px;margin:0 0 28px}
section{border-top:1px solid var(--line);padding:26px 0}header{display:flex;gap:14px;margin-bottom:16px}.n{background:var(--blue);color:#fff;font-weight:700;min-width:34px;height:34px;border-radius:50%;display:grid;place-items:center}
.t{margin:0;color:var(--mute);font-size:13px}h2{margin:2px 0 4px;font:400 24px/1.15 Georgia,serif}h2 b{color:var(--blue);font-style:italic}.feel{margin:0;color:var(--mute)}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.cards{grid-template-columns:1fr}}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}.ph{position:relative;background:#000;aspect-ratio:4/5;display:grid;place-items:center}.ph img{max-width:100%;max-height:100%;object-fit:contain}
.lab{position:absolute;top:8px;left:8px;background:var(--blue);color:#fff;font-weight:700;padding:2px 9px;border-radius:6px}.vid{position:absolute;top:8px;right:8px;background:#000c;color:#fff;font-size:12px;font-weight:600;padding:3px 8px;border-radius:6px}
figcaption{padding:10px 12px 12px;font-size:13px}figcaption p{margin:0 0 6px}.why{font-size:14px}.meta{color:var(--mute)}.lic{font-weight:600}.lic.pd{color:var(--pd)}.lic.by{color:var(--by)}.credit{font-size:12px;color:var(--mute);font-style:italic}a{color:var(--blue);font-size:12px}"""
page = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{html.escape(title)} Picture Options</title><style>{css}</style></head><body><main><h1>{html.escape(title)}: picture options</h1>'
        '<p class="intro">These are the <b>picture</b> moments; the moving graphics are drawn in code. A is my pick for each: reply '
        '<b>“go”</b> to use all the A’s, or list your own, e.g. “1B, 2A, 3C…”. <b style="color:var(--pd)">Green</b> = free, no credit needed; '
        '<b style="color:var(--by)">orange</b> = needs the credit line shown.</p>' + "".join(rows) + "</main></body></html>")
open(out, "w").write(page)
json.dump(chosen, open(os.path.join(os.path.dirname(os.path.abspath(out)), "chosen.json"), "w"), indent=1)
print(out, len(page) // 1024, "KB")
