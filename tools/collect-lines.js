/* Collects every sentence the player can speak for one lesson → JSON for the Voice Studio.
 * Usage: node tools/collect-lines.js lessons/i1.js > tools/i1.lines.json
 * Each line: { who: "narrator" | "kim", text }  (key in the manifest = who + "|" + text)
 */
const fs = require("fs"), vm = require("vm"), path = require("path");
const file = process.argv[2];
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(file, "utf8"), ctx);
const L = ctx.window.LESSON;
const out = new Map();
const add = (who, text) => { if (!text) return; text = String(text).trim(); out.set(who + "|" + text, { who, text }); };
const PRON = { he: "He's", she: "She's", i: "I'm" };

for (const b of L.blocks) for (const s of b.steps) {
  ["instruction", "intro", "ask", "title"].forEach((k) => s[k] && ["instruction", "intro", "ask"].includes(k) && add("kim", s[k]));
  if (s.type === "done") add("kim", s.title);
  if (s.type === "watch") s.cues.forEach((c) => c.line && !c.line.audio && add(c.line.who || "narrator", c.line.text));
  if (s.type === "chunks") s.cards.forEach((c) => { add(c.who || "narrator", c.full); add(c.who || "narrator", c.short); });
  if (s.type === "pick") s.items.forEach((it) => add("narrator", it.say));
  if (s.type === "lid") ["he", "she", "i"].forEach((sb) => s.foods.forEach((f) => add(sb === "i" ? "kim" : "narrator", `${sb === "he" ? "He" : sb === "she" ? "She" : "I"}${sb === "i" ? "'m" : "'s"} eating ${L.words[f].label}.`)));
  if (s.type === "qa") s.cards.forEach((c) => { add("narrator", c.q); add("kim", c.a); });
  if (s.type === "names") s.rounds.forEach((r) => { add("narrator", r.q); add("kim", r.a); });
  if (s.type === "answer") s.items.forEach((it) => {
    add("kim", it.q);
    const fs_ = it.foods || it.plate;
    add("narrator", `${PRON[it.s]} eating ${fs_.map((f) => L.words[f].label).join(" and ")}.`);
  });
}
/* fixed phrases spoken by Kim inside the engine (keep in sync with engine.js) */
const engine = fs.readFileSync(path.join(path.dirname(file), "..", "engine.js"), "utf8");
const lits = new Set();
for (const m of engine.matchAll(/(?:Kim\.say|retry\([^,]+,[^,]+,)\s*\(?\s*([^;]*?)\)\s*[;.]/g)) {
  for (const q of m[1].matchAll(/"([^"]{2,})"/g)) lits.add(q[1]);
}
["Don't forget “is”! Say the full sentence.", "Don't forget “am”! Say the full sentence.",
 "Full sentence, please! I'm eating…", "Full sentence, please! He's eating…", "Full sentence, please! She's eating…"].forEach((t) => lits.add(t));
["Good! Say all the food on the plate!", "Look at the picture again. Try again!"].forEach((t) => lits.add(t));
lits.forEach((t) => { if (/^[A-Z]/.test(t) && !/[`$]/.test(t) && t.length > 3) add("kim", t); });
process.stdout.write(JSON.stringify({ lesson: L.id, lines: [...out.values()] }, null, 1));
