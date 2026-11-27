"""Score topics by YouTube engagement. usage: python3 yt_engage.py topics.json out.json
topics.json = {"name": ["search phrase", "comment keyword regex"], ...}. Per topic: total views/likes/comments of the top 6 videos,
views of the most-viewed videos from the last 12 months, and the most-liked matching comments. ~205 quota units per topic
(free quota 10,000/day; search has its own daily cap, resets midnight US Pacific)."""
import os, json, sys, urllib.request, urllib.parse, html, re, math
import datetime
KEY=os.environ["YOUTUBE_API_KEY"]; SINCE=(datetime.datetime.utcnow()-datetime.timedelta(days=365)).strftime("%Y-%m-%dT00:00:00Z")
import time
def get(path, **p):
    p["key"]=KEY
    for k in range(5):
        time.sleep(1.2)
        try: return _get(path,p)
        except urllib.error.HTTPError as e:
            if e.code in (429,503): time.sleep(20*(k+1)); continue
            raise
    return _get(path,p)
def _get(path,p):
    return json.load(urllib.request.urlopen("https://youtube.googleapis.com/youtube/v3/"+path+"?"+urllib.parse.urlencode(p),timeout=30))
def stats(ids):
    if not ids: return []
    st=get("videos",part="statistics,snippet",id=",".join(ids))
    return [(int(v["statistics"].get("viewCount",0)),int(v["statistics"].get("likeCount",0)),int(v["statistics"].get("commentCount",0)),html.unescape(v["snippet"]["title"]),v["id"]) for v in st.get("items",[])]
topics=json.load(open(sys.argv[1])); out={}
for name,(q,kw) in topics.items():
    try:
        s=get("search",part="snippet",q=q,type="video",maxResults=6,order="relevance",relevanceLanguage="en")
        r=get("search",part="snippet",q=q,type="video",maxResults=6,order="viewCount",publishedAfter=SINCE,relevanceLanguage="en")
    except Exception as e: print("## search failed",name,e); break
    vids=stats([i["id"]["videoId"] for i in s.get("items",[])]); rec=stats([i["id"]["videoId"] for i in r.get("items",[])])
    hits=[]
    for v in sorted(vids,reverse=True)[:3]:
        try: c=get("commentThreads",part="snippet",videoId=v[4],maxResults=100,order="relevance",textFormat="plainText")
        except Exception: continue
        for it in c.get("items",[]):
            sn=it["snippet"]["topLevelComment"]["snippet"]; t=" ".join(sn["textDisplay"].split())
            if 30<len(t)<260 and (not kw or re.search(kw,t,re.I)): hits.append((sn["likeCount"],t))
    hits.sort(reverse=True)
    V=sum(v[0] for v in vids); Lk=sum(v[1] for v in vids); C=sum(v[2] for v in vids); RV=sum(v[0] for v in rec); TC=hits[0][0] if hits else 0
    score=round(0.35*math.log10(V+1)+0.25*math.log10(RV+1)+0.15*math.log10(Lk+1)+0.15*math.log10(C+1)+0.10*math.log10(TC+1),2)
    out[name]={"views":V,"recent_views":RV,"likes":Lk,"comments":C,"top_comment":TC,"score":score,"top":hits[:4],"recent":[(v[0],v[3]) for v in sorted(rec,reverse=True)[:2]]}
    print(f"\n### {name}: SCORE {score} | views {V/1e6:.1f}M, last-12-months {RV/1e6:.1f}M, likes {Lk/1e3:.0f}k, comments {C/1e3:.1f}k")
    for x in sorted(rec,reverse=True)[:2]: print(f"   recent {x[0]/1e6:.2f}M  {x[3][:70]}")
    for h in hits[:3]: print(f"  [{h[0]}] {h[1][:170]}")
json.dump(out,open(sys.argv[2],"w"),indent=1)
