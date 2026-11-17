/* EXPLORE Homework — Player engine (CP3)
 * One engine for every lesson; content comes from window.LESSON (lessons/*.js).
 * Step types: watch · explore · bubbles · say · recap  (more in CP4: chunks, qa, lines…)
 */
(function () {
  "use strict";
  /* L = the lesson being played. Before a lesson is opened it is a stub, so the home screens can use Kim and audio. */
  let L = { id: "HOME", unit: "", title: "EXPLORE", img: "assets/i1/img/", aud: "assets/i1/audio/", words: {}, blocks: [], skills: [] };
  const CAT = window.CATALOG || { units: [] };
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(c));
    return el;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* "br[ea]d" → br<u>ea</u>d : tricky letters marked in reading lessons (word.spell) */
  const marked = (s) => String(s).replace(/\[(.+?)\]/g, "<u>$1</u>");
  const wlabel = (w) => marked(w.spell || w.label);
  /* ?v=<build> on every file: a picture or voice changed under the same name shows up right after a deploy (no stale browser/Cloudflare copy) */
  const VER = window.EXPLORE_BUILD ? "?v=" + window.EXPLORE_BUILD : "";
  const ver = (u) => (u && !/^(data|blob):/.test(u) && !u.includes("?") ? u + VER : u);
  const img = (name) => ver((String(name).startsWith("@") ? "assets/" + name.slice(1) : L.img + name) + ".webp");   /* "@i1/img/x" = another lesson's picture */
  const ICON = {
    speaker: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  /* Placeholder Kim (girl, yellow shirt, pigtails) until the illustrator's Kim exists */
  /* Placeholder Kim puppet (girl, yellow shirt, pigtails) — arms move per pose.
     Replaced automatically by drawn poses in assets/common/kim/kim-<pose>.png when they exist. */
  const KIM_SVG = `<svg class="puppet" viewBox="0 0 120 200" width="100%" height="100%" aria-hidden="true">
    <g class="legs" stroke="#e9b48f" stroke-width="9" stroke-linecap="round"><path d="M50 150v28"/><path d="M70 150v28"/></g>
    <g fill="#fff" stroke="#3a2e29" stroke-width="2"><ellipse cx="48" cy="184" rx="11" ry="6"/><ellipse cx="72" cy="184" rx="11" ry="6"/></g>
    <path d="M40 128h40l3 24H37z" fill="#4f7fc4" stroke="#3a2e29" stroke-width="2" stroke-linejoin="round"/>
    <g class="arm armL"><path d="M40 86v40" stroke="#e9b48f" stroke-width="9" stroke-linecap="round"/><path d="M40 84v14" stroke="#f6c445" stroke-width="13" stroke-linecap="round"/></g>
    <g class="arm armR"><path d="M80 86v40" stroke="#e9b48f" stroke-width="9" stroke-linecap="round"/><path d="M80 84v14" stroke="#f6c445" stroke-width="13" stroke-linecap="round"/></g>
    <path d="M38 84q22-10 44 0l2 46H36z" fill="#f6c445" stroke="#3a2e29" stroke-width="2" stroke-linejoin="round"/>
    <g class="head">
      <circle cx="31" cy="46" r="11" fill="#5a3b2a"/><circle cx="89" cy="46" r="11" fill="#5a3b2a"/>
      <circle cx="37" cy="40" r="4" fill="#e5534b"/><circle cx="83" cy="40" r="4" fill="#e5534b"/>
      <circle cx="60" cy="52" r="26" fill="#ffdcc4" stroke="#3a2e29" stroke-width="2"/>
      <path d="M34 50c0-20 12-28 26-28s26 8 26 28c-7-9-16-12-26-12s-19 3-26 12z" fill="#5a3b2a"/>
      <g class="eyes" fill="#3a2e29"><ellipse cx="51" cy="54" rx="3" ry="3.6"/><ellipse cx="69" cy="54" rx="3" ry="3.6"/></g>
      <circle cx="45" cy="62" r="4" fill="#f4a3a3" opacity=".7"/><circle cx="75" cy="62" r="4" fill="#f4a3a3" opacity=".7"/>
      <path class="mouth" d="M53 64q7 6 14 0" fill="#c94f4f" stroke="#3a2e29" stroke-width="2" stroke-linecap="round"/>
    </g></svg>`;

  /* ======================= Storage layer =======================
   * Prototype: localStorage. Later: swap these two functions for Firebase writes. */
  const Store = {
    get key() { return "explore-hw:" + L.id; },
    load() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return {}; } },
    save(d) { try { localStorage.setItem(this.key, JSON.stringify(d)); } catch (e) {} }
  };
  const Results = {
    data: Store.load(),
    put(stepId, payload) { this.data[stepId] = Object.assign({ at: new Date().toISOString() }, payload); Store.save(this.data); },
    get(stepId) { return this.data[stepId]; }
  };

  /* ======================= Audio ======================= */
  const Audio_ = {
    cur: null, voices: [],
    pickVoices() {
      const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
      const gb = vs.filter((v) => /en[-_]GB/i.test(v.lang));
      const pref = ["Google UK English Female", "Libby", "Sonia", "Maisie", "Serena", "Kate", "Martha", "Stephanie", "Hazel"];
      let narrator = null;
      for (const p of pref) { narrator = gb.find((v) => v.name.includes(p)); if (narrator) break; }
      this.narrator = narrator || gb[0] || vs.find((v) => /^en/i.test(v.lang)) || null;
    },
    stop() {
      if (this.cur) { try { this.cur.pause(); } catch (e) {} this.cur.onended = null; this.cur = null; }
      if (window.speechSynthesis) speechSynthesis.cancel();
      document.querySelectorAll(".speak.playing").forEach((b) => b.classList.remove("playing"));
    },
    rateMul: 1,
    file(src) {
      this.stop();
      return new Promise((res) => {
        const a = new Audio(ver(src)); this.cur = a; a.playbackRate = this.rateMul;
        const done = () => { if (this.cur === a) this.cur = null; res(); };
        a.onended = done; a.onerror = done;
        a.play().catch(done);
      });
    },
    word(id) { const a = L.words[id].audio; return this.file((a.startsWith("@") ? "assets/" + a.slice(1) : L.aud + a) + ".mp3"); },
    sfx(name) { try { const a = new Audio(ver("assets/i1/audio/sfx-" + name + ".mp3"));   /* one shared set of sound effects */ a.volume = .6; a.play().catch(() => {}); } catch (e) {} },
    /* who: "narrator" | "kim" */
    speak(text, who = "narrator") {
      /* recorded voice first (Voice Studio → lessons/<id>.voice.js), browser TTS as fallback */
      const rec = window.VOICE && window.VOICE[who + "|" + String(text).trim()];
      if (rec) return this.file(rec);
      this.stop();
      const plain = text.replace(/[*_]/g, "");
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return sleep(400 + plain.split(/\s+/).length * 380);
      if (!this.narrator) this.pickVoices();
      /* Chrome drops an utterance queued right after cancel() — wait a beat first */
      return sleep(120).then(() => new Promise((res) => {
        const u = new SpeechSynthesisUtterance(plain);
        if (this.narrator) u.voice = this.narrator;
        u.lang = (this.narrator && this.narrator.lang) || "en-GB";
        u.rate = (who === "kim" ? 0.95 : 0.88) * this.rateMul;
        u.pitch = who === "kim" ? 1.45 : 1.15;
        let finished = false;
        const done = () => { if (!finished) { finished = true; clearTimeout(t); res(); } };
        const t = setTimeout(done, 1800 + plain.split(/\s+/).length * 520);
        u.onend = done; u.onerror = done;
        speechSynthesis.resume();
        speechSynthesis.speak(u);
      }));
    },
    line(line) { return line.audio ? this.file(line.audio) : this.speak(line.text, line.who || "narrator"); }
  };
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => Audio_.pickVoices();

  /* ======================= Kim helper ======================= */
  const Kim = {
    el: $("#kim"), bub: $("#kimBub"), btn: $("#kimBtn"), last: "", poseNow: "", imgs: {}, hideT: 0, backT: 0,
    POSES: ["wave", "point", "cheer", "listen", "think"],
    init() {
      this.btn.innerHTML = KIM_SVG + '<img class="kimimg" alt="" hidden><img class="kimhead" alt="" hidden>';
      this.btn.addEventListener("click", () => this.last && this.say(this.last));
      /* use drawn poses when the files exist */
      this.POSES.forEach((p) => { const im = new Image(); im.onload = () => { this.imgs[p] = im.src; if (this.poseNow) this.pose(this.poseNow, true); }; im.src = ver("assets/common/kim/kim-" + p + ".webp"); });
      this.pose("idle");
    },
    /* idle · talk · cheer · listen · think · point */
    pose(p, force) {
      if (p === this.poseNow && !force) return;
      this.poseNow = p;
      const art = { idle: "wave", talk: "point", point: "point", cheer: "cheer", listen: "listen", think: "think" }[p] || "wave";
      this.el.dataset.pose = p;
      const im = this.btn.querySelector(".kimimg");
      if (this.imgs[art]) { im.src = this.imgs[art]; im.hidden = false; this.btn.querySelector(".puppet").style.display = "none"; }
      /* head-only version, used where Kim just "talks" from the corner (scenes, home screens) */
      const hd = this.btn.querySelector(".kimhead");
      if (this.imgs[art]) { hd.src = ver("assets/common/kim/kim-head-" + art + ".webp"); hd.hidden = false; }
    },
    moodOf(text) {
      if (/\b(great|well done|super|yes!|hooray|good job|good!)/i.test(text)) return "cheer";
      if (/try again|can't hear|don't forget|full sentence|again\.|look at the (shadow|picture) again/i.test(text)) return "think";
      return "talk";
    },
    async say(text, { silent = false } = {}) {
      this.last = text; this.bub.textContent = text; this.bub.hidden = false;
      clearTimeout(this.hideT); clearTimeout(this.backT);
      const mood = this.moodOf(text);
      this.pose(mood); this.el.classList.add("talking");
      const intro = document.body.classList.contains("kim-intro");
      if (!silent) await Audio_.speak(text, "kim");
      this.el.classList.remove("talking");
      /* exercise screens: Kim (head + text) only reads the opening instruction, then leaves */
      if (intro) { clearTimeout(this.introT); this.introT = setTimeout(() => document.body.classList.remove("kim-intro"), silent ? 2500 : 900); }
      this.backT = setTimeout(() => { if (this.poseNow !== "listen") this.pose("idle"); }, mood === "cheer" ? 1400 : 600);
      this.hideT = setTimeout(() => (this.bub.hidden = true), 3500);
    },
    /* small standing Kim for the map */
    mini() {
      const d = h("span", { class: "kimmini" });
      if (this.imgs.wave) d.append(h("img", { src: this.imgs.wave, alt: "" })); else d.innerHTML = KIM_SVG;
      return d;
    },
    hide() { this.bub.hidden = true; this.el.classList.remove("talking"); clearTimeout(this.backT); this.pose("idle"); }
  };

  /* ======================= Flow / progress ======================= */
  /* Steps of the open lesson. A practice step whose skill the lesson does not teach is skipped (and reported to the author). */
  let steps = [], skipped = [];
  function buildSteps() {
    steps = []; skipped = [];
    L.blocks.forEach((b) => b.steps.forEach((s) => {
      if (s.skill && !(L.skills || []).includes(s.skill)) { skipped.push(`${b.name} · ${s.title} (${s.skill})`); return; }
      steps.push(Object.assign({ block: b }, s));
    }));
    if (skipped.length) console.warn("[EXPLORE] skipped steps outside this lesson's skills:", skipped);
  }
  let idx = 0, cleanup = null, runId = 0;
  const main = $("#main");

  function renderProgress() {
    const p = $("#progress"); p.innerHTML = "";
    const block = steps[idx].block;
    steps.forEach((s, i) => { if (s.block === block) p.append(h("i", { class: i < idx ? "done" : i === idx ? "now" : "", title: s.title })); });
    const phase = ["watch", "explore", "chunks", "qa"].includes(steps[idx].type) ? "Review" : steps[idx].type === "recap" ? "Words" : steps[idx].type === "done" ? "Done" : "Practice";
    $("#tag").innerHTML = `${L.id} · <b>${block.name}</b> · ${phase}`;
  }
  function go(i) {
    runId++; Audio_.stop(); Kim.hide(); clearTimeout(Kim.introT);
    document.body.classList.add("kim-intro");
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    idx = Math.max(0, Math.min(steps.length - 1, i));
    main.innerHTML = ""; renderProgress();
    document.body.dataset.view = steps[idx].type; document.body.classList.remove("contain");
    try { history.replaceState(null, "", "#" + L.id.toLowerCase() + "--" + steps[idx].id); } catch (e) {}
    cleanup = TYPES[steps[idx].type](steps[idx], runId) || null;
    document.body.classList.toggle("framed", FRAME.includes(steps[idx].type));
    document.body.classList.toggle("aa-on", AA.on);
    if (FRAME.includes(steps[idx].type)) taskbar(steps[idx]);
  }
  /* ---- progress: which steps are done (kept with results; Firebase later) ---- */
  const Prog = {
    get map() { return (Results.data._done = Results.data._done || {}); },
    mark(id) { this.map[id] = true; Store.save(Results.data); },
    isDone(id) { return !!this.map[id]; },
    blockSteps(b) { return steps.filter((s) => s.block === b); },
    count(b) { return this.blockSteps(b).filter((s) => this.isDone(s.id)).length; },
    complete(b) { const st = this.blockSteps(b); return st.length > 0 && st.every((s) => this.isDone(s.id)); },
    stars(b) {
      const rs = this.blockSteps(b).filter((s) => s.skill).map((s) => Results.get(s.id)).filter(Boolean)
        .map((r) => (r.firstTry != null ? r.firstTry : r.said) / r.total);
      if (!rs.length) return 0;
      const avg = rs.reduce((a, x) => a + x, 0) / rs.length;
      return avg >= 0.9 ? 3 : avg >= 0.6 ? 2 : 1;
    }
  };
  /* finishing a step: go on inside the block, or back to the map when the block ends */
  const next = () => {
    Prog.mark(steps[idx].id);
    const n = steps[idx + 1];
    if (!n || n.block !== steps[idx].block) showMap({ justDone: steps[idx].block.id });
    else go(idx + 1);
  };
  const alive = (r) => r === runId;

  /* ======================= MAP (lesson home) ======================= */
  function showMap(opts = {}) {
    runId++; Audio_.stop(); Kim.hide();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    main.innerHTML = "";
    document.body.dataset.view = "map"; document.body.classList.remove("contain"); document.body.classList.add("framed");
    try { history.replaceState(null, "", "#" + L.id.toLowerCase()); } catch (e) {}
    const plan = L.plan || L.blocks.map((b) => ({ id: b.id, label: b.name }));
    const blockOf = (id) => L.blocks.find((b) => b.id === id);
    /* top bar shows the whole lesson: one segment per part */
    const p = $("#progress"); p.innerHTML = "";
    plan.forEach((n) => { const b = blockOf(n.id); p.append(h("i", { class: b && Prog.complete(b) ? "done" : "", title: n.label })); });
    $("#tag").innerHTML = `${L.id} · <b>${L.title}</b>`;

    const map = h("div", { class: "map" });
    const unitId = L.id.charAt(0);
    const head = h("div", { class: "maphead" },
      h("button", { class: "backlink", onclick: () => showUnit(unitId) }, "← Unit " + unitId),
      h("span", { class: "eyebrow" }, L.subtitle), h("h1", {}, L.title));
    const path = h("div", { class: "mappath" });
    const road = "M32 50 C 32 100, 68 100, 68 150 S 32 200, 32 250 C 32 275, 50 285, 50 312";
    path.innerHTML = `<svg class="trail" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true">
      <path class="edge" d="${road}"/><path class="road" d="${road}"/><path class="stones" d="${road}"/><path class="mid" d="${road}"/></svg>`;
    /* a few foods dropped along the road, from this unit's own pictures */
    (L.mapDeco || []).forEach((d) => { const el = h("img", { class: "deco", src: img(d.img), alt: "" }); Object.assign(el.style, { left: d.x + "%", top: d.y + "%", transform: `rotate(${d.r || 0}deg)` }); path.append(el); });
    let current = null;
    plan.forEach((n, k) => {
      const b = blockOf(n.id);
      const prev = k > 0 ? blockOf(plan[k - 1].id) : null;
      const open = b && !n.soon && (k === 0 || (prev && Prog.complete(prev)));
      const done = b && Prog.complete(b);
      const total = b ? Prog.blockSteps(b).length : 1;
      const got = b ? Prog.count(b) : 0;
      if (open && !done && !current) current = n.id;
      const stall = h("span", { class: "stall" }, h("span", { class: "awning" }), h("span", { class: "board" }, h("img", { src: img(n.img), alt: "" })));
      if (n.awning) stall.style.setProperty("--aw", n.awning);
      const badge = h("span", { class: "nbadge" }, done ? "✓" : !open ? "🔒" : String(k + 1));
      const sc = done ? Prog.stars(b) : 0;
      const pips = h("span", { class: "pips", "aria-label": `${got} of ${total} steps done` });
      for (let q = 0; q < total; q++) pips.append(h("i"));
      const stars = done ? h("span", { class: "nstars", "aria-label": sc + " stars" }, "★".repeat(sc), h("span", { class: "off" }, "★".repeat(3 - sc)))
        : n.soon ? h("span", { class: "nsoon" }, "Coming soon") : pips;
      const node = h("button", { class: "node" + (done ? " done" : "") + (open ? " open" : " locked") + (k % 2 ? " right" : " left"), disabled: !open && !done, "aria-label": n.label },
        h("span", { class: "nbtn" }, stall, badge), h("span", { class: "nlabel" }, n.label), stars);
      node.dataset.id = n.id;
      const frac = done ? 1 : got / total;
      const animate = opts.justDone === n.id;
      const fill = (k2) => pips.querySelectorAll("i").forEach((e, q) => e.classList.toggle("on", q < k2));
      if (animate) { node.classList.add("celebrate"); }
      if (!done && !n.soon) {
        if (opts.from === n.id) { fill(0); pips.querySelectorAll("i").forEach((e, q) => q < got && setTimeout(() => e.classList.add("on"), 300 + q * 180)); }
        else fill(got);
      }
      node.onclick = () => {
        if (!b || (!open && !done)) return;
        const st = Prog.blockSteps(b);
        const resume = done ? st[0] : st.find((s) => !Prog.isDone(s.id)) || st[0];
        go(steps.indexOf(resume));
      };
      path.append(node);
    });
    map.append(head, path);
    main.append(map);
    /* summary for the unit screen */
    try {
      const bl = plan.map((n) => blockOf(n.id)).filter(Boolean);
      localStorage.setItem("explore-hw:sum:" + L.id, JSON.stringify({
        stars: bl.reduce((t, b) => t + (Prog.complete(b) ? Prog.stars(b) : 0), 0), max: bl.length * 3,
        done: steps.filter((s) => Prog.isDone(s.id)).length, total: steps.length, complete: bl.every((b) => Prog.complete(b)) }));
    } catch (e) {}
    const cur = current && path.querySelector(`.node[data-id="${current}"]`);
    if (cur) { cur.classList.add("current"); cur.querySelector(".nbtn").append(Kim.mini()); }
    if (opts.justDone) Audio_.sfx("complete");
    const allDone = plan.every((n) => { const b = blockOf(n.id); return b && Prog.complete(b); });
    if (allDone) {
      const total = plan.reduce((t, n) => t + Prog.stars(blockOf(n.id)), 0);
      const fin = h("div", { class: "finish" + (opts.justDone ? " pop" : "") }, h("span", { class: "cup" }, "🏆"),
        h("b", {}, "Complete!"), h("span", { class: "fstars" }, "★ " + total + " / " + plan.length * 3));
      head.append(fin);
      if (opts.justDone) { Kim.say(L.finishLine || "Hooray! You finished Food Street!"); return; }
    }
    const label = (id) => (plan.find((n) => n.id === id) || {}).label;
    const msg = opts.justDone
      ? (current ? `Great job! Now let's do ${label(current)}!` : "Well done! More is coming soon!")
      : current ? `Tap ${label(current)} to start!` : "Well done! More is coming soon!";
    Kim.say(msg);
  }

  /* Stage with crossfading scene images */
  /* Full-screen stage: the 16:9 scene covers the screen when little would be cropped,
     otherwise it is shown whole and the rest is filled with a blurred copy of itself. */
  function makeStage() {
    const wrap = h("div", { class: "stagewrap" });
    const stage = h("div", { class: "stage" });
    const fill = h("div", { class: "blurfill" });
    const canvas = h("div", { class: "canvas" });
    const a = h("img", { class: "scene", alt: "" }), b = h("img", { class: "scene out", alt: "" });
    const layer = h("div", { class: "layer" });
    canvas.append(a, b, layer); stage.append(fill, canvas); wrap.append(stage);
    let front = a, back = b, current = null;
    const fit = () => {
      const W = stage.clientWidth, H = stage.clientHeight, ar = 16 / 9; if (!W || !H) return;
      let cw, ch;
      if (W / H > ar) { cw = W; ch = W / ar; } else { ch = H; cw = H * ar; }
      const crop = Math.max((cw - W) / cw, (ch - H) / ch);
      const contain = crop > 0.12;
      if (contain) { if (W / H > ar) { ch = H; cw = H * ar; } else { cw = W; ch = W / ar; } }
      /* portrait: keep the picture near the top so the dock fits underneath */
      const top = contain && W / H < ar ? Math.min((H - ch) / 2, 70 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sat")) || 0)) : (H - ch) / 2;
      Object.assign(canvas.style, { width: cw + "px", height: ch + "px", left: (W - cw) / 2 + "px", top: top + "px" });
      stage.classList.toggle("contain", contain);
      document.body.classList.toggle("contain", contain);
    };
    const ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(stage); else window.addEventListener("resize", fit);
    requestAnimationFrame(fit);
    return {
      wrap, stage, layer,
      set(name) {
        if (name === current) return; current = name;
        back.src = img(name); fill.style.backgroundImage = `url("${img(name)}")`;
        back.classList.remove("out"); front.classList.add("out");
        [front, back] = [back, front];
      },
      get scene() { return current; }
    };
  }
  function setChrome(px) { document.documentElement.style.setProperty("--chrome", px + "px"); }

  /* ======================= Tray (collection slots) + task bar ======================= */
  /* Each round has a slot; a right answer flies its picture into the slot (Pixie-style collection). */
  function makeTray() {
    const el = h("div", { class: "tray" }); let n = 0;
    return {
      el,
      update(r, res, total) {
        if (total !== n) { n = total; el.innerHTML = ""; for (let k = 0; k < n; k++) el.append(h("i")); }
        [...el.children].forEach((e, k) => { e.classList.toggle("now", k === r); e.classList.toggle("try", k < r && !res[k]); });
      },
      fill(k, src, fromEl, ok = true) {
        const slot = el.children[k]; if (!slot) return;
        const pic = h("img", { src, alt: "" }); slot.innerHTML = ""; slot.append(pic); slot.classList.add("full"); slot.classList.toggle("try", !ok);
        if (!fromEl || !fromEl.getBoundingClientRect) return;
        const a = fromEl.getBoundingClientRect(), b = slot.getBoundingClientRect();
        const fly = h("img", { class: "flyer", src, alt: "" });
        Object.assign(fly.style, { left: a.left + a.width / 2 - 40 + "px", top: a.top + a.height / 2 - 40 + "px" });
        document.body.append(fly);
        pic.style.opacity = "0";
        fly.animate([{ transform: "translate(0,0) scale(1)" }, { transform: `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px,${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.35)` }],
          { duration: 650, easing: "cubic-bezier(.5,-.3,.6,1)" }).onfinish = () => { fly.remove(); pic.style.opacity = ""; slot.animate([{ transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 300 }); };
      }
    };
  }
  /* Aa: show/hide text in listening practice (hidden by default so students really listen) */
  const AA = { get on() { try { return localStorage.getItem("explore-hw:aa") === "1"; } catch (e) { return false; } },
    set on(v) { try { localStorage.setItem("explore-hw:aa", v ? "1" : "0"); } catch (e) {} document.body.classList.toggle("aa-on", v); } };
  const FRAME = ["bubbles", "pick", "names", "say", "lid", "answer", "chunks", "qa", "recap", "done"];
  function taskbar(step) {
    const block = step.block;
    const bs = steps.filter((s) => s.block === block), at = bs.indexOf(step);
    const close = h("button", { class: "tb-x", "aria-label": "Back to the map", onclick: () => showMap() }, "✕");
    const prog = h("span", { class: "tb-prog" }, h("i", { style: `width:${Math.round(((at + 0.5) / bs.length) * 100)}%` }));
    const tray = main.querySelector(".tray");
    const kids = [close, prog];
    if (tray) kids.push(tray);
    else kids.push(h("span", { class: "tb-title" }, block.name));
    if (step.skill === "L") {
      const aa = h("button", { class: "tb-aa" + (AA.on ? " on" : ""), "aria-label": "Show the words" }, "Aa");
      aa.onclick = () => { AA.on = !AA.on; aa.classList.toggle("on", AA.on); };
      kids.push(aa);
    }
    kids.push(h("button", { class: "tb-menu", "aria-label": "All steps", onclick: () => $("#menuBtn").click() }, "☰"));
    main.prepend(h("div", { class: "taskbar" }, ...kids));
    /* turtle: same sentence, slower */
    const spk = main.querySelector(".speak.big");
    if (spk && step.skill === "L") {
      const turtle = h("button", { class: "turtle", "aria-label": "Listen slowly", title: "Listen slowly" }, "🐢");
      turtle.onclick = () => { Audio_.rateMul = 0.72; Promise.resolve(spk.onclick && spk.onclick()).finally(() => (Audio_.rateMul = 1)); };
      spk.after(turtle);
    }
  }

  /* ======================= Step types ======================= */
  const TYPES = {};

  /* ---------- WATCH: auto-play animated review, every line replayable ---------- */
  TYPES.watch = function (step, run) {
    setChrome(300);
    const st = makeStage();
    const counter = h("div", { class: "counter" });
    const extras = h("div", { class: "layer" });
    const strip = h("div", { class: "strip", hidden: true });
    st.layer.append(counter, extras, strip);
    const capTxt = h("div", { class: "txt" }, "");
    const replay = h("button", { class: "speak", "aria-label": "Listen again", html: ICON.speaker });
    const caption = h("div", { class: "caption" }, replay, capTxt);
    const bPrev = h("button", { class: "ctl", "aria-label": "Previous" }, "⏮", h("span", { class: "t" }, "Back"));
    const bPlay = h("button", { class: "ctl primary", "aria-label": "Pause" }, "⏸", h("span", { class: "t" }, "Pause"));
    const bNext = h("button", { class: "ctl", "aria-label": "Next line" }, "⏭", h("span", { class: "t" }, "Next"));
    const bSkip = h("button", { class: "ctl go" }, step.skipLabel || "Skip ▶");
    const chips = h("div", { class: "chips", "aria-label": "Lines you heard" });
    bSkip.className = "ctl go bigarrow"; bSkip.innerHTML = "➜"; bSkip.setAttribute("aria-label", "Continue");
    caption.append(bSkip);
    const dock = h("div", { class: "dock" }, caption, chips);
    main.append(st.wrap, dock);

    const cues = step.cues;
    let i = 0, playing = true, token = 0;
    const cueText = (c) => c.food ? (c.line && !c.wordFirst ? c.line.text : (c.line ? L.words[c.food].label + " — " + c.line.text : L.words[c.food].label)) : (c.line ? c.line.text : "");
    const cueSound = async (c, tk) => {
      if (c.food && c.wordFirst) { await Audio_.word(c.food); if (tk !== token) return; await sleep(250); if (tk !== token) return; await Audio_.line(c.line); }
      else if (c.food) { await Audio_.word(c.food); }
      else if (c.line) { await Audio_.line(c.line); }
    };
    function ringAt(c) {
      st.layer.querySelectorAll(".ring").forEach((r) => r.remove());
      if (!c.point) return;
      let x, y;
      const [kind, id] = c.point.split(":");
      if (kind === "cart") { const k = L.street.carts.find((k) => k.id === id).hot; x = k.x + k.w / 2; y = k.y + k.h * 0.32; }
      else { const p = L.street.signRice[id]; x = p.x; y = p.y; }
      const r = h("div", { class: "ring" }); r.style.left = x + "%"; r.style.top = y + "%"; st.layer.append(r);
    }
    /* Rebuild what is visible after cues[0..k-1] (so Back works) */
    function foodsBefore(k) {
      let list = [];
      for (let j = 0; j < k; j++) { if (cues[j].clear) list = []; if (cues[j].food) list.push(cues[j].food); }
      if (cues[k] && cues[k].clear) list = [];
      return list;
    }
    function drawCounter(list, popLast) {
      counter.innerHTML = "";
      list.forEach((f, n) => {
        const el = h("div", { class: "food" }, h("img", { src: img(L.words[f].img), alt: L.words[f].label }), h("span", { class: "lbl", html: wlabel(L.words[f]) }));
        if (!(popLast && n === list.length - 1)) el.style.animation = "none";
        counter.append(el);
      });
    }
    function chip(k) {
      const c = cues[k], t = cueText(c);
      if (!t) return;
      const existing = chips.querySelector(`[data-k="${k}"]`);
      chips.querySelectorAll(".chip").forEach((x) => x.classList.remove("now"));
      if (existing) { existing.classList.add("now"); return; }
      const el = h("button", { class: "chip now", "data-k": k, onclick: () => { token++; playing = false; syncPlay(); cueSound(cues[k], token); } },
        h("span", { class: "s", html: ICON.speaker }), t);
      chips.append(el); el.scrollIntoView({ block: "nearest", inline: "end" });
    }
    /* actors (positioned images), speech bubble and sentence strip — state belongs to the cue */
    function drawExtras(c) {
      extras.innerHTML = "";
      if (c.dim) extras.append(h("div", { class: "dimmer" }));
      (c.actors || []).forEach((a) => { const el = h("img", { class: "actor", src: img(a.img), alt: "" }); Object.assign(el.style, { left: a.x + "%", top: a.y + "%", width: a.w + "%" }); extras.append(el); });
      if (c.bubble) { const b = h("div", { class: "sbubble" }, c.bubble.text); Object.assign(b.style, { left: c.bubble.x + "%", top: c.bubble.y + "%" }); extras.append(b); }
      if (c.strip) { strip.hidden = false; strip.innerHTML = c.strip; strip.classList.remove("fx"); void strip.offsetWidth; strip.classList.add("fx"); }
      else strip.hidden = true;
    }
    function syncPlay() { bPlay.innerHTML = playing ? '⏸<span class="t">Pause</span>' : '▶<span class="t">Play</span>'; }
    async function runFrom(k) {
      const tk = ++token;
      for (i = k; i < cues.length; i++) {
        if (!alive(run) || tk !== token) return;
        const c = cues[i];
        st.set(c.scene);
        const list = foodsBefore(i).concat(c.food ? [c.food] : []);
        drawCounter(list, !!c.food);
        ringAt(c);
        drawExtras(c);
        capTxt.innerHTML = c.food ? `<mark>${wlabel(L.words[c.food])}</mark>` + (c.line ? " " + c.line.text : "") : (c.line ? c.line.text : "");
        chip(i);
        replay.classList.add("playing"); Kim.pose("point"); Kim.el.classList.add("talking");
        await cueSound(c, tk);
        replay.classList.remove("playing"); Kim.el.classList.remove("talking");
        if (!alive(run) || tk !== token) return;
        await sleep(c.after != null ? c.after : (c.food ? 550 : 450));
      }
      if (alive(run) && tk === token) bSkip.classList.add("pulse");
    }
    replay.onclick = () => { token++; playing = false; syncPlay(); replay.classList.add("playing"); cueSound(cues[Math.min(i, cues.length - 1)], token).then(() => replay.classList.remove("playing")); };
    bPlay.onclick = () => { playing = !playing; syncPlay(); if (playing) runFrom(Math.min(i, cues.length - 1)); else { token++; Audio_.stop(); } };
    bPrev.onclick = () => { playing = true; syncPlay(); runFrom(Math.max(0, i - 1)); };
    bNext.onclick = () => { playing = true; syncPlay(); if (i + 1 >= cues.length) next(); else runFrom(i + 1); };
    bSkip.onclick = () => next();
    runFrom(0);
    return () => { token++; };
  };

  /* ---------- EXPLORE: tap carts → foods → hear each word ---------- */
  TYPES.explore = function (step, run) {
    setChrome(300);
    const st = makeStage();
    /* Self-tracking: every visit starts grey; a word turns green when the student taps it on a cart.
       "I'm ready!" never blocks (students who already know the words can skip). */
    const heard = new Set();
    const all = Object.keys(L.words);
    const visited = new Set();
    const tracker = h("div", { class: "tracker", "aria-label": "Words heard" });
    const count = h("span", { class: "count" });
    const ready = h("button", { class: "ctl go", disabled: true }, "I'm ready! ▶");
    const dock = h("div", { class: "dock" }, h("div", { class: "controls" }, h("div", { class: "trackwrap" }, tracker, count), h("span", { class: "spacer" }), ready));
    main.append(st.wrap, dock);

    function drawTracker() {
      tracker.innerHTML = "";
      all.forEach((w) => tracker.append(h("span", { class: heard.has(w) ? "on" : "", title: L.words[w].label }, h("img", { src: img(L.words[w].img), alt: L.words[w].label }))));
      count.textContent = `${heard.size}/${all.length} words`;
      const ok = step.readyWhen !== "all" || heard.size >= all.length;
      ready.disabled = !ok;
    }
    function streetView() {
      st.set(L.street.scene); st.layer.innerHTML = "";
      L.street.carts.forEach((c) => {
        const b = h("button", { class: "hot" + (visited.has(c.id) ? " visited" : ""), "aria-label": c.name }, h("span", { class: "name" }, c.name));
        Object.assign(b.style, { left: c.hot.x + "%", top: c.hot.y + "%", width: c.hot.w + "%", height: c.hot.h + "%" });
        b.onclick = () => cartView(c);
        st.layer.append(b);
      });
    }
    async function cartView(c) {
      visited.add(c.id); Audio_.sfx("region-enter");
      st.set(c.scene); st.layer.innerHTML = "";
      const back = h("button", { class: "backbtn" }, "◀ Food Street");
      back.onclick = () => { Audio_.stop(); streetView(); };
      const counter = h("div", { class: "counter" });
      st.layer.append(counter, back);
      for (const f of c.foods) {
        const el = h("button", { class: "food" + (heard.has(f) ? " heard" : ""), "aria-label": L.words[f].label },
          h("img", { src: img(L.words[f].img), alt: "" }), h("span", { class: "lbl", html: wlabel(L.words[f]) }));
        el.onclick = async () => {
          el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce", "heard");
          await Audio_.word(f);
          if (!heard.has(f)) { heard.add(f); Results.put(step.id, { heard: [...heard] }); drawTracker(); if (!ready.disabled && heard.size === all.length) { ready.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 600, iterations: 2 }); Kim.say("Great! Now tap “I'm ready!”"); } }
        };
        counter.append(el);
        await sleep(160);
        if (!alive(run)) return;
      }
    }
    /* Data for the teacher: which words were heard, and whether the student skipped */
    ready.onclick = () => { Results.put(step.id, { heard: [...heard], total: all.length, skipped: heard.size < all.length }); next(); };
    streetView(); drawTracker();
    Kim.say(step.instruction);
  };

  /* ---------- BUBBLES: listen and pop (template: Nghe & chọn đáp án) ---------- */
  TYPES.bubbles = function (step, run) {
    const field = h("div", { class: "field" });
    const tray = makeTray(); const dots = tray.el; main.append(dots);
    const spk = h("button", { class: "speak big", "aria-label": "Listen again", html: ICON.speaker });
    const row = h("div", { class: "bubbles" });
    const aaTxt = h("div", { class: "aa psent" });
    field.append(h("div", { class: "row" }, spk), aaTxt, row);
    main.append(field);
    const targets = shuffle(step.targets);
    const res = []; let r = 0;
    function drawDots() {
      tray.update(r, res, targets.length);
    }
    function optionsFor(t) {
      const set = [t, L.confusable[t]];
      const rest = shuffle(Object.keys(L.words).filter((w) => !set.includes(w)));
      while (set.length < step.options) set.push(rest.pop());
      return shuffle(set);
    }
    const playT = async () => { spk.classList.add("playing"); await Audio_.word(targets[r]); spk.classList.remove("playing"); };
    spk.onclick = playT;
    async function round() {
      if (!alive(run)) return;
      if (r >= targets.length) return finish();
      drawDots(); row.innerHTML = "";
      const t = targets[r]; let wrong = 0, locked = false;
      aaTxt.textContent = L.words[t].label; aaTxt.classList.remove("shown");
      optionsFor(t).forEach((w) => {
        const b = h("button", { class: "bubble", "aria-label": "Bubble" }, h("img", { src: img(L.words[w].img), alt: "" }));
        b.onclick = async () => {
          if (locked) return;
          if (w === t) {
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("sticker-place"); tray.fill(r, img(L.words[t].img), b, res[r]); aaTxt.classList.add("shown"); b.classList.add("popped");
            row.querySelectorAll(".bubble").forEach((x) => x !== b && x.classList.add("fade"));
            const rev = h("div", { class: "reveal" }, h("div", { class: "card" }, h("img", { src: img(L.words[t].img), alt: "" }), h("div", { class: "w" }, L.words[t].label)));
            field.append(rev);
            await sleep(250); await Audio_.word(t); await sleep(650);
            rev.remove(); r++; round();
          } else {
            wrong++; Audio_.sfx("practice-wrong"); Kim.pose("think"); setTimeout(() => Kim.poseNow === "think" && Kim.pose("idle"), 1200);
            b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
            locked = true; await sleep(900); locked = false; b.classList.remove("wrong");
            if (wrong >= 2) row.querySelectorAll(".bubble").forEach((x, k) => { if (x.dataset.w === t) x.classList.add("hint"); });
            playT();
          }
        };
        b.dataset.w = w; row.append(b);
      });
      await sleep(350); if (alive(run)) playT();
    }
    async function finish() {
      drawDots();
      const score = res.filter(Boolean).length;
      Results.put(step.id, { firstTry: score, total: targets.length });
      row.innerHTML = "";
      field.append(h("div", { class: "reveal" }, h("div", { class: "card" }, h("div", { class: "w", style: "color:var(--ink)" }, "⭐ " + score + " / " + targets.length))));
      await Kim.say(score >= targets.length - 1 ? "Super listening!" : "Good job!");
      await sleep(500); if (alive(run)) next();
    }
    Kim.say(step.intro || step.instruction).then(() => alive(run) && round());
  };

  /* ---------- SAY: picture → student speaks → keyword check (template: Nghe & repeat) ---------- */
  TYPES.say = function (step, run) {
    /* Flow per item: picture → Kim asks (audio) → mic turns on by itself → keyword check.
       Wrong/no sound → Kim encourages → mic turns on again. 2 misses → model answer, go on. */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let mode = SR ? "mic" : "self";
    const field = h("div", { class: "sayfield" });
    const tray = makeTray(); const dots = tray.el; main.append(dots);
    const pic = h("img", { class: "pic", alt: "" });
    const ans = h("div", { class: "answer" });
    const heardTxt = h("div", { class: "heardtxt" });
    const mic = h("button", { class: "mic", "aria-label": "Say it", html: ICON.mic });
    const hint = h("button", { class: "ctl", hidden: true }, "👂 Listen");
    const check = h("button", { class: "ctl primary", hidden: true }, "✓ Check");
    const nxt = h("button", { class: "ctl go", hidden: true }, "Next ▶");
    const note = h("div", { class: "note", hidden: true });
    field.append(pic, ans, heardTxt, h("div", { class: "row" }, mic, hint, check, nxt), note);
    main.append(field);
    const items = shuffle(step.items); const res = []; let r = 0, tries = 0, quiet = 0, rec = null, itemTok = 0;
    const live = (tk) => alive(run) && tk === itemTok;

    function setMode(m) {
      mode = m;
      mic.hidden = m !== "mic";
      if (m === "self") {
        note.hidden = false;
        note.textContent = "Máy hoặc trình duyệt này chưa cho dùng micro. HV nói to tên món, rồi bấm Check để nghe đáp án.";
      }
    }
    function drawDots() { tray.update(r, res, items.length); }
    function matches(list, w) {
      const word = L.words[w];
      return list.some((t) => {
        const s = " " + t.toLowerCase().replace(/[^a-z ]/g, " ") + " ";
        if (word.reject && word.reject.some((x) => s.includes(x))) return false;
        return word.say.some((k) => s.includes(k));
      });
    }
    function stopRec() { if (rec) { const x = rec; rec = null; try { x.abort(); } catch (e) {} } (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); }
    async function success(w, tk) {
      res[r] = tries === 0; stopRec(); mic.hidden = true; hint.hidden = true; check.hidden = true;
      ans.className = "answer ok"; ans.textContent = "✓ " + L.words[w].label; tray.fill(r, img(L.words[w].img), pic, res[r]);
      Audio_.sfx("name-reveal"); await sleep(300); if (!live(tk)) return;
      await Audio_.word(w); if (!live(tk)) return;
      await Kim.say(["Great!", "Well done!", "Yes!", "Super!"][r % 4]);
      await sleep(400); if (live(tk)) nextItem();
    }
    async function giveAnswer(w, tk) {
      res[r] = false; stopRec(); hint.hidden = true; check.hidden = true; mic.hidden = true;
      ans.className = "answer soft"; ans.textContent = L.words[w].label;
      await Kim.say("Listen!"); if (!live(tk)) return;
      await Audio_.word(w); if (!live(tk)) return;
      await Kim.say("Say it with me next time!");
      nxt.hidden = false;
    }
    async function retry(w, tk, msg) {
      hint.hidden = false;
      await Kim.say(msg); await sleep(250);
      if (live(tk) && mode === "mic") listen(w, tk);
    }
    function listen(w, tk) {
      stopRec(); Audio_.stop();
      const R = new SR(); rec = R;
      R.lang = "en-GB"; R.interimResults = false; R.maxAlternatives = 5; R.continuous = false;
      let got = false;
      (mic.classList.add("listening"), Kim.pose("listen")); heardTxt.textContent = "🎤 Listening…";
      R.onresult = (e) => {
        if (rec !== R || !live(tk)) return;
        got = true; (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle"));
        const alts = []; for (const x of e.results) for (const a of x) alts.push(a.transcript);
        heardTxt.textContent = "I heard: “" + (alts[0] || "") + "”";
        if (matches(alts, w)) return success(w, tk);
        tries++;
        Audio_.sfx("practice-wrong");
        if (tries >= 2) giveAnswer(w, tk); else retry(w, tk, "Hmm… try again!");
      };
      R.onerror = (e) => {
        if (rec !== R) return;
        (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle"));
        if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") { heardTxt.textContent = ""; setMode("self"); check.hidden = false; Kim.say("Say it out loud. Then tap Check!"); }
      };
      R.onend = () => {
        if (rec !== R || !live(tk)) return;
        (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); rec = null;
        if (got || mode !== "mic") return;
        /* nothing heard: re-open the mic once by itself, then wait for a tap */
        quiet++;
        if (quiet <= 1) retry(w, tk, "I can't hear you. Say it again!");
        else { heardTxt.textContent = "Tap the mic and say it!"; hint.hidden = false; }
      };
      /* safety: never leave the mic open more than 7 s */
      setTimeout(() => { if (rec === R) { try { R.stop(); } catch (e) {} } }, 7000);
      try { R.start(); } catch (e) { (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); setMode("self"); check.hidden = false; }
    }
    async function show() {
      if (r >= items.length) return finish();
      const tk = ++itemTok;
      tries = 0; quiet = 0; drawDots(); stopRec();
      const w = items[r];
      pic.src = img(L.words[w].img); pic.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 350, easing: "ease-out" });
      ans.className = "answer"; ans.textContent = ""; heardTxt.textContent = "";
      hint.hidden = true; nxt.hidden = true; check.hidden = mode !== "self"; mic.hidden = mode !== "mic";
      mic.onclick = () => { quiet = 0; listen(w, tk); };
      hint.onclick = async () => { stopRec(); ans.className = "answer soft"; ans.textContent = L.words[w].label; await Audio_.word(w); if (live(tk) && mode === "mic") listen(w, tk); };
      check.onclick = async () => { res[r] = true; check.hidden = true; ans.className = "answer ok"; ans.textContent = L.words[w].label; await Audio_.word(w); nxt.hidden = false; };
      await Kim.say(mode === "mic" ? (step.ask || "What's this?") : "What's this? Say it out loud!");
      await sleep(200);
      if (live(tk) && mode === "mic") listen(w, tk);
    }
    function nextItem() { r++; show(); }
    nxt.onclick = nextItem;
    async function finish() {
      stopRec(); drawDots(); mic.hidden = true; hint.hidden = true; check.hidden = true; nxt.hidden = true; pic.hidden = true; heardTxt.textContent = ""; note.hidden = true;
      const score = res.filter(Boolean).length;
      Results.put(step.id, { said: score, total: items.length, mode });
      ans.className = "answer"; ans.textContent = "⭐ " + score + " / " + items.length;
      await Kim.say("Well done! You said all the food words!"); await sleep(400); if (alive(run)) next();
    }
    setMode(mode);
    mic.hidden = true;
    (async () => {
      await Kim.say(step.intro || step.instruction);
      await sleep(300);
      if (alive(run)) show();
    })();
    return () => { itemTok++; stopRec(); };
  };

  /* ---------- RECAP: word list + results ---------- */
  TYPES.recap = function (step) {
    const box = h("div", { class: "recap" });
    const score = h("div", { class: "score" });
    (step.scores || [["v-p1", "🫧 Pop the bubble"], ["v-p2", "🎤 Say it"]]).forEach(([id, label]) => {
      const r = Results.get(id); const n = r ? (r.firstTry != null ? r.firstTry : r.said) : null;
      score.append(h("div", {}, label, h("span", { class: "num" }, r ? `${n}/${r.total}` : "–")));
    });
    const grid = h("div", { class: "grid" });
    (step.words || Object.keys(L.words)).forEach((w) => {
      const t = h("button", { class: "tile" }, h("img", { src: img(L.words[w].img), alt: "" }), h("span", { html: wlabel(L.words[w]) }));
      t.onclick = () => { t.classList.remove("bounce"); void t.offsetWidth; t.classList.add("bounce"); Audio_.word(w); };
      grid.append(t);
    });
    const again = h("button", { class: "ctl" }, "↻ Play again");
    again.onclick = () => go(steps.findIndex((s) => s.block === step.block));
    const nextB = h("button", { class: "ctl primary", onclick: () => next() }, "🗺️ Back to the map");
    box.append(h("h2", {}, step.heading || "Food Street words"), score, grid, h("div", { class: "controls" }, again, h("span", { class: "spacer" }), nextB));
    main.append(box);
    Audio_.sfx("complete");
    Kim.say("Tap a food and listen again!");
  };


  /* ---------- CHUNKS (Grammar explore): tap a card → full form, then buddies merge ---------- */
  TYPES.chunks = function (step) {
    const heard = new Set();
    const grid = h("div", { class: "chunkgrid" });
    const tracker = h("div", { class: "tracker" });
    const count = h("span", { class: "count" });
    const ready = h("button", { class: "ctl go" }, "I'm ready! ▶");
    const dock = h("div", { class: "dock" }, h("div", { class: "controls" }, h("div", { class: "trackwrap" }, tracker, count), h("span", { class: "spacer" }), ready));
    main.append(grid, dock);
    function drawTracker() {
      tracker.innerHTML = "";
      step.cards.forEach((c, k) => tracker.append(h("span", { class: "dot" + (heard.has(k) ? " on" : "") }, c.chunk.split(" ")[0])));
      count.textContent = `${heard.size}/${step.cards.length} cards`;
    }
    step.cards.forEach((c, k) => {
      const pic = h("div", { class: "cpic" }, h("img", { src: img(c.img), alt: "" }));
      if (c.food) pic.append(h("img", { class: "cfood", src: img(c.food), alt: "" }));
      const sent = h("div", { class: "csent" }, h("b", {}, c.chunk), " " + c.rest);
      const card = h("button", { class: "ccard" }, pic, sent);
      card.onclick = async () => {
        grid.querySelectorAll(".ccard").forEach((x) => x.classList.remove("now")); card.classList.add("now");
        sent.innerHTML = `<b>${c.chunk.replace("'s", " is").replace("I'm", "I am")}</b> ${c.rest}`;
        await Audio_.speak(c.full, c.who || "narrator");
        sent.innerHTML = `<b class="m">${c.chunk}</b> ${c.rest}`;
        await Audio_.speak(c.short, c.who || "narrator");
        heard.add(k); drawTracker();
      };
      grid.append(card);
    });
    ready.onclick = () => { Results.put(step.id, { heard: [...heard], total: step.cards.length, skipped: heard.size < step.cards.length }); next(); };
    drawTracker();
    Kim.say(step.instruction);
  };

  /* ---------- PICK (Listening with characters): hear a sentence → tap 1 of 3 pictures ---------- */
  TYPES.pick = function (step, run) {
    const field = h("div", { class: "field pickfield" });
    const tray = makeTray(); const dots = tray.el; main.append(dots);
    const spk = h("button", { class: "speak big", "aria-label": "Listen again", html: ICON.speaker });
    const sent = h("div", { class: "psent" });
    const row = h("div", { class: "pickrow" });
    sent.classList.add("aa");
    field.append(h("div", { class: "row" }, spk), sent, row);
    main.append(field);
    const items = shuffle(step.items); const res = []; let r = 0;
    const drawDots = () => { tray.update(r, res, items.length); };
    const play = async () => { spk.classList.add("playing"); await Audio_.speak(items[r].say, "narrator"); spk.classList.remove("playing"); };
    spk.onclick = play;
    async function round() {
      if (!alive(run)) return;
      if (r >= items.length) return finish();
      drawDots(); row.innerHTML = "";
      const it = items[r]; let wrong = 0, locked = false;
      sent.textContent = it.say; sent.classList.remove("shown");
      const order = shuffle(it.opts.map((o, k) => k));
      order.forEach((k) => {
        const b = h("button", { class: "pcard" }, h("img", { src: img(it.opts[k]), alt: "" }));
        b.dataset.k = k;
        b.onclick = async () => {
          if (locked) return;
          if (k === it.answer) {
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("name-reveal"); tray.fill(r, img(it.opts[k]), b, res[r]); b.classList.add("right");
            row.querySelectorAll(".pcard").forEach((x) => x !== b && x.classList.add("fade"));
            sent.classList.add("shown");
            await sleep(250); await play(); await sleep(700);
            if (!alive(run)) return; r++; round();
          } else {
            wrong++; Audio_.sfx("practice-wrong"); Kim.pose("think"); setTimeout(() => Kim.poseNow === "think" && Kim.pose("idle"), 1200);
            b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
            locked = true; await sleep(900); locked = false; b.classList.remove("wrong");
            if (wrong >= 2) row.querySelector(`.pcard[data-k="${it.answer}"]`).classList.add("hint");
            play();
          }
        };
        row.append(b);
      });
      await sleep(350); if (alive(run)) play();
    }
    async function finish() {
      drawDots(); row.innerHTML = ""; sent.textContent = "";
      const score = res.filter(Boolean).length;
      Results.put(step.id, { firstTry: score, total: items.length });
      field.append(h("div", { class: "reveal" }, h("div", { class: "card" }, h("div", { class: "w", style: "color:var(--ink)" }, "⭐ " + score + " / " + items.length))));
      await Kim.say(score >= items.length - 1 ? "Super listening!" : "Good job!");
      await sleep(500); if (alive(run)) next();
    }
    Kim.say(step.intro).then(() => alive(run) && round());
  };

  /* ---------- LID (Speaking full sentence): shadow → mic opens → check BE + food → lid lifts ---------- */
  TYPES.lid = function (step, run) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let mode = SR ? "mic" : "self";
    const pron = { he: "He", she: "She", i: "I" };
    const BE = {
      he: /\bhe ?'?s\b|\bhe is\b|\bhis\b|\bhes\b/,
      she: /\bshe ?'?s\b|\bshe is\b|\bshes\b|\bshe was\b/,
      i: /\bi ?'?m\b|\bi am\b|\bim\b|\bam\b/
    };
    /* build random kid × food each attempt (anti-memory) */
    const boys = shuffle(step.boys), girls = shuffle(step.girls), foods = shuffle(step.foods);
    const items = shuffle(step.subjects).map((s, k) => ({ s, f: foods[k], kid: s === "he" ? boys.pop() : s === "she" ? girls.pop() : step.me }));
    const field = h("div", { class: "sayfield lidfield" });
    const tray = makeTray(); const dots = tray.el; main.append(dots);
    const kid = h("img", { class: "lidkid", alt: "" });
    const tag = h("span", { class: "subj" });
    const plate = h("div", { class: "plate" });
    const shadow = h("img", { class: "shadow", alt: "" });
    const food = h("img", { class: "lfood", alt: "" });
    const lid = h("div", { class: "lid" });
    plate.append(food, shadow, lid);
    /* 💡 hint: shows (and says) the food word, so a child who can't read the shadow can still build the sentence */
    const bulb = h("button", { class: "bulb", "aria-label": "Hint", hidden: true }, "💡");
    const wordChip = h("div", { class: "wordchip", hidden: true });
    const plateWrap = h("div", { class: "platewrap" }, plate, bulb, wordChip);
    const scene = h("div", { class: "lidscene" }, h("div", { class: "kidwrap" }, kid, tag), plateWrap);
    const ans = h("div", { class: "answer" });
    const heardTxt = h("div", { class: "heardtxt" });
    const mic = h("button", { class: "mic", "aria-label": "Say it", html: ICON.mic });
    const lift = h("button", { class: "ctl primary", hidden: true }, "🍽️ Lift the lid");
    const hint = h("button", { class: "ctl", hidden: true }, "👂 Listen");
    const nxt = h("button", { class: "ctl go", hidden: true }, "Next ▶");
    const note = h("div", { class: "note", hidden: true });
    field.append(scene, ans, heardTxt, h("div", { class: "row" }, mic, hint, lift, nxt), note);
    main.append(field);
    const res = []; let r = 0, tries = 0, quiet = 0, rec = null, tok = 0, hints = 0;
    const live = (tk) => alive(run) && tk === tok;
    const verbOf = (f) => L.words[f].verb || "eating";
    const model = (it) => `${pron[it.s]}${it.s === "i" ? "'m" : "'s"} ${verbOf(it.f)} ${L.words[it.f].label}.`;
    const drawDots = () => { tray.update(r, res, items.length); };
    function setSelf() {
      mode = "self"; mic.hidden = true; lift.hidden = false; note.hidden = false;
      note.textContent = "Máy hoặc trình duyệt này chưa cho dùng micro. HV nói to cả câu, rồi bấm Lift the lid để nghe câu mẫu.";
    }
    function stopRec() { if (rec) { const x = rec; rec = null; try { x.abort(); } catch (e) {} } (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); }
    async function open(it, tk, good) {
      stopRec(); mic.hidden = true; hint.hidden = true; lift.hidden = true; bulb.hidden = true; wordChip.hidden = true;
      plate.classList.add("open"); tray.fill(r, food.src, plate, good);
      ans.className = "answer " + (good ? "ok" : "soft"); ans.textContent = (good ? "✓ " : "") + model(it);
      Audio_.sfx(good ? "name-reveal" : "sticker-place"); await sleep(450); if (!live(tk)) return;
      await Audio_.speak(model(it), it.s === "i" ? "kim" : "narrator"); if (!live(tk)) return;
      if (good) { await Kim.say(["Great!", "Well done!", "Super!"][r % 3]); await sleep(300); if (live(tk)) nextItem(); }
      else nxt.hidden = false;
    }
    async function retry(it, tk, msg) {
      hint.hidden = false;
      await Kim.say(msg); await sleep(250);
      if (live(tk) && mode === "mic") listen(it, tk);
    }
    function judge(alts, it) {
      const norm = alts.map((t) => " " + t.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' ]/g, " ") + " ");
      const w = L.words[it.f];
      const hasFood = (t) => !(w.reject && w.reject.some((x) => t.includes(x))) && w.say.some((k) => t.includes(k));
      const vb = verbOf(it.f), other = vb === "eating" ? "drinking" : "eating";
      const verbOk = (t) => !step.checkVerb || (new RegExp("\\b" + vb.slice(0, -3)).test(t) && !new RegExp("\\b" + other.slice(0, -3)).test(t));
      if (norm.some((t) => BE[it.s].test(t) && hasFood(t) && verbOk(t))) return "ok";
      if (step.checkVerb && norm.some((t) => hasFood(t) && !verbOk(t))) return "verb";   /* "drinking ice cream" — the I3 STS Insights error */
      if (norm.some(hasFood)) return "be";      /* food right, BE missing — the STS Insights error */
      return "food";
    }
    function listen(it, tk) {
      stopRec(); Audio_.stop();
      const R = new SR(); rec = R;
      R.lang = "en-GB"; R.interimResults = false; R.maxAlternatives = 5; R.continuous = false;
      let got = false;
      (mic.classList.add("listening"), Kim.pose("listen")); heardTxt.textContent = "🎤 Listening…";
      R.onresult = (e) => {
        if (rec !== R || !live(tk)) return;
        got = true; (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle"));
        const alts = []; for (const x of e.results) for (const a of x) alts.push(a.transcript);
        heardTxt.textContent = "I heard: “" + (alts[0] || "") + "”";
        const v = judge(alts, it);
        if (v === "ok") { res[r] = tries === 0; return open(it, tk, true); }
        tries++; Audio_.sfx("practice-wrong");
        if (tries >= 2) { res[r] = false; return open(it, tk, false); }
        if (v === "verb") retry(it, tk, "Eating or drinking? Try again!");
        else if (v === "be") retry(it, tk, it.s === "i" ? "Don't forget “am”! Say the full sentence." : "Don't forget “is”! Say the full sentence.");
        else retry(it, tk, "Look at the shadow again. Try again!");
      };
      R.onerror = (e) => {
        if (rec !== R) return;
        (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle"));
        if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) { heardTxt.textContent = ""; setSelf(); Kim.say("Say it out loud. Then lift the lid!"); }
      };
      R.onend = () => {
        if (rec !== R || !live(tk)) return;
        (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); rec = null;
        if (got || mode !== "mic") return;
        quiet++;
        if (quiet <= 1) retry(it, tk, "I can't hear you. Say it again!");
        else { heardTxt.textContent = "Tap the mic and say it!"; hint.hidden = false; }
      };
      setTimeout(() => { if (rec === R) { try { R.stop(); } catch (e) {} } }, 8000);
      try { R.start(); } catch (e) { (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); setSelf(); }
    }
    async function show() {
      if (r >= items.length) return finish();
      const tk = ++tok; const it = items[r];
      tries = 0; quiet = 0; drawDots(); stopRec();
      kid.src = img(it.kid); kid.classList.toggle("me", it.s === "i");
      tag.textContent = pron[it.s];
      food.src = img(L.words[it.f].img);
      if (step.style === "slot") { shadow.src = img(L.words[it.f].img); plate.classList.add("slot"); }
      else shadow.src = img("shadow-" + it.f);
      plate.classList.remove("open");
      bulb.hidden = false; bulb.classList.remove("used"); wordChip.hidden = true; wordChip.textContent = L.words[it.f].label;
      bulb.onclick = async () => {
        if (!bulb.classList.contains("used")) hints++;
        bulb.classList.add("used"); wordChip.hidden = false;
        wordChip.animate([{ opacity: 0, transform: "translate(-50%,8px) scale(.8)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 300 });
        stopRec(); await Audio_.word(it.f); await sleep(200);
        if (live(tk) && mode === "mic" && !plate.classList.contains("open")) listen(it, tk);
      };
      ans.className = "answer"; ans.textContent = ""; heardTxt.textContent = "";
      hint.hidden = true; nxt.hidden = true; mic.hidden = mode !== "mic"; lift.hidden = mode === "mic";
      scene.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 350 });
      mic.onclick = () => { quiet = 0; listen(it, tk); };
      hint.onclick = async () => { stopRec(); ans.className = "answer soft"; ans.textContent = model(it); await Audio_.speak(model(it), it.s === "i" ? "kim" : "narrator"); if (live(tk) && mode === "mic") listen(it, tk); };
      lift.onclick = () => { res[r] = true; open(it, tk, true); };
      if (step.style === "slot") await spin(it, tk);
      await Kim.say(it.s === "he" ? "Look at him!" : it.s === "she" ? "Look at her!" : "Look! It's you!");
      await sleep(200);
      if (live(tk) && mode === "mic") listen(it, tk);
    }
    /* Snack Machine: person and item roll like a slot machine, then stop */
    async function spin(it, tk) {
      const pool = shuffle(step.foods), kidsPool = shuffle(step.boys.concat(step.girls));
      Audio_.sfx("region-enter");
      for (let k = 0; k < 12; k++) {
        if (!live(tk)) return;
        shadow.src = img(L.words[pool[k % pool.length]].img); kid.src = img(kidsPool[k % kidsPool.length]); tag.textContent = "?";
        await sleep(60 + k * 12);
      }
      shadow.src = img(L.words[it.f].img); kid.src = img(it.kid); tag.textContent = pron[it.s];
      Audio_.sfx("sticker-place");
    }
    function nextItem() { r++; show(); }
    nxt.onclick = nextItem;
    async function finish() {
      stopRec(); drawDots(); scene.hidden = true; bulb.hidden = true; mic.hidden = true; hint.hidden = true; lift.hidden = true; nxt.hidden = true; heardTxt.textContent = ""; note.hidden = true;
      const score = res.filter(Boolean).length;
      Results.put(step.id, { said: score, total: items.length, mode, hints });
      ans.className = "answer"; ans.textContent = "⭐ " + score + " / " + items.length;
      await Kim.say("Well done! Great sentences!"); await sleep(400); if (alive(run)) next();
    }
    mic.hidden = true;
    (async () => { await Kim.say(step.intro); await sleep(300); if (alive(run)) show(); })();
    return () => { tok++; stopRec(); };
  };

  /* ---------- QA (FL explore): tap a card → question, then the answer appears ---------- */
  TYPES.qa = function (step) {
    const heard = new Set();
    const grid = h("div", { class: "chunkgrid" });
    const tracker = h("div", { class: "tracker" });
    const count = h("span", { class: "count" });
    const ready = h("button", { class: "ctl go" }, "I'm ready! ▶");
    main.append(grid, h("div", { class: "dock" }, h("div", { class: "controls" }, h("div", { class: "trackwrap" }, tracker, count), h("span", { class: "spacer" }), ready)));
    const draw = () => { tracker.innerHTML = ""; step.cards.forEach((c, k) => tracker.append(h("span", { class: "dot" + (heard.has(k) ? " on" : "") }, c.chunk.split(" ")[0]))); count.textContent = `${heard.size}/${step.cards.length} cards`; };
    step.cards.forEach((c, k) => {
      const pic = h("div", { class: "cpic" }, h("img", { src: img(c.img), alt: "" }));
      if (c.food) pic.append(h("img", { class: "cfood", src: img(c.food), alt: "" }));
      const q = h("div", { class: "cq" }, c.q);
      const a = h("div", { class: "csent ca" }, h("b", {}, c.chunk), " " + c.a.slice(c.chunk.length + 1));
      a.style.visibility = "hidden";
      const card = h("button", { class: "ccard" }, pic, h("div", { class: "ctext" }, q, a));
      card.onclick = async () => {
        grid.querySelectorAll(".ccard").forEach((x) => x.classList.remove("now")); card.classList.add("now");
        a.style.visibility = "hidden";
        await Audio_.speak(c.q, "narrator");
        a.style.visibility = "visible"; a.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300 });
        await Audio_.speak(c.a, "kim");
        heard.add(k); draw();
      };
      grid.append(card);
    });
    ready.onclick = () => { Results.put(step.id, { heard: [...heard], total: step.cards.length, skipped: heard.size < step.cards.length }); next(); };
    draw();
    Kim.say(step.instruction);
  };

  /* ---------- NAMES (FL listening): hear "What is Nick eating? — He's eating…" → tap the right friend ---------- */
  TYPES.names = function (step, run) {
    const field = h("div", { class: "field namefield" });
    const tray = makeTray(); const dots = tray.el; main.append(dots);
    const spk = h("button", { class: "speak big", "aria-label": "Listen again", html: ICON.speaker });
    const tag = h("div", { class: "nametag" });
    const crowd = h("div", { class: "crowd" });
    const aaTxt = h("div", { class: "aa psent" });
    field.append(h("div", { class: "row" }, spk, tag), aaTxt, crowd);
    main.append(field);
    const rounds = shuffle(step.rounds); const res = []; let r = 0;
    const kidEls = {};
    shuffle(step.kids).forEach((k) => {
      const b = h("button", { class: "kid" }, h("img", { src: img(k.img), alt: "" }), h("span", { class: "ktag" }));
      b.dataset.k = k.id; kidEls[k.id] = b; crowd.append(b);
    });
    const drawDots = () => { tray.update(r, res, rounds.length); };
    const play = async () => { const it = rounds[r]; spk.classList.add("playing"); await Audio_.speak(it.q, "narrator"); await sleep(150); await Audio_.speak(it.a, "kim"); spk.classList.remove("playing"); };
    spk.onclick = play;
    let wrong = 0, locked = false;
    function round() {
      if (!alive(run)) return;
      if (r >= rounds.length) return finish();
      drawDots(); wrong = 0; locked = false;
      const it = rounds[r];
      aaTxt.textContent = it.q + " — " + it.a; aaTxt.classList.remove("shown");
      tag.textContent = it.name; tag.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 300 });
      Object.values(kidEls).forEach((b) => b.classList.remove("hint"));
      sleep(300).then(() => alive(run) && play());
    }
    Object.values(kidEls).forEach((b) => {
      b.onclick = async () => {
        if (locked || r >= rounds.length || b.classList.contains("named")) return;
        const it = rounds[r];
        if (b.dataset.k === it.kid) {
          locked = true; res[r] = wrong === 0;
          Audio_.sfx("name-reveal"); tray.fill(r, b.querySelector("img").src, b, res[r]); aaTxt.classList.add("shown"); b.classList.add("named"); b.querySelector(".ktag").textContent = it.name;
          await sleep(600); if (!alive(run)) return; r++; round();
        } else {
          wrong++; Audio_.sfx("practice-wrong"); Kim.pose("think"); setTimeout(() => Kim.poseNow === "think" && Kim.pose("idle"), 1200);
          b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
          locked = true; await sleep(900); locked = false; b.classList.remove("wrong");
          if (wrong >= 2) kidEls[it.kid].classList.add("hint");
          play();
        }
      };
    });
    async function finish() {
      drawDots(); tag.textContent = "";
      const score = res.filter(Boolean).length;
      Results.put(step.id, { firstTry: score, total: rounds.length });
      field.append(h("div", { class: "reveal" }, h("div", { class: "card" }, h("div", { class: "w", style: "color:var(--ink)" }, "⭐ " + score + " / " + rounds.length))));
      await Kim.say(score >= rounds.length - 1 ? "Super listening!" : "Good job!");
      await sleep(500); if (alive(run)) next();
    }
    Kim.say(step.intro).then(() => alive(run) && round());
  };

  /* ---------- ANSWER (FL speaking): Kim asks → mic opens → check BE + every food ---------- */
  const BE_RX = { he: /\bhe ?'?s\b|\bhe is\b|\bhis\b|\bhes\b/, she: /\bshe ?'?s\b|\bshe is\b|\bshes\b/, i: /\bi ?'?m\b|\bi am\b|\bim\b|\bam\b/ };
  const PRON = { he: "He's", she: "She's", i: "I'm" };
  function judgeSentence(alts, subj, foods, verbs) {
    const norm = alts.map((t) => " " + t.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' ]/g, " ") + " ");
    const has = (t, f) => { const w = L.words[f]; return !(w.reject && w.reject.some((x) => t.includes(x))) && w.say.some((k) => t.includes(k)); };
    /* verbs: the -ing words the answer must use (and no other) — "She's drinking ice cream" is the I3/I5 STS Insights error */
    const vx = (v) => new RegExp("\\b" + v.slice(0, -3));   /* word start, so "meat" doesn't count as "eat" */
    const verbOk = (t) => !verbs || (verbs.every((v) => vx(v).test(t)) && ["eating", "drinking"].filter((v) => !verbs.includes(v)).every((v) => !vx(v).test(t)));
    if (norm.some((t) => BE_RX[subj].test(t) && foods.every((f) => has(t, f)) && verbOk(t))) return "ok";
    if (verbs && norm.some((t) => foods.every((f) => has(t, f)) && !verbOk(t))) return "verb";
    if (norm.some((t) => foods.every((f) => has(t, f)))) return "be";
    if (norm.some((t) => foods.some((f) => has(t, f)))) return "more";
    return "food";
  }
  /* short answers: "Yes, she is." / "No, he isn't." — Yes/No must match, and the pronoun + is/isn't must be there */
  function judgeShort(alts, it) {
    const yes = it.short.startsWith("Yes");
    const norm = alts.map((t) => " " + t.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' ]/g, " ") + " ");
    const yn = (t) => (yes ? /\b(yes|yeah|yep)\b/ : /\b(no|nope)\b/).test(t);
    const tail = (t) => yes ? new RegExp("\\b" + it.s + " is\\b").test(t)   /* "Yes, she's" is the STS Insights error → not accepted */ && !/isn'?t|is not/.test(t)
                            : new RegExp("\\b" + it.s + " (isn'?t|is not|isnt)\\b|\\bisn'?t\\b").test(t);
    if (norm.some((t) => yn(t) && tail(t))) return "ok";
    if (norm.some(yn)) return "short";
    return "yn";
  }
  TYPES.answer = function (step, run) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let mode = SR ? "mic" : "self";
    const field = h("div", { class: "sayfield" });
    const tray = makeTray(); const dots = tray.el; main.append(dots);
    const pic = h("div", { class: "apic" });
    const qtxt = h("div", { class: "cq big" });
    const ans = h("div", { class: "answer" });
    const heardTxt = h("div", { class: "heardtxt" });
    const mic = h("button", { class: "mic", "aria-label": "Say it", html: ICON.mic });
    const check = h("button", { class: "ctl primary", hidden: true }, "✓ Check");
    const hint = h("button", { class: "ctl", hidden: true }, "👂 Listen");
    const nxt = h("button", { class: "ctl go", hidden: true }, "Next ▶");
    const note = h("div", { class: "note", hidden: true });
    field.append(pic, qtxt, ans, heardTxt, h("div", { class: "row" }, mic, hint, check, nxt), note);
    let board = null, pawnAt = 0;
    if (step.board) {
      board = h("div", { class: "raceboard" });
      for (let k = 0; k <= step.items.length; k++) board.append(h("span", { class: "sq" + (k === step.items.length ? " home" : "") }, k === step.items.length ? "🏠" : String(k + 1)));
      board.firstChild.append(h("span", { class: "pawn" }, "🙂"));
      field.prepend(board);
    }
    const movePawn = () => { if (!board) return; pawnAt = Math.min(pawnAt + 1, step.items.length); const p = board.querySelector(".pawn"); board.children[pawnAt].append(p); p.animate([{ transform: "translateY(-14px) scale(1.2)" }, { transform: "none" }], { duration: 400 }); };
    main.append(field);
    const items = shuffle(step.items).map((it) => Object.assign({}, it, { foods: it.foods || it.plate || (it.parts ? it.parts.flatMap((p) => p.foods) : []) }));
    const res = []; let r = 0, tries = 0, quiet = 0, rec = null, tok = 0;
    const live = (tk) => alive(run) && tk === tok;
    const join = (fs) => fs.map((f) => L.words[f].label).join(" and ");
    const vOf = (f) => L.words[f].verb || "eating";
    /* parts: one sentence per verb — "She's eating rice. She's drinking milk." (same verb → one sentence with "and") */
    const partsOf = (it) => it.parts || [{ verb: it.verb || vOf(it.foods[0]), foods: it.foods }];
    const model = (it) => it.short ? it.short : partsOf(it).map((p) => `${PRON[it.s]} ${p.verb} ${join(p.foods)}.`).join(" ");
    const drawDots = () => { tray.update(r, res, items.length); };
    function setSelf() { mode = "self"; mic.hidden = true; check.hidden = false; note.hidden = false; note.textContent = "Máy hoặc trình duyệt này chưa cho dùng micro. HV trả lời to cả câu, rồi bấm Check để nghe câu mẫu."; }
    function stopRec() { if (rec) { const x = rec; rec = null; try { x.abort(); } catch (e) {} } (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); }
    async function reveal(it, tk, good) {
      stopRec(); mic.hidden = true; hint.hidden = true; check.hidden = true;
      ans.className = "answer " + (good ? "ok" : "soft"); ans.textContent = (good ? "✓ " : "") + model(it);
      tray.fill(r, img(it.trayImg || L.words[it.foods[0]].img), pic, good);
      Audio_.sfx(good ? "name-reveal" : "sticker-place"); await sleep(350); if (!live(tk)) return;
      await Audio_.speak(model(it), "narrator"); if (!live(tk)) return;
      if (good) { movePawn(); await Kim.say(["Great answer!", "Well done!", "Super!"][r % 3]); await sleep(300); if (live(tk)) { r++; show(); } }
      else nxt.hidden = false;
    }
    async function retry(it, tk, msg) { hint.hidden = false; await Kim.say(msg); await sleep(250); if (live(tk) && mode === "mic") listen(it, tk); }
    function listen(it, tk) {
      stopRec(); Audio_.stop();
      const R = new SR(); rec = R; R.lang = "en-GB"; R.interimResults = false; R.maxAlternatives = 5;
      let got = false; (mic.classList.add("listening"), Kim.pose("listen")); heardTxt.textContent = "🎤 Listening…";
      R.onresult = (e) => {
        if (rec !== R || !live(tk)) return;
        got = true; (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle"));
        const alts = []; for (const x of e.results) for (const a of x) alts.push(a.transcript);
        heardTxt.textContent = "I heard: “" + (alts[0] || "") + "”";
        const v = it.short ? judgeShort(alts, it) : judgeSentence(alts, it.s, it.foods, step.checkVerb ? [...new Set(partsOf(it).map((p) => p.verb))] : null);
        if (v === "ok") { res[r] = tries === 0; return reveal(it, tk, true); }
        tries++; Audio_.sfx("practice-wrong");
        if (tries >= 2) { res[r] = false; return reveal(it, tk, false); }
        retry(it, tk, v === "verb" ? "Eating or drinking? Try again!" : v === "yn" ? "Yes or no? Look again!" : v === "short" ? (it.short.startsWith("Yes") ? `Say: Yes, ${it.s} is!` : `Say: No, ${it.s} isn't!`) : v === "be" ? (it.s === "i" ? "Full sentence, please! I'm eating…" : `Full sentence, please! ${PRON[it.s]} eating…`)
          : v === "more" ? "Good! Say all the food on the plate!" : "Look at the picture again. Try again!");
      };
      R.onerror = (e) => { if (rec !== R) return; (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) { heardTxt.textContent = ""; setSelf(); } };
      R.onend = () => {
        if (rec !== R || !live(tk)) return;
        (mic.classList.remove("listening"), Kim.poseNow === "listen" && Kim.pose("idle")); rec = null;
        if (got || mode !== "mic") return;
        quiet++;
        if (quiet <= 1) retry(it, tk, "I can't hear you. Say it again!");
        else { heardTxt.textContent = "Tap the mic and answer!"; hint.hidden = false; }
      };
      setTimeout(() => { if (rec === R) { try { R.stop(); } catch (e) {} } }, 9000);
      try { R.start(); } catch (e) { setSelf(); }
    }
    async function show() {
      if (r >= items.length) return finish();
      const tk = ++tok; const it = items[r];
      tries = 0; quiet = 0; drawDots(); stopRec();
      pic.innerHTML = "";
      pic.className = "apic" + (it.s === "i" ? " me" : "");
      pic.append(h("img", { class: "aimg", src: img(it.img), alt: "" }));
      if (it.plate) { const pl = h("div", { class: "aplate" }); it.plate.forEach((f) => pl.append(h("img", { src: img(L.words[f].img), alt: "" }))); pic.append(pl); }
      pic.animate([{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }], { duration: 300 });
      qtxt.textContent = it.q;
      ans.className = "answer"; ans.textContent = ""; heardTxt.textContent = "";
      hint.hidden = true; nxt.hidden = true; mic.hidden = mode !== "mic"; check.hidden = mode === "mic";
      mic.onclick = () => { quiet = 0; listen(it, tk); };
      hint.onclick = async () => { stopRec(); ans.className = "answer soft"; ans.textContent = model(it); await Audio_.speak(model(it), "narrator"); if (live(tk) && mode === "mic") listen(it, tk); };
      check.onclick = () => { res[r] = true; reveal(it, tk, true); };
      await Kim.say(it.q); await sleep(200);
      if (live(tk) && mode === "mic") listen(it, tk);
    }
    nxt.onclick = () => { r++; show(); };
    async function finish() {
      stopRec(); drawDots(); pic.innerHTML = ""; qtxt.textContent = ""; mic.hidden = true; hint.hidden = true; check.hidden = true; nxt.hidden = true; heardTxt.textContent = ""; note.hidden = true;
      const score = res.filter(Boolean).length;
      Results.put(step.id, { said: score, total: items.length, mode });
      ans.className = "answer"; ans.textContent = "⭐ " + score + " / " + items.length;
      await Kim.say("Well done! You can ask and answer!"); await sleep(400); if (alive(run)) next();
    }
    mic.hidden = true;
    (async () => { await Kim.say(step.intro); await sleep(300); if (alive(run)) show(); })();
    return () => { tok++; stopRec(); };
  };

  /* ---------- DONE: end of a block ---------- */
  TYPES.done = function (step) {
    const box = h("div", { class: "recap donebox" });
    const score = h("div", { class: "score" });
    (step.scores || []).forEach(([id, label]) => {
      const r = Results.get(id); const n = r ? (r.firstTry != null ? r.firstTry : r.said) : null;
      score.append(h("div", {}, label, h("span", { class: "num" }, r ? `${n}/${r.total}` : "–")));
    });
    const nextB = h("button", { class: "ctl primary", onclick: () => next() }, "🗺️ Back to the map");
    const again = h("button", { class: "ctl" }, "↻ Do this part again");
    const first = steps.findIndex((s) => s.block === step.block);
    again.onclick = () => go(first);
    box.append(h("div", { class: "trophy" }, "🏆"), h("h2", {}, step.title), score, h("div", { class: "controls" }, again, h("span", { class: "spacer" }), nextB));
    main.append(box);
    Audio_.sfx("complete");
    Kim.say(step.title);
  };

  /* ======================= HOME: units → lessons → lesson map ======================= */
  const SKILL = { L: "🎧", S: "🗣️", R: "📖", W: "✏️" };
  const skillLabel = (sk, review) => review ? "⭐ Ôn tổng hợp" : sk.includes("R") ? "📖✏️ Đọc – Viết" : "🎧🗣️ Nghe – Nói";
  const sumOf = (id) => { try { return JSON.parse(localStorage.getItem("explore-hw:sum:" + id)) || null; } catch (e) { return null; } };
  function homeShell(view) {
    runId++; Audio_.stop(); Kim.hide();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    main.innerHTML = "";
    document.body.dataset.view = view; document.body.classList.remove("contain"); document.body.classList.add("framed");
  }
  function showUnits() {
    homeShell("units");
    try { history.replaceState(null, "", "#units"); } catch (e) {}
    const grid = h("div", { class: "unitgrid" });
    CAT.units.forEach((u) => {
      const card = h("button", { class: "unitcard" + (u.ready ? "" : " soon"), disabled: !u.ready },
        h("span", { class: "ucover" }, u.cover ? h("img", { src: u.cover, alt: "" }) : h("span", { class: "uletter" }, u.id)),
        h("span", { class: "utext" }, h("b", {}, "Unit " + u.id), h("span", {}, u.title), u.ready ? null : h("em", {}, "Sắp có")));
      card.onclick = () => showUnit(u.id);
      grid.append(card);
    });
    main.append(h("div", { class: "homehead" }, h("span", { class: "eyebrow" }, "EXPLORE · Homework"), h("h1", {}, "Choose a unit"),
      h("button", { class: "backlink voicelink", onclick: showVoices }, "🎧 Nghe audio (GV)")), grid);
    const first = grid.querySelector(".unitcard:not(.soon)");
    if (first) requestAnimationFrame(() => first.scrollIntoView({ block: "center" }));
    Kim.say("Hi! Choose a unit!");
  }
  function showUnit(uid) {
    const u = CAT.units.find((x) => x.id === uid);
    if (!u || !u.ready) return showUnits();
    homeShell("unit");
    try { history.replaceState(null, "", "#unit-" + uid.toLowerCase()); } catch (e) {}
    const list = h("div", { class: "lessonlist" });
    let nextUp = null;
    u.lessons.forEach((l, k) => {
      const sum = sumOf(l.id);
      const st = !l.ready ? "Sắp có" : !sum || !sum.done ? "Chưa làm" : sum.complete ? "★".repeat(Math.round((sum.stars / sum.max) * 3)) + "☆".repeat(3 - Math.round((sum.stars / sum.max) * 3)) : `Đang làm ${sum.done}/${sum.total}`;
      if (l.ready && !(sum && sum.complete) && !nextUp) nextUp = l.id;
      const card = h("button", { class: "lessoncard" + (l.ready ? "" : " soon") + (sum && sum.complete ? " done" : ""), disabled: !l.ready },
        h("span", { class: "lnum" }, l.id),
        h("span", { class: "ltext" }, h("b", {}, l.title), h("span", { class: "lskill" }, skillLabel(l.skills, l.review))),
        h("span", { class: "lstate" }, st));
      card.dataset.id = l.id;
      card.onclick = () => openLesson(l.id);
      list.append(card);
    });
    main.append(h("div", { class: "homehead" }, h("button", { class: "backlink", onclick: showUnits }, "← Units"),
      h("span", { class: "eyebrow" }, "Unit " + u.id), h("h1", {}, u.title)), list);
    if (nextUp) list.querySelector(`[data-id="${nextUp}"]`).classList.add("current");
    Kim.say("Choose a lesson!");
  }
  const loadScript = (src) => new Promise((res) => { const sc = document.createElement("script"); sc.src = src + (window.EXPLORE_BUILD ? "?v=" + window.EXPLORE_BUILD : ""); sc.onload = () => res(true); sc.onerror = () => res(false); document.head.append(sc); });
  async function openLesson(lid, stepId) {
    const u = CAT.units.find((x) => (x.lessons || []).some((l) => l.id === lid));
    const meta = u && u.lessons.find((l) => l.id === lid);
    if (!meta || !meta.ready) return showUnits();
    if (L.id !== lid) {
      window.LESSON = null;
      const ok = await loadScript(meta.file);
      if (!ok || !window.LESSON) { Kim.say("Oops! This lesson is not ready yet."); return; }
      await loadScript(meta.file.replace(/\.js$/, ".voice.js"));
      L = window.LESSON;
      Results.data = Store.load();
      buildSteps();
      $("#bg").style.backgroundImage = `url("${img(L.backdrop || "scene-street")}")`;
    }
    const at = stepId ? steps.findIndex((s) => s.id === stepId) : -1;
    if (at >= 0) go(at); else showMap();
  }
  /* Audio check page for authors: every recorded line, grouped by voice */
  async function showVoices() {
    homeShell("voices");
    try { history.replaceState(null, "", "#voices"); } catch (e) {}
    for (const u of CAT.units) for (const l of (u.lessons || [])) if (l.ready) await loadScript(l.file.replace(/\.js$/, ".voice.js"));
    const entries = Object.entries(window.VOICE || {});
    const box = h("div", { class: "recap voicelist" });
    const groups = { kim: "Kim (Blondie)", narrator: "Người dẫn (Sally)" };
    let playing = null;
    const playRow = async (row, src) => { if (playing) playing.classList.remove("on"); playing = row; row.classList.add("on"); await Audio_.file(src); row.classList.remove("on"); };
    const all = [];
    box.append(h("button", { class: "backlink", onclick: showUnits }, "← Units"), h("h2", {}, `Nghe toàn bộ audio · ${entries.length} câu`));
    const playAll = h("button", { class: "ctl primary" }, "▶ Phát lần lượt tất cả");
    box.append(h("div", { class: "controls" }, playAll, h("span", { class: "note" }, "Bấm vào câu bất kỳ để nghe riêng câu đó.")));
    Object.entries(groups).forEach(([who, label]) => {
      const list = entries.filter(([k]) => k.startsWith(who + "|"));
      box.append(h("h3", {}, `${label} · ${list.length}`));
      list.forEach(([k, src]) => {
        const row = h("button", { class: "vrow" }, h("span", { class: "vplay" }, "▶"), h("span", {}, k.slice(who.length + 1)));
        row.onclick = () => playRow(row, src);
        all.push([row, src]); box.append(row);
      });
    });
    /* vocabulary audio (DOL recordings) of every ready lesson */
    for (const u of CAT.units) for (const l of (u.lessons || [])) if (l.ready) {
      const keep = window.LESSON; window.LESSON = null; await loadScript(l.file); const pack = window.LESSON; window.LESSON = keep;
      if (!pack) continue;
      const ws = Object.values(pack.words || {});
      box.append(h("h3", {}, `Từ vựng ${pack.id} (audio DOL) · ${ws.length}`));
      ws.forEach((w) => { const src = pack.aud + w.audio + ".mp3"; const row = h("button", { class: "vrow" }, h("span", { class: "vplay" }, "▶"), h("span", {}, w.label)); row.onclick = () => playRow(row, src); all.push([row, src]); box.append(row); });
    }
    playAll.onclick = async () => { const r = runId; for (const [row, src] of all) { if (r !== runId) return; row.scrollIntoView({ block: "center", behavior: "smooth" }); await playRow(row, src); await sleep(300); } };
    main.append(box);
  }
  function route() {
    const hsh = (location.hash || "").slice(1).toLowerCase();
    const m = hsh.match(/^([a-j]\d)(?:--(.+))?$/);
    if (m) return openLesson(m[1].toUpperCase(), m[2]);
    const u = hsh.match(/^unit-([a-j])$/);
    if (u) return showUnit(u[1].toUpperCase());
    if (hsh === "voices") return showVoices();
    showUnits();
  }

  /* ======================= Menu (jump to any step) ======================= */
  $("#mapBtn").onclick = () => (L.id === "HOME" ? showUnits() : showMap());
  $("#menuBtn").onclick = () => {
    const ov = h("div", { class: "overlay" });
    const m = h("div", { class: "menu" }, h("h3", {}, "Steps"), h("small", {}, "Dành cho GV/người duyệt: nhảy tới bước bất kỳ."));
    m.append(h("button", { onclick: () => { ov.remove(); showUnits(); } }, "🏠 Units"));
    if (L.id === "HOME") { ov.onclick = (e) => { if (e.target === ov) ov.remove(); }; ov.append(m); document.body.append(ov); return; }
    if (skipped.length) m.append(h("small", { class: "warn" }, "⚠️ Đã bỏ qua bài sai kỹ năng của lesson: " + skipped.join("; ")));
    m.append(h("button", { onclick: () => { ov.remove(); showMap(); } }, "🗺️ Map"));
    steps.forEach((s, i) => m.append(h("button", { onclick: () => { ov.remove(); go(i); } }, `${s.block.name} · ${s.title}`)));
    m.append(h("button", { onclick: () => { try { localStorage.removeItem(Store.key); } catch (e) {} Results.data = {}; ov.remove(); showMap(); } }, "↺ Xoá kết quả & làm lại từ đầu"));
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    ov.append(m); document.body.append(ov);
  };

  /* ======================= Add-on step types (types-rw.js) ======================= */
  window.EXPLORE_API = { TYPES, FRAME, h, sleep, shuffle, img, ICON, Audio_, Kim, Results, makeTray, next: () => next(), alive: (r) => alive(r), main, get L() { return L; } };
  (window.EXPLORE_ADDONS || []).forEach((f) => f(window.EXPLORE_API));

  /* ======================= Boot ======================= */
  Kim.init();
  $("#bg").style.backgroundImage = `url("${img("scene-street")}")`;
  $("#startBtn").onclick = () => {
    $("#start").remove();
    /* unlock audio on iOS: play a silent utterance inside the tap */
    try { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } } catch (e) {}
    Audio_.pickVoices();
    route();
  };
})();
