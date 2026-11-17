/* Collect every spoken line of a unit's lesson packs (+ the engine's fixed Kim lines) for the Voice Pipeline.
 * usage: node tools/collect-unit-lines.js i2 i3 i4 i5   → tools/unit-lines.json  [{ id, voice, text }]
 * Lines already recorded (in any lessons/*.voice.js) are skipped; tools/reuse.json lists them with their file.
 * Spoken by:  narrator = line / prompt / model sentences;  kim = intros, instructions, Kim.say feedback, answers with who:"kim".
 */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const window = {};
global.window = window;
const LIST = process.argv[2] === "--list";
const lessons = process.argv.slice(LIST ? 3 : 2);
const out = new Map();   // key "voice|text"
const add = (voice, text) => { if (!text) return; text = String(text).replace(/\s+/g, " ").trim(); if (text) out.set(voice + "|" + text, { voice, text }); };
const sayLine = (l, def = "narrator") => { if (!l) return; if (typeof l === "string") add(def, l); else if (l.text) add(l.who || def, l.text); };
const PRON = { he: "He's", she: "She's", i: "I'm" }, PR = { he: "He", she: "She", i: "I" };

/* engine + add-on types: fixed lines Kim says */
["Great!", "Well done!", "Super!", "Yes!", "Listen!", "Good job!", "Super listening!", "Super reading!", "Super spelling!", "Great sentences!", "Great answer!",
 "Hmm… try again!", "Say it with me next time!", "I can't hear you. Say it again!", "Say it out loud. Then tap Check!", "What's this? Say it out loud!",
 "Tap a food and listen again!", "Eating or drinking? Try again!", "Yes or no? Look again!", "Look at the picture again. Try again!",
 "Look at the shadow again. Try again!", "Say it out loud. Then lift the lid!", "Look at him!", "Look at her!", "Look! It's you!",
 "Well done! Great sentences!", "Well done! You can ask and answer!", "Good! Say all the food on the plate!", "Don't forget “is”! Say the full sentence.",
 "Don't forget “am”! Say the full sentence.", "Full sentence, please! I'm eating…", "Full sentence, please! He's eating…", "Full sentence, please! She's eating…",
 "Say: Yes, he is!", "Say: Yes, she is!", "Say: No, he isn't!", "Say: No, she isn't!", "Great! Now tap “I'm ready!”", "Well done! You said all the food words!",
 "Grammar done!", "Let's Talk done!"].forEach((t) => add("kim", t));

for (const id of lessons) {
  window.LESSON = null;
  eval(fs.readFileSync(path.join(root, "lessons", id + ".js"), "utf8"));
  const L = window.LESSON;
  const label = (w) => L.words[w].label;
  add("kim", L.finishLine);
  for (const b of L.blocks) for (const s of b.steps) {
    add("kim", s.intro); add("kim", s.instruction); add("kim", s.doneLine);
    if (s.type === "done") add("kim", s.title);
    (s.cues || []).forEach((c) => sayLine(c.line));
    (s.cards || []).forEach((c) => { if (c.full) { add(c.who || "narrator", c.full); add(c.who || "narrator", c.short); } if (c.q) { add("narrator", c.q); add("kim", c.a); } });
    (s.items || []).forEach((it) => {
      if (typeof it !== "object") return;
      if (it.prompt) { [].concat(it.prompt.say || []).forEach((l) => sayLine(l)); }
      [].concat(it.after || []).forEach((l) => sayLine(l));
      if (it.whyWrong) Object.values(it.whyWrong).forEach((t) => add("kim", t));
      if (s.type === "build") sayLine(it.say || { text: it.tiles.join(" ").replace(/\s+([.,?!])/g, "$1"), who: it.who });
      if (s.type === "answer") {
        add("kim", it.q);
        const join = (fs2) => fs2.map(label).join(" and ");
        const parts = it.parts || [{ verb: it.verb || L.words[(it.foods || it.plate)[0]].verb || "eating", foods: it.foods || it.plate }];
        add("narrator", it.short || parts.map((p) => `${PRON[it.s]} ${p.verb} ${join(p.foods)}.`).join(" "));
      }
    });
    if (s.type === "lid") for (const sub of new Set(s.subjects)) for (const f of s.foods)
      add(sub === "i" ? "kim" : "narrator", `${PR[sub]}${sub === "i" ? "'m" : "'s"} ${L.words[f].verb || "eating"} ${label(f)}.`);
    (s.lines || []).forEach((l) => sayLine(l));
    (s.trays || []).forEach((t) => add("narrator", t.say || t.label));
    [].concat(s.after || []).forEach((l) => sayLine(l));
  }
  /* map + explore */
  L.plan.forEach((p) => { add("kim", `Tap ${p.label} to start!`); add("kim", `Great job! Now let's do ${p.label}!`); });
}
if (LIST) { process.stdout.write(JSON.stringify([...out.keys()])); process.exit(0); }
/* what is already recorded */
const rec = {};
for (const f of fs.readdirSync(path.join(root, "lessons")).filter((f) => f.endsWith(".voice.js"))) {
  window.VOICE = {}; eval(fs.readFileSync(path.join(root, "lessons", f), "utf8")); Object.assign(rec, window.VOICE);
}
const todo = [], reuse = {};
for (const [k, v] of out) { if (rec[k]) reuse[k] = rec[k]; else todo.push(v); }
todo.forEach((v, n) => (v.id = "u" + String(n + 1).padStart(3, "0")));
fs.writeFileSync(path.join(__dirname, "unit-lines.json"), JSON.stringify(todo, null, 1));
fs.writeFileSync(path.join(__dirname, "reuse.json"), JSON.stringify(reuse, null, 1));
console.log("lines:", out.size, "already recorded:", Object.keys(reuse).length, "to record:", todo.length);
