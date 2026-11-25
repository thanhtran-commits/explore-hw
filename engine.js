/* EXPLORE Homework — Player engine
 * One engine for every lesson; content comes from window.LESSON (lessons/*.js).
 * Screens (giao diện v3, decisions #52–#57): splash → units → unit path → lesson roadmap → steps.
 * Story steps: watch · explore · chunks · qa · recap · done. Practice steps: here (bubbles, pick, names, say, lid, answer)
 * and in types-rw.js (choose, spell, build, sort, gaptext).
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
  /* Rewards (decision #57) — one record per child for every unit, kept apart from the lesson results.
   * Prototype: localStorage key "explore-hw:rewards". Later: one Firebase document (swap load / save).
   *   stamps["I1:grammar"] = { ink: "blue" | "silver" | "gold", pct, at }   a stage stamp; the ink only ever goes up
   *   carts["I1"]          = { id, at }                                     the reward picked when lesson I1 was finished
   *   logos["I"]           = { at, seen }                                   every lesson of the unit has its reward → unit logo */
  const INKS = ["blue", "silver", "gold"];
  const inkOf = (pct) => (pct == null ? "blue" : pct >= 90 ? "gold" : pct >= 70 ? "silver" : "blue");
  const Rewards = {
    key: "explore-hw:rewards", d: null,
    load() {
      let d = null; try { d = JSON.parse(localStorage.getItem(this.key)); } catch (e) {}
      d = d && typeof d === "object" ? d : {};
      d.v = 1; d.stamps = d.stamps || {}; d.carts = d.carts || {}; d.logos = d.logos || {};
      return (this.d = d);
    },
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) {} },
    get data() { return this.d || this.load(); },
    stamp(lid, part) { return this.data.stamps[lid + ":" + part] || null; },
    /* a finished stage: a new stamp, or a better ink; never lost or downgraded */
    award(lid, part, pct) {
      const k = lid + ":" + part, old = this.data.stamps[k] || null, ink = inkOf(pct);
      const up = !old || INKS.indexOf(ink) > INKS.indexOf(old.ink);
      if (up) this.data.stamps[k] = { ink, pct, at: new Date().toISOString() };
      else if (pct != null && (old.pct == null || pct > old.pct)) old.pct = pct;
      this.save();
      return { rec: this.data.stamps[k], up, old };
    },
    cart(lid) { return this.data.carts[lid] || null; },
    /* picking (or changing) a lesson's reward; returns true when this fills the unit's last spot → logo earned */
    setCart(lid, id) {
      this.data.carts[lid] = { id, at: new Date().toISOString() };
      const meta = lessonMeta(lid), u = meta && meta.unit;
      let won = false;
      if (u && u.logo && !this.data.logos[u.id] && (u.lessons || []).every((l) => this.data.carts[l.id])) { this.data.logos[u.id] = { at: new Date().toISOString(), seen: false }; won = true; }
      this.save();
      return won;
    },
    logo(uid) { return this.data.logos[uid] || null; },
    touched(lid) { return !!this.data.carts[lid] || Object.keys(this.data.stamps).some((k) => k.startsWith(lid + ":")); }
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
      document.querySelectorAll(".speak.playing, .px-spk.playing").forEach((b) => b.classList.remove("playing"));
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
    /* a word with no recording yet (new unit, before the Voice Pipeline) → its label through speak() (recorded line or TTS) */
    word(id) { const a = L.words[id].audio; if (!a) return this.speak(L.words[id].label); return this.file((a.startsWith("@") ? "assets/" + a.slice(1) : L.aud + a) + ".mp3"); },
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

  /* ======================= Kim (v3 · decision #56) =======================
   * Full body only on the splash. Her round HEAD: the Watch caption (tap = hear the line again), the roadmap
   * "you are here" marker, celebrating on the Done screen. Explore and practice: her voice only. */
  const kimArt = (pose) => ver("assets/common/kim/kim-" + pose + ".webp");
  const kimHead = (pose = "point", cls = "") => h("span", { class: "kh " + cls, style: `background-image:url("${kimArt("head-" + pose)}")`, "aria-hidden": "true" });
  const kimVoice = (text) => (text ? Audio_.speak(text, "kim") : Promise.resolve());
  /* small UI icons (stroke style, currentColor) */
  const UI = {
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    tap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.6 15a1.5 1.5 0 0 1 2.4-1.8L9 15"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>',
    stamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="3.2 2.4"/><path d="M8 12.3l2.7 2.7L16.2 9.4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2L18.5 7.8"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>',
    ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 9a5 5 0 0 1 10 0c0 3-3 3.5-3 6.5a3 3 0 0 1-5.5 1.6"/><path d="M10 9.5a2 2 0 0 1 4 0"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="8.5" y="2" width="7" height="12.5" rx="3.5"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5C5.5 4.5 9 4.5 12 6.5c3-2 6.5-2 9-1V19c-2.5-1-6-1-9 1-3-2-6.5-2-9-1z"/><path d="M12 6.5V20"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M14 6.5l3 3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 19 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>'
  };
  const iconBtn = (cls, icon, label, onclick) => h("button", { class: cls, type: "button", "aria-label": label, title: label, html: icon, onclick });

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
  /* every screen starts here: stop what runs, clear the page; body[data-view] names the screen (v3 = white DOL frame) */
  function screen(view) {
    runId++; Audio_.stop();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    document.querySelectorAll(".overlay").forEach((o) => o.remove());
    main.innerHTML = "";
    document.body.className = "v3"; document.body.dataset.view = view;
  }
  function go(i) {
    idx = Math.max(0, Math.min(steps.length - 1, i));
    const s = steps[idx];
    screen(s.type);
    if (Prog.blockSteps(s.block)[0] === s) Prog.started(s.block.id);
    try { history.replaceState(null, "", "#" + L.id.toLowerCase() + "--" + s.id); } catch (e) {}
    cleanup = TYPES[s.type](s, runId) || null;
  }
  /* ---- progress: which steps are done (kept with results; Firebase later) ---- */
  const Prog = {
    get map() { return (Results.data._done = Results.data._done || {}); },
    mark(id) { this.map[id] = true; Store.save(Results.data); },
    isDone(id) { return !!this.map[id]; },
    blockSteps(b) { return steps.filter((s) => s.block === b); },
    count(b) { return this.blockSteps(b).filter((s) => this.isDone(s.id)).length; },
    complete(b) { const st = this.blockSteps(b); return st.length > 0 && st.every((s) => this.isDone(s.id)); },
    /* a part opens when the part before it is complete; inside a part, a step opens when every step before it is done */
    blockOpen(b) { const k = L.blocks.indexOf(b); return k <= 0 || L.blocks.slice(0, k).every((p) => !this.blockSteps(p).length || this.complete(p)); },
    stepOpen(s) { if (this.isDone(s.id)) return true; if (!this.blockOpen(s.block)) return false; const st = this.blockSteps(s.block); return st.slice(0, st.indexOf(s)).every((x) => this.isDone(x.id)); },
    current() { return steps.find((s) => !this.isDone(s.id) && this.stepOpen(s)) || null; },
    /* practice results of a part: first-try share of every scored item (total 0 = all skipped with "Can't speak now" → not counted) */
    rates(b) {
      return this.blockSteps(b).filter((s) => s.skill).map((s) => Results.get(s.id)).filter((r) => r && r.total > 0)
        .map((r) => (r.firstTry != null ? r.firstTry : r.said) / r.total);
    },
    /* CORRECT % of a part (null = nothing scored) — the Done screen shows it, the stamp's ink comes from it */
    pct(b) { const rs = this.rates(b); return rs.length ? Math.round((rs.reduce((a, x) => a + x, 0) / rs.length) * 100) : null; },
    stars(b) {
      const rs = this.rates(b); if (!rs.length) return 0;
      const avg = rs.reduce((a, x) => a + x, 0) / rs.length;
      return avg >= 0.9 ? 3 : avg >= 0.6 ? 2 : 1;
    },
    /* time spent on a part: from opening its first step to its last screen */
    started(bid) { (Results.data._t = Results.data._t || {})[bid] = Date.now(); Store.save(Results.data); },
    elapsed(bid) { const t = (Results.data._t || {})[bid]; const ms = t ? Date.now() - t : 0; return ms > 0 && ms < 3 * 3600e3 ? ms : 0; }
  };
  /* finishing a step: go on inside the part, or back to the roadmap when the part ends */
  const next = () => {
    const s = steps[idx];
    Prog.mark(s.id);
    const n = steps[idx + 1];
    if (!n || n.block !== s.block) showMap({ justDone: s.block.id, from: s.id });
    else go(idx + 1);
  };
  const alive = (r) => r === runId;

  /* ======================= Road: unit path (N3) + lesson roadmap (N4) — decisions #53, #56 =======================
   * One design for every screen, only stretched: portrait → one winding column; landscape → rows that snake
   * left→right / right→left (on the roadmap each part starts a new row). Items are placed by their centre;
   * the SVG road is a smooth curve through the centres. Re-laid out on every resize. */
  const SVGNS = "http://www.w3.org/2000/svg";
  const clampN = (a, x, b) => Math.max(a, Math.min(b, x));
  /* background of the nav screens: a people-free theme scene, blurred evenly + washed (configurable: catalog / lesson pack `bg`) */
  const BG_FALLBACK = "assets/unit-i/bg-unit.webp";
  function navBg(src) {
    return h("div", { class: "nv-bg", "aria-hidden": "true" }, h("div", { class: "nv-bgimg", style: `background-image:url("${ver(src || BG_FALLBACK)}")` }), h("div", { class: "nv-wash" }));
  }
  function navTop(title, back, extra) {
    return h("div", { class: "nv-top" }, back ? iconBtn("nv-ib nv-back", UI.back, "Back", back) : null, h("b", { class: "nv-title" }, title), h("span", { class: "nv-sp" }), extra || null,
      iconBtn("nv-ib nv-menu", UI.menu, "All steps (teachers)", openMenu));
  }
  /* items: [{ el, d (circle / frame size), big, row (starts a new row in landscape), bottom (extra px under the item: flag, label) }] */
  function road(scroller, items, cfg) {
    const wrap = h("div", { class: "nv-road" });
    const svg = document.createElementNS(SVGNS, "svg"); svg.setAttribute("class", "nv-path"); svg.setAttribute("aria-hidden", "true");
    wrap.append(svg); items.forEach((it) => wrap.append(it.el));
    scroller.append(wrap);
    const api = { wrap, items, land: false, onLayout: null };
    function layout() {
      const W = scroller.clientWidth, H = scroller.clientHeight; if (!W || !H) return;
      const land = W > H * 1.05 && W >= 560; api.land = land;
      cfg.size(items, W, H, land);   /* sets it.d / it.bottom / it.top */
      const pts = [];
      let total;
      if (!land) {
        /* a gentle S-curve (rule E, 2026-11-20): x follows a sine, so the road bends smoothly instead of zigzagging;
           a big item sits on the centre line and the wave restarts from it */
        const cx = W / 2, amp = Math.min(W * cfg.amp, cfg.ampMax), step = cfg.wave || Math.PI / 3;
        let y = cfg.padTop, ph = 0, dir = cfg.firstSide || 1, prev = null;
        items.forEach((it) => {
          if (prev) y += prev.d / 2 + (prev.bottom || 0) + cfg.gap(prev, it) + it.d / 2 + (it.top || 0);
          else y += it.d / 2 + (it.top || 0);
          if (it.big) { it.x = cx; ph = 0; dir = -dir; } else { ph += step; it.x = cx + dir * amp * Math.sin(ph); }
          it.y = y; prev = it;
        });
        total = y + prev.d / 2 + (prev.bottom || 0) + cfg.padBottom;
      } else {
        /* rows: a new row where an item asks for it, or when the row is full */
        const padX = cfg.padX(W), Wa = W - 2 * padX;
        const pitch = (it) => it.pitch || (it.big ? it.d + cfg.bigGap : it.d + cfg.smallGap(it));
        const rows = [];
        items.forEach((it) => {
          const r = rows[rows.length - 1];
          if (!r || (it.row && r.length) || r.reduce((a, x) => a + pitch(x), 0) + pitch(it) > Wa) rows.push([it]); else r.push(it);
        });
        let y = cfg.padTopLand;
        rows.forEach((r, k) => {
          const sum = r.reduce((a, x) => a + pitch(x), 0);
          const scale = Math.min(Wa / sum, cfg.stretch);
          let x = padX + (Wa - sum * scale) / 2;
          const wob = cfg.wobble(r);
          const up = Math.max(...r.map((it) => it.d / 2 + (it.top || 0) + (it.big ? 0 : wob))), down = Math.max(...r.map((it) => it.d / 2 + (it.bottom || 0) + (it.big ? 0 : wob)));
          y += up;
          let s = 0;
          r.forEach((it) => {
            const p = pitch(it) * scale;
            it.x = x + p / 2; x += p;
            if (k % 2) it.x = W - it.x;   /* snake */
            it.y = y + (it.big ? 0 : -wob * Math.sin(++s * (cfg.waveLand || Math.PI / 2.5)));   /* a soft wave, not a zigzag */
          });
          y += down + (k < rows.length - 1 ? cfg.rowGap : 0);
        });
        total = y + (cfg.padBottomLand || cfg.padBottom);
        api.rows = rows;
      }
      /* centre the whole road when it is shorter than the screen */
      const off = Math.max(0, (H - total) / 2);
      items.forEach((it) => { it.y += off; });
      total = Math.max(total, H);
      wrap.style.height = total + "px";
      items.forEach((it) => Object.assign(it.el.style, { left: it.x - it.d / 2 + "px", top: it.y - it.d / 2 + "px", width: it.d + "px", height: it.d + "px" }));
      /* the road: lead in, through every centre (U-turns between landscape rows), lead out */
      const f = items[0], l = items[items.length - 1];
      if (!land) pts.push([f.x, f.y - f.d / 2 - 60]);
      else pts.push([f.x - 90, f.y]);
      items.forEach((it, k) => {
        const nx = items[k + 1];
        pts.push([it.x, it.y]);
        if (land && nx && Math.abs(nx.y - it.y) > it.d && Math.abs(nx.x - it.x) < it.d * 2) {
          const dir = it.x > W / 2 ? 1 : -1, turn = Math.min(cfg.padX(W) * 0.8, 70);
          const edge = (dir > 0 ? Math.max(it.x, nx.x) : Math.min(it.x, nx.x)) + dir * turn;
          pts.push([Math.max(10, Math.min(W - 10, edge)), (it.y + nx.y) / 2]);
        }
      });
      if (!land) pts.push([l.x, l.y + l.d / 2 + (l.bottom || 0) + 40]);
      else pts.push([l.x + (l.x > W / 2 ? 90 : -90), l.y]);
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
        d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
      }
      const rw = cfg.roadW(items);
      svg.setAttribute("viewBox", `0 0 ${W} ${total}`); svg.setAttribute("width", W); svg.setAttribute("height", total);
      svg.innerHTML = `<path class="edge" d="${d}" stroke-width="${rw + 8}"/><path class="lane" d="${d}" stroke-width="${rw}"/><path class="dash" d="${d}" stroke-width="${Math.max(3, rw / 9)}" stroke-dasharray="${rw * 0.5} ${rw * 0.45}"/>`;
      if (api.onLayout) api.onLayout(W, total);
    }
    const ro = window.ResizeObserver ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(scroller); else window.addEventListener("resize", layout);
    layout();
    api.layout = layout;
    api.stop = () => { if (ro) ro.disconnect(); else window.removeEventListener("resize", layout); };
    return api;
  }
  /* Kim's head as the "you are here" pin: round, red ring, small tail pointing at the node */
  function kimPin(say) {
    const pin = h("button", { class: "nv-kim", type: "button", "aria-label": "Kim" }, kimHead("point"), h("i", { class: "tail" }));
    pin.onclick = () => { pin.classList.add("talk"); playSafe(() => kimVoice(say())).then(() => pin.classList.remove("talk")); };
    return pin;
  }
  /* place the pin beside an item (rule E: never on top of a node): candidates in order of preference — "side" (outer
     side, then inner side, then above), "above" (above, then right, then left), "corner" (top-right / top-left) — the
     first one that stays on screen and clears every other item (others: [{x, y, d}]) wins; else the least covered. */
  function placePin(pin, it, where, W, others) {
    const kd = pin.offsetWidth || 60, gap = 10, out = it.x < W / 2 ? -1 : 1;
    const at = (k) => k === "r" ? { left: it.x + it.d / 2 + gap, top: it.y - kd * 0.92, side: 1 }
      : k === "l" ? { left: it.x - it.d / 2 - gap - kd, top: it.y - kd * 0.92, side: -1 }
      : k === "a" ? { left: it.x - kd / 2, top: it.y - it.d / 2 - kd - 14, side: 0 }
      : k === "cr" ? { left: it.x + it.d * 0.2, top: it.y - it.d / 2 - kd * 0.8, side: 1 } : { left: it.x - it.d * 0.2 - kd, top: it.y - it.d / 2 - kd * 0.8, side: -1 };
    const o = out > 0 ? "r" : "l", i = out > 0 ? "l" : "r";
    const order = where === "side" ? [o, i, "a"] : where === "above" ? ["a", "r", "l"] : ["cr", "cl", "a"];
    const cost = (c) => {
      let v = (c.left < 6 || c.left + kd > W - 6 || c.top < 4) ? 1e6 : 0;
      (others || []).forEach((q) => { if (q === it) return; const r = q.d / 2 + 6;
        const ix = Math.min(c.left + kd, q.x + r) - Math.max(c.left, q.x - r), iy = Math.min(c.top + kd + 12, q.y + r) - Math.max(c.top, q.y - r);
        if (ix > 0 && iy > 0) v += ix * iy; });
      return v;
    };
    let best = null;
    for (const k of order) { const c = at(k), v = cost(c); if (!best || v < best.v) best = { ...c, v }; if (v === 0) break; }
    pin.style.left = best.left + "px"; pin.style.top = best.top + "px";
    pin.dataset.side = best.side > 0 ? "r" : best.side < 0 ? "l" : "c";
    return best.side;
  }

  /* ======================= Units (N2) ======================= */
  const sumOf = (id) => { try { return JSON.parse(localStorage.getItem("explore-hw:sum:" + id)) || null; } catch (e) { return null; } };
  function showUnits() {
    screen("units");
    try { history.replaceState(null, "", "#units"); } catch (e) {}
    const ready = CAT.units.filter((u) => u.ready), soon = CAT.units.filter((u) => !u.ready);
    const page = h("div", { class: "nv-units" });
    const head = h("div", { class: "nv-uhead" }, h("h1", {}, "My units"),
      h("button", { class: "rw-passbtn", type: "button", onclick: () => showPassport() }, h("span", { class: "e", "aria-hidden": "true" }, "🛂"), "Passport"),
      iconBtn("nv-ib nv-menu", UI.menu, "Teachers", openMenu));
    const cards = h("div", { class: "nv-ucards" });
    ready.forEach((u) => {
      const ls = u.lessons || [];
      const done = ls.filter((l) => (sumOf(l.id) || {}).complete).length;
      const go = () => showUnit(u.id);
      const card = h("div", { class: "nv-ucard" },
        h("button", { class: "nv-ucover", type: "button", "aria-label": "Unit " + u.id + " · " + u.title, onclick: go, style: `background-image:url("${ver(u.cover)}")` }),
        h("div", { class: "nv-ubody" },
          h("span", { class: "nv-tag" }, `UNIT ${u.id} · ${ls.length} LESSONS`),
          h("b", { class: "nv-utitle" }, u.title),
          h("span", { class: "nv-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(ls.length), "aria-valuenow": String(done) }, h("i", { style: `width:${ls.length ? Math.max(4, (done / ls.length) * 100) : 0}%` })),
          h("small", { class: "nv-ucount" }, `${done} / ${ls.length} lessons`),
          h("button", { class: "nv-btn red", type: "button", onclick: go }, "CONTINUE")));
      cards.append(card);
    });
    const tiles = h("div", { class: "nv-soon" });
    soon.forEach((u) => tiles.append(h("div", { class: "nv-stile", "aria-label": "Unit " + u.id + " · coming soon" }, h("b", {}, u.id), h("span", {}, u.title))));
    page.append(head, h("div", { class: "nv-ugrid" }, cards, h("div", { class: "nv-soonbox" }, h("span", { class: "nv-sub" }, "COMING SOON"), tiles)));
    main.append(page);
  }

  /* ======================= Unit path (N3): the lessons of a unit on a road ======================= */
  function showUnit(uid) {
    const u = CAT.units.find((x) => x.id === uid);
    if (!u || !u.ready) return showUnits();
    screen("unit");
    try { history.replaceState(null, "", "#unit-" + uid.toLowerCase()); } catch (e) {}
    const scroller = h("div", { class: "nv-scroll" });
    main.append(navBg(u.bg), navTop(`Unit ${u.id} · ${u.title}`, showUnits), scroller);
    let cur = null;
    const items = u.lessons.map((l, k) => {
      const sum = sumOf(l.id), done = !!(sum && sum.complete);
      const now = l.ready && !done && !cur; if (now) cur = l.id;
      const st = !l.ready ? "lock" : done ? "done" : now ? "now" : "open";
      const label = h("span", { class: "nv-llabel" }, h("small", {}, "LESSON " + (k + 1)), h("b", {}, l.title));
      const btn = h("button", { class: "nv-lesson " + st, type: "button", "aria-label": `Lesson ${k + 1} · ${l.title}` + (done ? " · done" : ""), disabled: !l.ready },
        h("span", { class: "pic", style: `background-image:url("${ver(l.cover || u.cover)}")` }));
      btn.onclick = () => openLesson(l.id);
      /* the reward picked for this lesson (decision #57): a small badge on the node */
      const rw = rewardOf(l.id);
      const el = h("div", { class: "nv-item" }, btn, label, done ? h("span", { class: "nv-star", "aria-hidden": "true", html: UI.check }) : null, now ? h("span", { class: "nv-start" }, "START") : null,
        rw ? h("span", { class: "rw-lcart", title: rw.name }, h("img", { src: ver(rw.img), alt: rw.name })) : null);
      return { el, label, id: l.id, now };
    });
    const R = road(scroller, items, {
      size(its, W, H, land) {
        const d = land ? clampN(84, H * 0.26, 150) : clampN(92, W * 0.29, 140);
        /* landscape: every lesson in one row when the labels still get ≥ 140 px */
        const pitch = land ? clampN(140, (W - 2 * Math.max(40, W * 0.06)) / its.length, 260) : 0;
        its.forEach((it) => { it.d = d; it.top = d * 0.12; it.bottom = land ? 64 : d * 0.12; it.pitch = Math.max(pitch, d + 30) || 0; });
      },
      amp: 0.2, ampMax: 170, firstSide: -1, padTop: 70, padBottom: 34, gap: (a) => a.d * 0.32,
      padX: (W) => Math.max(40, W * 0.06), padTopLand: 74, bigGap: 0, smallGap: (it) => Math.max(70, 220 - it.d), stretch: 2.2, rowGap: 40,
      wobble: (r) => r[0].d * 0.22, roadW: (its) => clampN(26, its[0].d * 0.3, 42)
    });
    const pin = kimPin(() => "Choose a lesson!");
    R.wrap.append(pin);
    R.onLayout = (W) => {
      items.forEach((it) => {
        const side = R.land ? "b" : it.x < W / 2 ? "r" : "l";
        it.label.className = "nv-llabel " + side;
        it.label.style.maxWidth = (R.land ? Math.min(220, W / items.length - 16) : side === "r" ? W - it.x - it.d / 2 - 30 : it.x - it.d / 2 - 30) + "px";
      });
      const c = items.find((it) => it.now);
      pin.hidden = !c; if (c) placePin(pin, c, "corner", W, items);
    };
    R.layout();
    const c = items.find((it) => it.now);
    if (c) requestAnimationFrame(() => scrollToItem(scroller, c));
    cleanup = () => R.stop();
  }
  function scrollToItem(scroller, it) { const t = it.y - scroller.clientHeight / 2; if (t > 0) scroller.scrollTo({ top: t, behavior: "auto" }); }

  /* ======================= Lesson roadmap (N4) ======================= */
  /* the picture on a step's node: a food / item from the step where possible (each used once), else an icon for its kind */
  function stepIcons() {
    const used = new Set(), out = new Map();
    const wimg = (id) => L.words[id] && L.words[id].img;
    const okPic = (n) => n && /(^|\/)(food|item|icon)-/.test(n);
    const pool = (s) => {
      const c = [];
      const add = (x) => { if (!x) return; if (typeof x === "string") c.push(wimg(x) || x); else if (Array.isArray(x)) x.forEach(add); else { add(x.word); add(x.answer && typeof x.answer === "string" ? x.answer : null); add(x.food); add(x.foods); add(x.plate); add(x.img); add(x.imgs); add(x.tray); if (x.prompt) add(x.prompt.img); ["say", "a", "short", "text"].forEach((k) => typeof x[k] === "string" && said(x[k])); if (x.line) said(x.line.text); } };
      /* foods named in a sentence ("He's eating a burger.") */
      const said = (t) => { const low = " " + t.toLowerCase().replace(/[^a-z ]/g, " ") + " "; Object.keys(L.words).forEach((id) => { const w = L.words[id], lab = w.label.replace(/^(an?|the) /, "").toLowerCase(); if (low.includes(" " + lab + " ")) c.push(w.img); }); };
      if (s.icon) c.push(s.icon);
      if (s.type === "watch") (s.cues || []).forEach((q) => add(q.food ? q.food : q.line ? { line: q.line } : null));
      if (s.type === "explore" && L.street) L.street.carts.forEach((k) => add(k.foods));
      add(s.targets); add(s.items); add(s.foods); add(s.cards); add(s.kids); add(s.words);
      return c.filter(okPic);
    };
    const kind = (s) => s.type === "watch" ? UI.play : ["explore", "chunks", "qa"].includes(s.type) ? UI.tap : s.type === "recap" ? UI.cards : s.type === "done" ? UI.stamp
      : s.skill === "S" ? UI.mic : s.skill === "R" ? UI.book : s.skill === "W" ? UI.pen : UI.ear;
    steps.forEach((s) => {
      const pic = s.type === "done" || s.type === "recap" ? null : pool(s).find((n) => !used.has(n));
      if (pic) used.add(pic);
      out.set(s, pic ? { img: pic } : { svg: kind(s) });
    });
    return out;
  }
  function showMap(opts = {}) {
    screen("map");
    try { history.replaceState(null, "", "#" + L.id.toLowerCase()); } catch (e) {}
    const meta = lessonMeta(L.id);
    const plan = L.plan || L.blocks.map((b) => ({ id: b.id, label: b.name }));
    const blockOf = (id) => L.blocks.find((b) => b.id === id);
    const cur = Prog.current();
    const icons = stepIcons();
    const items = [];
    const allDone = plan.every((n) => { const b = blockOf(n.id); return b && Prog.complete(b); });
    /* summary for the unit screen */
    try {
      const bl = plan.map((n) => blockOf(n.id)).filter(Boolean);
      localStorage.setItem("explore-hw:sum:" + L.id, JSON.stringify({
        stars: bl.reduce((t, b) => t + (Prog.complete(b) ? Prog.stars(b) : 0), 0), max: bl.length * 3,
        done: steps.filter((s) => Prog.isDone(s.id)).length, total: steps.length, complete: bl.every((b) => Prog.complete(b)) }));
    } catch (e) {}
    /* stamps of parts finished before rewards existed: given quietly from the saved results */
    plan.forEach((n) => { const b = blockOf(n.id); if (b && !n.soon && Prog.complete(b) && !Rewards.stamp(L.id, n.id)) Rewards.award(L.id, n.id, Prog.pct(b)); });
    /* the whole lesson is finished and no reward picked yet → pick one first (offered again until picked) */
    if (allDone && !Rewards.cart(L.id) && !pickLater.has(L.id) && ((meta && meta.rewards) || []).length) return showPick(L.id, { back: () => showMap() });
    plan.forEach((n, k) => {
      const b = blockOf(n.id);
      const has = b && !n.soon && Prog.blockSteps(b).length;
      const open = has && Prog.blockOpen(b), done = has && Prog.complete(b);
      const st = done ? "done" : open ? "open" : "lock";
      const frame = h("button", { class: "nv-mile " + st + (opts.justDone === n.id ? " pop" : ""), type: "button", "aria-label": `${k + 1} · ${n.label}` + (done ? " · done" : open ? "" : " · locked") },
        h("span", { class: "pic", style: `background-image:url("${img(n.frame || n.img)}")` }));
      const stp = done ? Rewards.stamp(L.id, n.id) : null;
      const mile = h("div", { class: "nv-item nv-mileitem " + st }, frame,
        stp ? h("span", { class: "rw-mbadge ink-" + stp.ink, role: "img", "aria-label": INK_NAME[stp.ink] + " stamp" }, h("i", { html: UI.check })) : null,
        h("span", { class: "flag" }, `${k + 1} · ${String(n.label).toUpperCase()}`));
      frame.onclick = () => {
        if (!open && !done) return nudge(mile);
        const ss = Prog.blockSteps(b);
        go(steps.indexOf(done ? ss[0] : ss.find((s) => !Prog.isDone(s.id)) || ss[0]));
      };
      items.push({ el: mile, big: true, row: true });
      if (!has) return;
      Prog.blockSteps(b).forEach((s) => {
        const sd = Prog.isDone(s.id), now = s === cur, op = Prog.stepOpen(s);
        const ic = icons.get(s);
        const btn = h("button", { class: "nv-node " + (sd ? "done" : now ? "now" : op ? "open" : "lock"), type: "button", "aria-label": `${n.label} · ${s.title}` + (sd ? " · done" : op ? "" : " · locked") },
          ic.img ? h("img", { src: img(ic.img), alt: "" }) : h("span", { class: "ico", html: ic.svg }));
        const el = h("div", { class: "nv-item" }, btn, sd ? h("span", { class: "nv-chk" }, "✓") : null);
        el.dataset.step = s.id;
        btn.onclick = () => (op ? go(steps.indexOf(s)) : nudge(el));
        items.push({ el, s, now });
      });
    });
    const scroller = h("div", { class: "nv-scroll" });
    /* the stamps of this lesson (decision #57: the stamp ink is the only rating children see; scores stay stored for teachers) */
    const stamps = plan.filter((n) => blockOf(n.id) && !n.soon).map((n) => Rewards.stamp(L.id, n.id));
    const got = stamps.filter(Boolean).length;
    const badge = got ? h("span", { class: "rw-scount" + (opts.justDone ? " pop" : ""), role: "img", "aria-label": `${got} of ${stamps.length} stamps` },
      ...stamps.map((st) => h("i", { class: st ? "ink-" + st.ink : "" })), h("b", {}, `${got}/${stamps.length}`)) : null;
    main.append(navBg(L.bg || (meta && meta.bg)), navTop(L.subtitle || L.title, () => showUnit(L.id.charAt(0)), badge), scroller);
    const R = road(scroller, items, {
      size(its, W, H, land) {
        const dM = land ? clampN(104, H * 0.2, 170) : clampN(120, W * 0.36, 190), dn = land ? clampN(64, H * 0.115, 96) : clampN(66, W * 0.2, 96);
        its.forEach((it) => { it.d = it.big ? dM : dn; it.bottom = it.big ? 30 : 0; it.top = 0; });
      },
      amp: 0.22, ampMax: 150, firstSide: 1, padTop: 26, padBottom: 40, wave: Math.PI / 2.6,
      gap: (a, b) => (a.big || b.big ? 34 : a.d * 0.36),
      padX: (W) => Math.max(44, W * 0.05), padTopLand: 96, padBottomLand: 20, bigGap: 70, smallGap: (it) => it.d * 0.75, stretch: 1.6, rowGap: 30,
      wobble: (r) => Math.min(...r.map((it) => it.d)) * 0.25, roadW: (its) => clampN(24, its.find((x) => !x.big) ? its.find((x) => !x.big).d * 0.46 : 30, 40)
    });
    /* START tag + Kim pin at the current step */
    const label = (id) => (plan.find((n) => n.id === id) || {}).label;
    const curPart = cur ? cur.block.id : null;
    const msg = () => allDone ? (L.finishLine || "Hooray! You finished Food Street!")
      : opts.justDone ? (curPart ? `Great job! Now let's do ${label(curPart)}!` : "Well done! More is coming soon!")
      : curPart ? `Tap ${label(curPart)} to start!` : "Well done! More is coming soon!";
    const tag = h("span", { class: "nv-starttag" }, "START");
    const pin = kimPin(msg);
    R.wrap.append(tag, pin);
    const at = items.find((it) => it.now);
    const from = opts.from && items.find((it) => it.s && it.s.id === opts.from);
    /* coming back from a finished part: the pin starts at the last step and slides along to the next one */
    let first = true, sliding = false;
    R.onLayout = (W) => {
      tag.hidden = pin.hidden = !at;
      if (!at) return;
      const where = R.land ? "above" : "side";
      if (first && from && from !== at) {
        placePin(pin, from, where, W, items); sliding = true;
        setTimeout(() => { pin.classList.add("slide"); placePin(pin, at, where, R.wrap.clientWidth, items); setTimeout(() => { sliding = false; pin.classList.remove("slide"); }, 950); }, 600);
      } else if (!sliding) placePin(pin, at, where, W, items);
      first = false;
      /* START: on the inner side of the node (portrait), under it (landscape) */
      const tw = tag.offsetWidth || 70, th = tag.offsetHeight || 30;
      const side = pin.dataset.side;
      if (R.land) { tag.style.left = at.x - tw / 2 + "px"; tag.style.top = at.y + at.d / 2 + 10 + "px"; tag.dataset.side = "b"; }
      else {
        const s = side === "r" ? -1 : 1, x = s > 0 ? at.x + at.d / 2 + 12 : at.x - at.d / 2 - 12 - tw;
        /* no room on that side (the node is near the screen edge) → under the node */
        if (x < 6 || x + tw > W - 6) { tag.style.left = at.x - tw / 2 + "px"; tag.style.top = at.y + at.d / 2 - th * 0.45 + "px"; tag.dataset.side = "b"; }
        else { tag.style.left = x + "px"; tag.style.top = at.y - th / 2 + "px"; tag.dataset.side = s > 0 ? "r" : "l"; }
      }
    };
    R.layout();
    if (at) requestAnimationFrame(() => scrollToItem(scroller, at));
    cleanup = () => R.stop();
    if (opts.justDone) { Audio_.sfx("complete"); const r = runId; setTimeout(() => { if (alive(r)) pin.click(); }, 900); }
  }
  function nudge(el) { el.classList.remove("nv-no"); void el.offsetWidth; el.classList.add("nv-no"); }

  /* ======================= V3 practice shell (giao diện v3, 2026-11-18 · decisions #52–#56) =======================
   * One frame for every practice screen:
   *   top bar  ✕ (back to the map) · progress (blue, this exercise's items) · Aa
   *   body     the exercise (each type fills P.body)
   *   foot     CHECK (spell / build / gaptext) or the speaking controls — empty for tap-to-answer exercises
   *   Aa line  the instruction (or the spoken question) as one dark line over space the body keeps free
   *   sheet    feedback sliding up from the bottom: green "Great job!" + CONTINUE · light red "Almost!" + TRY AGAIN / GOT IT
   * No Kim on screen: her voice reads the instruction at the start; nothing is written unless Aa is on. */
  const V3 = ["bubbles", "pick", "names", "say", "lid", "answer"];
  const ICON3 = {
    speaker: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/><path d="M14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="8.5" y="2" width="7" height="12.5" rx="3.5"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 17.5V21M8.5 21.5h7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  /* pictures with a transparent background (foods, drinks, figures) sit on a padded white card; scenes fill their card */
  const isObj = (name) => /(^|\/)(food|item|icon|shadow|who|kid|lid-kid)-|i-hand|girl-plate|hand-point|fridge|(^|\/)may$/.test(String(name));
  /* audio that resolves when it ends OR when something else stops it — so a flow never hangs on a cut-off sound */
  function playSafe(fn) {
    return new Promise((res) => {
      let done = false, idle = 0; const fin = () => { if (!done) { done = true; clearInterval(t); res(); } };
      const busy = () => Audio_.cur || (window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending));
      /* two quiet checks in a row (≥ ¼ s of silence): short pauses inside a sequence of lines don't count */
      const t = setInterval(() => { idle = busy() ? 0 : idle + 1; if (idle >= 2) fin(); }, 250);
      Promise.resolve(fn && fn()).then(fin, fin);
    });
  }

  function practice(step, opts = {}) {
    const root = h("div", { class: "px" + (opts.cls ? " " + opts.cls : "") });
    const bar = h("i");
    const aaBtn = h("button", { class: "px-aa", type: "button", "aria-label": "Show the words", "aria-pressed": "false" }, "Aa");
    const top = h("div", { class: "px-top" },
      h("button", { class: "px-x", type: "button", "aria-label": "Back to the map", onclick: () => showMap() }, "✕"),
      h("span", { class: "px-prog", role: "progressbar", "aria-label": "Progress" }, bar), aaBtn);
    const content = h("div", { class: "px-main" });
    const aaLine = h("div", { class: "px-aaline", hidden: true });
    const frame = h("div", { class: "px-body" }, content, aaLine);
    const foot = h("div", { class: "px-foot" });
    root.append(top, frame, foot);
    main.append(root);

    let aaText = "", aaOn = false, sheetEl = null;
    const runNow = runId;
    const syncAa = () => { aaBtn.classList.toggle("on", aaOn); aaBtn.setAttribute("aria-pressed", String(aaOn)); aaLine.textContent = aaText; aaLine.hidden = !(aaOn && aaText); };
    aaBtn.onclick = () => { aaOn = !aaOn; syncAa(); };

    const P = {
      root, body: content, foot,
      progress(done, total) { bar.style.width = (total ? Math.round((done / total) * 100) : 0) + "%"; },
      /* Aa text: the instruction, or the question being asked */
      aa(text) { aaText = String(text || "").replace(/[*_]/g, ""); syncAa(); },
      /* blue speaker; size: xl (listen-and-tap) · lg · md (speaking) · sm · xs (next to a word / sentence) */
      speaker(size, play, label = "Listen again") {
        const b = h("button", { class: "px-spk " + size, type: "button", "aria-label": label, html: ICON3.speaker });
        if (play) b.onclick = () => P.play(b, play);
        return b;
      },
      play(btn, fn) { if (btn) btn.classList.add("playing"); return playSafe(fn).then(() => btn && btn.classList.remove("playing")); },
      /* Kim's voice only (no avatar, no text) */
      voice(text) { return text ? playSafe(() => Audio_.speak(text, "kim")) : Promise.resolve(); },
      /* the first item is already on screen, dimmed and not tappable, while Kim reads the instruction */
      async intro(text) {
        root.classList.add("pre");
        const spk = root.querySelector(".px-main .px-spk"); if (spk) spk.classList.add("playing");
        await P.voice(text);
        root.classList.remove("pre"); if (spk && !spk.dataset.busy) spk.classList.remove("playing");
      },
      wrong(el) {
        Audio_.sfx("practice-wrong");
        el.classList.remove("px-wrong"); void el.offsetWidth; el.classList.add("px-wrong");
        setTimeout(() => el.classList.remove("px-wrong"), 900);
      },
      /* feedback sheet → resolves when its button is tapped.
         { ok, title, text | html, play (sheet speaker), auto (sound played as it opens), button } */
      sheet(o) {
        return new Promise((res) => {
          P.closeSheet(true);
          const ok = o.ok !== false;
          const inner = h("div", { class: "px-sheet-in" }, h("h3", {}, o.title || (ok ? "✔ Great job!" : "Almost!")));
          let spk = null;
          if (o.text || o.html) {
            const row = h("div", { class: "px-ans" });
            if (o.play) { spk = h("button", { class: "px-spk xs green", type: "button", "aria-label": "Listen", html: ICON3.speaker }); spk.onclick = () => P.play(spk, o.play); row.append(spk); }
            row.append(o.html ? h("span", { class: "px-read", html: o.html }) : h("span", { class: "px-read" }, o.text));
            inner.append(row);
          }
          /* o.hideAfter (ms): no button — the sheet slides away by itself (a wrong tap: the child just tries again) */
          const btn = o.hideAfter ? null : h("button", { class: "px-btn " + (ok ? "green" : "red"), type: "button" }, o.button || (ok ? "CONTINUE" : "GOT IT"));
          if (btn) inner.append(btn);
          const el = h("div", { class: "px-sheet " + (ok ? "ok" : "bad"), role: "status" }, inner);
          sheetEl = el; root.append(el); root.classList.add("sheet-open");
          requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
          /* sound played as the sheet opens; still() turns false once the sheet is gone, so nothing spills into the next item */
          if (o.auto) { const still = () => sheetEl === el && alive(runNow); spk ? P.play(spk, () => o.auto(still)) : playSafe(() => o.auto(still)); }
          if (btn) btn.onclick = () => { Audio_.stop(); P.closeSheet(); res(); };
          else setTimeout(() => { if (sheetEl === el) P.closeSheet(); res(); }, o.hideAfter);
        });
      },
      closeSheet(now) {
        const el = sheetEl; sheetEl = null; root.classList.remove("sheet-open");
        if (!el) return;
        if (now) return el.remove();
        el.classList.remove("show"); setTimeout(() => el.remove(), 320);
      },
      /* a wrong answer that the child simply tries again: short red sheet, gone after ~1.2 s (longer when it carries a hint) */
      retry(text) { return P.sheet({ ok: false, title: "Almost!", text: text || "Try again!", hideAfter: text && text !== "Try again!" ? 2000 : 1200 }); },
      /* CHECK (only spell / build / gaptext): grey until every slot is filled */
      check(onCheck) {
        const b = h("button", { class: "px-btn red", type: "button", disabled: true }, "CHECK");
        b.onclick = onCheck; foot.append(b); root.classList.add("has-btn");
        return b;
      },
      /* end of the exercise: score + Kim's praise, then on */
      async finish(score, total, line) {
        P.progress(1, 1); P.aa("");
        await P.sheet({ ok: true, title: "⭐ " + score + " / " + total, text: line, auto: () => Audio_.speak(line, "kim") });
        if (alive(runNow)) next();
      },
      /* speaking controls: a line (hints, "Your turn!") · big red mic · "Can't speak now" */
      micFoot() {
        const line = h("div", { class: "px-mline", "aria-live": "polite" });
        const mic = h("button", { class: "px-mic", type: "button", "aria-label": "Tap and speak", html: ICON3.mic });
        const cant = h("button", { class: "px-cant", type: "button" }, "Can't speak now");
        foot.append(line, mic, cant); root.classList.add("has-mic");
        return {
          mic, cant,
          line(text, tone) { line.textContent = text || ""; line.className = "px-mline" + (tone ? " " + tone : ""); },
          pulse(on) { mic.classList.toggle("pulse", !!on); },
          listening(on) { mic.classList.toggle("listening", !!on); }
        };
      }
    };
    return P;
  }

  /* picture block: a padded white card for objects, the picture itself (rounded) for scenes */
  function picture(name, cls = "") {
    const im = h("img", { src: img(name), alt: "" });
    return isObj(name) ? h("div", { class: "px-obj " + cls }, im) : h("div", { class: "px-scene " + cls }, im);
  }

  /* ======================= Scene camera (Watch · Explore) — decisions #54, #27 =======================
   * The scene picture sits in a canvas that is scaled and moved so the cue's FOCUS box (in % of the picture) is fully
   * visible between the top UI and the bottom UI. If the picture can cover the screen with the focus inside → cover.
   * Otherwise it shrinks until the focus fits; the rest of the screen shows the same picture blurred and washed.
   * Focus boxes: lesson pack `focus: { <scene>: {x,y,w,h} }`, a cue's own `focus`, or what the cue points at. */
  const ratio = {};
  const aspectOf = (name) => new Promise((res) => {
    if (ratio[name]) return res(ratio[name]);
    const im = new Image();
    im.onload = () => res((ratio[name] = im.naturalWidth / im.naturalHeight || 16 / 9));
    im.onerror = () => res(16 / 9);
    im.src = img(name);
  });
  const WHOLE = { x: 0, y: 0, w: 100, h: 100 };
  const focusOf = (scene) => (L.focus && L.focus[scene]) || WHOLE;
  const pad = (f, p) => { const x = Math.max(0, f.x - p), y = Math.max(0, f.y - p); return { x, y, w: Math.min(100, f.x + f.w + p) - x, h: Math.min(100, f.y + f.h + p) - y }; };
  const union = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };
  function camera(root) {
    const blur = h("div", { class: "st-blur" });
    const a = h("img", { class: "st-img", alt: "" }), b = h("img", { class: "st-img out", alt: "" });
    const layer = h("div", { class: "st-layer" });
    const canvas = h("div", { class: "st-canvas" }, a, b, layer);
    const cam = h("div", { class: "st-cam" }, blur, h("div", { class: "st-wash" }), canvas);
    root.append(cam);
    let front = a, back = b, scene = null, ar = 16 / 9, focus = WHOLE, margins = () => ({ top: 0, bottom: 0 }), token = 0;
    /* pan (rule G, upright screens only): the picture fills the screen's height and the child swipes sideways;
       the view snaps to snap points (.st-snap in the layer). panAt = where it starts (x in % of the picture). */
    let pan = false, panAt = null;
    function fit(animate) {
      const W = cam.clientWidth, H = cam.clientHeight; if (!W || !H) return;
      if (pan && H > W) {
        const cw = H * ar, first = cam.dataset.mode !== "pan";
        canvas.classList.remove("anim");
        Object.assign(canvas.style, { width: cw + "px", height: H + "px", left: "0px", top: "0px" });
        cam.dataset.mode = "pan";
        if (first && panAt != null) cam.scrollLeft = clampN(0, (panAt / 100) * cw - W / 2, cw - W);
        if (api.onFrame) api.onFrame({ W, H, left: 0, right: 0, top: 0, bottom: 0, mode: "pan", animate: false });
        return;
      }
      if (cam.dataset.mode === "pan") cam.scrollLeft = 0;
      const m = margins(), y0 = m.top, y1 = H - m.bottom, side = m.side || 0, vw = W - 2 * side, vh = Math.max(80, y1 - y0);
      const fx = focus.x / 100, fy = focus.y / 100, fw = focus.w / 100, fh = focus.h / 100;
      /* where the canvas may go on one axis: the focus inside the free band [v0, v1] and, when possible, the screen covered
         (or the whole picture on screen when it is smaller than the screen); the focus centred in the band when there is room */
      const axis = (size, S, v0, v1, f0, f1, t) => {
        const fLo = v0 - f0 * size - t * (f1 - f0) * size, fHi = v1 - f1 * size + t * (f1 - f0) * size;
        const sLo = size >= S ? S - size : 0, sHi = size >= S ? 0 : S - size;
        /* the whole picture fits in the band → the picture is centred in the band; it fits on the screen → centred on
           the screen (then kept so the focus stays in the band); else the focus is centred. A centred frame keeps the
           caption / button column centred on it, and no odd strip of blur shows on one side only. */
        const want = size <= v1 - v0 + 0.5 ? (v0 + v1 - size) / 2 : size <= S ? (S - size) / 2 : (v0 + v1) / 2 - ((f0 + f1) / 2) * size;
        const lo = Math.max(fLo, sLo), hi = Math.min(fHi, sHi);
        return { pos: lo <= hi ? Math.min(hi, Math.max(lo, want)) : Math.min(fHi, Math.max(fLo, want)), ok: lo <= hi + 0.5 };
      };
      const tol = m.tol != null ? m.tol : 0.05;
      const place = (cw, t) => {
        const ch = cw / ar;
        /* a focus that reaches the picture's own edge needs no side margin there (else a strip of blur shows on one side) */
        const x = axis(cw, W, fx <= 0.005 ? 0 : side, fx + fw >= 0.995 ? W : W - side, fx, fx + fw, t), y = axis(ch, H, y0, y1, fy, fy + fh, t);
        return { cw, ch, left: x.pos, top: y.pos, ok: x.ok && y.ok };
      };
      /* cover when the focus box fits inside the free area (a little tolerance), else shrink until it fits */
      let g = place(Math.max(W, H * ar), tol), mode = "cover";
      if (!g.ok) {
        mode = "fit"; g = place(Math.min(vw / fw, (vh / fh) * ar, Math.max(W, H * ar)), 0);
        /* a framed picture a few px narrower than the screen but wider than the side band → exactly the band, so it sits centred */
        if (side && g.cw > vw && g.cw < W) g = place(vw, 0);
      }
      if (animate != null) canvas.classList.toggle("anim", !!animate);   /* null (a resize): keep the running move */
      Object.assign(canvas.style, { width: g.cw + "px", height: g.ch + "px", left: g.left + "px", top: g.top + "px" });
      cam.dataset.mode = mode;
      /* the visible frame (the picture ∩ the screen), so the bottom column can share its edges */
      if (api.onFrame) api.onFrame({ W, H, left: Math.max(0, g.left), right: Math.max(0, W - g.left - g.cw), top: Math.max(0, g.top), bottom: Math.max(0, H - g.top - g.ch), mode, animate: !!animate });
    }
    const resized = () => { if (api.onResize) api.onResize(); fit(null); };
    const ro = window.ResizeObserver ? new ResizeObserver(resized) : null;
    if (ro) ro.observe(cam); else window.addEventListener("resize", resized);
    const api = {
      cam, layer, canvas,
      /* margins(): the free area — { top, bottom, side } in px */
      margins(fn) { margins = fn; },
      pan(on, at) { pan = !!on; panAt = at != null ? at : null; if (!pan && cam.dataset.mode === "pan") { cam.dataset.mode = ""; cam.scrollLeft = 0; } },
      panBy(dir) {
        const W = cam.clientWidth, xs = [...layer.querySelectorAll(".st-snap")].map((e) => e.offsetLeft - W / 2).sort((p, q) => p - q);
        const now = cam.scrollLeft, t = dir > 0 ? xs.find((x) => x > now + 8) : xs.reverse().find((x) => x < now - 8);
        if (t != null) cam.scrollTo({ left: t, behavior: "smooth" });
      },
      watch(el) { if (ro && el) ro.observe(el); },
      fit,
      async show(name, f) {
        const tk = ++token;
        const r = await aspectOf(name);
        if (tk !== token) return;
        focus = f || focusOf(name);
        if (name !== scene) {
          const first = !scene;
          scene = name; ar = r;
          back.src = img(name); blur.style.backgroundImage = `url("${img(name)}")`;
          back.classList.remove("out"); front.classList.add("out"); [front, back] = [back, front];
          fit(!first);
        } else fit(true);
      },
      get scene() { return scene; },
      stop() { token++; if (ro) ro.disconnect(); else window.removeEventListener("resize", resized); }
    };
    return api;
  }
  /* top of a scene screen: the part's pill · map · menu */
  function sceneTop(step) {
    return h("div", { class: "st-top" }, h("span", { class: "st-pill" }, `${L.id} · ${step.block.name}`), h("span", { class: "st-sp" }),
      iconBtn("st-ib", UI.map, "Back to the map", () => showMap()), iconBtn("st-ib", UI.menu, "All steps (teachers)", openMenu));
  }
  /* strip HTML → plain words, for comparing a cue's sentence strip with its spoken line */
  const plain = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/[…….!?,·]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  /* strip markup for the caption / board: <b> = the chunk (dashed blue underline), .q = a question (red) */
  const stripHtml = (s) => String(s).replace(/<b class=['"]m['"]>/g, '<span class="hl m">').replace(/<b>/g, '<span class="hl">').replace(/<\/b>/g, "</span>");
  /* "He's eating" in a strip's merged chunk → ["He is", "He's"] (the chip row "He is ➜ He's") */
  function contraction(strip) {
    const m = /<b class=['"]m['"]>\s*(He|She|It|I|You|We|They)('s|'m|'re)\b/.exec(strip || "");
    if (!m) return null;
    return [m[1] + { "'s": " is", "'m": " am", "'re": " are" }[m[2]], m[1] + m[2]];
  }

  /* the bottom column of a scene screen (Watch caption, Explore button / tray) shares the visible frame's edges:
   * exactly the frame's width, centred on it; where the frame reaches a screen edge, both sides come in by the same
   * amount so it keeps 12px from that edge (continuous: no jump when a frame grows to the screen edge).
   * Never narrower than minW (then centred on the frame). Sets --bl / --br (px from the screen's left / right). */
  function frameColumn(el, f, minW) {
    const pad = Math.max(0, 12 - Math.min(f.left, f.right));
    let L = f.left + pad, R = f.right + pad;
    const m = Math.min(f.W - 24, minW);
    if (f.W - L - R < m) { const c = L + (f.W - L - R) / 2; L = clampN(12, c - m / 2, f.W - 12 - m); R = f.W - L - m; }
    const old = [parseFloat(el.style.getPropertyValue("--bl")), parseFloat(el.style.getPropertyValue("--br"))];
    if (Math.abs(old[0] - L) < 1 && Math.abs(old[1] - R) < 1) return;
    el.classList.toggle("glide", f.animate);
    el.style.setProperty("--bl", L.toFixed(1) + "px"); el.style.setProperty("--br", R.toFixed(1) + "px");
  }

  /* the foods of a cart on its counter (Explore vocab and Watch use the same row: same places, same labels) */
  /* a long word shrinks a little so it stays on one line inside its card (≤ 8 letters: full size) */
  const lfit = (t) => { const n = String(t).replace(/<[^>]+>/g, "").length; return n > 8 ? (8 / n).toFixed(2) : 1; };
  function cartCounter(c, tag) {
    const counter = h("div", { class: "st-counter", "data-n": c.foods.length, "data-fit": "bottom", style: `--n:${c.foods.length}` });
    const items = {};
    c.foods.forEach((f, n) => {
      const el = h(tag, { class: "st-cfood", style: `animation-delay:${n * 90}ms` }, h("img", { src: img(L.words[f].img), alt: "" }), h("span", { class: "lbl px-read", html: wlabel(L.words[f]), style: `--lf:${lfit(L.words[f].label)}` }));
      if (tag === "button") { el.type = "button"; el.setAttribute("aria-label", L.words[f].label); }
      items[f] = el; counter.append(el);
    });
    return { counter, items };
  }
  /* camera framing of an open cart: landscape = the whole counter row; upright = the cart's own focus */
  const CART_WIDE = { x: 10, y: 10, w: 80, h: 88 };

  /* ======================= Step types ======================= */
  const TYPES = {};

  /* ---------- WATCH (S1 · S2): the scene fills the screen; caption = Kim's head (tap = again) · line · ➜ ---------- */
  TYPES.watch = function (step, run) {
    const root = h("div", { class: "st st-watch" });
    main.append(root);
    const cam = camera(root);
    const top = sceneTop(step);
    const board = h("div", { class: "st-board", hidden: true });
    const chips = h("div", { class: "st-chips", hidden: true });
    const head = h("button", { class: "st-head", type: "button", "aria-label": "Listen again" }, kimHead("wave"));
    const txt = h("div", { class: "st-txt", "aria-live": "polite" });
    const goBtn = iconBtn("st-go", UI.next, "Next", () => next());
    const cap = h("div", { class: "st-cap" }, head, txt, goBtn);
    const bottom = h("div", { class: "st-bottom" }, board, chips, cap);
    root.append(top, bottom);
    cam.margins(() => ({ top: top.offsetHeight + 4, bottom: bottom.offsetHeight + 14 }));
    cam.watch(bottom);
    /* caption column = the visible picture frame (same edges, centred on it) */
    cam.onFrame = (f) => frameColumn(bottom, f, 440);

    const cues = step.cues;
    let i = 0, token = 0;
    const cueSound = async (c, tk) => {
      if (c.food && c.wordFirst) { await Audio_.word(c.food); if (tk !== token) return; await sleep(250); if (tk !== token) return; await Audio_.line(c.line); }
      else if (c.food) await Audio_.word(c.food);
      else if (c.line) await Audio_.line(c.line);
    };
    /* an open cart: its foods stand on the counter as Kim names them (same row as Explore vocab) */
    const cartOf = (scene) => (L.street && L.street.carts ? L.street.carts.find((x) => x.scene === scene) : null) || null;
    const upright = () => cam.cam.clientWidth < cam.cam.clientHeight * 0.9;
    let wc = null;   /* { cart, counter, items } of the cart on screen */
    /* landscape: the whole counter row (as Explore); upright: the cart itself, the row narrowed to it */
    function cartFrame(ct) {
      if (ct.focus) return ct.focus;
      if (!upright()) return CART_WIDE;
      const f = focusOf(ct.scene); return union(f, { x: f.x, y: 84, w: f.w, h: 14 });
    }
    function placeRow() {
      if (!wc) return;
      const up = upright() && !wc.cart.focus, f = focusOf(wc.cart.scene);
      wc.counter.classList.toggle("tight", up);
      const m = f.w * 0.05;   /* a little in from the cart's edges, so the ring never touches the screen edge */
      Object.assign(wc.counter.style, up ? { left: f.x + m + "%", right: 100 - f.x - f.w + m + "%" } : { left: "", right: "" });
    }
    function drawCart(c, list, now) {
      const ct = cartOf(c.scene);
      if (wc && (!ct || wc.cart !== ct)) { wc.counter.remove(); wc = null; }
      if (!ct) return false;
      if (!wc) { wc = { cart: ct, ...cartCounter(ct, "span") }; wc.counter.classList.add("watch"); cam.canvas.append(wc.counter); placeRow(); }
      ct.foods.forEach((f) => {
        const el = wc.items[f], on = list.includes(f);
        el.style.animationDelay = "0ms";
        el.classList.toggle("wait", !on);
        el.classList.toggle("sel", f === now); el.classList.toggle("heard", f === now);
      });
      return true;
    }
    cam.onResize = () => {
      const was = wc && wc.counter.classList.contains("tight"); placeRow();
      if (wc && was !== wc.counter.classList.contains("tight")) { const c = cues[Math.min(i, cues.length - 1)]; cam.show(c.scene, focusCue(c)); }
    };
    /* what the cue talks about: a cart / a sign point / the actors + bubble / the scene's own focus */
    function focusCue(c) {
      if (c.focus) return c.focus;
      const ct = cartOf(c.scene);
      /* on an open cart the counter row stays in view; a sign point is framed together with it */
      if (ct && !(c.actors && c.actors.length)) {
        const fr = cartFrame(ct);
        if (c.point && c.point.startsWith("sign:")) { const p = L.street.signRice[c.point.split(":")[1]]; return union(fr, { x: p.x - 10, y: Math.max(0, p.y - 15), w: 20, h: 30 }); }
        return fr;
      }
      if (c.point) {
        const [kind, id] = c.point.split(":");
        /* the cart AND the children standing in front of it, down to the picture's bottom: never a face cut in half */
        if (kind === "cart") { const k = pad(L.street.carts.find((x) => x.id === id).hot, 3); return { x: k.x, y: k.y, w: k.w, h: 100 - k.y }; }
        const p = L.street.signRice[id]; return { x: p.x - 10, y: Math.max(0, p.y - 15), w: 20, h: 30 };
      }
      if (c.actors && c.actors.length) {
        let f = null;
        c.actors.forEach((a) => { const r = ratio[a.img] || 1; const box = { x: a.x, y: a.y, w: a.w, h: (a.w / r) * (ratio[c.scene] || 16 / 9) }; f = f ? union(f, box) : box; });
        if (c.bubble) f = union(f, { x: c.bubble.x, y: c.bubble.y, w: Math.min(32, 100 - c.bubble.x), h: 16 });
        return pad(f, 2);
      }
      return focusOf(c.scene);
    }
    function foodsBefore(k) {
      let list = [];
      for (let j = 0; j < k; j++) { if (cues[j].clear) list = []; if (cues[j].food) list.push(cues[j].food); }
      if (cues[k] && cues[k].clear) list = [];
      return list;
    }
    /* foods heard at this cart: on the cart's counter (drawCart); a scene without a cart (I5's sky) shows the word's
       picture + label on the scene itself, at the bottom of the part the cue looks at — never a card row */
    let solo = null;
    function drawFoods(c, list, popLast) {
      if (solo) { solo.remove(); solo = null; }
      if (drawCart(c, list, popLast ? list[list.length - 1] : null)) return;
      if (list.length) {
        const f = focusOf(c.scene), m = f.w * 0.05;
        solo = cartCounter({ foods: list }, "span").counter;
        solo.classList.add("watch", "tight", "solo");
        Object.assign(solo.style, { left: f.x + m + "%", right: 100 - f.x - f.w + m + "%" });
        const last = solo.lastChild; last.style.animationDelay = "0ms"; if (popLast) last.classList.add("sel", "heard");
        cam.canvas.append(solo);
      }
    }
    function drawLayer(c) {
      cam.layer.innerHTML = "";
      if (c.dim) cam.layer.append(h("div", { class: "st-dim" }));
      (c.actors || []).forEach((a) => { const el = h("img", { class: "st-actor", src: img(a.img), alt: "" }); Object.assign(el.style, { left: a.x + "%", top: a.y + "%", width: a.w + "%" }); cam.layer.append(el); });
      if (c.bubble) { const bb = h("div", { class: "st-bubble px-read" }, c.bubble.text); Object.assign(bb.style, { left: c.bubble.x + "%", top: c.bubble.y + "%" }); cam.layer.append(bb); }
      if (c.point) {
        const [kind, id] = c.point.split(":");
        const r = h("div", { class: "st-ring" + (kind === "cart" ? " box" : "") });
        if (kind === "cart") { const k = L.street.carts.find((x) => x.id === id).hot; Object.assign(r.style, { left: k.x + "%", top: k.y + "%", width: k.w + "%", height: k.h + "%" }); }
        else { const p = L.street.signRice[id]; Object.assign(r.style, { left: p.x + "%", top: p.y + "%" }); }
        cam.layer.append(r);
      }
    }
    /* sentence strip: a contraction → chip row "He is ➜ He's"; the same words as the line → highlights in the caption; else a small board */
    function drawText(c) {
      const line = c.line ? c.line.text : "";
      const ct = contraction(c.strip);
      chips.hidden = !ct; board.hidden = true;
      let html = c.food ? `<span class="hl">${wlabel(L.words[c.food])}</span>` + (line ? " " + esc(line) : "") : esc(line);
      if (ct) {
        chips.innerHTML = `<s>${esc(ct[0])}</s><span class="ar" aria-hidden="true">➜</span><b>${esc(ct[1])}</b>`;
        chips.setAttribute("aria-label", ct[0] + " becomes " + ct[1]);
        const k = html.indexOf(ct[1]);
        if (k >= 0) { const end = html.slice(k + ct[1].length).match(/^[!.…]?/)[0]; html = html.slice(0, k) + `<span class="hl m">${ct[1]}${end}</span>` + html.slice(k + ct[1].length + end.length); }
      } else if (c.strip && !c.food) {
        if (plain(c.strip) === plain(line)) html = stripHtml(c.strip);
        else { board.hidden = false; board.innerHTML = stripHtml(c.strip); board.classList.remove("in"); void board.offsetWidth; board.classList.add("in"); }
      }
      txt.innerHTML = html;
    }
    async function runFrom(k) {
      const tk = ++token;
      for (i = k; i < cues.length; i++) {
        if (!alive(run) || tk !== token) return;
        const c = cues[i];
        drawLayer(c); drawText(c);
        drawFoods(c, foodsBefore(i).concat(c.food ? [c.food] : []), !!c.food);
        cam.show(c.scene, focusCue(c));
        head.classList.add("talk"); head.firstChild.style.backgroundImage = `url("${kimArt("head-point")}")`;
        await cueSound(c, tk);
        head.classList.remove("talk");
        if (!alive(run) || tk !== token) return;
        await sleep(c.after != null ? c.after : (c.food ? 550 : 450));
      }
      if (alive(run) && tk === token) { goBtn.classList.add("pulse"); head.firstChild.style.backgroundImage = `url("${kimArt("head-wave")}")`; }
    }
    head.onclick = () => { token++; head.classList.add("talk"); const c = cues[Math.min(i, cues.length - 1)]; playSafe(() => cueSound(c, token)).then(() => head.classList.remove("talk")); };
    /* actors' picture ratios first, so the first framing is already right */
    Promise.all(cues.flatMap((c) => (c.actors || []).map((a) => aspectOf(a.img))).concat(cues.map((c) => aspectOf(c.scene)))).then(() => alive(run) && runFrom(0));
    return () => { token++; cam.stop(); };
  };

  /* ---------- EXPLORE vocab (S3 · S3b): the scene, whole and uncovered; a thin top bar collects the words heard ---------- */
  TYPES.explore = function (step, run) {
    const root = h("div", { class: "st st-explore" });
    main.append(root);
    const cam = camera(root);
    const heard = new Set(), all = Object.keys(L.words), visited = new Set();
    const total = all.length;
    /* bar: icons of the words heard (empty dots for the rest), ≤ 6 per row; tap → every word */
    const cols = total <= 6 ? total : Math.ceil(total / 2);
    const slots = h("div", { class: "st-slots", style: `--cols:${Math.min(6, cols)};--all:${total}` });
    const slotOf = {};
    all.forEach((w) => { const s = h("span", { class: "st-slot", title: L.words[w].label }); slotOf[w] = s; slots.append(s); });
    const count = h("small", { class: "st-count" });
    const bar = h("button", { class: "st-wbar", type: "button", "aria-label": "All the words" }, slots, count);
    const close = iconBtn("st-x", "✕", "Back to the map", () => showMap());
    const backBtn = h("button", { class: "st-back", type: "button", hidden: true }, h("span", { html: UI.back }), L.street.name || "Food Street");
    const top = h("div", { class: "st-etop" }, h("div", { class: "st-eleft" }, close, backBtn), bar);
    const ready = h("button", { class: "st-ready px-btn red", type: "button", hidden: true }, "I'M READY");
    /* upright street (pan mode): ‹ › step to the previous / next cart */
    const panL = h("button", { class: "st-pan l", type: "button", "aria-label": "Previous cart", html: UI.back, onclick: () => cam.panBy(-1) });
    const panR = h("button", { class: "st-pan r", type: "button", "aria-label": "Next cart", html: UI.back, onclick: () => cam.panBy(1) });
    root.append(panL, panR);
    /* upright screens: the foods of an open cart sit as big cards under the picture (landscape: on the cart's counter) */
    const tray = h("div", { class: "st-tray", hidden: true });
    root.append(top, tray, ready);
    cam.margins(() => ({ top: top.offsetHeight + 10, bottom: (ready.hidden ? 12 : ready.offsetHeight + 28) + (tray.hidden ? 0 : tray.offsetHeight + 14), side: 8, tol: 0 }));
    cam.watch(top); cam.watch(tray);
    cam.onFrame = (f) => frameColumn(root, f, 0);
    let counter = null, cart = null;
    const upright = () => cam.cam.clientWidth < cam.cam.clientHeight * 0.9;
    const cartFocus = () => cart.focus || (upright() ? focusOf(cart.scene) : CART_WIDE);
    function placeCounter() {
      const up = !!counter && upright();
      if (counter && up && counter.parentNode !== tray) tray.append(counter);
      if (counter && !up && counter.parentNode !== cam.layer) cam.layer.append(counter);
      tray.hidden = !up;
    }
    cam.onResize = () => { const was = tray.hidden; placeCounter(); if (cart && was !== tray.hidden) cam.show(cart.scene, cartFocus()); };
    const done = () => heard.size >= total;
    function drawBar() {
      count.textContent = `${heard.size} / ${total}`;
      const ok = done();
      if (ok && ready.hidden) { ready.hidden = false; ready.classList.add("in"); cam.fit(true); }
      root.classList.toggle("all", ok);
    }
    function fillSlot(w, fromEl) {
      const s = slotOf[w];
      if (s.firstChild) return;
      const pic = h("img", { src: img(L.words[w].img), alt: "" });
      s.append(pic); s.classList.add("on");
      if (fromEl && fromEl.animate) {
        /* visual rects → the stage's logical px (the body is scaled on big screens) */
        const k = window.STAGE || 1, sc = (r) => ({ left: r.left / k, top: r.top / k, width: r.width / k, height: r.height / k });
        const a = sc(fromEl.getBoundingClientRect()), b = sc(s.getBoundingClientRect());
        if (a.width && b.width) {
          const fly = h("img", { class: "st-fly", src: img(L.words[w].img), alt: "" });
          Object.assign(fly.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
          document.body.append(fly); pic.style.opacity = 0;
          fly.animate([{ transform: "none" }, { transform: `translate(${b.left - a.left}px,${b.top - a.top}px) scale(${b.width / a.width})` }], { duration: 650, easing: "cubic-bezier(.5,0,.3,1)" })
            .onfinish = () => { fly.remove(); pic.style.opacity = ""; s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop"); };
        }
      }
    }
    async function hear(w, el) {
      Audio_.stop();
      const fresh = !heard.has(w);
      if (fresh) { heard.add(w); Results.put(step.id, { heard: [...heard] }); fillSlot(w, el); drawBar(); }
      await Audio_.word(w);
    }
    function streetView() {
      backBtn.hidden = true;
      cam.layer.innerHTML = ""; counter = cart = null; tray.innerHTML = ""; placeCounter();
      L.street.carts.forEach((c) => {
        const b = h("button", { class: "st-hot" + (visited.has(c.id) ? " visited" : ""), type: "button", "aria-label": c.name });
        Object.assign(b.style, { left: c.hot.x + "%", top: c.hot.y + "%", width: c.hot.w + "%", height: c.hot.h + "%" });
        const name = h("span", { class: "st-hotname px-read" + (visited.has(c.id) ? " visited" : ""), "aria-hidden": "true" }, c.name);
        Object.assign(name.style, { left: c.hot.x + c.hot.w / 2 + "%", top: c.hot.y + c.hot.h * 0.66 + "%" });
        cam.layer.append(name);
        b.onclick = () => {
          /* the ring sits exactly on the cart's hotspot, then the cart opens */
          cam.layer.querySelectorAll(".st-hot").forEach((x) => x.classList.toggle("sel", x === b));
          cam.layer.querySelectorAll(".st-hotname").forEach((x) => x.classList.toggle("sel", x === name));
          Audio_.sfx("region-enter");
          const r = run; setTimeout(() => alive(r) && cartView(c), 520);
        };
        name.onclick = () => b.click();
        cam.layer.append(b);
      });
      const hots = L.street.carts.map((c) => c.hot).reduce((f, k) => union(f, k));
      /* upright: the street fills the screen's height; swipe from cart to cart (each cart is a snap point) */
      L.street.carts.forEach((c) => { const sn = h("span", { class: "st-snap", "aria-hidden": "true" }); sn.style.left = c.hot.x + c.hot.w / 2 + "%"; cam.layer.append(sn); });
      const c0 = L.street.carts[0].hot;
      cam.pan(true, c0.x + c0.w / 2);
      cam.show(L.street.scene, L.street.focus || pad(hots, 4));
    }
    function cartView(c) {
      visited.add(c.id); cart = c; cam.pan(false);
      backBtn.hidden = false;
      cam.layer.innerHTML = ""; tray.innerHTML = "";
      const row = cartCounter(c, "button");
      counter = row.counter;
      c.foods.forEach((f) => {
        const el = row.items[f];
        el.classList.toggle("heard", heard.has(f));
        el.onclick = () => {
          counter.querySelectorAll(".st-cfood").forEach((x) => x.classList.toggle("sel", x === el));
          el.classList.add("heard"); el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce");
          hear(f, el.querySelector("img"));
        };
      });
      placeCounter();
      cam.show(c.scene, cartFocus());
    }
    backBtn.onclick = () => { Audio_.stop(); streetView(); };
    /* panel: every word card; tap = hear */
    function panel() {
      const grid = tileGrid(all.length);
      all.forEach((w) => {
        const t = wordTile(w); if (heard.has(w)) t.classList.add("heard");
        t.onclick = () => { t.classList.add("heard"); t.classList.remove("bounce"); void t.offsetWidth; t.classList.add("bounce"); hear(w, null).then(() => syncP()); syncP(); };
        grid.append(t);
      });
      const pReady = h("button", { class: "px-btn red", type: "button", hidden: true, onclick: () => finish() }, "I'M READY");
      const syncP = () => { pReady.hidden = !done(); };
      const shut = () => { ov.classList.remove("show"); setTimeout(() => ov.remove(), 220); };
      const sheet = h("div", { class: "st-sheet", role: "dialog", "aria-label": "All the words" },
        h("div", { class: "st-sh-head" }, h("b", {}, wordsTitle(step)), iconBtn("st-x dark", "✕", "Close", shut)), h("div", { class: "st-sh-body" }, grid), h("div", { class: "st-sh-foot" }, pReady));
      const ov = h("div", { class: "st-panel" }, sheet);
      ov.onclick = (e) => { if (e.target === ov) shut(); };
      root.append(ov); syncP();
      requestAnimationFrame(() => ov.classList.add("show"));
    }
    bar.onclick = panel;
    /* data for the teacher: which words were heard (the button only shows once every word was heard — mockup S3b) */
    function finish() { Results.put(step.id, { heard: [...heard], total, skipped: heard.size < total }); next(); }
    ready.onclick = finish;
    drawBar(); streetView();
    playSafe(() => kimVoice(step.instruction));
    return () => cam.stop();
  };
  /* title of the word list (panel, recap): the recap heading of the part, else "<street> words" */
  function wordsTitle(step) {
    const rc = steps.find((s) => s.block === step.block && s.type === "recap");
    return step.heading || (rc && rc.heading) || "Food Street words";
  }

  /* ---------- EXPLORE grammar (S4) · Let's Talk (S5): one card per screen, then a summary (S6) ---------- */
  function cardPic(c) {
    const box = h("div", { class: "st-pic" + (isObj(c.img) ? " obj" : "") });
    const im = h("img", { src: img(c.img), alt: "" });
    if (!isObj(c.img)) { const f = focusOf(c.img); im.style.objectPosition = `${clampN(0, f.x + f.w / 2, 100)}% ${clampN(0, f.y + f.h / 2, 100)}%`; }
    box.append(im);
    if (c.food) box.append(h("img", { class: "st-cfoodimg", src: img(c.food), alt: "" }));
    return box;
  }
  const chunkHtml = (sent, chunk) => { const s = esc(sent), k = s.indexOf(esc(chunk)); return k < 0 ? s : s.slice(0, k) + `<span class="hl">${esc(chunk)}</span>` + s.slice(k + esc(chunk).length); };
  const fullChunk = (chunk) => chunk.replace(/^(He|She|It)'s/, "$1 is").replace(/^I'm/, "I am").replace(/^(You|We|They)'re/, "$1 are");
  function cards(step, run, qa) {
    const root = h("div", { class: "st st-cards" + (qa ? " qa" : "") });
    const bar = h("i");
    root.append(h("div", { class: "px-top st-ctop" }, iconBtn("px-x", "✕", "Back to the map", () => showMap()), h("span", { class: "px-prog", role: "progressbar" }, bar)));
    const body = h("div", { class: "st-cbody" });
    const foot = h("div", { class: "st-cfoot" });
    root.append(body, foot);
    main.append(root);
    const heard = new Set(), n = step.cards.length;
    let k = 0, tok = 0;
    const save = () => Results.put(step.id, { heard: [...heard], total: n, skipped: heard.size < n });
    function show(j) {
      k = j; tok++; Audio_.stop();
      bar.style.width = Math.round(((j + 1) / (n + 1)) * 100) + "%";
      body.innerHTML = ""; foot.innerHTML = "";
      if (j >= n) return summary();
      const c = step.cards[j], my = tok;
      const lines = h("div", { class: "st-lines" });
      let play;
      if (!qa) {
        const s = h("span", { class: "st-sent px-read" });
        const spk = h("button", { class: "px-spk xs", type: "button", "aria-label": "Listen", html: ICON3.speaker });
        const full = () => { s.innerHTML = chunkHtml(c.full, fullChunk(c.chunk)); };
        const short = () => { s.innerHTML = chunkHtml(c.short, c.chunk); const m = s.querySelector(".hl"); if (m) m.classList.add("m"); };
        /* the full form first, then the buddies merge (He is → He's) */
        play = async () => { full(); await Audio_.speak(c.full, c.who || "narrator"); if (my !== tok) return; await sleep(200); if (my !== tok) return; short(); await Audio_.speak(c.short, c.who || "narrator"); };
        spk.onclick = () => P0.play(spk, play);
        full();
        lines.append(h("div", { class: "st-line" }, spk, s));
      } else {
        const q = h("span", { class: "st-sent q px-read" }, c.q), a = h("span", { class: "st-sent px-read", html: chunkHtml(c.a, c.chunk) });
        const sq = h("button", { class: "px-spk xs", type: "button", "aria-label": "Listen to the question", html: ICON3.speaker });
        const sa = h("button", { class: "px-spk xs", type: "button", "aria-label": "Listen to the answer", html: ICON3.speaker });
        const aRow = h("div", { class: "st-line ans" }, sa, a);
        sq.onclick = () => P0.play(sq, () => Audio_.speak(c.q, "narrator"));
        sa.onclick = () => { aRow.classList.add("in"); P0.play(sa, () => Audio_.speak(c.a, "kim")); };
        play = async () => { aRow.classList.remove("in"); await P0.play(sq, () => Audio_.speak(c.q, "narrator")); if (my !== tok) return; aRow.classList.add("in"); await P0.play(sa, () => Audio_.speak(c.a, "kim")); };
        lines.append(h("div", { class: "st-line" }, sq, q), aRow);
      }
      body.append(h("div", { class: "st-card" }, cardPic(c), lines));
      const dots = h("div", { class: "st-dots", "aria-hidden": "true" });
      for (let q = 0; q < n; q++) dots.append(h("i", { class: q === j ? "on" : q < j ? "past" : "" }));
      foot.append(dots, h("button", { class: "px-btn red", type: "button", onclick: () => show(j + 1) }, "NEXT"));
      setTimeout(() => { if (alive(run) && my === tok) playSafe(play).then(() => { if (my === tok) { heard.add(j); save(); } }); }, 350);
    }
    /* S6: every card in one list; tap a row = hear it again */
    function summary() {
      root.classList.add("sum");
      const list = h("div", { class: "st-sum" });
      step.cards.forEach((c) => {
        const sent = qa ? c.a : c.short, chunk = c.chunk;
        const row = h("button", { class: "st-row", type: "button" }, cardPic(c),
          h("span", { class: "st-rtext" }, qa ? h("small", { class: "q px-read" }, c.q) : null, h("span", { class: "px-read", html: chunkHtml(sent, chunk) })));
        row.onclick = () => { row.classList.add("playing"); playSafe(() => qa ? Audio_.speak(c.q, "narrator").then(() => Audio_.speak(c.a, "kim")) : Audio_.speak(c.short, c.who || "narrator")).then(() => row.classList.remove("playing")); };
        list.append(row);
      });
      body.append(list);
      foot.append(h("button", { class: "px-btn red", type: "button", onclick: () => { save(); next(); } }, "I'M READY"));
    }
    const P0 = { play: (btn, fn) => { btn.classList.add("playing"); return playSafe(fn).then(() => btn.classList.remove("playing")); } };
    show(0);
    return () => { tok++; };
  }
  TYPES.chunks = (step, run) => cards(step, run, false);
  TYPES.qa = (step, run) => cards(step, run, true);

  /* a word card (panel + recap, rule D): square white card · the picture centred in its box · the word under it ·
     a small speaker badge in the corner (tap anywhere = hear) */
  function wordTile(w) {
    return h("button", { class: "st-tile", type: "button", "aria-label": L.words[w].label },
      h("span", { class: "pic" }, h("img", { src: img(L.words[w].img), alt: "" })),
      h("span", { class: "t px-read", html: wlabel(L.words[w]), style: `--lf:${lfit(L.words[w].label)}` }), h("i", { class: "spk", html: ICON3.speaker }));
  }
  /* a grid of word cards: equal cards on a grid, the group centred (columns / rows from the number of words) */
  function tileGrid(n) {
    const land = Math.min(6, n <= 6 ? n : Math.ceil(n / 2)), port = n <= 4 ? 2 : n <= 12 ? 3 : 4;
    return h("div", { class: "st-grid", style: `--cl:${land};--rl:${Math.ceil(n / land)};--cp:${port};--rp:${Math.ceil(n / port)}` });
  }
  /* ---------- RECAP (F3): every word of the part; PLAY AGAIN · CONTINUE ---------- */
  TYPES.recap = function (step) {
    const root = h("div", { class: "st st-recap" });
    const words = step.words || Object.keys(L.words);
    const grid = tileGrid(words.length);
    words.forEach((w) => {
      const t = wordTile(w);
      t.onclick = () => { t.classList.remove("bounce"); void t.offsetWidth; t.classList.add("bounce"); Audio_.word(w); };
      grid.append(t);
    });
    const first = steps.findIndex((s) => s.block === step.block);
    root.append(h("div", { class: "px-top st-ctop" }, iconBtn("px-x", "✕", "Back to the map", () => showMap()), h("span", { class: "px-prog" }, h("i", { style: "width:100%" }))),
      h("h2", { class: "st-h" }, wordsTitle(step)), h("div", { class: "st-gridwrap" }, grid),
      h("div", { class: "st-cfoot two" }, h("button", { class: "px-btn white", type: "button", onclick: () => go(first) }, "PLAY AGAIN"),
        h("button", { class: "px-btn red", type: "button", onclick: () => endRecap(step) }, "CONTINUE")));
    main.append(root);
    Audio_.sfx("complete");
  };
  /* the recap ends its part (Vocabulary): the part's own Done screen follows, with its stamp (F4) */
  function endRecap(step) {
    const n = steps[idx + 1];
    if (n && n.block === step.block) return next();
    Prog.mark(step.id);
    const label = ((L.plan || []).find((x) => x.id === step.block.id) || {}).label || step.block.name;
    screen("done");
    cleanup = doneScreen({ id: step.id, title: `${label} done!`, block: step.block, scores: step.scores, say: ["Well done!"] }) || null;
  }

  /* ---------- DONE (F4): Kim's head cheering · the passport page of this lesson, the part's stamp drops in · results · again / continue ---------- */
  TYPES.done = (step) => doneScreen(step);
  function doneScreen(step) {
    const meta = lessonMeta(L.id);
    const run = runId;
    const root = h("div", { class: "st st-done" });
    const chips = h("div", { class: "st-scores" });
    (step.scores || []).forEach(([id, label]) => {
      const r = Results.get(id); const n = r ? (r.firstTry != null ? r.firstTry : r.said) : null;
      chips.append(h("span", { class: "st-score" }, h("span", { class: "l" }, label), h("b", {}, r && r.total ? `${n}/${r.total}` : "–")));
    });
    const pct = Prog.pct(step.block);
    const ms = Prog.elapsed(step.block.id);
    /* the stamp: only when every other step of the part is done (the Done step itself can be opened from the teachers' menu) */
    const ready = Prog.blockSteps(step.block).every((s) => s.id === step.id || Prog.isDone(s.id));
    const aw = ready ? Rewards.award(L.id, step.block.id, pct) : null;
    const page = passPage(L, L.id, step.block.id, aw);
    const time = ms ? `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}` : null;
    const stats = h("div", { class: "st-stats" },
      pct != null ? h("div", { class: "st-stat" }, h("small", {}, "CORRECT"), h("b", { class: "g" }, pct + "%")) : null,
      time ? h("div", { class: "st-stat" }, h("small", {}, "TIME"), h("b", { class: "b" }, time)) : null);
    const first = steps.findIndex((s) => s.block === step.block);
    if (page) root.classList.add("has-stamp");
    root.append(navBg(L.bg || (meta && meta.bg)),
      h("div", { class: "st-dmain" },
        h("div", { class: "st-dhead" },
          h("div", { class: "st-cheer" }, kimHead("cheer", "big"), h("span", { class: "st-burst", "aria-hidden": "true" }, ...Array.from({ length: 8 }, (_, q) => h("i", { style: `--a:${q * 45}deg` })))),
          h("h1", { class: "st-dtitle" }, step.title)),
        /* the part's passport stamp (rewards, decision #57) */
        h("div", { class: "st-stamp-slot", "data-slot": "stamp" }, page),
        h("div", { class: "st-dres" }, stats.childNodes.length ? stats : null, chips)),
      h("div", { class: "st-cfoot two" }, h("button", { class: "px-btn white", type: "button", onclick: () => go(first) }, "DO THIS PART AGAIN"),
        h("button", { class: "px-btn red", type: "button", onclick: () => next() }, "CONTINUE")));
    main.append(root);
    Audio_.sfx("complete");
    const head = root.querySelector(".st-cheer");
    const say = (step.say || []).concat(step.title).find((t) => recorded("kim", t)) || step.title;
    head.classList.add("talk"); playSafe(() => kimVoice(say)).then(() => head.classList.remove("talk"));
    /* a new / better stamp: it drops onto the page (thunk), the ink spreads */
    const cur = page && page.querySelector(".rw-stamp.cur");
    if (cur && aw && aw.up) {
      cur.classList.add("pre"); page.classList.add("pre");
      setTimeout(() => { if (!alive(run)) return; cur.classList.remove("pre"); cur.classList.add("drop"); }, 650);
      setTimeout(() => { if (!alive(run)) return; Audio_.sfx("sticker-place"); page.classList.remove("pre"); page.classList.add("thunk"); }, 650 + 330);
    }
  }

  /* ---------- speaking checks used by ANSWER: BE + every food (+ verb), or the short answer ---------- */
  const BE_RX = { he: /\bhe ?'?s\b|\bhe is\b|\bhis\b|\bhes\b/, she: /\bshe ?'?s\b|\bshe is\b|\bshes\b/, i: /\bi ?'?m\b|\bi am\b|\bim\b|\bam\b/ };
  const PRON = { he: "He's", she: "She's", i: "I'm" };
  /* pool: the verbs this step tells apart (default eating / drinking; H3: wearing / holding via step.verbSet) */
  function judgeSentence(alts, subj, foods, verbs, pool = ["eating", "drinking"]) {
    const norm = alts.map((t) => " " + t.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' ]/g, " ") + " ");
    const has = (t, f) => { const w = L.words[f]; return !(w.reject && w.reject.some((x) => t.includes(x))) && w.say.some((k) => t.includes(k)); };
    /* verbs: the -ing words the answer must use (and no other) — "She's drinking ice cream" is the I3/I5 STS Insights error */
    const vx = (v) => new RegExp("\\b" + v.slice(0, -3));   /* word start, so "meat" doesn't count as "eat" */
    const verbOk = (t) => !verbs || (verbs.every((v) => vx(v).test(t)) && pool.filter((v) => !verbs.includes(v)).every((v) => !vx(v).test(t)));
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
  /* ---------- BUBBLES (P1): listen → pop the right bubble (template: Nghe & chọn đáp án) ---------- */
  TYPES.bubbles = function (step, run) {
    const P = practice(step, { cls: "px-listen" });
    const targets = shuffle(step.targets); const res = []; let r = 0;
    const sayT = () => Audio_.word(targets[r]);
    const spk = P.speaker("xl", sayT);
    const grid = h("div", { class: "px-grid round", "data-n": step.options });
    P.body.append(h("div", { class: "px-head" }, spk), h("div", { class: "px-opts" }, grid));
    P.aa(step.instruction || step.intro);
    function optionsFor(t) {
      const set = [t, L.confusable[t]];
      const rest = shuffle(Object.keys(L.words).filter((w) => !set.includes(w)));
      while (set.length < step.options) set.push(rest.pop());
      return shuffle(set);
    }
    const intro = P.intro(step.intro || step.instruction);
    async function round() {
      if (!alive(run)) return;
      if (r >= targets.length) { const score = res.filter(Boolean).length; Results.put(step.id, { firstTry: score, total: targets.length }); return P.finish(score, targets.length, score >= targets.length - 1 ? "Super listening!" : "Good job!"); }
      P.progress(r, targets.length); grid.innerHTML = "";
      const t = targets[r]; let wrong = 0, locked = false;
      optionsFor(t).forEach((w) => {
        const b = h("button", { class: "px-bub", type: "button", "aria-label": "Bubble" }, h("img", { src: img(L.words[w].img), alt: "" }));
        b.dataset.w = w;
        b.onclick = async () => {
          if (locked) return;
          if (w === t) {
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("sticker-place"); b.classList.add("ok");
            grid.querySelectorAll(".px-bub").forEach((x) => x !== b && x.classList.add("fade"));
            await P.sheet({ ok: true, text: L.words[t].label, play: () => Audio_.word(t), auto: async (still) => { await sleep(250); if (still()) await Audio_.word(t); } });
            if (!alive(run)) return; r++; round();
          } else {
            wrong++; locked = true; P.wrong(b);
            await P.retry(); locked = false;
            if (wrong >= 2) grid.querySelector(`[data-w="${t}"]`).classList.add("px-hint");
            P.play(spk, sayT);
          }
        };
        grid.append(b);
      });
      await intro; if (!alive(run)) return;
      P.play(spk, sayT);
    }
    round();
  };

  /* ---------- PICK (P2): hear a sentence → tap 1 of 3 pictures (wrong ones differ by food OR person) ---------- */
  TYPES.pick = function (step, run) {
    const P = practice(step, { cls: "px-listen" });
    const items = shuffle(step.items); const res = []; let r = 0;
    const sayIt = () => Audio_.speak(items[r].say, "narrator");
    const spk = P.speaker("xl", sayIt);
    const grid = h("div", { class: "px-grid cards" });
    P.body.append(h("div", { class: "px-head" }, spk), h("div", { class: "px-opts" }, grid));
    P.aa(step.instruction || step.intro);
    const intro = P.intro(step.intro);
    async function round() {
      if (!alive(run)) return;
      if (r >= items.length) { const score = res.filter(Boolean).length; Results.put(step.id, { firstTry: score, total: items.length }); return P.finish(score, items.length, score >= items.length - 1 ? "Super listening!" : "Good job!"); }
      P.progress(r, items.length); grid.innerHTML = "";
      const it = items[r]; let wrong = 0, locked = false;
      grid.dataset.n = it.opts.length;
      shuffle(it.opts.map((o, k) => k)).forEach((k) => {
        const b = h("button", { class: "px-card", type: "button", "aria-label": "Picture " + (k + 1) }, h("img", { src: img(it.opts[k]), alt: "" }));
        b.dataset.k = k;
        b.onclick = async () => {
          if (locked) return;
          if (k === it.answer) {
            locked = true; res[r] = wrong === 0;
            Audio_.sfx("name-reveal"); b.classList.add("ok");
            grid.querySelectorAll(".px-card").forEach((x) => x !== b && x.classList.add("fade"));
            await P.sheet({ ok: true, text: it.say, play: sayIt, auto: async (still) => { await sleep(250); if (still()) await sayIt(); } });
            if (!alive(run)) return; r++; round();
          } else {
            wrong++; locked = true; P.wrong(b);
            await P.retry(); locked = false;
            if (wrong >= 2) grid.querySelector(`[data-k="${it.answer}"]`).classList.add("px-hint");
            P.play(spk, sayIt);
          }
        };
        grid.append(b);
      });
      await intro; if (!alive(run)) return;
      P.play(spk, sayIt);
    }
    round();
  };

  /* ---------- NAMES (P3): hear "What is Nick eating? — He's eating…" → tap the right friend, the name goes there ---------- */
  TYPES.names = function (step, run) {
    const P = practice(step, { cls: "px-listen px-names" });
    const rounds = shuffle(step.rounds); const res = []; let r = 0;
    const sayIt = async () => { const it = rounds[r]; await Audio_.speak(it.q, "narrator"); await sleep(150); await Audio_.speak(it.a, "kim"); };
    const spk = P.speaker("lg", sayIt);
    const tag = h("span", { class: "px-chip px-name" });
    const grid = h("div", { class: "px-grid kids", "data-n": step.kids.length });
    P.body.append(h("div", { class: "px-head row" }, spk, tag), h("div", { class: "px-opts" }, grid));
    P.aa(step.instruction || step.intro);
    const kidEls = {};
    shuffle(step.kids).forEach((k) => {
      const b = h("button", { class: "px-card kid", type: "button", "aria-label": "Friend" }, h("img", { src: img(k.img), alt: "" }), h("span", { class: "px-ktag" }));
      b.dataset.k = k.id; kidEls[k.id] = b; grid.append(b);
    });
    let wrong = 0, locked = true;
    const intro = P.intro(step.intro);
    async function round() {
      if (!alive(run)) return;
      if (r >= rounds.length) { const score = res.filter(Boolean).length; Results.put(step.id, { firstTry: score, total: rounds.length }); return P.finish(score, rounds.length, score >= rounds.length - 1 ? "Super listening!" : "Good job!"); }
      P.progress(r, rounds.length); wrong = 0;
      const it = rounds[r];
      tag.textContent = it.name; tag.animate([{ transform: "scale(.7)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300 });
      Object.values(kidEls).forEach((b) => b.classList.remove("px-hint"));
      await intro; if (!alive(run)) return;
      locked = false; P.play(spk, sayIt);
    }
    Object.values(kidEls).forEach((b) => {
      b.onclick = async () => {
        if (locked || r >= rounds.length || b.classList.contains("named")) return;
        const it = rounds[r];
        if (b.dataset.k === it.kid) {
          locked = true; res[r] = wrong === 0;
          Audio_.sfx("name-reveal"); b.classList.add("named"); b.querySelector(".px-ktag").textContent = it.name;
          await P.sheet({ ok: true, text: it.a, play: sayIt });
          if (!alive(run)) return; r++; round();
        } else {
          wrong++; locked = true; P.wrong(b);
          await P.retry(); locked = false;
          if (wrong >= 2) kidEls[it.kid].classList.add("px-hint");
          P.play(spk, sayIt);
        }
      };
    });
    round();
  };

  /* ---------- SPEAKING (P10–P13: say · lid · answer · race) — one flow for every speaking screen ----------
   * item → Kim asks (voice) → the mic opens by itself → keyword check (the same checks as before).
   * Wrong → Kim's hint (voice + one short line over the mic) → mic again; 2nd miss → "Almost!" sheet with the model answer.
   * Silence ≈5 s after the prompt → the mic pulses, "Your turn! Tap and say it.", the prompt plays once more.
   * No mic on this device / browser → say it out loud, then tap the mic → model answer (as the old "Check").
   * "Can't speak now" → the rest of this exercise is skipped without penalty: only the items done are scored. */
  const SR_OFF = ["not-allowed", "service-not-allowed", "audio-capture", "network"];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function speaking(step, run, P, cfg) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let mode = SR ? "mic" : "self";
    const items = cfg.items, res = [], spk = cfg.speaker;
    let r = 0, tries = 0, quiet = 0, nudged = false, rec = null, tok = 0, silT = 0, busy = true, asking = false;
    const live = (tk) => alive(run) && tk === tok;
    const F = P.micFoot();
    const note = h("div", { class: "px-note", hidden: true }, "Thiết bị này chưa cho dùng micro — HV nói to, rồi bấm micro để nghe câu mẫu.");
    P.body.prepend(note);
    const SELF_LINE = "Say it out loud. Then tap the mic!";
    function setSelf() {
      if (mode !== "self") { mode = "self"; stopRec(); }
      note.hidden = false; F.mic.classList.add("self"); F.mic.setAttribute("aria-label", "I said it — tap to check");
      if (!busy) F.line(SELF_LINE, "blue");
    }
    function stopRec() { if (rec) { const x = rec; rec = null; try { x.abort(); } catch (e) {} } F.listening(false); }
    const ask = (it) => P.play(spk, () => cfg.ask(it, mode));
    function armSilence(it, tk) {
      clearTimeout(silT);
      silT = setTimeout(async () => {
        if (!live(tk) || busy) return;
        F.pulse(true); F.line(mode === "self" ? "Your turn! Say it, then tap the mic." : "Your turn! Tap and say it.", "blue");
        if (nudged) return;
        nudged = true; quiet = Math.max(quiet, 1); stopRec();
        await ask(it);
        if (live(tk) && !busy && mode === "mic") listen(it, tk);
      }, 5000);
    }
    function listen(it, tk) {
      stopRec(); Audio_.stop();
      const R = new SR(); rec = R;
      R.lang = "en-GB"; R.interimResults = false; R.maxAlternatives = 5; R.continuous = false;
      let got = false;
      F.listening(true);
      R.onspeechstart = () => { if (rec !== R) return; clearTimeout(silT); F.pulse(false); F.line(""); };
      R.onresult = (e) => {
        if (rec !== R || !live(tk)) return;
        got = true; F.listening(false); clearTimeout(silT); F.pulse(false);
        const alts = []; for (const x of e.results) for (const a of x) alts.push(a.transcript);
        const v = cfg.judge(alts, it);
        if (v === true) { res[r] = tries === 0; return reveal(it, tk, true); }
        tries++; Audio_.sfx("practice-wrong");
        if (tries >= 2) { res[r] = false; return reveal(it, tk, false); }
        retry(it, tk, v);
      };
      R.onerror = (e) => { if (rec !== R) return; F.listening(false); if (SR_OFF.includes(e.error)) setSelf(); };
      R.onend = () => {
        if (rec !== R || !live(tk)) return;
        F.listening(false); rec = null;
        if (got || mode !== "mic" || busy) return;
        quiet++;
        if (quiet <= 1) retry(it, tk, "I can't hear you. Say it again!");
        else { F.line("Tap the mic and say it!", "blue"); F.pulse(true); }
      };
      /* safety: never leave the mic open too long */
      setTimeout(() => { if (rec === R) { try { R.stop(); } catch (e) {} } }, cfg.maxMs || 8000);
      try { R.start(); } catch (e) { F.listening(false); setSelf(); }
    }
    async function retry(it, tk, msg) {
      busy = true; clearTimeout(silT); F.line(msg, "red");
      await P.voice(msg); await sleep(250);
      if (!live(tk)) return;
      busy = false;
      if (mode === "mic") listen(it, tk);
      armSilence(it, tk);
    }
    async function reveal(it, tk, good) {
      busy = true; stopRec(); clearTimeout(silT); F.pulse(false); F.line("");
      if (cfg.onReveal) cfg.onReveal(it, good);
      Audio_.sfx(good ? "name-reveal" : "sticker-place");
      const k = r, model = cfg.model(it);
      if (good) await P.sheet({ ok: true, text: model, play: () => cfg.playModel(it),
        auto: async (still) => { await sleep(400); if (!still()) return; await cfg.playModel(it); await sleep(150); if (still()) await Audio_.speak(cfg.praise[k % cfg.praise.length], "kim"); } });
      else await P.sheet({ ok: false, title: "Almost!", html: "Correct answer: <u>" + esc(model) + "</u>", button: "GOT IT",
        auto: async (still) => { await sleep(400); for (const l of cfg.missLines ? cfg.missLines(it) : [null]) { if (!still()) return; await (l ? Audio_.speak(l, "kim") : cfg.playModel(it)); await sleep(120); } } });
      if (!live(tk)) return;
      r++; show();
    }
    async function show() {
      if (!alive(run)) return;
      if (r >= items.length) return finish();
      const tk = ++tok; const it = items[r];
      tries = 0; quiet = 0; nudged = false; busy = true; stopRec(); clearTimeout(silT);
      F.pulse(false); F.line("");
      P.progress(r, items.length); P.aa(cfg.aa(it));
      P.root.__model = cfg.model(it);           /* test hook (JS property only, not in the page) */
      await cfg.paint(it, tk, true);            /* Snack Machine spins here */
      if (!live(tk)) return;
      F.mic.onclick = () => {
        if (busy && !asking) return;
        if (asking) { asking = false; busy = false; Audio_.stop(); }   /* the child may answer before Kim has finished asking */
        clearTimeout(silT); F.pulse(false);
        if (mode === "self") { res[r] = true; return reveal(it, tk, true); }
        quiet = 0; F.line(""); listen(it, tk);
      };
      spk.onclick = async () => {
        if (busy) return;
        stopRec(); clearTimeout(silT);
        await ask(it);
        if (!live(tk) || busy) return;
        if (mode === "mic") listen(it, tk);
        armSilence(it, tk);
      };
      asking = true; await ask(it);
      if (!live(tk) || !asking) return;
      asking = false; busy = false;
      if (mode === "mic") listen(it, tk); else F.line(SELF_LINE, "blue");
      armSilence(it, tk);
    }
    function finish() {
      stopRec(); clearTimeout(silT); busy = true;
      const score = res.filter(Boolean).length;
      Results.put(step.id, Object.assign({ said: score, total: items.length, mode }, cfg.extra ? cfg.extra() : {}));
      P.finish(score, items.length, cfg.doneLine);
    }
    /* "Can't speak now": skip the rest of this exercise, no penalty */
    F.cant.onclick = () => {
      tok++; stopRec(); clearTimeout(silT); Audio_.stop();
      const said = res.slice(0, r).filter(Boolean).length;
      Results.put(step.id, Object.assign({ said, total: r, skipped: items.length - r, mode: "skipped" }, cfg.extra ? cfg.extra() : {}));
      next();
    };
    if (mode === "self") setSelf();
    /* the first item is on screen (dimmed) while Kim reads the instruction — never an empty frame */
    cfg.paint(items[0], 0, false); P.progress(0, items.length); P.aa(cfg.aa(items[0]));
    (async () => { await P.intro(cfg.intro); await sleep(250); if (alive(run)) show(); })();
    return {
      cleanup: () => { tok++; stopRec(); clearTimeout(silT); },
      /* pause the mic for a hint sound (💡), then listen again */
      async hold(fn) {
        if (busy) return;
        const tk = tok; stopRec(); clearTimeout(silT); await playSafe(fn);
        if (live(tk) && !busy && mode === "mic") listen(items[r], tk);
      }
    };
  }

  /* ---------- SAY (P10): picture → the child says the word ---------- */
  TYPES.say = function (step, run) {
    const P = practice(step, { cls: "px-speak" });
    const spk = P.speaker("md");
    const pic = h("img", { alt: "" });
    P.body.append(h("div", { class: "px-head" }, spk), h("div", { class: "px-stage" }, h("div", { class: "px-obj big" }, pic)));
    function matches(list, w) {
      const word = L.words[w];
      return list.some((t) => {
        const s = " " + t.toLowerCase().replace(/[^a-z ]/g, " ") + " ";
        if (word.reject && word.reject.some((x) => s.includes(x))) return false;
        return word.say.some((k) => s.includes(k));
      });
    }
    return speaking(step, run, P, {
      items: shuffle(step.items), speaker: spk, intro: step.intro || step.instruction, maxMs: 7000,
      doneLine: step.doneLine || "Well done! You said all the food words!", praise: ["Great!", "Well done!", "Yes!", "Super!"],
      aa: () => step.instruction || step.ask || "What's this?",
      paint: (w, tk, anim) => { pic.src = img(L.words[w].img); if (anim) pic.animate([{ transform: "scale(.7)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "ease-out" }); },
      ask: (w, mode) => Audio_.speak(mode === "mic" ? (step.ask || "What's this?") : "What's this? Say it out loud!", "kim"),
      judge: (alts, w) => matches(alts, w) || "Hmm… try again!",
      model: (w) => L.words[w].label,
      playModel: (w) => Audio_.word(w),
      missLines: () => ["Listen!", null, "Say it with me next time!"]
    }).cleanup;
  };

  /* ---------- LID (P11): shadow on the plate → full sentence (BE + food) → the lid lifts · Snack Machine (style "slot") ---------- */
  TYPES.lid = function (step, run) {
    const slot = step.style === "slot";
    const P = practice(step, { cls: "px-speak" + (slot ? " px-snack" : "") });
    const pron = { he: "He", she: "She", i: "I" };
    const BE = { he: /\bhe ?'?s\b|\bhe is\b|\bhis\b|\bhes\b/, she: /\bshe ?'?s\b|\bshe is\b|\bshes\b|\bshe was\b/, i: /\bi ?'?m\b|\bi am\b|\bim\b|\bam\b/ };
    /* random kid × food each attempt (anti-memory) */
    const boys = shuffle(step.boys), girls = shuffle(step.girls), foods = shuffle(step.foods);
    const items = shuffle(step.subjects).map((s, k) => ({ s, f: foods[k], kid: s === "he" ? boys.pop() : s === "she" ? girls.pop() : step.me }));
    const spk = P.speaker("md");
    const kid = h("img", { alt: "" });
    const shadow = h("img", { class: "shadow", alt: "" }), food = h("img", { class: "lfood", alt: "" });
    const plate = h("div", { class: "px-plate" + (slot ? " slot" : "") }, food, shadow, h("div", { class: "px-lidtop" }));
    /* 💡 hint: shows (and says) the food word, so a child who can't read the shadow can still build the sentence */
    const bulb = h("button", { class: "px-bulb", type: "button", "aria-label": "Hint", hidden: true }, "💡");
    const wordChip = h("div", { class: "px-chip px-wordchip", hidden: true });
    const kidBox = h("div", { class: "px-kidbox" }, kid);
    P.body.append(h("div", { class: "px-head" }, spk),
      h("div", { class: "px-stage px-lid" }, kidBox, h("div", { class: "px-platebox" }, plate, bulb, wordChip)));
    let hints = 0;
    const verbOf = (f) => L.words[f].verb || "eating";
    const model = (it) => `${pron[it.s]}${it.s === "i" ? "'m" : "'s"} ${verbOf(it.f)} ${L.words[it.f].label}.`;
    function judge(alts, it) {
      const norm = alts.map((t) => " " + t.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' ]/g, " ") + " ");
      const w = L.words[it.f];
      const hasFood = (t) => !(w.reject && w.reject.some((x) => t.includes(x))) && w.say.some((k) => t.includes(k));
      const vb = verbOf(it.f), other = vb === "eating" ? "drinking" : "eating";
      const verbOk = (t) => !step.checkVerb || (new RegExp("\\b" + vb.slice(0, -3)).test(t) && !new RegExp("\\b" + other.slice(0, -3)).test(t));
      if (norm.some((t) => BE[it.s].test(t) && hasFood(t) && verbOk(t))) return true;
      if (step.checkVerb && norm.some((t) => hasFood(t) && !verbOk(t))) return "Eating or drinking? Try again!";   /* "drinking ice cream" — the I3 STS Insights error */
      if (norm.some(hasFood)) return it.s === "i" ? "Don't forget “am”! Say the full sentence." : "Don't forget “is”! Say the full sentence.";   /* food right, BE missing */
      return "Look at the shadow again. Try again!";
    }
    function paint(it) {
      kid.src = img(it.kid); kidBox.classList.toggle("me", it.s === "i");
      food.src = img(L.words[it.f].img);
      shadow.src = slot ? img(L.words[it.f].img) : img("shadow-" + it.f);
      plate.classList.remove("open");
      wordChip.hidden = true; wordChip.textContent = L.words[it.f].label; bulb.dataset.f = it.f;
    }
    /* Snack Machine: person and item roll like a slot machine, then stop */
    async function spin(it, tk) {
      const pool = shuffle(step.foods), kidsPool = shuffle(step.boys.concat(step.girls));
      Audio_.sfx("region-enter");
      for (let k = 0; k < 12; k++) {
        if (!alive(run)) return;
        shadow.src = img(L.words[pool[k % pool.length]].img); kid.src = img(kidsPool[k % kidsPool.length]); kidBox.classList.remove("me");
        await sleep(60 + k * 12);
      }
      paint(it); Audio_.sfx("sticker-place");
    }
    const ctl = speaking(step, run, P, {
      items, speaker: spk, intro: step.intro, maxMs: 8000,
      doneLine: "Well done! Great sentences!", praise: ["Great!", "Well done!", "Super!"],
      aa: () => step.instruction || step.intro,
      paint: async (it, tk, live) => {
        paint(it); bulb.hidden = !live; bulb.classList.remove("used");
        if (live) kidBox.parentNode.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 300 });
        if (live && slot) await spin(it, tk);
      },
      ask: (it) => Audio_.speak(it.s === "he" ? "Look at him!" : it.s === "she" ? "Look at her!" : "Look! It's you!", "kim"),
      judge, model, playModel: (it) => Audio_.speak(model(it), it.s === "i" ? "kim" : "narrator"),
      onReveal: () => { plate.classList.add("open"); bulb.hidden = true; wordChip.hidden = true; },
      extra: () => ({ hints })
    });
    bulb.onclick = () => {
      if (!bulb.classList.contains("used")) hints++;
      bulb.classList.add("used"); wordChip.hidden = false;
      wordChip.animate([{ opacity: 0, transform: "translate(-50%,8px) scale(.8)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 300 });
      ctl.hold(() => Audio_.word(bulb.dataset.f));
    };
    return ctl.cleanup;
  };

  /* ---------- ANSWER (P12) + RACE HOME (P13, step.board): Kim asks → full sentence (BE + every food) or short answer ---------- */
  TYPES.answer = function (step, run) {
    const P = practice(step, { cls: "px-speak" + (step.board ? " px-race" : "") });
    const spk = P.speaker("md");
    const pic = h("div", { class: "px-stage" });
    const head = h("div", { class: "px-head" });
    let board = null, token = null, pawnAt = 0;
    if (step.board) {
      board = h("div", { class: "px-board", "aria-label": "Race home" });
      for (let k = 0; k <= step.items.length; k++) board.append(h("span", { class: k === step.items.length ? "home" : "" }, k === step.items.length ? "🏠" : String(k + 1)));
      token = h("img", { class: "px-token", src: ver("assets/common/kim/kim-head-cheer.webp"), alt: "" });
      board.firstChild.append(token);
      head.append(board);
    }
    head.append(spk);
    P.body.append(head, pic);
    const movePawn = () => {
      if (!board) return;
      board.children[pawnAt].classList.add("on");
      pawnAt = Math.min(pawnAt + 1, step.items.length); board.children[pawnAt].append(token);
      token.animate([{ transform: "translate(-50%,-14px) scale(1.2)" }, { transform: "translate(-50%,0)" }], { duration: 400 });
    };
    const items = shuffle(step.items).map((it) => Object.assign({}, it, { foods: it.foods || it.plate || (it.parts ? it.parts.flatMap((p) => p.foods) : []) }));
    const join = (fs) => fs.map((f) => L.words[f].label).join(" and ");
    const vOf = (f) => L.words[f].verb || "eating";
    /* parts: one sentence per verb — "She's eating rice. She's drinking milk." (same verb → one sentence with "and") */
    const partsOf = (it) => it.parts || [{ verb: it.verb || vOf(it.foods[0]), foods: it.foods }];
    const model = (it) => it.short ? it.short : partsOf(it).map((p) => `${PRON[it.s]} ${p.verb} ${join(p.foods)}.`).join(" ");
    function paintPic(it) {
      pic.innerHTML = "";
      if (it.plate) {
        /* "What are you eating?": the hand points at the child, the plate shows the food */
        const pl = h("div", { class: "px-aplate" }); it.plate.forEach((f) => pl.append(h("img", { src: img(L.words[f].img), alt: "" })));
        pic.append(h("div", { class: "px-me" }, h("img", { class: "hand", src: img(it.img), alt: "" }), pl));
      } else pic.append(picture(it.img, "photo"));
    }
    return speaking(step, run, P, {
      items, speaker: spk, intro: step.intro, maxMs: 9000,
      doneLine: "Well done! You can ask and answer!", praise: ["Great answer!", "Well done!", "Super!"],
      aa: (it) => it.q,
      paint: (it, tk, live) => { paintPic(it); if (live) pic.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 300 }); },
      ask: (it) => Audio_.speak(it.q, "kim"),
      judge: (alts, it) => {
        const verbs = step.checkVerb ? [...new Set(partsOf(it).map((p) => p.verb))] : null;
        const v = it.short ? judgeShort(alts, it) : judgeSentence(alts, it.s, it.foods, verbs, step.verbSet);
        if (v === "ok") return true;
        /* alsoOk: other things in the picture that are right too (H1: "He's wearing a T-shirt" when the model says trousers) */
        if (!it.short && it.alsoOk && it.alsoOk.some((f) => judgeSentence(alts, it.s, [f], verbs, step.verbSet) === "ok")) return true;
        return v === "verb" ? (step.verbLine || "Eating or drinking? Try again!") : v === "yn" ? "Yes or no? Look again!" : v === "short" ? (it.short.startsWith("Yes") ? `Say: Yes, ${it.s} is!` : `Say: No, ${it.s} isn't!`)
          : v === "be" ? `Full sentence, please! ${PRON[it.s]} ${partsOf(it)[0].verb}…`
          : v === "more" ? (step.moreLine || "Good! Say all the food on the plate!") : (step.foodLine || "Look at the picture again. Try again!");
      },
      model, playModel: (it) => Audio_.speak(model(it), "narrator"),
      onReveal: (it, good) => { if (good) movePawn(); }
    }).cleanup;
  };

  /* ======================= Rewards (milestone 6 · decision #57): stamps · pick a reward · my street · passport =======================
   * Every picture, name and line comes from data: the catalog (unit logo / street / rewards) and the lesson packs
   * (the stamp picture = the part's roadmap milestone picture; the line a stamp / cart plays = a recorded line of that part). */
  const INK_NAME = { blue: "BLUE", silver: "SILVER", gold: "GOLD" };
  const recorded = (who, t) => !!(t && window.VOICE && window.VOICE[who + "|" + String(t).trim()]);
  /* Kim says the first of these lines that has a recording (no new audio: nothing is said when none has) */
  function kimLine(cands, el) {
    const t = cands.find((x) => recorded("kim", x));
    if (!t) return Promise.resolve();
    if (el) el.classList.add("talk");
    return playSafe(() => kimVoice(t)).then(() => { if (el) el.classList.remove("talk"); });
  }
  const lessonNo = (lid) => { const m = lessonMeta(lid); return m ? m.unit.lessons.findIndex((l) => l.id === lid) + 1 : 0; };
  const rewardOf = (lid) => { const c = Rewards.cart(lid), m = lessonMeta(lid); return (c && m && (m.rewards || []).find((r) => r.id === c.id)) || null; };
  const boldStars = (s) => esc(s).replace(/\*(.+?)\*/g, "<b>$1</b>");

  /* lesson packs opened outside the lesson (passport, street, demo): loaded once, with their recorded voice */
  const packs = new Map();
  async function packOf(lid) {
    if (L.id === lid) return L;
    if (packs.has(lid)) return packs.get(lid);
    const meta = lessonMeta(lid);
    if (!meta || !meta.ready) return null;
    const keep = window.LESSON; window.LESSON = null;
    await loadScript(meta.file);
    const p = window.LESSON; window.LESSON = keep;
    if (!p) return null;
    await loadScript(meta.file.replace(/\.js$/, ".voice.js"));
    packs.set(lid, p);
    return p;
  }
  const imgOf = (p, name) => ver((String(name).startsWith("@") ? "assets/" + name.slice(1) : p.img + name) + ".webp");
  const planOf = (p) => (p.plan || p.blocks.map((b) => ({ id: b.id, label: b.name }))).filter((n) => !n.soon && p.blocks.some((b) => b.id === n.id));
  const stepsOf = (p) => { const out = []; p.blocks.forEach((b) => b.steps.forEach((s) => { if (!(s.skill && !(p.skills || []).includes(s.skill))) out.push(Object.assign({ block: b }, s)); })); return out; };
  const wordSrc = (p, id) => { const a = p.words[id].audio; return (a.startsWith("@") ? "assets/" + a.slice(1) : p.aud + a) + ".mp3"; };
  const stampLabel = (n) => n.stamp || (n.id === "vocab" ? "VOCAB" : String(n.label).toUpperCase());
  /* the line a stage's stamp replays (optional override: plan[n].key = { text, who }):
   * grammar → the first Explore card · Let's Talk → the first question + answer · vocabulary → the first word of the Watch
   * · otherwise the first model sentence of the Watch (a line with a sentence strip) · last resort: the first word */
  function keyLine(p, pid, avoid) {
    const fresh = (t) => !(avoid && avoid.has(t));
    const n = planOf(p).find((x) => x.id === pid) || {};
    if (n.key) return n.key;
    const b = p.blocks.find((x) => x.id === pid);
    if (!b) return null;
    const ss = b.steps.filter((s) => !(s.skill && !(p.skills || []).includes(s.skill)));
    const ch = ss.find((s) => s.type === "chunks" && (s.cards || []).length);
    if (ch) { const c = ch.cards.find((x) => fresh(x.short)) || ch.cards[0]; return { text: c.short, who: c.who || "narrator" }; }
    const qa = ss.find((s) => s.type === "qa" && (s.cards || []).length);
    if (qa) { const c = qa.cards[0]; return { text: c.q, who: "narrator", then: { text: c.a, who: "kim" } }; }
    const w = ss.find((s) => s.type === "watch"), cues = (w && w.cues) || [];
    const food = cues.find((q) => q.food && p.words[q.food]);
    if (food) return { word: food.food, text: p.words[food.food].label };
    const okLine = (q) => q.strip && q.line && !/…/.test(q.line.text) && !/^Look\b/.test(q.line.text);
    const line = cues.find((q) => okLine(q) && fresh(q.line.text)) || cues.find(okLine);
    if (line) return { text: line.line.text, who: line.line.who || "narrator" };
    const rc = ss.find((s) => s.type === "recap"), wid = (rc && rc.words && rc.words[0]) || Object.keys(p.words)[0];
    return wid ? { word: wid, text: p.words[wid].label } : null;
  }
  const keyText = (k) => (k ? (k.then ? k.text + " " + k.then.text : k.text) : "");
  const playKey = (p, k) => (!k ? Promise.resolve() : k.word ? Audio_.file(wordSrc(p, k.word))
    : Audio_.speak(k.text, k.who).then(() => (k.then ? sleep(250).then(() => Audio_.speak(k.then.text, k.then.who)) : null)));
  /* the sentence a lesson's cart says on the street: the lesson's first grammar model sentence
   * (avoid = sentences earlier carts already say: a reading lesson that reuses the same cards takes its next card) */
  const streetLine = (p, avoid) => { const pl = planOf(p); const n = pl.find((x) => x.id === "grammar") || pl[1] || pl[0]; return n ? keyLine(p, n.id, avoid) : null; };

  /* ---- a stage stamp: dashed ink ring · the stage's milestone picture · label; ink = blue / silver / gold. Tap = hear its line ---- */
  const ROT = [-7, 5, -3];
  function stampEl(p, lid, n, k, st) {
    const el = h(st ? "button" : "span", { class: "rw-stamp " + (st ? "ink-" + st.ink : "empty"), style: `--rot:${ROT[k % 3]}deg`, type: st ? "button" : null,
      "aria-label": st ? `${n.label} · ${INK_NAME[st.ink].toLowerCase()} stamp` : `${n.label} · no stamp yet` },
      h("span", { class: "ring" }), st ? h("span", { class: "pic", style: `background-image:url("${imgOf(p, n.frame || n.img)}")` }) : null,
      h("span", { class: "lab" }, stampLabel(n)), st ? h("span", { class: "spread", "aria-hidden": "true" }) : null);
    if (st) el.onclick = () => {
      el.classList.remove("tap"); void el.offsetWidth; el.classList.add("tap", "playing");
      playSafe(() => playKey(p, keyLine(p, n.id))).then(() => el.classList.remove("playing"));
    };
    return el;
  }
  /* the lesson's passport page (Done screen): one stamp place per stage, the current stage marked */
  function passPage(p, lid, cur) {
    const meta = lessonMeta(lid);
    if (!meta) return null;
    const page = h("div", { class: "rw-page" }, h("span", { class: "rw-ptag" }, `PASSPORT · UNIT ${meta.unit.id} · LESSON ${lessonNo(lid)}`));
    const row = h("div", { class: "rw-prow" });
    planOf(p).forEach((n, k) => { const el = stampEl(p, lid, n, k, Rewards.stamp(lid, n.id)); if (n.id === cur) el.classList.add("cur"); row.append(el); });
    page.append(row);
    const st = Rewards.stamp(lid, cur);
    if (st) page.append(h("span", { class: "rw-inkchip ink-" + st.ink }, `${INK_NAME[st.ink]} STAMP`));
    return page;
  }
  /* a unit logo: the round badge + its ribbon text (written in CSS, so every unit's art can leave the ribbon empty) */
  const logoEl = (u, cls = "") => h("span", { class: "rw-logo " + cls }, h("img", { src: ver(u.logo.img), alt: "" }), h("span", { class: "rw-ltext" }, u.logo.text || ""));

  /* ---- R1 · lesson finished → pick one reward (only once; offered again on the next visit if skipped) ---- */
  const pickLater = new Set();
  function showPick(lid, o = {}) {
    const meta = lessonMeta(lid), u = meta && meta.unit, opts = (meta && meta.rewards) || [];
    const leave = o.back || (() => showUnit(u.id));
    if (!opts.length) return leave();
    screen("pick");
    try { history.replaceState(null, "", "#" + lid.toLowerCase()); } catch (e) {}
    let sel = o.change ? (Rewards.cart(lid) || {}).id || null : null;
    const add = h("button", { class: "px-btn red", type: "button", disabled: !sel }, u.rewardButton || "ADD TO MY STREET");
    const grid = h("div", { class: "rw-opts" });
    opts.forEach((r) => {
      const b = h("button", { class: "rw-opt" + (r.id === sel ? " sel" : ""), type: "button", "aria-pressed": String(r.id === sel) },
        h("span", { class: "p" }, h("img", { src: ver(r.img), alt: "" })), h("span", { class: "t" }, r.name), h("span", { class: "ok", "aria-hidden": "true" }, "✓"));
      b.onclick = () => {
        sel = r.id; add.disabled = false; Audio_.sfx("region-enter");
        grid.querySelectorAll(".rw-opt").forEach((x) => { x.classList.toggle("sel", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      };
      grid.append(b);
    });
    add.onclick = () => { if (!sel) return; Rewards.setCart(lid, sel); showUnitPage(u.id, { arrive: lid, back: o.pageBack || leave }); };
    const kim = h("div", { class: "rw-pkim" }, kimHead("cheer"));
    const root = h("div", { class: "st rw-pick" }, navBg(u.bg),
      h("div", { class: "rw-pin" },
        h("div", { class: "rw-ptop" }, iconBtn("px-x", "✕", o.change ? "Back" : "Not now", () => { if (!o.change) pickLater.add(lid); leave(); })),
        h("div", { class: "rw-phead" }, kim, h("div", { class: "rw-ptext" },
          h("span", { class: "nv-tag" }, o.change ? `LESSON ${lessonNo(lid)}` : `LESSON ${lessonNo(lid)} COMPLETE!`), h("h1", {}, u.rewardPrompt || "Pick a reward!"))),
        h("div", { class: "rw-optwrap" }, grid),
        h("div", { class: "st-cfoot" }, add)));
    main.append(root);
    if (!o.change) { Audio_.sfx("complete"); kimLine([L.id === lid && L.finishLine, "Super!"], kim); }
  }

  /* ---- R2 + passport unit page: my street (one spot per lesson, the picked cart stands on it) · the stamps of every lesson ---- */
  async function showUnitPage(uid, o = {}) {
    const u = CAT.units.find((x) => x.id === uid);
    if (!u || !u.street) return showPassport();
    screen("street");
    try { history.replaceState(null, "", "#passport-" + uid.toLowerCase()); } catch (e) {}
    const run = runId, S = u.street, ls = u.lessons || [];
    const back = o.back || showPassport;
    const filled = ls.filter((l) => Rewards.cart(l.id)).length;
    main.append(navBg(u.bg), navTop(S.title || `Unit ${u.id}`, back, h("span", { class: "rw-count" }, `${filled} / ${ls.length}`)));
    const page = h("div", { class: "nv-scroll rw-upage" });
    /* the street: a wide picture; phones scroll it sideways (snapping to the spots), wide screens see all of it */
    const pic = h("img", { class: "rw-simg", src: ver(S.img), alt: "" });
    const cv = h("div", { class: "rw-scv" }, pic);
    const vp = h("div", { class: "rw-svp" }, cv);
    const arL = iconBtn("rw-sarrow l", UI.back, "Scroll left", () => vp.scrollBy({ left: -G.Wi * 0.19, behavior: "smooth" }));
    const arR = iconBtn("rw-sarrow r", UI.back, "Scroll right", () => vp.scrollBy({ left: G.Wi * 0.19, behavior: "smooth" }));
    const street = h("div", { class: "rw-street" }, vp, arL, arR);
    const bub = h("div", { class: "rw-bub", hidden: true }, h("span", { class: "spk", html: ICON3.speaker }), h("span", { class: "tx px-read" }));
    const spots = ls.map((l, k) => {
      const rw = rewardOf(l.id), [x, y] = S.spots[k] || [50 + (k - 2) * 18, 74];
      const el = rw ? h("button", { class: "rw-cart", type: "button", "aria-label": `Lesson ${k + 1} · ${rw.name}` }, h("span", { class: "sh", "aria-hidden": "true" }), h("img", { src: ver(rw.img), alt: "" }))
        : h("span", { class: "rw-spot" }, "L" + (k + 1));
      const tag = rw ? h("span", { class: "rw-ctag" }, "L" + (k + 1)) : null;
      const snap = h("i", { class: "rw-snap", "aria-hidden": "true" });
      cv.append(snap, el); if (tag) cv.append(tag);
      const s = { l, k, x, y, rw, el, tag, snap };
      if (rw) el.onclick = () => talk(s);
      return s;
    });
    cv.append(bub);
    let G = { Wi: 0, Hi: 0, crop: 0 }, bubT = 0, bubFor = null;
    /* tapping a cart on the street: a little bounce + a soft sound (no sentence — Thanh 11-18) */
    async function talk(s) {
      if (!alive(run) || !s) return;
      center(s.k, true);
      s.el.classList.remove("talk"); void s.el.offsetWidth; s.el.classList.add("talk");
      Audio_.sfx("region-enter");
      await new Promise((r) => setTimeout(r, 700));
      if (alive(run)) s.el.classList.remove("talk");
    }
    function placeBub() {
      const s = bubFor; if (!s || bub.hidden) return;
      const bw = bub.offsetWidth, bh = bub.offsetHeight;
      const left = clampN(bw / 2 + 8, s.cx, G.Wi - bw / 2 - 8);
      const top = Math.max(G.crop + bh + 8, s.top + s.side * 0.06);
      bub.style.left = left + "px"; bub.style.top = top + "px";
      bub.style.setProperty("--tail", clampN(14, s.cx - (left - bw / 2), bw - 14) + "px");
    }
    function center(k, smooth) { const s = spots[k]; if (s && s.cx != null) vp.scrollTo({ left: s.cx - vp.clientWidth / 2, behavior: smooth ? "smooth" : "auto" }); }
    function arrows() {
      const max = vp.scrollWidth - vp.clientWidth;
      arL.hidden = !(max > 4 && vp.scrollLeft > 4);
      arR.hidden = !(max > 4 && vp.scrollLeft < max - 4);
    }
    vp.addEventListener("scroll", arrows, { passive: true });
    /* under the street: the five spots (gold = filled; tap = go there) · the goal or the logo */
    const slots = h("div", { class: "rw-slots" });
    ls.forEach((l, k) => {
      const on = !!Rewards.cart(l.id);
      slots.append(h("button", { class: "rw-slot" + (on ? " on" : ""), type: "button", "aria-label": `Lesson ${k + 1}` + (on ? " · " + rewardOf(l.id).name : " · empty"), onclick: () => (on ? talk(spots[k]) : center(k, true)) }, "L" + (k + 1)));
    });
    const won = Rewards.logo(uid);
    const goal = h("div", { class: "rw-goal" + (won ? " won" : "") }, won && u.logo ? logoEl(u, "sm") : null,
      h("span", { html: boldStars(won ? `You got the *${u.nick || u.title} logo*!` : u.rewardGoal || "") }));
    const below = h("div", { class: "rw-below" }, slots, goal);
    /* every lesson: its three stage stamps, its reward (with a small "Change") */
    const lgrid = h("div", { class: "rw-lgrid" });
    page.append(street, below, h("section", { class: "rw-sbox" }, h("h2", {}, "My stamps"), lgrid));
    main.append(page);
    function layout() {
      const cw = vp.clientWidth, ph = page.clientHeight;
      if (!cw || !ph) return;
      const land = cw > ph * 1.05 && cw >= 560;
      const ar = pic.naturalWidth ? pic.naturalWidth / pic.naturalHeight : S.ar || 1920 / 814;
      let Hi, Wi, vis;
      if (!land) { Hi = clampN(280, ph * 0.56, 560); Wi = Hi * ar; if (Wi < cw) { Wi = cw; Hi = Wi / ar; } vis = Hi; }
      else { Wi = cw; Hi = Wi / ar; vis = Math.min(Hi, Math.max(ph - below.offsetHeight - 14, Hi * 0.75)); }   /* wide: only sky is cropped */
      G = { Wi, Hi, crop: Hi - vis };
      vp.style.height = vis + "px";
      Object.assign(cv.style, { width: Wi + "px", height: Hi + "px", top: -G.crop + "px" });
      const side = (Wi * ((S.cart && S.cart.w) || 18)) / 100, base = (S.cart && S.cart.base) || 3;
      spots.forEach((s) => {
        s.cx = (Wi * s.x) / 100; s.cy = (Hi * s.y) / 100; s.side = side;
        const foot = (Hi * (s.y + base)) / 100; s.top = foot - side * 0.98;   /* the wheels (98 % down the picture) on the chalk circle */
        if (s.rw) Object.assign(s.el.style, { left: s.cx - side / 2 + "px", top: s.top + "px", width: side + "px", height: side + "px" });
        else Object.assign(s.el.style, { left: s.cx + "px", top: s.cy + "px" });
        if (s.tag) Object.assign(s.tag.style, { left: s.cx + "px", top: foot + Hi * 0.012 + "px" });
        Object.assign(s.snap.style, { left: s.cx + "px", top: G.crop + "px" });
      });
      placeBub(); arrows();
    }
    const ro = window.ResizeObserver ? new ResizeObserver(() => layout()) : null;
    if (ro) { ro.observe(page); ro.observe(below); } else window.addEventListener("resize", layout);
    pic.onload = layout;
    cleanup = () => { clearTimeout(bubT); if (ro) ro.disconnect(); else window.removeEventListener("resize", layout); };
    layout();
    const arrive = o.arrive && spots.find((s) => s.l.id === o.arrive && s.rw);
    if (arrive) {
      center(arrive.k, false);
      arrive.el.classList.add("arrive");
      setTimeout(() => { if (alive(run)) Audio_.sfx("sticker-place"); }, 520);
      setTimeout(() => { if (alive(run)) talk(arrive).then(() => { if (alive(run)) maybeParty(); }); }, 1100);
    } else setTimeout(() => { if (alive(run)) maybeParty(); }, 500);
    function maybeParty() { const r = Rewards.logo(uid); if (r && !r.seen) { clearTimeout(bubT); bub.hidden = true; logoParty(u, run); } }
    /* the stamps need the lesson packs (pictures, lines) */
    const ps = await Promise.all(ls.map((l) => (l.ready ? packOf(l.id) : null)));
    if (!alive(run)) return;
    ls.forEach((l, k) => {
      const p = ps[k], rw = rewardOf(l.id);
      const card = h("div", { class: "rw-lcard" }, h("div", { class: "hd" }, h("span", { class: "nv-tag" }, `LESSON ${k + 1}`), h("b", {}, l.title)));
      if (p) card.append(h("div", { class: "rw-lstamps" }, ...planOf(p).map((n, j) => stampEl(p, l.id, n, j, Rewards.stamp(l.id, n.id)))));
      if (rw) card.append(h("div", { class: "ft" }, h("img", { src: ver(rw.img), alt: "" }), h("span", {}, rw.name),
        h("button", { class: "rw-change", type: "button", onclick: () => showPick(l.id, { change: true, back: () => showUnitPage(uid, { back }), pageBack: back }) }, "Change")));
      lgrid.append(card);
    });
  }
  /* one-time celebration: the unit's logo pops in */
  function logoParty(u, run) {
    const rec = Rewards.logo(u.id);
    if (rec) { rec.seen = true; Rewards.save(); }
    const ov = h("div", { class: "overlay rw-logoov" });
    const close = () => { ov.remove(); };
    const box = h("div", { class: "rw-logobox", role: "dialog", "aria-label": `${u.nick || u.title} logo` },
      h("div", { class: "rw-lwrap" }, h("span", { class: "rw-rays", "aria-hidden": "true" }, ...Array.from({ length: 12 }, (_, q) => h("i", { style: `--a:${q * 30}deg` }))), logoEl(u, "big")),
      h("span", { class: "nv-tag" }, `UNIT ${u.id} COMPLETE!`),
      h("h2", { html: boldStars(`You got the *${u.nick || u.title} logo*!`) }),
      h("button", { class: "px-btn red", type: "button", onclick: close }, "CONTINUE"));
    ov.append(box); document.body.append(ov);
    Audio_.sfx("complete");
    setTimeout(() => { if (alive(run)) kimLine([u.logoSay, "Super!"]); }, 500);
  }

  /* ---- R3 · passport cover: one logo per unit A → J; tap an earned (or started) unit → its page ---- */
  function showPassport() {
    screen("passport");
    try { history.replaceState(null, "", "#passport"); } catch (e) {}
    const grid = h("div", { class: "rw-pgrid" });
    CAT.units.forEach((u) => {
      const got = !!(u.logo && Rewards.logo(u.id));
      const some = !got && !!u.street && (u.lessons || []).some((l) => Rewards.touched(l.id));
      const name = `${u.id} · ${u.nick || u.title}`;
      const n = (u.lessons || []).filter((l) => Rewards.cart(l.id)).length;
      const disc = got ? logoEl(u) : some && u.logo ? h("span", { class: "rw-ghost" }, logoEl(u), h("span", { class: "n" }, `${n} / ${u.lessons.length}`)) : h("span", { class: "rw-emoji" }, u.badge || "📦");
      const it = h(got || some ? "button" : "div", { class: "rw-unit " + (got ? "won" : some ? "some" : "none"), type: got || some ? "button" : null,
        "aria-label": name + (got ? " · logo" : some ? " · started" : " · not yet") }, h("span", { class: "disc" }, disc), h("b", {}, name));
      if (got || some) it.onclick = () => showUnitPage(u.id, { back: showPassport });
      grid.append(it);
    });
    const won = CAT.units.filter((u) => u.logo && Rewards.logo(u.id)).length;
    main.append(navTop("My Passport", showUnits),
      h("div", { class: "nv-scroll rw-pscroll" }, h("div", { class: "rw-pass" },
        h("span", { class: "rw-ptag" }, "DOL EXPLORE · PASSPORT"), h("b", { class: "rw-pcount" }, `${won} / ${CAT.units.length} units`), grid)));
  }

  /* ---- teachers / testers: fill fake progress (☰ menu; #reward-test). mode: "almost" = L1–L4 done, L5 one step short · "all" · "clear" ---- */
  async function demoProgress(mode) {
    const u = CAT.units.find((x) => x.street && x.ready);
    if (!u) return;
    try { localStorage.removeItem(Rewards.key); } catch (e) {}
    Rewards.d = null; Rewards.load();
    const PCT = [[95, 80, 60], [92, 96, 75], [65, 90, 93], [85, 72, 98], [94, 88, 91]];
    for (const [k, l] of u.lessons.entries()) {
      ["explore-hw:" + l.id, "explore-hw:sum:" + l.id].forEach((key) => { try { localStorage.removeItem(key); } catch (e) {} });
      if (mode === "clear" || !l.ready) continue;
      const p = await packOf(l.id);
      if (!p) continue;
      const ss = stepsOf(p), short = mode === "almost" && k === u.lessons.length - 1;
      const res = { _done: {} }, at = new Date().toISOString();
      ss.forEach((s, j) => { if (!(short && j === ss.length - 1)) res._done[s.id] = true; });
      const plan = planOf(p);
      ss.filter((s) => s.skill).forEach((s) => { const r = PCT[k % PCT.length][plan.findIndex((n) => n.id === s.block.id) % 3] / 100; res[s.id] = { at, firstTry: Math.round(r * 20), total: 20 }; });
      try { localStorage.setItem("explore-hw:" + l.id, JSON.stringify(res)); } catch (e) {}
      const bl = plan.map((n) => p.blocks.find((b) => b.id === n.id));
      const bDone = (b) => ss.filter((s) => s.block === b).every((s) => res._done[s.id]);
      const bPct = (b) => { const rs = ss.filter((s) => s.block === b && s.skill).map((s) => res[s.id].firstTry / res[s.id].total); return rs.length ? Math.round((rs.reduce((a, x) => a + x, 0) / rs.length) * 100) : null; };
      bl.forEach((b) => { if (bDone(b)) Rewards.award(l.id, b.id, bPct(b)); });
      const complete = bl.every(bDone);
      try { localStorage.setItem("explore-hw:sum:" + l.id, JSON.stringify({ stars: 0, max: bl.length * 3, done: Object.keys(res._done).length, total: ss.length, complete })); } catch (e) {}
      if (complete && (l.rewards || []).length) Rewards.setCart(l.id, l.rewards[k % l.rewards.length].id);
    }
    if (L.id !== "HOME") Results.data = Store.load();
    pickLater.clear();
  }

  /* ======================= Open a lesson / routes ======================= */
  const lessonMeta = (lid) => { for (const u of CAT.units) for (const l of (u.lessons || [])) if (l.id === lid) return Object.assign({ unit: u }, l); return null; };
  const loadScript = (src) => new Promise((res) => { const sc = document.createElement("script"); sc.src = src + (window.EXPLORE_BUILD ? "?v=" + window.EXPLORE_BUILD : ""); sc.onload = () => res(true); sc.onerror = () => res(false); document.head.append(sc); });
  async function openLesson(lid, stepId) {
    const meta = lessonMeta(lid);
    if (!meta || !meta.ready) return showUnits();
    pickLater.delete(lid);   /* a skipped reward pick is offered again on this visit */
    if (L.id !== lid) {
      const p = await packOf(lid);
      if (!p) { kimVoice("Oops! This lesson is not ready yet."); return; }
      L = p;
      Results.data = Store.load();
      buildSteps();
    }
    const at = stepId ? steps.findIndex((s) => s.id === stepId) : -1;
    if (at >= 0) go(at); else showMap();
  }
  /* Audio check page for authors: every recorded line, grouped by voice */
  async function showVoices() {
    screen("voices");
    try { history.replaceState(null, "", "#voices"); } catch (e) {}
    for (const u of CAT.units) for (const l of (u.lessons || [])) if (l.ready) await loadScript(l.file.replace(/\.js$/, ".voice.js"));
    const entries = Object.entries(window.VOICE || {});
    const box = h("div", { class: "nv-voices" });
    const groups = { kim: "Kim (Blondie)", narrator: "Người dẫn (Sally)" };
    let playing = null;
    const playRow = async (row, src) => { if (playing) playing.classList.remove("on"); playing = row; row.classList.add("on"); await Audio_.file(src); row.classList.remove("on"); };
    const all = [];
    box.append(h("button", { class: "nv-link", type: "button", onclick: showUnits }, "← Units"), h("h2", {}, `Nghe toàn bộ audio · ${entries.length} câu`));
    const playAll = h("button", { class: "nv-btn red", type: "button" }, "▶ Phát lần lượt tất cả");
    box.append(h("div", { class: "nv-vctl" }, playAll, h("span", {}, "Bấm vào câu bất kỳ để nghe riêng câu đó.")));
    Object.entries(groups).forEach(([who, label]) => {
      const list = entries.filter(([k]) => k.startsWith(who + "|"));
      box.append(h("h3", {}, `${label} · ${list.length}`));
      list.forEach(([k, src]) => {
        const row = h("button", { class: "nv-vrow", type: "button" }, h("span", { class: "p" }, "▶"), h("span", {}, k.slice(who.length + 1)));
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
      ws.forEach((w) => { const src = (w.audio.startsWith("@") ? "assets/" + w.audio.slice(1) : pack.aud + w.audio) + ".mp3"; const row = h("button", { class: "nv-vrow", type: "button" }, h("span", { class: "p" }, "▶"), h("span", {}, w.label)); row.onclick = () => playRow(row, src); all.push([row, src]); box.append(row); });
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
    if (hsh === "passport") return showPassport();
    const pp = hsh.match(/^passport-([a-j])$/);
    if (pp) return showUnitPage(pp[1].toUpperCase(), { back: showPassport });
    if (hsh === "reward-test") return demoProgress("almost").then(showPassport);
    showUnits();
  }

  /* ======================= Menu (teachers / reviewers: jump to any step) ======================= */
  function openMenu() {
    const ov = h("div", { class: "overlay nv-menuov" });
    const close = () => ov.remove();
    const m = h("div", { class: "nv-menubox", role: "dialog", "aria-label": "Steps" }, h("h3", {}, "Steps"), h("small", {}, "Dành cho GV/người duyệt: nhảy tới bước bất kỳ."));
    m.append(h("button", { type: "button", onclick: () => { close(); showUnits(); } }, "🏠 Units"));
    m.append(h("button", { type: "button", onclick: () => { close(); showPassport(); } }, "🛂 Passport"));
    /* rewards test (teachers / testers only): fake progress, then the passport */
    const demo = (mode) => async () => { close(); await demoProgress(mode); if (mode === "clear") showUnits(); else showPassport(); };
    if (L.id === "HOME") m.append(h("button", { type: "button", onclick: () => { close(); showVoices(); } }, "🎧 Nghe audio (GV)"));
    else {
      if (skipped.length) m.append(h("small", { class: "warn" }, "⚠️ Đã bỏ qua bài sai kỹ năng của lesson: " + skipped.join("; ")));
      m.append(h("button", { type: "button", onclick: () => { close(); showMap(); } }, "🗺️ Map"));
      steps.forEach((s, i) => m.append(h("button", { type: "button", onclick: () => { close(); go(i); } }, `${s.block.name} · ${s.title}`)));
      m.append(h("button", { type: "button", onclick: () => { try { localStorage.removeItem(Store.key); } catch (e) {} Results.data = {}; close(); showMap(); } }, "↺ Xoá kết quả & làm lại từ đầu"));
      m.append(h("button", { type: "button", onclick: () => { close(); showVoices(); } }, "🎧 Nghe audio (GV)"));
    }
    m.append(h("small", {}, "Thử phần thưởng (GV): điền tiến độ giả cho Unit I."),
      h("button", { type: "button", onclick: demo("almost") }, "🧪 Demo: L1–L4 xong, L5 còn bước cuối"),
      h("button", { type: "button", onclick: demo("all") }, "🧪 Demo: xong cả 5 lesson (có logo)"),
      h("button", { type: "button", onclick: demo("clear") }, "🧪 Demo: xoá hết tiến độ & phần thưởng"));
    ov.onclick = (e) => { if (e.target === ov) close(); };
    ov.append(m); document.body.append(ov);
  }

  /* ======================= Add-on step types (types-rw.js) ======================= */
  window.EXPLORE_API = { TYPES, V3, h, sleep, shuffle, img, ver, ICON3, Audio_, Results, practice, picture, isObj, playSafe, esc, next: () => next(), alive: (r) => alive(r), main, get L() { return L; } };
  (window.EXPLORE_ADDONS || []).forEach((f) => f(window.EXPLORE_API));

  /* ======================= Boot: splash (N1) ======================= */
  /* splash background: the unit's `bg` (people-free theme art) of the opened lesson / unit, else the catalog's */
  (function splashBg() {
    const hsh = (location.hash || "").slice(1).toUpperCase();
    const meta = lessonMeta((hsh.match(/^([A-J]\d)/) || [])[1]);
    const unit = meta ? meta.unit : CAT.units.find((u) => hsh === "UNIT-" + u.id);
    const src = (meta && meta.unit.bg) || (unit && unit.bg) || (CAT.splash && CAT.splash.bg) || BG_FALLBACK;
    const el = $("#startBg"); if (el) el.style.backgroundImage = `url("${ver(src)}")`;
  })();
  $("#startBtn").onclick = () => {
    $("#start").remove();
    /* unlock audio on iOS: play a silent utterance inside the tap */
    try { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } } catch (e) {}
    Audio_.pickVoices();
    route();
  };
})();
