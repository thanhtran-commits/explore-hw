/* EXPLORE Homework — add-on step types: choose · spell · build · sort · gaptext
 * Loaded BEFORE engine.js; the engine calls this with its internals (window.EXPLORE_API).
 * 2026-11-17 (CP6b) · 2026-11-18 giao diện v3: every screen is built on the engine's practice shell (X.practice).
 *
 * Shared rules:
 *  - tap-to-answer (choose, sort): checked on tap. Right → green sheet + CONTINUE. Wrong → shake + "tè tè" + a red "Almost! Try again!" sheet that hides by itself (~1.2 s);
 *    after the 2nd miss on the same item the right answer blinks (DOL template, decisions #10/#30).
 *  - build-up answers (spell, build, gaptext): CHECK (grey until every slot is filled). 1st wrong check → the wrong pieces turn red,
 *    a short "Try again!" (hides by itself), they go back; 2nd wrong check → "Correct answer: …" + GOT IT.
 *  - Reading / writing steps (skill R, W): the word / sentence is read aloud only AFTER the answer (decision #36) —
 *    before that, the speaker replays the instruction. Spelling: the speaker says the word (the old 💡 hint, counted as hints).
 *  - Listening steps (skill L): the speaker replays the item's audio.
 */
(window.EXPLORE_ADDONS = window.EXPLORE_ADDONS || []).push(function (X) {
  const { TYPES, V3, h, sleep, shuffle, img, Audio_, Results, picture, esc } = X;
  V3.push("choose", "spell", "build", "sort", "gaptext");

  /* ---------- helpers ---------- */
  const say = (line) => !line ? Promise.resolve() : typeof line === "string" ? Audio_.speak(line, "narrator")
    : line.word ? Audio_.word(line.word) : Audio_.speak(line.text, line.who || "narrator");   /* { word: id } = the DOL word recording */
  async function sayAll(lines, still) { for (const l of [].concat(lines || [])) { if (still && !still()) return; await say(l); await sleep(180); } }
  const lineText = (l) => !l ? "" : typeof l === "string" ? l : l.word ? word(l.word).label : l.text;
  const word = (id) => X.L.words[id];
  /* text with tricky letters marked: "br[ea]d" → br<u>ea</u>d */
  const marked = (s) => esc(s).replace(/\[(.+?)\]/g, "<u>$1</u>");
  const plain = (s) => String(s).replace(/\[(.+?)\]/g, "$1");
  const sentence = (tiles) => tiles.join(" ").replace(/\s+([.,?!])/g, "$1");
  const praise = (step, score, total, def) => step.doneLine || def || (score >= total - 1 ? (step.skill === "L" ? "Super listening!" : "Super reading!") : "Good job!");
  const finish = (P, step, res, total, extra, def) => {
    const score = res.filter(Boolean).length;
    Results.put(step.id, Object.assign({ firstTry: score, total }, extra || {}));
    return P.finish(score, total, praise(step, score, total, def));
  };
  /* label of the word whose picture this is ("@i3/img/item-water" → "water") */
  const labelOfImg = (name) => { const w = Object.values(X.L.words).find((x) => x.img === name); return w ? w.label : ""; };
  /* the instruction, spoken before a reading / writing answer */
  const instr = (step) => () => Audio_.speak(step.intro || step.instruction, "kim");

  /* ======================= CHOOSE (P4 · P5 and variants) =======================
   * item: { prompt: { img | imgs, text, note, say }, opts: [{ img } | { text } | { text, mark }], answer: index | [indexes],
   *         after: line(s) spoken after the right answer, fix: the right sentence (after a correct ✗) }
   * Layouts: word / sound → pictures (P4) · picture → words or sentences (list) · picture + sentence → ✓ ✗ / yes no (P5)
   *          · picture + sound → pictures (person, meal icon beside the speaker).
   */
  TYPES.choose = function (step, run) {
    const LIS = step.skill === "L";
    const P = X.practice(step, { cls: "px-choose" });
    const items = step.keepOrder ? step.items.slice() : shuffle(step.items); const res = []; let r = 0, answered = false;
    P.aa(step.instruction || step.intro);
    const intro = P.intro(step.intro);
    const sayPrompt = (still) => sayAll(items[r].prompt.say, still);
    /* the speaker: L → the item's audio; R / W → the instruction, and the item's audio once it is answered */
    const spkPlay = () => (LIS || answered ? sayPrompt() : instr(step)());
    function answerText(it, want) {
      if (it.fix) return plain(it.fix);
      const right = want.map((k) => it.opts[k]);
      if (right.every((o) => o.text && !o.mark && !/^(yes|no)$/i.test(o.text))) return right.map((o) => plain(o.text)).join(" / ");
      if (right.every((o) => o.img)) { const ls = right.map((o) => labelOfImg(o.img)); if (ls.every(Boolean)) return ls.join(", "); }
      const p = it.prompt || {};
      if (p.text) return plain(p.text);
      return [].concat(p.say || []).map(lineText).join(" ");
    }
    async function round() {
      if (!X.alive(run)) return;
      if (r >= items.length) return finish(P, step, res, items.length);
      P.progress(r, items.length); answered = false; P.aa(step.instruction || step.intro);
      const it = items[r], p = it.prompt || {};
      const want = [].concat(it.answer); const found = new Set(); let wrong = 0, locked = false;
      P.root.__want = want;                     /* test hook (JS property only) */
      const pics = it.opts.every((o) => o.img);
      const marks = !pics && it.opts.length === 2 && it.opts.every((o) => o.mark || /^(yes|no)$/i.test(o.text || ""));
      const hasPic = !!(p.img || p.imgs);
      /* ---- prompt ---- */
      P.body.innerHTML = "";
      const head = h("div", { class: "px-head" });
      let spk, autoPlay = null;
      if (hasPic && pics) {
        /* picture + sound → pictures: the person / meal icon sits beside the speaker */
        spk = P.speaker("md", spkPlay);
        const who = h("div", { class: "px-who" }, picture(p.img || p.imgs[0], "small"));
        if (p.note) who.append(h("span", { class: "px-chip px-note-chip" }, p.note));
        head.className = "px-head row"; head.append(who, spk);
      } else if (hasPic) {
        const picEl = p.imgs ? h("div", { class: "px-pics" }, p.imgs.map((s) => picture(s))) : picture(p.img);
        const pic = h("div", { class: "px-pic" }, picEl);
        head.classList.add("grow");
        head.append(pic);
        if (p.text) {
          spk = P.speaker("xs", spkPlay);
          head.append(h("div", { class: "px-say" }, spk, h("span", { class: "px-sent", html: marked(p.text) })));
        } else if (LIS) {
          spk = P.speaker("md", spkPlay); head.append(spk);
        } else {
          spk = P.speaker("sm", spkPlay, "Listen"); pic.classList.add("has-spk"); picEl.append(spk);
        }
      } else if (p.text) {
        spk = P.speaker("sm", spkPlay);
        head.className = "px-head row"; head.append(spk, h("span", { class: "px-chip px-word-chip", html: marked(p.text) }));
      } else if (marks && [].concat(p.say || []).length === 2) {
        /* sound only, a question and an answer ("Does it match?"): two speech bubbles, each replays its own line; the words only via Aa */
        const [qL, aL] = p.say;
        const bubble = (cls, icon, line, label) => {
          const b = h("button", { class: "px-bubble " + cls, type: "button", "aria-label": label },
            h("span", { class: "px-spk xs", html: X.ICON3.speaker }), h("span", { class: "px-bicon", "aria-hidden": "true" }, icon));
          b.onclick = () => P.play(b, () => say(line));
          return b;
        };
        const qb = bubble("q", "?", qL, "Listen to the question"), ab = bubble("a", "💬", aL, "Listen to the answer");
        head.classList.add("px-qa"); head.append(qb, ab);
        spk = qb;
        autoPlay = async () => { await P.play(qb, () => say(qL)); await sleep(150); if (X.alive(run) && items[r] === it) await P.play(ab, () => say(aL)); };
        P.aa(lineText(qL) + " — " + lineText(aL));
      } else {
        spk = P.speaker("xl", spkPlay); head.append(spk);
      }
      const replay = () => (autoPlay ? autoPlay() : P.play(spk, spkPlay));
      if (want.length > 1) {
        /* tap several pictures: one dot per right answer, filled as they are found */
        const count = h("div", { class: "px-count", "aria-label": "Tap " + want.length }, want.map(() => h("i")));
        head.append(count);
      }
      /* ---- options ---- */
      const box = pics ? h("div", { class: "px-grid cards objs", "data-n": it.opts.length })
        : marks ? h("div", { class: "px-grid marks", "data-n": 2 }) : h("div", { class: "px-list" });
      const order = it.fixedOrder ? it.opts.map((o, k) => k) : shuffle(it.opts.map((o, k) => k));
      order.forEach((k) => {
        const o = it.opts[k];
        const cls = pics ? "px-card obj" : marks ? "px-card mark " + (o.mark || o.text.toLowerCase()) : "px-opt";
        const label = o.mark === "tick" ? "Right" : o.mark === "cross" ? "Wrong" : o.text || "Picture";
        const b = h("button", { class: cls, type: "button", "aria-label": label },
          o.img ? h("img", { src: img(o.img), alt: "" }) : o.mark ? h("span", { class: "glyph" }, o.mark === "tick" ? "✔" : "✘") : h("span", { class: "px-read", html: marked(o.text) }));
        b.dataset.k = k;
        b.onclick = async () => {
          if (locked || b.classList.contains("ok")) return;
          if (want.includes(k)) {
            found.add(k); b.classList.add("ok"); Audio_.sfx("sticker-place");
            const dots = head.querySelectorAll(".px-count i"); if (dots[found.size - 1]) dots[found.size - 1].classList.add("on");
            if (found.size < want.length) return;
            locked = true; res[r] = wrong === 0; answered = true;
            Audio_.sfx("name-reveal");
            box.querySelectorAll("button").forEach((x) => !x.classList.contains("ok") && x.classList.add("fade"));
            const play = async (still) => { if (!LIS) await sayPrompt(still); if (!still || still()) await sayAll(it.after, still); };
            await P.sheet({ ok: true, text: answerText(it, want), play: () => sayAll([].concat(it.prompt.say || [], it.after || [])),
              auto: async (still) => { await sleep(250); if (still()) await play(still); } });
            if (!X.alive(run)) return; r++; round();
          } else {
            wrong++; locked = true; P.wrong(b);
            await P.retry(); locked = false;
            if (wrong >= 2) want.forEach((a) => { if (!found.has(a)) box.querySelector(`[data-k="${a}"]`).classList.add("px-hint"); });
            if (LIS) replay();
          }
        };
        box.append(b);
      });
      P.body.append(head, h("div", { class: "px-opts" + (pics ? "" : marks ? " marks" : " list") }, box));
      P.body.dataset.lay = pics ? (hasPic ? "who" : "pics") : marks ? "marks" : "list";
      P.body.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260 });
      await intro; if (!X.alive(run)) return;
      if (LIS) replay();
    }
    round();
  };

  /* ======================= SPELL (P6: letter tiles) =======================
   * item: { word: id, text: "chicken" (defaults to the word's label without a/an), gaps: [indexes] (missing letters) | "all" (jumbled),
   *         decoys: "kx" (extra wrong letters) }
   * The form (a / an) is printed before the slots — students only build the word itself.
   * Tap a tile → it goes to the first empty slot (a grey ghost stays behind); tap a letter you placed → it goes back.
   */
  TYPES.spell = function (step, run) {
    const P = X.practice(step, { cls: "px-spell" });
    const items = shuffle(step.items); const res = []; let r = 0, hints = 0;
    const spk = P.speaker("sm", null, "Listen to the word");
    const pic = h("img", { alt: "" });
    const wordEl = h("div", { class: "px-word" });
    const tilesEl = h("div", { class: "px-tiles" });
    P.body.append(h("div", { class: "px-head px-spellhead" }, spk, h("div", { class: "px-obj spellpic" }, pic)), wordEl, tilesEl);
    P.aa(step.instruction || step.intro);
    let state = null;
    const check = P.check(() => doCheck());
    const intro = P.intro(step.intro);
    /* the speaker is the old 💡: hear the word, counted as a hint for the teacher */
    spk.onclick = () => { const it = items[r]; if (!it) return; if (!state || !state.hinted) { hints++; if (state) state.hinted = true; } P.play(spk, () => Audio_.word(it.word)); };
    function round() {
      if (!X.alive(run)) return;
      if (r >= items.length) { Results.put(step.id + ":hints", { hints }); return finish(P, step, res, items.length, null, "Super spelling!"); }
      P.progress(r, items.length);
      const it = items[r], w = word(it.word);
      const m = w.label.match(/^(a|an) (.+)$/);
      const form = m ? m[1] : "", text = it.text || (m ? m[2] : w.label);
      const gaps = it.gaps === "all" || !it.gaps ? [...text].map((c, k) => k).filter((k) => text[k] !== " ") : it.gaps;
      pic.src = img(w.img); pic.animate([{ transform: "scale(.8)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 280 });
      wordEl.innerHTML = "";
      wordEl.style.setProperty("--len", text.length + (form ? form.length + 1 : 0));
      if (form) wordEl.append(h("span", { class: "px-form" }, form));
      const slots = [];
      [...text].forEach((c, k) => {
        if (c === " ") { wordEl.append(h("span", { class: "px-sp" })); return; }
        if (gaps.includes(k)) { const s = h("span", { class: "px-slot empty tap" }); s.dataset.want = c; slots.push(s); wordEl.append(s); }
        else wordEl.append(h("span", { class: "px-slot given" }, c));
      });
      const pool = shuffle(slots.map((s) => s.dataset.want).concat([...(it.decoys || "")]));
      tilesEl.innerHTML = "";
      state = { it, w, slots, checks: 0, hinted: false };
      const tiles = pool.map((c) => { const t = h("button", { class: "px-chip px-tile", type: "button" }, c); t.dataset.c = c; tilesEl.append(t); return t; });
      const sync = () => { check.disabled = slots.some((s) => !s.dataset.c); };
      tiles.forEach((t) => {
        t.onclick = () => {
          if (P.root.classList.contains("sheet-open")) return;
          /* tapping a used tile's ghost takes its letter back (the slots themselves can be narrow on long words) */
          if (t.classList.contains("ghost")) { const back = slots.find((x) => x.tile === t); if (back && !back.classList.contains("ok")) { unplace(back); sync(); } return; }
          const s = slots.find((x) => !x.dataset.c); if (!s) return;
          s.dataset.c = t.dataset.c; s.textContent = t.dataset.c; s.classList.remove("empty", "bad"); s.tile = t;
          t.classList.add("ghost"); Audio_.sfx("sticker-place"); sync();
        };
      });
      slots.forEach((s) => { s.onclick = () => { if (!s.dataset.c || s.classList.contains("ok")) return; unplace(s); sync(); }; });
      state.sync = sync; sync();
    }
    function unplace(s) { if (s.tile) s.tile.classList.remove("ghost"); s.tile = null; delete s.dataset.c; s.textContent = ""; s.classList.remove("bad"); s.classList.add("empty"); }
    async function doCheck() {
      const st = state; if (!st || check.disabled) return;
      check.disabled = true;
      const bad = st.slots.filter((s) => s.dataset.c !== s.dataset.want);
      if (!bad.length) {
        res[r] = st.checks === 0;
        st.slots.forEach((s) => s.classList.add("ok")); wordEl.classList.add("done"); Audio_.sfx("name-reveal");
        await P.sheet({ ok: true, text: st.w.label, play: () => Audio_.word(st.it.word), auto: async (still) => { await sleep(250); if (still()) await Audio_.word(st.it.word); } });
        wordEl.classList.remove("done"); if (!X.alive(run)) return; r++; return round();
      }
      st.checks++; bad.forEach((s) => s.classList.add("bad")); Audio_.sfx("practice-wrong");
      if (st.checks < 2) {
        await P.retry();
        bad.forEach(unplace); st.sync();
        return;
      }
      res[r] = false;
      await P.sheet({ ok: false, title: "Almost!", html: "Correct answer: <u>" + esc(st.w.label) + "</u>", button: "GOT IT", auto: async (still) => { await sleep(300); if (still()) await Audio_.word(st.it.word); } });
      if (!X.alive(run)) return; r++; round();
    }
    round();
  };

  /* ======================= BUILD (P7: sentence tiles) =======================
   * item: { img | imgs, tiles: ["He is", "eating", "a burger."] (right order), decoys: ["eat", "He"], sick: "He eating a burger." (Sentence Doctor),
   *         question: "Is she drinking milk?" (shown under the picture), say: line spoken after, whyWrong: { tile: hint } }
   * step.style "burger": the answer is built as a burger — bun · patty · bun.
   */
  TYPES.build = function (step, run) {
    const burger = step.style === "burger";
    const P = X.practice(step, { cls: "px-build" + (burger ? " burger" : "") });
    const items = shuffle(step.items); const res = []; let r = 0, answered = false, state = null;
    P.aa(step.instruction || step.intro);
    const check = P.check(() => doCheck());
    const intro = P.intro(step.intro);
    function round() {
      if (!X.alive(run)) return;
      if (r >= items.length) return finish(P, step, res, items.length, null, "Great sentences!");
      P.progress(r, items.length); answered = false;
      const it = items[r];
      const sayIt = () => say(it.say || { text: sentence(it.tiles), who: it.who });
      P.body.innerHTML = "";
      const spk = P.speaker("sm", () => (answered ? sayIt() : instr(step)()), "Listen");
      const picEl = it.imgs ? h("div", { class: "px-pics" }, it.imgs.map((s) => picture(s))) : picture(it.img, "cover");
      const pic = h("div", { class: "px-pic has-spk" }, picEl); picEl.append(spk);
      const head = h("div", { class: "px-head grow" }, pic);
      if (it.question) head.append(h("div", { class: "px-sent q" }, it.question));
      if (it.sick) head.append(h("div", { class: "px-sick" }, h("span", { "aria-hidden": "true" }, "🤒"), h("s", {}, it.sick)));
      const lines = h("div", { class: "px-lines" + (burger ? " burger" : ""), "data-n": it.tiles.length });
      const bank = h("div", { class: "px-bank" });
      const placed = [];
      const pool = shuffle(it.tiles.concat(it.decoys || []));
      const sync = () => { check.disabled = placed.length !== it.tiles.length; };
      const draw = () => {
        lines.innerHTML = "";
        placed.forEach((c, k) => {
          const b = h("button", { class: "px-chip placed l" + k + (c.bad ? " bad" : "") + (c.ok ? " ok" : ""), type: "button" }, c.t);
          b.onclick = () => { if (c.ok || P.root.classList.contains("sheet-open")) return; placed.splice(placed.indexOf(c), 1); c.el.classList.remove("ghost"); c.bad = false; draw(); sync(); };
          lines.append(b);
        });
        if (burger) for (let k = placed.length; k < it.tiles.length; k++) lines.append(h("span", { class: "px-layer l" + k }));
      };
      pool.forEach((t) => {
        const el = h("button", { class: "px-chip", type: "button" }, t);
        const c = { t, el };
        el.onclick = () => {
          if (el.classList.contains("ghost") || placed.length >= it.tiles.length || P.root.classList.contains("sheet-open")) return;
          placed.push(c); el.classList.add("ghost"); Audio_.sfx("sticker-place"); draw(); sync();
        };
        bank.append(el);
      });
      state = { it, placed, draw, sync, checks: 0, sayIt };
      P.root.__tiles = it.tiles;                /* test hook (JS property only) */
      draw(); sync();
      P.body.append(head, h("div", { class: "px-answer" }, lines), bank);
      P.body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    }
    async function doCheck() {
      const st = state; if (!st || check.disabled) return;
      check.disabled = true;
      const it = st.it;
      st.placed.forEach((c, k) => { c.bad = c.t !== it.tiles[k]; });
      const bad = st.placed.filter((c) => c.bad);
      if (!bad.length) {
        res[r] = st.checks === 0; answered = true;
        st.placed.forEach((c) => (c.ok = true)); st.draw(); Audio_.sfx("name-reveal");
        await P.sheet({ ok: true, text: sentence(it.tiles), play: st.sayIt, auto: async (still) => { await sleep(250); if (still()) await st.sayIt(); } });
        if (!X.alive(run)) return; r++; return round();
      }
      st.checks++; st.draw(); Audio_.sfx("practice-wrong");
      if (st.checks < 2) {
        const why = it.whyWrong && bad.map((c) => it.whyWrong[c.t]).find(Boolean);
        if (why) P.voice(why);
        await P.retry(why || "Try again!");
        /* the right beginning stays; everything from the first wrong chip goes back to the bank */
        const from = st.placed.findIndex((c) => c.bad);
        st.placed.splice(from).forEach((c) => { c.el.classList.remove("ghost"); c.bad = false; });
        st.draw(); st.sync();
        return;
      }
      res[r] = false; answered = true;
      await P.sheet({ ok: false, title: "Almost!", html: "Correct answer: <u>" + esc(sentence(it.tiles)) + "</u>", button: "GOT IT", auto: async (still) => { await sleep(300); if (still()) await st.sayIt(); } });
      if (!X.alive(run)) return; r++; round();
    }
    round();
  };

  /* ======================= SORT (P8: three trays, one item at a time) =======================
   * step: { trays: [{ id, label, start: wordId, say }], items: [wordIds], showWords, nameAfter: true → tray names appear only at the end }
   * The item is big in the middle; tap the tray it belongs to (word.group). The trays show their first item and "?" until named.
   */
  TYPES.sort = function (step, run) {
    const P = X.practice(step, { cls: "px-sort" });
    const items = shuffle(step.items); const res = []; let r = 0, answered = false;
    P.aa(step.instruction || step.intro);
    const pic = h("img", { alt: "" });
    const wordEl = h("span", { class: "px-read" });
    const spk = P.speaker("xs", () => (step.skill === "L" || answered ? Audio_.word(items[r]) : instr(step)()), "Listen");
    const card = h("div", { class: "px-obj sortpic" }, pic);
    const left = h("div", { class: "px-left" });
    const trayEls = {};
    const traysEl = h("div", { class: "px-trays" });
    step.trays.forEach((t) => {
      const n = h("span", { class: "px-tcount" }, "");
      const name = h("span", { class: "px-tname" }, step.nameAfter ? "?" : t.label);
      const el = h("button", { class: "px-tray", type: "button", "aria-label": step.nameAfter ? "Tray" : t.label }, h("img", { src: img(word(t.start).img), alt: "" }), name, n);
      el.dataset.id = t.id; trayEls[t.id] = { el, name, n, count: 0 };
      traysEl.append(el);
    });
    P.body.append(h("div", { class: "px-head grow" }, h("div", { class: "px-pic" }, card),
      h("div", { class: "px-say" }, spk, step.showWords !== false ? h("span", { class: "px-sent" }, wordEl) : null)),
      h("div", { class: "px-opts trays" }, traysEl), left);
    const intro = P.intro(step.intro);
    let wrong = 0, locked = true;
    function show() {
      if (!X.alive(run)) return;
      if (r >= items.length) return end();
      P.progress(r, items.length); answered = false; wrong = 0;
      const w = items[r];
      pic.src = img(word(w).img); wordEl.textContent = word(w).label;
      card.animate([{ transform: "scale(.85)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260 });
      const more = items.length - r - 1;
      left.textContent = more ? more + " more" : "Last one!";
      Object.values(trayEls).forEach((t) => t.el.classList.remove("px-hint"));
      locked = false;
      if (step.skill === "L") P.play(spk, () => Audio_.word(w));
    }
    Object.entries(trayEls).forEach(([id, t]) => {
      t.el.onclick = async () => {
        if (locked || r >= items.length) return;
        const w = items[r];
        if (word(w).group === id) {
          locked = true; res[r] = wrong === 0; answered = true;
          t.count++; t.n.textContent = "+" + t.count; Audio_.sfx("sticker-place");
          t.el.classList.add("ok"); setTimeout(() => t.el.classList.remove("ok"), 900);
          await P.sheet({ ok: true, text: word(w).label, play: () => Audio_.word(w), auto: async (still) => { await sleep(200); if (still()) await Audio_.word(w); } });
          if (!X.alive(run)) return; r++; show();
        } else {
          wrong++; locked = true; P.wrong(t.el);
          await P.retry(); locked = false;
          if (wrong >= 2) trayEls[word(w).group].el.classList.add("px-hint");
        }
      };
    });
    /* all sorted: the tray names appear one by one, then what they mean */
    async function end() {
      locked = true; P.progress(1, 1);
      P.body.classList.add("named");
      left.textContent = "";
      for (const t of step.trays) {
        if (!X.alive(run)) return;
        const e = trayEls[t.id]; e.name.textContent = t.label; e.el.classList.add("named");
        Audio_.sfx("name-reveal"); await X.playSafe(() => Audio_.speak(t.say || t.label, "narrator")); await sleep(250);
      }
      if (step.after) await X.playSafe(() => sayAll(step.after));
      if (!X.alive(run)) return;
      finish(P, step, res, items.length, { wrong: res.filter((x) => !x).length }, step.doneLine || "Well done!");
    }
    intro.then(() => { if (X.alive(run)) show(); });
  };

  /* ======================= GAPTEXT (P9: Starters R&W Part 4 style) =======================
   * step: { heading, pages: [{ img, text: "Tom is eating {bread|water,juice}. …", line: "read aloud when the page is done" }], wordsOnly }
   *   (old form: text + lines → one page)
   * {word|other,other} = a gap and the words offered for it. Max ~3 sentences per page (decision #55); page dots under the text.
   * Tap a word → it fills the blue gap, the next gap turns blue; tap a filled gap to empty it. CHECK when the page is full.
   */
  TYPES.gaptext = function (step, run) {
    const P = X.practice(step, { cls: "px-gap" });
    const pages = step.pages || [{ img: step.img, text: step.text, line: (step.lines || []).join(" ") }];
    const total = pages.reduce((n, pg) => n + (pg.text.match(/\{[^}]+\}/g) || []).length, 0);
    const res = []; let pg = 0, done = 0, state = null, answered = false;
    P.aa(step.instruction || step.intro);
    const check = P.check(() => doCheck());
    const intro = P.intro(step.intro);
    function page() {
      if (!X.alive(run)) return;
      if (pg >= pages.length) return finish(P, step, res, total);
      P.progress(done, total); answered = false;
      const cur = pages[pg];
      P.body.innerHTML = "";
      const spk = P.speaker("xs", () => (answered ? X.playSafe(() => say(cur.line)) : instr(step)()), "Listen");
      const textEl = h("div", { class: "px-ptext" });
      const gaps = [];
      cur.text.split(/(\{[a-z\-|,]+\})/).forEach((part) => {
        const m = part.match(/^\{([a-z\-]+)(?:\|([a-z\-,]+))?\}$/);
        if (m) {
          const g = h("button", { class: "px-gapslot", type: "button", "aria-label": "Gap " + (gaps.length + 1) }, "");
          g.dataset.want = m[1]; g.dataset.opts = [m[1], ...(m[2] ? m[2].split(",") : [])].join(",");
          gaps.push(g); textEl.append(g);
        } else textEl.append(part);
      });
      const chips = h("div", { class: "px-bank" });
      const dots = h("div", { class: "px-dots", "aria-label": `Page ${pg + 1} of ${pages.length}` }, pages.map((x, k) => h("i", { class: k === pg ? "on" : k < pg ? "done" : "" })));
      const card = h("div", { class: "px-passage" },
        h("div", { class: "px-ptitle" }, spk, h("b", {}, step.heading || step.title), pages.length > 1 ? h("span", {}, `${pg + 1} / ${pages.length}`) : null), textEl);
      const head = h("div", { class: "px-head grow" });
      if (cur.img) head.append(h("div", { class: "px-pic" }, picture(cur.img, "cover wide")));
      head.append(card);
      P.body.append(head, chips, dots);
      P.body.animate([{ opacity: 0, transform: "translateX(16px)" }, { opacity: 1, transform: "none" }], { duration: 280 });
      state = { cur, gaps, checks: 0, now: 0 };
      const sync = () => { check.disabled = gaps.some((g) => !g.dataset.c); };
      const focus = (k) => {
        state.now = k; gaps.forEach((g, j) => g.classList.toggle("now", j === k));
        chips.innerHTML = "";
        if (k < 0) return;
        shuffle(gaps[k].dataset.opts.split(",")).forEach((w) => {
          const b = h("button", { class: "px-chip", type: "button" }, word(w).label);
          b.onclick = () => {
            if (P.root.classList.contains("sheet-open")) return;
            const g = gaps[state.now]; if (!g) return;
            g.dataset.c = w; g.textContent = word(w).label; g.classList.remove("bad"); g.classList.add("filled");
            Audio_.sfx("sticker-place");
            const nextEmpty = gaps.findIndex((x) => !x.dataset.c);
            focus(nextEmpty); sync();
          };
          chips.append(b);
        });
      };
      gaps.forEach((g, k) => { g.onclick = () => { if (g.classList.contains("ok") || P.root.classList.contains("sheet-open")) return; delete g.dataset.c; g.textContent = ""; g.classList.remove("filled", "bad"); focus(k); sync(); }; });
      state.focus = focus; state.sync = sync;
      focus(0); sync();
    }
    async function doCheck() {
      const st = state; if (!st || check.disabled) return;
      check.disabled = true;
      const bad = st.gaps.filter((g) => g.dataset.c !== g.dataset.want);
      if (!bad.length) {
        st.gaps.forEach((g, k) => { g.classList.add("ok"); res[done + k] = !g.wasWrong; });
        st.focus(-1); answered = true; Audio_.sfx("name-reveal");
        P.progress(done + st.gaps.length, total);
        await P.sheet({ ok: true, text: st.gaps.map((g) => word(g.dataset.want).label).join(" · "), play: () => say(st.cur.line), auto: async (still) => { await sleep(250); if (still()) await say(st.cur.line); } });
        if (!X.alive(run)) return;
        done += st.gaps.length; pg++; return page();
      }
      st.checks++; bad.forEach((g) => { g.classList.add("bad"); g.wasWrong = true; }); Audio_.sfx("practice-wrong");
      if (st.checks < 2) {
        await P.retry();
        bad.forEach((g) => { delete g.dataset.c; g.textContent = ""; g.classList.remove("filled", "bad"); });
        st.focus(st.gaps.indexOf(bad[0])); st.sync();
        return;
      }
      await P.sheet({ ok: false, title: "Almost!", html: "Correct answer: " + st.gaps.map((g) => "<u>" + esc(word(g.dataset.want).label) + "</u>").join(", "), button: "GOT IT",
        auto: async (still) => { await sleep(300); if (still()) await say(st.cur.line); } });
      if (!X.alive(run)) return;
      st.gaps.forEach((g, k) => { res[done + k] = !g.wasWrong; });
      done += st.gaps.length; pg++; page();
    }
    page();
  };
});
