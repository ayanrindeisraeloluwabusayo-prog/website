# Fits the picture to the owner's voice: each camera cut of the film (old frame) is tied to the word it belongs to in
# the cleaned recording (voice3/words.json). Writes voice3/retime.json (old time -> new time anchors) and builds the
# re-timed film from the rendered one, piece by piece.
import json, subprocess, sys
W = json.load(open('voice3/words.json'))
PAIRS = [(0, "This woman"), (123, "You see,"), (201, "Whosoever"), (284, "Her husband's"), (306, "grate,"), (320, "press,"), (328, "and fry"),
  (344, "same day."), (372, "By evening,"), (423, "Hers?"), (446, "One sack"), (483, "under a"), (516, "Her mother-in-law"), (562, "She said,"),
  (595, "She's raising"), (610, 'it."'), (628, "Every market"), (651, "sell out"), (683, "She arrives"), (718, "customers"), (749, "Her garri"),
  (809, "The whole"), (857, "lazy."), (878, "Then the"), (913, "One month,"), (929, "two months."), (950, "The yams"), (983, "The maize"),
  (1022, "Only the"), (1070, "So everybody"), (1104, "and night."), (1123, "The family"), (1140, "because"), (1157, "they love"), (1177, "First,"),
  (1213, "His knee"), (1247, "Then the children"), (1263, "walking"), (1301, "Then one"), (1334, "couldn't"), (1352, "up from"), (1380, "You see,"),
  (1403, "carries a"), (1439, "cyanide."), (1469, "Grating"), (1500, "but it"), (1560, "and into"), (1619, "And bitter"), (1647, "carries the"),
  (1685, "In Mozambique,"), (1732, "a statistic"), (1766, "left more"), (1821, "So that"), (1859, "was never"), (1896, "It was"), (1932, "compound.")]
A = []; i = 0
for old, phrase in PAIRS:
    ph = phrase.split()
    j = next(k for k in range(i, len(W)) if [w['w'] for w in W[k:k + len(ph)]] == ph)
    t = max(0.0, W[j]['start'] - 0.10) if old else 0.0
    if phrase == "The whole":  # "Theirs is quick." was not recorded: its picture (old frames 781-809) is dropped
        A.append((781 / 30, t)); 
    A.append((old / 30, t)); i = j + 1
END = W[-1]['end'] + 1.2
A.append((1975 / 30, END))
assert all(A[k + 1][1] >= A[k][1] and A[k + 1][0] > A[k][0] for k in range(len(A) - 1)), "anchors out of order"
json.dump({"anchors": A}, open('voice3/retime.json', 'w'))
segs = [(A[k], A[k + 1]) for k in range(len(A) - 1) if A[k + 1][1] - A[k][1] > 0.04]
print(len(A), "anchors,", len(segs), "pieces, new length", round(END, 2), "s; stretch per piece:", [round((b[1] - a[1]) / (b[0] - a[0]), 2) for a, b in segs])
if len(sys.argv) > 1:
    n = len(segs)
    fc = f"[0:v]split={n}" + "".join(f"[s{i}]" for i in range(n)) + ";"
    for i, ((o0, n0), (o1, n1)) in enumerate(segs):
        fc += f"[s{i}]trim=start={o0:.4f}:end={o1:.4f},setpts=(PTS-STARTPTS)*{(n1 - n0) / (o1 - o0):.5f}[p{i}];"
    fc += "".join(f"[p{i}]" for i in range(n)) + f"concat=n={n}:v=1,fps=30[v]"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", sys.argv[1], "-filter_complex", fc, "-map", "[v]", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", sys.argv[2]], check=True)
