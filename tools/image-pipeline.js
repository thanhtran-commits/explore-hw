/* EXPLORE Image Pipeline — runs in the user's Chrome (injected into https://example.com by Claude), like the Voice Pipeline.
 * Needs, set first:  window.__IPJOBS = <tools/image-jobs-<unit>.json>   window.__IPREFS = { refKey: base64 JPEG }
 * One click: Gemini draws each picture (with its reference pictures) → a second model checks it against a checklist
 * (no people, no text, the style, what it must show) → a failed picture is drawn again (max 3 takes; the best take is kept)
 * → one result file is downloaded to ~/Downloads (explore-image-<unit>.json). ↻ on a card re-draws just that picture.
 * Key: the Gemini key the Voice Pipeline remembered on this page (localStorage "explore-vp-keys"), or typed by the user.
 * Claude never reads, types or prints the key.
 */
(() => {
  const J = window.__IPJOBS, REFS = window.__IPREFS || {}, ITEMS = J.items;
  const IMG_MODELS = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"];
  const CHECK_MODELS = ["gemini-flash-latest", "gemini-pro-latest"];
  const MAX_TAKES = 3;

  document.title = "EXPLORE · Image Pipeline";
  const sty = document.createElement("style");
  sty.textContent = `body{font:15px/1.45 system-ui,sans-serif;margin:0;background:#f7f4ee;color:#2e2620;max-width:none!important;padding:0!important}
header{position:sticky;top:0;background:#fff;padding:14px 20px;box-shadow:0 2px 10px #0001;z-index:2}h1{font-size:20px;margin:0 0 6px}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:6px 0}input[type=password]{width:250px;padding:7px 10px;border:1px solid #bbb;border-radius:8px}
button{padding:10px 22px;border-radius:10px;border:0;background:#2f7f5c;color:#fff;font-weight:700;font-size:16px;cursor:pointer}button:disabled{background:#bbb}
#bar{height:8px;background:#eee;border-radius:4px;flex:1;min-width:200px;overflow:hidden}#bar i{display:block;height:100%;width:0;background:#2f7f5c;transition:width .3s}
#st{font-weight:600}#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;padding:16px 20px}
.card{background:#fff;border:3px solid #e6e0d4;border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:6px}
.card.ok{border-color:#3aa657}.card.warn{border-color:#e5534b}.card.busy{border-color:#7b5cd6}
.card .pic{aspect-ratio:16/10;background:repeating-conic-gradient(#f1ece4 0 25%,#fff 0 50%) 0 0/16px 16px;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.card img{max-width:100%;max-height:100%;object-fit:contain}.card b{font-size:14px}.card small{color:#777}.card .iss{color:#c0392b;font-size:13px}
.card button{padding:4px 10px;font-size:13px;align-self:flex-start;background:#7a6a60}`;
  document.head.innerHTML = ""; document.head.append(sty);
  document.body.innerHTML = `<header><h1>EXPLORE · Image Pipeline — Unit ${J.unit} (${ITEMS.length} hình)</h1>
<div class="row" id="keyrow"><label>Gemini key <input type="password" id="kGM" autocomplete="off"></label></div>
<div class="row"><button id="run">▶ Run</button><div id="bar"><i></i></div><span id="st"></span></div>
<small>Vẽ từng hình theo ảnh mẫu → model khác chấm (không người, không chữ, đúng nét, đúng nội dung) → vẽ lại hình trượt (tối đa ${MAX_TAKES} lần) → tự tải file kết quả về Downloads.</small></header>
<div id="grid"></div>`;
  const $ = (s, el = document) => el.querySelector(s), st = (t) => ($("#st").textContent = t);
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  let stored = "";
  try { stored = (JSON.parse(localStorage.getItem("explore-vp-keys") || "{}").gm) || ""; } catch (e) {}
  if (stored) $("#keyrow").innerHTML = "<small>Dùng key Gemini đã nhớ trên trang này.</small>";
  const key = () => stored || ($("#kGM") ? $("#kGM").value.trim() : "");

  const R = {}; window.__IPR = R;
  ITEMS.forEach((it) => {
    R[it.id] = { id: it.id, state: "", takes: 0, issues: [], mime: "", b64: null, model: "" };
    const c = document.createElement("div"); c.className = "card"; c.id = "c-" + it.id;
    c.innerHTML = `<b>${it.id}</b><div class="pic"></div><small class="s">–</small><div class="iss"></div><button type="button">↻ Vẽ lại</button>`;
    $("button", c).onclick = () => redo(it.id);
    $("#grid").append(c);
  });
  const paint = (id) => {
    const x = R[id], c = $("#c-" + id);
    c.className = "card " + x.state;
    $(".s", c).textContent = ({ ok: "✓ đạt", warn: "✗ cần xem lại", busy: "…đang vẽ" }[x.state] || "–") + (x.takes ? ` · ${x.takes} lần` : "");
    $(".iss", c).innerHTML = x.issues.map((i) => `• ${esc(i)}`).join("<br>");
    if (x.b64 && !$("img", c)) { const im = document.createElement("img"); $(".pic", c).append(im); }
    if (x.b64) $("img", c).src = `data:${x.mime};base64,${x.b64}`;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const S = J.style;
  function promptOf(it) {
    if (it.kind === "costume") return S.costume.replace("{what}", it.what) + it.prompt + "\n\n" + S.obj;
    if (it.kind === "obj") return it.prompt + "\n\n" + S.obj;
    return it.prompt + "\n\n" + S.bg;
  }
  const checksOf = (it) => (it.kind === "bg" ? J.check.bg : J.check.obj).concat([`It shows: ${it.shows}.`], it.extraCheck || []);
  const aspectOf = (it) => it.aspect || "1:1", sizeOf = (it) => it.size || "1K";

  async function gem(models, idx, body) {
    for (let a = 0; a < 8; a++) {
      const model = models[idx.i];
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key() }, body: JSON.stringify(body) });
      if (r.status === 429 || r.status >= 500) { await sleep(5000 * (a + 1)); continue; }
      const j = await r.json().catch(() => ({}));
      if ((r.status === 404 || r.status === 400) && idx.i < models.length - 1 && /model|not found|support/i.test(JSON.stringify(j))) { idx.i++; continue; }
      if (!r.ok) throw new Error(`Gemini ${r.status}: ${(j.error && j.error.message) || ""}`.slice(0, 200));
      return { j, model };
    }
    throw new Error("Gemini: quá tải, thử lại sau");
  }
  const imgIdx = { i: 0 }, chkIdx = { i: 0 };

  async function draw(it, extra) {
    const parts = [];
    (it.refs || []).forEach((k, n) => { if (REFS[k]) parts.push({ text: `Reference picture ${n + 1}:` }, { inline_data: { mime_type: "image/jpeg", data: REFS[k] } }); });
    parts.push({ text: promptOf(it) + (extra ? "\n\nIMPORTANT, fix this from the last try: " + extra : "") });
    const cfg = { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspectOf(it) } };
    if (IMG_MODELS[imgIdx.i].includes("pro")) cfg.imageConfig.imageSize = sizeOf(it);
    const { j, model } = await gem(IMG_MODELS, imgIdx, { contents: [{ role: "user", parts }], generationConfig: cfg });
    const p = ((j.candidates || [])[0] || {}).content;
    const im = p && (p.parts || []).map((x) => x.inlineData || x.inline_data).find(Boolean);
    if (!im) throw new Error("Không nhận được hình (" + (((j.candidates || [])[0] || {}).finishReason || "?") + ")");
    return { b64: im.data, mime: im.mimeType || im.mime_type || "image/png", model };
  }
  async function check(it, pic) {
    const list = checksOf(it);
    const prompt = `You are a strict art checker for pictures in an English app for 6-9 year old children.
Look at the picture very carefully and check each statement:
${list.map((s, n) => `${n + 1}. ${s}`).join("\n")}
Return JSON: {"results":[{"n":1,"pass":true|false,"note":"<if it fails: what exactly is wrong, short>"}]}`;
    const { j } = await gem(CHECK_MODELS, chkIdx, { contents: [{ parts: [{ inline_data: { mime_type: pic.mime, data: pic.b64 } }, { text: prompt }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json" } });
    const t = j.candidates[0].content.parts.map((p) => p.text || "").join("");
    const c = JSON.parse(t.replace(/^\s*```json|```\s*$/g, ""));
    return (c.results || []).filter((r) => !r.pass).map((r) => `${list[r.n - 1] ? "#" + r.n : ""} ${r.note || "không đạt"}`.trim());
  }

  async function doItem(id, note) {
    const it = ITEMS.find((x) => x.id === id), x = R[id];
    x.state = "busy"; x.issues = []; paint(id);
    let best = null, extra = note || "";
    for (let t = 0; t < MAX_TAKES; t++) {
      const pic = await draw(it, extra); x.takes++;
      const issues = await check(it, pic);
      if (!best || issues.length < best.issues.length) best = { ...pic, issues };
      Object.assign(x, { b64: best.b64, mime: best.mime, model: best.model, issues: best.issues }); paint(id);
      if (!issues.length) break;
      extra = (note ? note + " " : "") + issues.join(" ");
    }
    x.state = best.issues.length ? "warn" : "ok"; paint(id);
  }

  function download() {
    const out = { unit: J.unit, made: new Date().toISOString(), models: { image: IMG_MODELS[imgIdx.i], check: CHECK_MODELS[chkIdx.i] },
      items: Object.values(R).filter((x) => x.b64).map((x) => ({ id: x.id, state: x.state, takes: x.takes, issues: x.issues, model: x.model, mime: x.mime, b64: x.b64 })) };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
    a.download = `explore-image-${J.unit}.json`; a.click();
  }
  window.__IPdownload = download;

  let running = false;
  async function runIds(ids) {
    running = true; $("#run").disabled = true; window.__IPstate = "running";
    let done = 0, i = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (i < ids.length) {
        const id = ids[i++];
        try { await doItem(id, window.__IPNOTES && window.__IPNOTES[id]); } catch (e) { R[id].state = "warn"; R[id].issues = ["Lỗi: " + (e.message || e)]; paint(id); }
        done++; $("#bar i").style.width = (100 * done / ids.length) + "%";
        st(`${done}/${ids.length} hình · ${IMG_MODELS[imgIdx.i]}`);
      }
    }));
    const warn = ids.filter((id) => R[id].state === "warn").length;
    download();
    window.__IPstate = "done"; running = false;
    st(`Xong! ${ids.length - warn}/${ids.length} hình đạt, ${warn} hình cần xem lại (viền đỏ). Đã tải explore-image-${J.unit}.json về Downloads.`);
    $("#run").disabled = false; $("#run").textContent = "▶ Vẽ lại các hình trượt";
  }
  function redo(id) { if (!running && key()) runIds([id]); }
  window.__IPrun = (ids) => runIds(ids);

  $("#run").onclick = () => {
    if (!key()) { st("Nhập key Gemini trước nhé"); return; }
    const ids = ITEMS.map((x) => x.id).filter((id) => R[id].state !== "ok");
    runIds(ids);
  };
  st(stored ? "Key đã nhớ sẵn — bấm Run" : "Nhập key Gemini rồi bấm Run");
  return "ready";
})();
