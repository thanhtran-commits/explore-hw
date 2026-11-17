/* EXPLORE Homework — add-on step types (CP6b, 2026-11-17)
 * choose · spell · build · sort · gaptext
 * Loaded BEFORE engine.js; the engine calls this with its internals (window.EXPLORE_API).
 *
 * Shared rules (decisions #29, #36):
 *  - wrong answer = DOL template: shake + red border + "tè tè" sound; 2nd miss on the same item → the right one blinks.
 *  - Reading / writing steps (skill R, W): the sentence is read aloud only AFTER the student answers.
 *    Listening steps (skill L): the audio plays first, with replay + 🐢.
 *  - Each round has a tray slot; a right answer flies its picture into the slot.
 */
(window.EXPLORE_ADDONS = window.EXPLORE_ADDONS || []).push(function (X) {
  const { TYPES, FRAME, h, sleep, shuffle, img, ICON, Audio_, Kim, Results, makeTray } = X;
  FRAME.push("choose", "spell", "build", "sort", "gaptext");

  /* ---------- helpers ---------- */
  function wrongFx(el) {
    Audio_.sfx("practice-wrong"); Kim.pose("think"); setTimeout(() => Kim.poseNow === "think" && Kim.pose("idle"), 1200);
    el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong");
    setTimeout(() => el.classList.remove("wrong"), 900);
  }
  const say = (line) => !line ? Promise.resolve() : typeof line === "string" ? Audio_.speak(line, "narrator")
    : line.word ? Audio_.word(line.word) : Audio_.speak(line.text, line.who || "narrator");   /* { word: id } = the DOL word recording */
  async function sayAll(lines) { for (const l of [].concat(lines || [])) { await say(l); await sleep(180); } }
  function scoreCard(field, score, total) {
    field.append(h("div", { class: "reveal" }, h("div", { class: "card" }, h("div", { class: "w", style: "color:var(--ink)" }, "⭐ " + score + " / " + total))));
  }
  async function finishStep(step, run, field, res, total, msg) {
    const score = res.filter(Boolean).length;
    Results.put(step.id, { firstTry: score, total });
    scoreCard(field, score, total);
    await Kim.say(msg || (score >= total - 1 ? (step.skill === "L" ? "Super listening!" : "Super reading!") : "Good job!"));
    await sleep(500); if (X.alive(run)) X.next();
  }
  const word = (id) => X.L.words[id];
  /* text with tricky letters marked: "br[ea]d" → br<u>ea</u>d */
  const marked = (s) => String(s).replace(/\[(.+?)\]/g, "<u>$1</u>");

  /* ======================= CHOOSE =======================
   * One prompt (picture / text / audio), N options (pictures or texts). answer = index, or [indexes] (tap all of them).
   * item: { prompt: { img, imgs:[], text, say, who }, opts: [{ img } | { text }], answer, after: line(s) spoken after the right answer,
   *         fix: "the right sentence" (shown after a correct ✗), tray: picture for the tray }
   */
  TYPES.choose = function (step, run) {
    const field = h("div", { class: "field choosefield" + (step.layout ? " lay-" + step.layout : "") });
    const tray = makeTray(); X.main.append(tray.el);
    const spk = h("button", { class: "speak big", "aria-label": "Listen again", html: ICON.speaker, hidden: step.skill !== "L" });
    const pbox = h("div", { class: "cprompt" });
    const row = h("div", { class: "copts" });
    const fix = h("div", { class: "cfix", hidden: true });
    field.append(h("div", { class: "row" }, spk), pbox, row, fix);
    X.main.append(field);
    const items = step.keepOrder ? step.items.slice() : shuffle(step.items); const res = []; let r = 0;
    const play = async () => { const it = items[r]; if (!it) return; spk.classList.add("playing"); await sayAll(it.prompt.say); spk.classList.remove("playing"); };
    spk.onclick = play;
    async function round() {
      if (!X.alive(run)) return;
      if (r >= items.length) { row.innerHTML = ""; pbox.innerHTML = ""; fix.hidden = true; spk.hidden = true; return finishStep(step, run, field, res, items.length, step.doneLine); }
      tray.update(r, res, items.length);
      const it = items[r], p = it.prompt || {};
      const want = [].concat(it.answer); const found = new Set(); let wrong = 0, locked = false;
      pbox.innerHTML = ""; row.innerHTML = ""; fix.hidden = true; row.classList.toggle("many", it.opts.length > 4);
      if (p.img) pbox.append(h("img", { class: "cpic", src: img(p.img), alt: "" }));
      if (p.imgs) pbox.append(h("div", { class: "cpics" }, p.imgs.map((s) => h("img", { src: img(s), alt: "" }))));
      if (p.text) pbox.append(h("div", { class: "ctext big", html: marked(p.text) }));
      if (p.note) pbox.append(h("div", { class: "cnote" }, p.note));
      if (want.length > 1) pbox.append(h("div", { class: "cnote" }, `Tap ${want.length} pictures.`));
      pbox.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 300 });
      const order = it.fixedOrder ? it.opts.map((o, k) => k) : shuffle(it.opts.map((o, k) => k));
      order.forEach((k) => {
        const o = it.opts[k];
        const b = h("button", { class: "copt" + (o.img ? " pic" : " txt") + (o.mark ? " mark " + o.mark : "") }, o.img ? h("img", { src: img(o.img), alt: "" }) : null, o.text ? h("span", { html: marked(o.text) }) : null);
        b.dataset.k = k;
        b.onclick = async () => {
          if (locked || b.classList.contains("right")) return;
          if (want.includes(k)) {
            found.add(k); b.classList.add("right"); Audio_.sfx("sticker-place");
            if (found.size < want.length) return;
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("name-reveal");
            tray.fill(r, img(it.tray || o.img || p.img || (p.imgs || [])[0]), b, res[r]);
            row.querySelectorAll(".copt").forEach((x) => !x.classList.contains("right") && x.classList.add("fade"));
            if (it.fix) { fix.hidden = false; fix.innerHTML = "✓ " + marked(it.fix); }
            await sleep(250);
            if (step.skill !== "L") await sayAll(p.say);            /* R/W: read aloud only after the answer */
            await sayAll(it.after);
            await sleep(600); if (!X.alive(run)) return; r++; round();
          } else {
            wrong++; locked = true; wrongFx(b); await sleep(900); locked = false;
            if (wrong >= 2) want.forEach((a) => { if (!found.has(a)) row.querySelector(`.copt[data-k="${a}"]`).classList.add("hint"); });
            if (step.skill === "L") play();
          }
        };
        row.append(b);
      });
      await sleep(300); if (X.alive(run) && step.skill === "L") play();
    }
    Kim.say(step.intro).then(() => X.alive(run) && round());
  };

  /* ======================= SPELL (letter tiles) =======================
   * item: { word: id, text: "chicken" (defaults to the word's label without a/an), gaps: [indexes] (missing letters) | "all" (jumbled),
   *         decoys: "kx" (extra wrong letters) }
   * The form (a / an) is printed before the slots — students only build the word itself.
   */
  TYPES.spell = function (step, run) {
    const field = h("div", { class: "field spellfield" });
    const tray = makeTray(); X.main.append(tray.el);
    const pic = h("img", { class: "cpic", alt: "" });
    const line = h("div", { class: "spline" });
    const tiles = h("div", { class: "tiles" });
    const bulb = h("button", { class: "bulb small", "aria-label": "Hint", hidden: true }, "💡");
    field.append(h("div", { class: "picwrap" }, pic, bulb), line, tiles);
    X.main.append(field);
    const items = shuffle(step.items); const res = []; let r = 0, hints = 0;
    function round() {
      if (!X.alive(run)) return;
      if (r >= items.length) { pic.hidden = true; line.innerHTML = ""; tiles.innerHTML = ""; bulb.hidden = true; Results.put(step.id + ":hints", { hints }); return finishStep(step, run, field, res, items.length, step.doneLine || "Super spelling!"); }
      tray.update(r, res, items.length);
      const it = items[r], w = word(it.word);
      const label = w.label, m = label.match(/^(a|an) (.+)$/);
      const form = m ? m[1] : "", text = it.text || (m ? m[2] : label);
      const gaps = it.gaps === "all" || !it.gaps ? [...text].map((c, k) => k).filter((k) => text[k] !== " ") : it.gaps;
      pic.hidden = false; pic.src = img(w.img); pic.animate([{ transform: "scale(.7)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300 });
      line.innerHTML = "";
      if (form) line.append(h("span", { class: "form" }, form));
      const slots = [];
      const wordEl = h("span", { class: "spword" });
      [...text].forEach((c, k) => {
        if (c === " ") { wordEl.append(h("span", { class: "sp" })); return; }
        if (gaps.includes(k)) { const s = h("span", { class: "slot" }); s.dataset.k = k; slots.push(s); wordEl.append(s); }
        else wordEl.append(h("span", { class: "given" }, c));
      });
      line.append(wordEl);
      const need = slots.map((s) => text[+s.dataset.k]);
      const pool = shuffle(need.concat([...(it.decoys || "")]));
      tiles.innerHTML = ""; let at = 0, wrong = 0, wrongHere = 0, locked = false;
      const tileEls = pool.map((c) => { const t = h("button", { class: "ltile" }, c); t.dataset.c = c; tiles.append(t); return t; });
      slots[0] && slots[0].classList.add("now");
      bulb.hidden = false; bulb.classList.remove("used");
      bulb.onclick = async () => { if (!bulb.classList.contains("used")) hints++; bulb.classList.add("used"); await Audio_.word(it.word); };
      tileEls.forEach((t) => {
        t.onclick = async () => {
          if (locked || t.classList.contains("used")) return;
          if (t.dataset.c === need[at]) {
            t.classList.add("used"); slots[at].textContent = t.dataset.c; slots[at].classList.remove("now"); slots[at].classList.add("filled");
            Audio_.sfx("sticker-place"); at++; wrongHere = 0;
            tileEls.forEach((x) => x.classList.remove("hint"));
            if (at < slots.length) { slots[at].classList.add("now"); return; }
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("name-reveal"); wordEl.classList.add("done"); tray.fill(r, img(w.img), pic, res[r]);
            await sleep(250); await Audio_.word(it.word); await sleep(700);
            if (!X.alive(run)) return; r++; round();
          } else {
            wrong++; wrongHere++; locked = true; wrongFx(t); await sleep(700); locked = false;
            if (wrongHere >= 2) { const right = tileEls.find((x) => !x.classList.contains("used") && x.dataset.c === need[at]); right && right.classList.add("hint"); }
          }
        };
      });
    }
    Kim.say(step.intro).then(() => X.alive(run) && round());
  };

  /* ======================= BUILD (sentence tiles) =======================
   * item: { img | imgs, tiles: ["He is", "eating", "a burger."] (right order), decoys: ["eat", "He"], sick: "He eating a burger." (Sentence Doctor),
   *         say: line spoken after, question: "Is she drinking milk?" (shown above) }
   * step.style "burger": tiles look like burger layers (bun · patty · bun).
   */
  TYPES.build = function (step, run) {
    const field = h("div", { class: "field buildfield" + (step.style ? " st-" + step.style : "") });
    const tray = makeTray(); X.main.append(tray.el);
    const pbox = h("div", { class: "cprompt" });
    const slotsEl = h("div", { class: "bslots" });
    const tiles = h("div", { class: "btiles" });
    field.append(pbox, slotsEl, tiles);
    X.main.append(field);
    const items = shuffle(step.items); const res = []; let r = 0;
    function round() {
      if (!X.alive(run)) return;
      if (r >= items.length) { pbox.innerHTML = ""; slotsEl.innerHTML = ""; tiles.innerHTML = ""; return finishStep(step, run, field, res, items.length, step.doneLine || "Great sentences!"); }
      tray.update(r, res, items.length);
      const it = items[r];
      pbox.innerHTML = "";
      if (it.img) pbox.append(h("img", { class: "cpic", src: img(it.img), alt: "" }));
      if (it.imgs) pbox.append(h("div", { class: "cpics" }, it.imgs.map((s) => h("img", { src: img(s), alt: "" }))));
      if (it.question) pbox.append(h("div", { class: "ctext q" }, it.question));
      if (it.sick) pbox.append(h("div", { class: "sick" }, h("span", { class: "thermo" }, "🤒"), h("s", {}, it.sick)));
      pbox.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      slotsEl.innerHTML = "";
      const slots = it.tiles.map((t, k) => { const s = h("span", { class: "bslot l" + k }); slotsEl.append(s); return s; });
      slots[0].classList.add("now");
      tiles.innerHTML = ""; let at = 0, wrong = 0, wrongHere = 0, locked = false;
      const pool = shuffle(it.tiles.map((t, k) => ({ t, k })).concat((it.decoys || []).map((t) => ({ t, k: -1 }))));
      const els = pool.map((p) => { const b = h("button", { class: "btile" + (p.k >= 0 ? " l" + p.k : " dec") }, p.t); b.dataset.t = p.t; tiles.append(b); return b; });
      els.forEach((b) => {
        b.onclick = async () => {
          if (locked || b.classList.contains("used")) return;
          if (b.dataset.t === it.tiles[at]) {
            b.classList.add("used"); slots[at].textContent = b.dataset.t; slots[at].classList.remove("now"); slots[at].classList.add("filled");
            Audio_.sfx("sticker-place"); at++; wrongHere = 0; els.forEach((x) => x.classList.remove("hint"));
            if (at < slots.length) { slots[at].classList.add("now"); return; }
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("name-reveal"); slotsEl.classList.add("done"); setTimeout(() => slotsEl.classList.remove("done"), 1200);
            tray.fill(r, img(it.tray || it.img || (it.imgs || [])[0]), slotsEl, res[r]);
            await sleep(250); await say(it.say || { text: it.tiles.join(" ").replace(/\s+([.,?!])/g, "$1"), who: it.who });
            await sleep(700); if (!X.alive(run)) return; r++; round();
          } else {
            wrong++; wrongHere++; locked = true; wrongFx(b); await sleep(700); locked = false;
            if (it.whyWrong && it.whyWrong[b.dataset.t]) Kim.say(it.whyWrong[b.dataset.t]);
            if (wrongHere >= 2) { const right = els.find((x) => !x.classList.contains("used") && x.dataset.t === it.tiles[at]); right && right.classList.add("hint"); }
          }
        };
      });
    }
    Kim.say(step.intro).then(() => X.alive(run) && round());
  };

  /* ======================= SORT (tap a card, then tap a tray) =======================
   * step: { trays: [{ id, label, start: wordId }], items: [wordIds], groupOf: (word.group), nameAfter: true → tray names appear only at the end }
   */
  TYPES.sort = function (step, run) {
    const field = h("div", { class: "field sortfield" });
    const traysEl = h("div", { class: "strays" });
    const cards = h("div", { class: "scards" });
    field.append(traysEl, cards);
    X.main.append(field);
    let picked = null, wrong = 0, done = 0, locked = false;
    const trayEls = {};
    step.trays.forEach((t) => {
      const name = h("span", { class: "tname" + (step.nameAfter ? " hidden" : "") }, t.label);
      const box = h("div", { class: "tbox" }, h("img", { src: img(word(t.start).img), alt: "" }));
      const el = h("button", { class: "stray" }, box, name);
      el.dataset.id = t.id; trayEls[t.id] = { el, box, name };
      el.onclick = async () => {
        if (!picked || locked) return;
        const w = picked.dataset.w;
        if ((word(w).group) === t.id) {
          picked.classList.remove("picked"); picked.remove();
          box.append(h("img", { src: img(word(w).img), alt: "" }));
          Audio_.sfx("sticker-place"); picked = null; done++;
          Audio_.word(w);
          if (done === step.items.length) finish();
        } else {
          wrong++; locked = true; wrongFx(el); await sleep(800); locked = false;
        }
      };
      traysEl.append(el);
    });
    shuffle(step.items).forEach((w) => {
      const c = h("button", { class: "scard" }, h("img", { src: img(word(w).img), alt: "" }), step.showWords ? h("span", {}, word(w).label) : null);
      c.dataset.w = w;
      c.onclick = () => { cards.querySelectorAll(".scard").forEach((x) => x.classList.remove("picked")); c.classList.add("picked"); picked = c; if (step.skill === "L") Audio_.word(w); };   /* reading: the word is heard only once it is on the right tray */
      cards.append(c);
    });
    async function finish() {
      const score = Math.max(0, step.items.length - wrong);
      Results.put(step.id, { firstTry: score, total: step.items.length, wrong });
      for (const t of step.trays) {
        const e = trayEls[t.id]; e.name.classList.remove("hidden"); e.el.classList.add("named");
        Audio_.sfx("name-reveal"); await Audio_.speak(t.say || t.label, "narrator"); await sleep(250);
        if (!X.alive(run)) return;
      }
      if (step.after) await sayAll(step.after);
      await Kim.say(step.doneLine || "Well done!"); await sleep(600); if (X.alive(run)) X.next();
    }
    Kim.say(step.intro);
  };

  /* ======================= GAPTEXT (Starters R&W Part 4 style) =======================
   * step: { title, text: "Sue is having breakfast. She is drinking {milk} and eating {bread}. …", box: [wordIds incl. extras],
   *         lines: ["sentence 1", …] read aloud at the end }
   * Gaps are filled in order; tap a word in the box.
   */
  TYPES.gaptext = function (step, run) {
    const field = h("div", { class: "field gapfield" });
    const tray = makeTray(); X.main.append(tray.el);
    const textEl = h("div", { class: "gtext" });
    const box = h("div", { class: "gbox" });
    field.append(step.heading ? h("h2", { class: "gtitle" }, step.heading) : null, textEl, box);
    X.main.append(field);
    const answers = [];
    textEl.innerHTML = "";
    step.text.split(/(\{[a-z\-|,]+\})/).forEach((part) => {
      const m = part.match(/^\{([a-z\-]+)(?:\|([a-z\-,]+))?\}$/);
      if (m) { const g = h("span", { class: "gap" }, "____"); g.dataset.w = m[1]; g.dataset.opts = m[2] ? [m[1], ...m[2].split(",")].join(",") : ""; answers.push(g); textEl.append(g); }
      else textEl.append(part);
    });
    const res = []; let at = 0, wrong = 0, locked = false;
    tray.update(0, res, answers.length);
    answers[0].classList.add("now");
    const showBox = () => { if (!answers[at] || !answers[at].dataset.opts) return; const allowed = answers[at].dataset.opts.split(","); box.innerHTML = ""; shuffle(opts.filter((o) => allowed.includes(o.dataset.w))).forEach((o) => { o.classList.remove("hint"); box.append(o); }); };
    const boxWords = step.box || [...new Set(answers.flatMap((g) => g.dataset.opts.split(",")))];
    const opts = boxWords.map((w) => {
      const b = h("button", { class: "gword" + (step.wordsOnly ? " wonly" : "") }, step.wordsOnly ? null : h("img", { src: img(word(w).img), alt: "" }), h("span", {}, word(w).label));
      b.dataset.w = w;
      b.onclick = async () => {
        if (locked || at >= answers.length) return;
        const g = answers[at];
        if (w === g.dataset.w) {
          res[at] = wrong === 0; wrong = 0;
          g.textContent = word(w).label; g.classList.remove("now"); g.classList.add("filled");
          Audio_.sfx("sticker-place"); tray.fill(at, img(word(w).img), b, res[at]);
          opts.forEach((x) => x.classList.remove("hint"));
          at++;
          if (at < answers.length) { answers[at].classList.add("now"); answers[at].scrollIntoView({ block: "center", behavior: "smooth" }); showBox(); return; }
          locked = true; await sleep(400);
          for (const l of step.lines || []) { if (!X.alive(run)) return; await say(l); await sleep(150); }
          const score = res.filter(Boolean).length;
          Results.put(step.id, { firstTry: score, total: answers.length });
          await Kim.say(score >= answers.length - 1 ? "Super reading!" : "Good job!"); await sleep(500); if (X.alive(run)) X.next();
        } else {
          wrong++; locked = true; wrongFx(b); await sleep(800); locked = false;
          if (wrong >= 2) opts.find((x) => x.dataset.w === g.dataset.w).classList.add("hint");
        }
      };
      box.append(b); return b;
    });
    showBox();
    Kim.say(step.intro);
  };
});
