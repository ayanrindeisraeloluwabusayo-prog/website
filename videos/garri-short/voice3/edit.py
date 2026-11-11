# Cuts the stumbles out of the owner's recording, tightens long pauses, cleans the sound, and writes the timing of
# every kept word (voice3/words.json). Token numbers refer to voice3/scribe.json (words only, spacing removed).
import json, subprocess, re
d = json.load(open('voice3/scribe.json'))
T = [w for w in d['words'] if w['type'] != 'spacing']
# kept token ranges (inclusive). Cut: "She leaves a--", "Her family--", "This is--", the first "She arrives on day
# three.", "there is... There is--", "they lo-", and "nineteen eighty-eight in" (the year is 1981; the newspaper on
# screen carries it).
KEEP = [(3, 36), (39, 71), (74, 90), (96, 110), (115, 162), (165, 242), (246, 283)]
# what each kept token shows in the captions when it differs from the transcription
FIX = {3: "This", 39: "Her", 57: "One", 56: "Hers?", 72: "This", 74: '"This', 104: "have", 110: "sour.", 119: "she's", 158: "rush", 164: "", 205: "carries",
       212: "breaks", 228: "squeezed", 253: "rushed", 266: "sour", 242: "In", 246: "Mozambique,"}
kept = [i for a, b in KEEP for i in range(a, b + 1)]
PRE, POST = 0.07, 0.10
islands = []  # [in_start, in_end, [token ids]]
for n, i in enumerate(kept):
    w = T[i]
    if islands:
        j = kept[n - 1]
        gap = w['start'] - T[j]['end']
        if i == j + 1 and gap <= 0.30:
            islands[-1][1] = w['end'] + POST; islands[-1][2].append(i); continue
    islands.append([max(0, w['start'] - PRE), w['end'] + POST, [i]])
# pause after each island: a breath after a sentence, a short beat after a comma, a tiny gap inside a phrase
def pause_after(tok, nxt):
    t = T[tok]['text']
    if re.search(r'[.?!]"?$', t) or tok == 110: return 0.42
    if t.endswith(','): return 0.20
    return 0.06 if nxt != tok + 1 else 0.10
out_t = 0.0; words = []; parts = []
for k, (a, b, toks) in enumerate(islands):
    parts.append((a, b))
    for i in toks:
        w = T[i]
        txt = FIX.get(i, w['text'])
        if txt: words.append({"w": txt, "start": round(out_t + w['start'] - a, 3), "end": round(out_t + w['end'] - a, 3)})
    out_t += (b - a)
    if k + 1 < len(islands):
        gap = pause_after(toks[-1], islands[k + 1][2][0])
        parts.append(("sil", max(0.0, gap - (PRE + POST) * 0.5))); out_t += max(0.0, gap - (PRE + POST) * 0.5)
for w in words: w['frame'] = round(w['start'] * 30)
json.dump(words, open('voice3/words.json', 'w'), indent=1)
# cut with 12 ms fades at every joint, then clean: rumble filter, light noise reduction, presence, gentle compression
fc = []; lab = []
for n, p in enumerate(parts):
    if p[0] == "sil":
        fc.append(f"anullsrc=r=48000:cl=mono,atrim=0:{p[1]:.4f}[p{n}]")
    else:
        dur = p[1] - p[0]
        fc.append(f"[0:a]aresample=48000,pan=mono|c0=0.5*c0+0.5*c1,atrim={p[0]:.4f}:{p[1]:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={dur - 0.012:.4f}:d=0.012[p{n}]")
    lab.append(f"[p{n}]")
fc.append("".join(lab) + f"concat=n={len(parts)}:v=0:a=1,highpass=f=85,afftdn=nr=9:nf=-45,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=220:t=q:w=1:g=-1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,alimiter=limit=0.9[a]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "voice3/raw.mp3", "-filter_complex", ";".join(fc), "-map", "[a]", "-ar", "48000", "-ac", "2", "voice3/voice.wav"], check=True)
print(len(words), "words,", round(out_t, 2), "s,", len(islands), "pieces")
print(" ".join(w['w'] for w in words))
