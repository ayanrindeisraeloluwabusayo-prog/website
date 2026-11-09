"""Search the Art Institute of Chicago, Wikimedia Commons, NASA and Pixabay for each scene.

Usage: python3 search_media.py plan.json results.json
plan.json:
  {"1_hook": {"aic": ["head eyes closed"], "wm": ["marble bust eyes closed"], "nasa": ["aurora"],
              "pixabay": ["goosebumps", "woman listening music"]}, ...}
Pixabay queries search both videos and photos and need PIXABAY_API_KEY in the environment.
The output maps each scene to a list of {src, title, who, date, thumb, full, page, lic, q, w, h}.
"""
import json, os, sys, time, urllib.parse, urllib.request

UA_WIKI = "explainer-video-research/1.0 (https://github.com/ayanrindeisraeloluwabusayo-prog/website)"
UA_PLAIN = "explainer-video-research/1.0"  # the Art Institute's image server refuses the long form
KEY = os.environ.get("PIXABAY_API_KEY", "")


def get(url, ua):
    req = urllib.request.Request(url, headers={"User-Agent": ua, "AIC-User-Agent": ua})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read())


def aic(q):
    u = "https://api.artic.edu/api/v1/artworks/search?" + urllib.parse.urlencode({
        "q": q, "limit": 12, "fields": "id,title,image_id,artist_title,date_display",
        "query[term][is_public_domain]": "true"})
    return [dict(src="AIC", title=a["title"], who=a.get("artist_title") or "", date=a.get("date_display") or "",
                 thumb=f"https://www.artic.edu/iiif/2/{a['image_id']}/full/400,/0/default.jpg",
                 full=f"https://www.artic.edu/iiif/2/{a['image_id']}/full/843,/0/default.jpg",
                 page=f"https://www.artic.edu/artworks/{a['id']}", lic="Public domain (CC0)")
            for a in get(u, UA_PLAIN)["data"] if a.get("image_id")]


def wm(q):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrsearch": q,
        "gsrlimit": 12, "prop": "imageinfo", "iiprop": "url|extmetadata|mime|size", "iiurlwidth": 330})
    pages = get(u, UA_WIKI).get("query", {}).get("pages", {})
    out = []
    for pg in sorted(pages.values(), key=lambda x: x.get("index", 0)):
        ii = pg["imageinfo"][0]
        if ii.get("mime") not in ("image/jpeg", "image/png"):
            continue
        m = ii.get("extmetadata", {})
        g = lambda k: m.get(k, {}).get("value") or ""
        thumb = ii.get("thumburl", ii["url"]).split("?")[0].replace("thumb.wikimedia.org", "upload.wikimedia.org")
        out.append(dict(src="Wikimedia", title=pg["title"][5:], who=g("Artist"), date=g("DateTimeOriginal"),
                        thumb=thumb, full=ii["url"].split("?")[0], page=ii.get("descriptionurl"),
                        lic=g("LicenseShortName"), credit=g("Attribution") or g("Credit"), w=ii.get("width"), h=ii.get("height")))
    return out


def nasa(q):
    u = "https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": "image", "page_size": 12})
    out = []
    for it in get(u, UA_PLAIN)["collection"]["items"][:12]:
        d = it["data"][0]
        out.append(dict(src="NASA", title=d.get("title", ""), who="NASA", date=d.get("date_created", "")[:10],
                        thumb=it["links"][0]["href"], full=it["links"][0]["href"].replace("~thumb", "~large"),
                        page=f"https://images.nasa.gov/details/{d['nasa_id']}", lic="Public domain (NASA)"))
    return out


def pixabay(q):
    if not KEY:
        raise RuntimeError("PIXABAY_API_KEY is not set")
    out = []
    for kind in ("videos", "photos"):
        base = "https://pixabay.com/api/videos/" if kind == "videos" else "https://pixabay.com/api/"
        params = {"key": KEY, "q": q, "per_page": 12, "safesearch": "true"}
        if kind == "photos":
            params["image_type"] = "photo"
        for h in get(base + "?" + urllib.parse.urlencode(params), UA_PLAIN)["hits"]:
            if "ai generated" in h.get("tags", ""):
                continue
            if kind == "videos":
                v = h["videos"]
                big = v.get("large") if (v.get("large") or {}).get("url") else v["medium"]
                out.append(dict(src="Pixabay video", title=f'{h["tags"]} ({h["duration"]} s)', who=h.get("user", ""),
                                thumb=v["medium"].get("thumbnail") or v["small"].get("thumbnail"), full=big["url"],
                                page=h["pageURL"], lic="Pixabay Content License", w=big.get("width"), h=big.get("height")))
            else:
                out.append(dict(src="Pixabay photo", title=h["tags"], who=h.get("user", ""), thumb=h["webformatURL"],
                                full=h["largeImageURL"], page=h["pageURL"], lic="Pixabay Content License",
                                w=h["imageWidth"], h=h["imageHeight"]))
    return out


SOURCES = {"aic": aic, "wm": wm, "nasa": nasa, "pixabay": pixabay}

if __name__ == "__main__":
    plan, res = json.load(open(sys.argv[1])), {}
    for scene, by_src in plan.items():
        for src, queries in by_src.items():
            for q in queries:
                for attempt in range(4):
                    try:
                        res.setdefault(scene, []).extend(dict(x, q=q) for x in SOURCES[src](q))
                        break
                    except Exception as e:  # rate limits: back off and retry
                        msg = str(e).replace(KEY, "[KEY]") if KEY else str(e)
                        if attempt == 3:
                            print(f"  {scene} {src} '{q}': {msg}")
                        time.sleep(3 * (attempt + 1))
                time.sleep(1.5 if src == "wm" else 0.2)
        print(scene, len(res.get(scene, [])), "results")
    json.dump(res, open(sys.argv[2], "w"), indent=1)
