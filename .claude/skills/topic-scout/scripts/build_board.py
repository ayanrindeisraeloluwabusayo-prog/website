import json, math, sys
files=sys.argv[1:]
rows={}
for f in files:
    for k,v in json.load(open(f)).items():
        rows[k]={"views":v["views"],"likes":v["likes"],"comments":v["comments"],"tc":v["top"][0][0] if v.get("top") else 0,"recent":v.get("recent_views")}
STUDY={
"baby amnesia":"Yates et al. 2025, Science","time slows in danger":"Stetson, Fiesta & Eagleman 2007, PLoS ONE","dunning kruger":"Kruger & Dunning 1999, JPSP",
"alone with thoughts shock":"Wilson et al. 2014, Science","why we forget dreams":"Eichenlaub et al. 2014","money happiness":"Killingsworth, Kahneman & Mellers 2023, PNAS",
"no inner voice":"Nedergaard & Lupyan 2024, Psych. Science","aphantasia":"Zeman et al. 2015, Cortex","36 questions love":"Aron et al. 1997, PSPB","milgram obedience":"Milgram 1963",
"lie detection":"Bond & DePaulo 2006","birth order":"Rohrer et al. 2015, PNAS","breakup pain":"Kross et al. 2011, PNAS","lonely in crowd":"Cacioppo & Hawkley 2009",
"mirror vs photo":"Mita, Dermer & Knight 1977","sleep paralysis":"Sharpless & Barber 2011","stanford prison":"Le Texier 2019","fake smile":"Gunnery, Hall & Ruben 2013",
"vicarious cringe":"Krach et al. 2011","night owl":"Samson et al. 2017","synesthesia":"Simner et al. 2006","boredom good":"Mann & Cadman 2014",
"spicy food":"Rozin & Schiller 1980","why we kiss":"Jankowiak et al. 2015","petting animals":"Nagasawa et al. 2015, Science",
"explanation for everything (split brain)":"Gazzaniga split-brain","uncanny valley":"Mathur & Reichling 2015; Steckenfinger & Ghazanfar 2009","fear of spiders babies":"Hoehl et al. 2017",
"walking creativity":"Oppezzo & Schwartz 2014","brain when you die":"Xu, Borjigin et al. 2023, PNAS","what makes people happy (Harvard study)":"Harvard Study of Adult Development",
"left handed":"Papadatou-Pastou 2020; Faurie & Raymond 2005","sad songs":"Vuoskoski et al. 2012","like being scared":"Andersen, Clasen et al. 2020",
"why people lie":"Serota, Levine & Boster 2010","why we fall in love":"Marazziti et al. 1999","tears of joy":"Gelstein et al. 2011, Science","hard on ourselves":"Breines & Chen 2012",
"imaginary friends":"Taylor et al. 2004","invisible gorilla":"Simons & Chabris 1999","change blindness (person swap)":"Simons & Levin 1998",
"the dress":"Wallisch 2017, J. Vision","mcgurk effect":"McGurk & MacDonald 1976, Nature","rubber hand illusion":"Botvinick & Cohen 1998, Nature","phone on desk brain drain":"Ward et al. 2017",
"ganzfeld hallucinate":"Wackermann, Pütz & Allefeld 2008, Cortex","mirror gazing strange face":"Caputo 2010, Perception","saying ow":"Swee & Schirmer 2015, J. Pain",
"random number 37 / 7":"Kubovy & Psotka 1976","quietest room hallucinate":"Mason & Brady 2009","smell of fear":"de Groot et al. 2012, Psych. Science",
"brain decides before you know":"Soon et al. 2008, Nature Neuroscience","swearing pain":"Stephens et al. 2009, NeuroReport","christmas decorations early":"Werner et al. 1989 (happier claim = myth)",
"night owls smarter":"Imperial College, BMJ Public Health 2024","comparing yourself":"Vogel et al. 2014",
}
NOTE={"procrastination":"made already","falling dreams":"hypnic jerk, seen before","want what you can't have":"off-topic results","crying at movies":"off-topic results",
"phone checking":"off-topic results","christmas decorations early":"recent views = an unrelated comedy reel","random number 37 / 7":"recent views = unrelated 'part 37' videos"}
sc=lambda r: round(0.45*math.log10(r["views"]+1)+0.2*math.log10(r["likes"]+1)+0.2*math.log10(r["comments"]+1)+0.15*math.log10(r["tc"]+1),2)
f=lambda n: f"{n/1e6:.1f}M" if n>=1e6 else (f"{n/1e3:.0f}k" if n>=1e3 else str(n))
L=sorted(rows.items(),key=lambda kv:-sc(kv[1]))
out=["# Topic leaderboard (YouTube engagement + Google searches)","",
"Built by the topic-scout skill (`scripts/yt_engage.py` + `scripts/build_board.py`), 26-27 Nov 2026. **Score** = 45% total views of the",
"top 6 videos for the topic, 20% likes, 20% comments, 15% likes on the single best comment (log scale: 10x the views adds a fixed amount).",
"**Last 12 months** = views of the most viewed videos published in the past year (measured from round 12 on; check the note, since a",
"recent search can pick up unrelated videos). Topics with a study were fact-checked and offered; the rest were tested and dropped.",
"Check `topics-done.md` before reusing.","",
"| # | Topic | Score | Views | Last 12 months | Likes | Comments | Best comment | Study | Note |","|---|---|---|---|---|---|---|---|---|---|"]
for i,(k,r) in enumerate(L,1):
    out.append(f"| {i} | {k} | {sc(r)} | {f(r['views'])} | {f(r['recent']) if r['recent'] is not None else '–'} | {f(r['likes'])} | {f(r['comments'])} | {f(r['tc'])} | {STUDY.get(k,'–')} | {NOTE.get(k,'')} |")
print("\n".join(out))
for i,(k,r) in enumerate(L[:20],1): print(i,k,sc(r),f(r['views']),file=sys.stderr)
