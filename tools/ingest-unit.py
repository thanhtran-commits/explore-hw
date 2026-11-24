"""Write the unit-wide voice manifest (lessons/unit-i.voice.js, loaded on every page).

usage:
  python3 tools/ingest-unit.py                         → manifest from tools/reuse.json only (lines already recorded for I1)
  python3 tools/ingest-unit.py <pipeline-result.json>  → also bring in the new takes (ids u001…) as assets/common/vo-i/<id>.mp3
  python3 tools/ingest-unit.py --unit h <result.json>  → another unit: tools/unit-lines-h.json → assets/common/vo-h/<id>.mp3 (no unit manifest;
                                                          then tools/pack-voice.py --unit h --files . h1 h2 …)

The Voice Pipeline (tools/voice-pipeline.js) sets the pace while generating, so this only loudness-normalises (no time-stretch → no echo).
"""
import base64, json, os, subprocess, sys, tempfile

root = os.path.join(os.path.dirname(__file__), "..")
os.chdir(root)
args = sys.argv[1:]
U = "i"
if args[:1] == ["--unit"]: U, args = args[1], args[2:]
SUF = "" if U == "i" else "-" + U
VO = f"assets/common/vo-{U}"
reuse = json.load(open(f"tools/reuse{SUF}.json"))
lines = json.load(open(f"tools/unit-lines{SUF}.json"))
entries = dict(reuse)
flag = []
if args:
    R = json.load(open(args[0]))
    os.makedirs(VO, exist_ok=True)
    for l in lines:
        b = R["audio"].get(l["id"])
        if not b: continue
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as t: t.write(base64.b64decode(b))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", t.name, "-af", "loudnorm=I=-18:TP=-1.5:LRA=7", "-ar", "44100", "-b:a", "128k",
                        f"{VO}/{l['id']}.mp3"], check=True)
        os.unlink(t.name)
    flag = [x for x in R["lines"] if x.get("state") == "warn"]
if U != "i":   # other units: the mp3 files are all we need here — pack-voice.py writes each lesson's voice file
    print(sum(os.path.exists(f"{VO}/{l['id']}.mp3") for l in lines), "of", len(lines), "lines have a take;", len(flag), "still flagged")
    for x in flag: print(" ", x["id"], x["text"], "|", "; ".join(i["word"] + ": " + i["problem"] for i in x.get("issues", [])))
    sys.exit(0)
for l in lines:
    if os.path.exists(f"assets/common/vo-i/{l['id']}.mp3"):
        entries[l["voice"] + "|" + l["text"]] = f"assets/common/vo-i/{l['id']}.mp3"
with open("lessons/unit-i.voice.js", "w") as f:
    f.write("/* Unit I voice lines for I2–I5 (+ I1 lines they reuse). Made by tools/voice-pipeline.js → tools/ingest-unit.py. Loaded on every page. */\n")
    f.write("window.VOICE = Object.assign(window.VOICE || {}, " + json.dumps(entries, ensure_ascii=False, indent=1) + ");\n")
print(len(entries), "entries;", len(flag), "still flagged")
for x in flag: print(" ", x["id"], x["text"], "|", "; ".join(i["word"] + ": " + i["problem"] for i in x.get("issues", [])))
