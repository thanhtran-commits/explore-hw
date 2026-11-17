"""Bring a Voice Pipeline result (explore-voice-<lesson>.json from the user's Downloads) into the app.

usage: python3 tools/ingest-voice.py <result.json> <folder-name, e.g. vo4>
- writes each take to assets/<lesson>/<folder>/<id>.mp3 (ids 118-127 go to assets/common/<folder>/)
- only loudness-normalises (-18 LUFS); pace was set at generation time, so there is NO time-stretch (no echo)
- repoints lessons/<lesson>.voice.js and lessons/common.voice.js to the new folder for the ids it received
- prints the lines Gemini still flagged, for the user to listen to
"""
import base64, json, os, re, subprocess, sys, tempfile

src, folder = sys.argv[1], sys.argv[2]
R = json.load(open(src))
lesson = R["unit"].lower()                       # "I1" -> "i1"
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
# where each id lives = the folder its current manifest entry points to (lesson or common)
HOME = {}
for man in [f"lessons/{lesson}.voice.js", "lessons/common.voice.js"]:
    for base, fid in re.findall(r'"(assets/[a-z0-9]+)/vo\d*/(\w+)\.mp3"', open(man).read()):
        HOME[fid] = base
done = []
for id_, b in R["audio"].items():
    base = HOME.get(id_, f"assets/{lesson}")
    os.makedirs(f"{base}/{folder}", exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as t:
        t.write(base64.b64decode(b))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", t.name, "-af", "loudnorm=I=-18:TP=-1.5:LRA=7",
                    "-ar", "44100", "-b:a", "128k", f"{base}/{folder}/{id_}.mp3"], check=True)
    os.unlink(t.name); done.append(id_)

for man in [f"lessons/{lesson}.voice.js", "lessons/common.voice.js"]:
    s = open(man).read()
    s = re.sub(r'"(assets/[a-z0-9]+)/vo\d*/(\w+)\.mp3"',
               lambda m: f'"{m.group(1)}/{folder}/{m.group(2)}.mp3"' if m.group(2) in done else m.group(0), s)
    s = re.sub(r"^/\*.*?\*/", f"/* Recorded voice lines — ElevenLabs (Kim: \"Blondie\", Narrator: \"Sally\"), eleven_multilingual_v2, "
               f"made by tools/voice-pipeline.js {R['made'][:10]}: pace set at generation (target {R['target']} syl/s), "
               f"pronunciation checked by {R['gemini']}, loudness normalised. No time-stretch. */", s, count=1, flags=re.S)
    open(man, "w").write(s)

flag = [l for l in R["lines"] if l.get("state") == "warn"]
print(f"{len(done)} lines written to {folder}; {len(flag)} still flagged:")
for l in flag:
    print(" ", l["id"], l["text"], "|", "; ".join(f"{i['word']}: {i['problem']}" for i in l.get("issues", [])) or l.get("heard", ""))
