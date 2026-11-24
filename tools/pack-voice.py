"""Pack each lesson's voice lines into its own lessons/<id>.voice.js (loaded only when that lesson opens).

New takes (assets/common/vo-i/*.mp3) are embedded as data: URIs (re-encoded 64 kbps mono — plenty for speech),
so the published app stays far below the 512-file limit. Lines already recorded for I1 keep pointing to their mp3.
usage: python3 tools/pack-voice.py [--unit h] [--files OUTDIR] i2 i3 i4 i5   (--unit h: tools/*-h.json, assets/common/vo-h)
  --files OUTDIR: for the real website (Dokploy) — point to the mp3 files instead of embedding, write the .voice.js into OUTDIR/lessons
"""
import base64, json, os, subprocess, sys, tempfile

root = os.path.join(os.path.dirname(__file__), "..")
os.chdir(root)
args = sys.argv[1:]
U = "i"
if args[:1] == ["--unit"]: U, args = args[1], args[2:]
SUF = "" if U == "i" else "-" + U
reuse = json.load(open(f"tools/reuse{SUF}.json"))
lines = json.load(open(f"tools/unit-lines{SUF}.json"))
newfile = {l["voice"] + "|" + l["text"]: f"assets/common/vo-{U}/{l['id']}.mp3" for l in lines}
cache = {}
def data_uri(p):
    if p not in cache:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as t: out = t.name
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ac", "1", "-b:a", "64k", out], check=True)
        cache[p] = "data:audio/mpeg;base64," + base64.b64encode(open(out, "rb").read()).decode()
        os.unlink(out)
    return cache[p]
FILES = None
if args and args[0] == "--files": FILES, args = args[1], args[2:]
for lid in args:
    # which lines this lesson speaks: run the collector for this lesson only, in "list" mode
    keys = json.loads(subprocess.check_output(["node", "tools/collect-unit-lines.js", "--list", lid]))   # --list ignores --unit
    entries = {}
    for k in keys:
        if k in reuse: entries[k] = reuse[k]
        elif k in newfile and os.path.exists(newfile[k]): entries[k] = newfile[k] if FILES else data_uri(newfile[k])
    dest = os.path.join(FILES, "lessons") if FILES else "lessons"
    os.makedirs(dest, exist_ok=True)
    with open(f"{dest}/{lid}.voice.js", "w") as f:
        f.write(f"/* {lid.upper()} voice lines — ElevenLabs via tools/voice-pipeline.js (pace set at generation, Gemini pronunciation check). "
                "New takes embedded as data URIs (64 kbps mono); I1 takes reused by path. Made by tools/pack-voice.py. */\n")
        f.write("window.VOICE = Object.assign(window.VOICE || {}, " + json.dumps(entries, ensure_ascii=False) + ");\n")
    print(lid, len(keys), "lines,", len(entries), "with audio,", round(os.path.getsize(f"{dest}/{lid}.voice.js") / 1e6, 2), "MB")
