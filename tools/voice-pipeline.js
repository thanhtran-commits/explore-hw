/* EXPLORE Voice Pipeline — runs in the user's Chrome (injected into https://example.com by Claude).
 * Needs window.__VP = { unit:"I", lines:[{id, voice:"kim"|"narrator", text}] } set first.
 * One click: ElevenLabs makes every line → page measures pace and re-makes off-pace lines with an adjusted
 * `speed` (no time-stretching afterwards, so no echo) → Gemini listens for mispronunciations → bad takes are
 * re-made (max 3 takes) → one result file is downloaded to ~/Downloads (explore-voice-<unit>.json).
 * Keys: typed by the user, optionally remembered in this browser's localStorage (key "explore-vp-keys").
 */
(() => {
  const VP = window.__VP, LINES = VP.lines;
  const TARGET = 3.35;                       // syllables/s measured first-to-last sound on the raw take; = the pace of decision #40 (3.45 on the old meter)
  const TOL = 0.08;                          // ±8% is fine
  const VOICES = { kim: { id: "XXphLKNRxvJ1Qa95KBhX", speed: 0.95 }, narrator: { id: "jkUnCsbErmJrcbWk1Hmh", speed: 0.88 } };
  const MODELS = ["gemini-pro-latest", "gemini-flash-latest"];   // aliases: Google retires named versions (2.5/3-pro were gone by 11-17)
  const MAX_TAKES = 3;

  document.title = "EXPLORE · Voice Pipeline";
  const sty = document.createElement("style");
  sty.textContent = `body{font:15px/1.45 system-ui,sans-serif;margin:0;background:#f7f4ee;color:#2e2620;max-width:none!important;padding:0!important}
header{position:sticky;top:0;background:#fff;padding:14px 20px;box-shadow:0 2px 10px #0001;z-index:2}h1{font-size:20px;margin:0 0 6px}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:6px 0}input[type=password]{width:250px;padding:7px 10px;border:1px solid #bbb;border-radius:8px}
button{padding:10px 22px;border-radius:10px;border:0;background:#7b5cd6;color:#fff;font-weight:700;font-size:16px;cursor:pointer}button:disabled{background:#bbb}
#bar{height:8px;background:#eee;border-radius:4px;flex:1;min-width:200px;overflow:hidden}#bar i{display:block;height:100%;width:0;background:#7b5cd6;transition:width .3s}
#st{font-weight:600}table{border-collapse:collapse;width:calc(100% - 40px);margin:16px 20px;background:#fff}td,th{border-bottom:1px solid #eee;padding:6px 8px;text-align:left;vertical-align:top}
tr.ok td.s{color:#2a8a3e}tr.warn{background:#fff1f0}tr.warn td.s{color:#c0392b;font-weight:700}tr.busy td.s{color:#7b5cd6}audio{height:30px;width:200px}small{color:#777}`;
  document.head.innerHTML = ""; document.head.append(sty);
  document.body.innerHTML = `<header><h1>EXPLORE · Voice Pipeline — Unit ${VP.unit} (${LINES.length} câu)</h1>
<div class="row"><label>ElevenLabs key <input type="password" id="kEL" autocomplete="off"></label><label>Gemini key <input type="password" id="kGM" autocomplete="off"></label>
<label><input type="checkbox" id="rem" checked> Nhớ key trên máy này</label></div>
<div class="row"><button id="run">▶ Run</button><div id="bar"><i></i></div><span id="st"></span></div>
<small>Tự tạo giọng → chỉnh tốc độ → Gemini kiểm tra phát âm → tạo lại câu lỗi (tối đa ${MAX_TAKES} lần) → tự tải file kết quả về Downloads.</small></header>
<table><thead><tr><th>#</th><th>Giọng</th><th>Câu</th><th>Trạng thái</th><th>Tốc độ</th><th>Gemini nghe thấy / lỗi</th><th>Nghe</th></tr></thead><tbody id="tb"></tbody></table>`;
  const $ = (s) => document.querySelector(s), st = (t) => ($("#st").textContent = t);
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  try { const k = JSON.parse(localStorage.getItem("explore-vp-keys") || "{}"); if (k.el) $("#kEL").value = k.el; if (k.gm) $("#kGM").value = k.gm; } catch (e) {}

  const R = {}; window.__VPR = R;
  LINES.forEach((l) => {
    R[l.id] = { ...l, state: "", rate: 0, speed: VOICES[l.voice].speed, takes: 0, heard: "", issues: [], b64: null };
    const tr = document.createElement("tr"); tr.id = "r" + l.id;
    tr.innerHTML = `<td>${l.id}</td><td>${l.voice}</td><td>${esc(l.text)}</td><td class="s">–</td><td class="v"></td><td class="h"></td><td class="a"></td>`;
    $("#tb").append(tr);
  });
  const paint = (id) => {
    const x = R[id], tr = $("#r" + id);
    tr.className = x.state;
    tr.querySelector(".s").textContent = { ok: "✓ ổn", warn: "✗ cần nghe lại", busy: "…đang làm" }[x.state] || x.state;
    tr.querySelector(".v").innerHTML = x.rate ? `${x.rate.toFixed(2)} âm tiết/s<br><small>speed ${x.speed.toFixed(2)} · ${x.takes} lần</small>` : "";
    tr.querySelector(".h").innerHTML = `<i>${esc(x.heard || "")}</i>` + x.issues.map((i) => `<div>• <b>${esc(i.word)}</b>: ${esc(i.problem)}</div>`).join("");
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const b64 = (buf) => { let s = "", u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const syl = (text) => text.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean)
    .reduce((n, w) => { let v = (w.replace(/'/g, "").replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g) || []).length; return n + Math.max(1, v); }, 0);
  const AC = new (window.AudioContext || window.webkitAudioContext)();
  async function speechSeconds(buf) {           // length from first to last sound above -40 dB
    const a = await AC.decodeAudioData(buf.slice(0)), d = a.getChannelData(0), th = 0.01, sr = a.sampleRate;
    let s = 0, e = d.length - 1; while (s < e && Math.abs(d[s]) < th) s++; while (e > s && Math.abs(d[e]) < th) e--;
    return Math.max(0.2, (e - s) / sr);
  }

  async function tts(l, speed, stability) {
    const v = VOICES[l.voice];
    for (let a = 0; a < 6; a++) {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}?output_format=mp3_44100_128`, {
        method: "POST", headers: { "Content-Type": "application/json", "xi-api-key": $("#kEL").value.trim() },
        body: JSON.stringify({ text: l.text.replace(/[“”]/g, '"'), model_id: "eleven_multilingual_v2",
          voice_settings: { stability, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true, speed } }) });
      if (r.status === 429 || r.status >= 500) { await sleep(3000 * (a + 1)); continue; }
      if (!r.ok) throw new Error("ElevenLabs " + r.status + ": " + (await r.text()).slice(0, 160));
      return await r.arrayBuffer();
    }
    throw new Error("ElevenLabs: quá tải, thử lại sau");
  }
  let mi = 0;
  async function check(text, data) {
    const prompt = `You are a strict British English pronunciation checker for audio used to teach English to 6-9 year old Vietnamese children.
The speaker was asked to say exactly: "${text}"
Listen very carefully, sound by sound. Report a problem ONLY for: a wrong vowel or consonant sound (e.g. "lesson" sounding like "lasson", "chips" like "cheeps"), wrong word stress, a missing, extra, swapped or cut-off word, or a mumbled/unclear word a child could mishear. Do NOT flag voice style, child-like tone, emotion, natural connected speech, or a standard British vs American difference.
Return JSON: {"heard": "<what you literally hear; spell misheard words the way they sound>", "ok": true|false, "issues": [{"word": "<expected word>", "problem": "<short description>"}]}`;
    for (let a = 0; a < 8; a++) {
      const model = MODELS[mi];
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": $("#kGM").value.trim() },
        body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: "audio/mp3", data } }, { text: prompt }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" } }) });
      if (r.status === 429 || r.status >= 500) { await sleep(4000 * (a + 1)); continue; }
      const j = await r.json().catch(() => ({}));
      if ((r.status === 404 || r.status === 400 || r.status === 403) && mi < MODELS.length - 1 && /model|not found|support/i.test(JSON.stringify(j))) { mi++; continue; }
      if (!r.ok) throw new Error("Gemini " + r.status + ": " + ((j.error && j.error.message) || ""));
      const t = j.candidates[0].content.parts.map((p) => p.text || "").join("");
      const c = JSON.parse(t.replace(/^\s*```json|```\s*$/g, ""));
      c.issues = c.issues || []; c.bad = !(c.ok && !c.issues.length); return c;
    }
    throw new Error("Gemini: quá tải, thử lại sau");
  }

  async function doLine(id) {
    const x = R[id]; x.state = "busy"; paint(id);
    const n = syl(x.text); let best = null, stab = [0.5, 0.65, 0.4];
    for (let t = 0; t < MAX_TAKES; t++) {
      let buf = await tts(x, x.speed, stab[t]); x.takes++;
      let rate = n / (await speechSeconds(buf));
      if (!/…/.test(x.text) && Math.abs(rate / TARGET - 1) > TOL && !((x.speed <= 0.7 && rate < TARGET) || (x.speed >= 1.2 && rate > TARGET))) {   // lines with "…" pause on purpose: leave them   // off pace → one re-make at a corrected speed
        x.speed = Math.min(1.2, Math.max(0.7, x.speed * TARGET / rate));
        buf = await tts(x, x.speed, stab[t]); x.takes++; rate = n / (await speechSeconds(buf));
      }
      const data = b64(buf), c = await check(x.text, data);
      const score = c.issues.length + (c.bad ? 1 : 0) + (/…/.test(x.text) ? 0 : Math.abs(rate / TARGET - 1));
      if (!best || score < best.score) best = { score, data, buf, rate, c };
      x.rate = rate; x.heard = c.heard; x.issues = c.issues; paint(id);
      if (!c.bad) break;
    }
    x.b64 = best.data; x.rate = best.rate; x.heard = best.c.heard; x.issues = best.c.issues;
    x.state = best.c.bad ? "warn" : "ok";
    const a = document.createElement("audio"); a.controls = true; a.src = URL.createObjectURL(new Blob([best.buf], { type: "audio/mpeg" }));
    const cell = $("#r" + id + " .a"); cell.innerHTML = ""; cell.append(a); paint(id);
  }

  function download() {
    const out = { unit: VP.unit, made: new Date().toISOString(), target: TARGET, gemini: MODELS[mi],
      lines: Object.values(R).map(({ b64, ...x }) => x), audio: Object.fromEntries(Object.values(R).filter((x) => x.b64).map((x) => [x.id, x.b64])) };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
    a.download = `explore-voice-${VP.unit}.json`; a.click();
  }
  window.__VPdownload = download;

  $("#run").onclick = async () => {
    if (!$("#kEL").value.trim() || !$("#kGM").value.trim()) { st("Nhập 2 key trước nhé"); return; }
    try { if ($("#rem").checked) localStorage.setItem("explore-vp-keys", JSON.stringify({ el: $("#kEL").value.trim(), gm: $("#kGM").value.trim() })); else localStorage.removeItem("explore-vp-keys"); } catch (e) {}
    $("#run").disabled = true; AC.resume();
    const ids = LINES.map((l) => l.id).filter((id) => !R[id].b64); let done = LINES.length - ids.length, i = 0, errs = 0;
    window.__VPstate = "running";
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (i < ids.length) {
        const id = ids[i++];
        try { await doLine(id); } catch (e) { errs++; R[id].state = "warn"; R[id].heard = "Lỗi: " + (e.message || e); paint(id); }
        done++; $("#bar i").style.width = (100 * done / LINES.length) + "%";
        st(`${done}/${LINES.length} câu · Gemini: ${MODELS[mi]}`);
      }
    }));
    const warn = Object.values(R).filter((x) => x.state === "warn").length;
    download();
    window.__VPstate = "done";
    st(`Xong! ${LINES.length - warn} câu ổn, ${warn} câu cần bạn nghe lại (tô đỏ). Đã tải explore-voice-${VP.unit}.json về Downloads.`);
    $("#run").disabled = false; $("#run").textContent = "▶ Chạy lại các câu lỗi";
    Object.values(R).forEach((x) => { if (x.state === "warn") x.b64 = null; });   // a second Run only redoes the red ones
  };
  st($("#kEL").value ? "Key đã nhớ sẵn — bấm Run" : "Nhập 2 key rồi bấm Run");
  return "ready";
})();
