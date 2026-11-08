"""Thumbnail sheets for one scene: python3 grid.py results.json <scene> <outdir>
Writes <outdir>/grid_<scene>_N.jpg (48 per sheet, numbered) and <scene>_items.json (same numbering)."""
import json, sys, os, time, hashlib, urllib.request
from PIL import Image, ImageDraw
UA = "explainer-video-research/1.0 (https://github.com/ayanrindeisraeloluwabusayo-prog/website)"
res, scene, out = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
os.makedirs(f"{out}/thumbs", exist_ok=True)
items, seen = [], set()
for x in res[scene]:
    if "err" in x or x["thumb"] in seen: continue
    if x.get("mime") and x["mime"] not in ("image/jpeg", "image/png"): continue
    if x["src"] == "Wikimedia":
        import re
        x["thumb"] = re.sub(r"/(\d+)px-", "/330px-", x["thumb"].split("?")[0].replace("thumb.wikimedia.org", "upload.wikimedia.org"))
    seen.add(x["thumb"]); items.append(x)
for i, x in enumerate(items):
    p = f"{out}/thumbs/{hashlib.md5(x['thumb'].encode()).hexdigest()}.jpg"; x["local"] = p
    if not os.path.exists(p):
        for t in range(3):
            try:
                d = urllib.request.urlopen(urllib.request.Request(x["thumb"], headers={"User-Agent": UA if x["src"] == "Wikimedia" else "explainer-video-research/1.0"}), timeout=30).read()
                open(p, "wb").write(d); break
            except Exception: time.sleep(2 + 2 * t)
        if x["src"] == "Wikimedia": time.sleep(1.5)
json.dump(items, open(f"{out}/{scene}_items.json", "w"), indent=1)
C, W, H = 8, 190, 150
for s in range(0, len(items), 48):
    chunk = items[s:s + 48]; rows = (len(chunk) + C - 1) // C
    g = Image.new("RGB", (C * W, rows * (H + 30)), "white"); d = ImageDraw.Draw(g)
    for j, x in enumerate(chunk):
        cx, cy = (j % C) * W, (j // C) * (H + 30)
        try:
            im = Image.open(x["local"]).convert("RGB"); im.thumbnail((W - 6, H - 6)); g.paste(im, (cx + 3, cy + 3))
        except Exception: d.text((cx + 10, cy + 100), "no image", fill="red")
        d.text((cx + 4, cy + H + 2), f"{s + j} {x['src'][:4]} {x['title'][:22]}", fill="black")
        d.text((cx + 4, cy + H + 15), (x.get("lic") or "")[:40], fill="blue")
    g.save(f"{out}/grid_{scene}_{s // 48}.jpg", quality=80)
print(scene, len(items))
