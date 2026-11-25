// Extended audit: node run2.js [lessons|all] [vps comma] [outdir]
const { chromium } = require('playwright');
const fs = require('fs');
const STEPS = require('./steps.json');
const VPS = { l1440: [1440, 900], phone: [390, 844], tablet: [820, 1180], laptop: [1280, 720], short: [1366, 640], small: [360, 640], land: [844, 390], ipadl: [1180, 820], big: [1512, 982], mac: [1728, 1117] };
const only = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : null;
const vps = process.argv[3] ? process.argv[3].split(',') : Object.keys(VPS);
const OUT = process.argv[4] || './shots'; fs.mkdirSync(OUT, { recursive: true });
const jobs = [];
const pages = [{ name: 'home-units', hash: 'units', wait: 2500 }, { name: 'home-unit-i', hash: 'unit-i', wait: 2500 }];
for (const lid of Object.keys(STEPS)) pages.push({ name: lid + '-map', hash: lid, wait: 2500, lid });
for (const [lid, steps] of Object.entries(STEPS)) for (const s of steps) pages.push({ name: lid + '-' + s.id, hash: lid + '--' + s.id, wait: s.skill === 'L' || s.type === 'watch' ? 9000 : 4500, lid });
for (const pg of pages) if (!only || only.includes(pg.lid) || only.includes(pg.name) || (only.includes('home') && !pg.lid)) for (const vp of vps) jobs.push({ ...pg, vp });
const CHECK = () => {
  const vw = innerWidth, vh = innerHeight, issues = [];
  if (document.documentElement.scrollWidth > vw + 1) issues.push('hscroll ' + document.documentElement.scrollWidth);
  if (/Ã|â€|ðŸ|Â·/.test(document.body.innerText)) issues.push('mojibake');
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  for (const i of document.images) if (vis(i) && i.complete && i.naturalWidth === 0) issues.push('broken ' + i.getAttribute('src'));
  const scrollers = (e) => { for (let p = e.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p); if ((/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 2) || (/(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth + 2)) return true; } return false; };
  let off = 0; const offs = [];
  for (const e of document.querySelectorAll('button, img, .copt, .bubble, .pcard, .ltile, .btile, .scard, .lbl, .name, .px-card, .px-bub, .px-chip, .px-slot, .px-tray')) {
    if (!vis(e) || e.closest('.overlay') || e.closest('#bg') || e.classList.contains('blurfill') || e.closest('.blurfill')) continue;
    if (e.classList.contains('scene') || (e.tagName === 'IMG' && e.closest('.st-cam'))) continue;
    const r = e.getBoundingClientRect();
    if ((r.right > vw + 2 || r.left < -2 || r.bottom > vh + 2 || r.top < -2) && !scrollers(e)) { off++; if (offs.length < 4) offs.push((e.className || e.tagName) + '@' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  }
  if (off) issues.push('offscreen ' + off + ': ' + offs.join(' | '));
  // labels must stay inside the scene canvas
  const cv = document.querySelector('.canvas');
  if (cv) { const c = cv.getBoundingClientRect(); for (const e of document.querySelectorAll('.canvas .lbl, .canvas .name, .canvas .backbtn')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.left < c.left - 1 || r.right > c.right + 1 || r.bottom > c.bottom + 1 || r.top < c.top - 1) { issues.push('label outside scene: ' + e.innerText.slice(0, 20)); break; } } }
  for (const e of document.querySelectorAll('.copt.pic')) { const r = e.getBoundingClientRect(); if (vis(e) && Math.abs(r.width - r.height) > 3) { issues.push('copt not square ' + Math.round(r.width) + 'x' + Math.round(r.height)); break; } }
  const groups = new Map();
  for (const i of document.images) { if (!vis(i) || !i.naturalWidth || i.classList.contains('normed')) continue; const g = i.closest('.copts,.pickrow,.bubbles,.trays,.cards,.grid,.row,.scards,.strays,.px-grid,.px-trays') || null; if (!g) continue; const r = i.getBoundingClientRect(); const k = Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight); if (!groups.has(g)) groups.set(g, []); groups.get(g).push({ k, src: i.getAttribute('src').split('/').pop(), dh: i.naturalHeight * k, dw: i.naturalWidth * k }); }
  for (const [g, arr] of groups) if (arr.length > 1) { const ks = arr.map(a => a.k); if (Math.max(...ks) / Math.min(...ks) > 1.3) issues.push('scale mix in .' + g.className.split(' ')[0] + ': ' + arr.slice(0, 4).map(a => a.src + '×' + a.k.toFixed(2)).join(', ')); }
  // upscaled pictures (blurry): drawn > 1.6x natural at DPR 1
  for (const i of document.images) { if (!vis(i) || !i.naturalWidth || i.classList.contains('scene') || i.closest('.blurfill') || i.closest('.st-cam')) continue; const r = i.getBoundingClientRect(); const k = Math.min(r.width / i.naturalWidth, r.height / i.naturalHeight); if (k > 1.6 && r.width > 120) { issues.push('upscaled ' + i.getAttribute('src').split('/').pop() + ' ×' + k.toFixed(1)); break; } }
  for (const e of document.querySelectorAll('button:not(.hot), .copt, .bubble, .tile, .ltile, .btile, .gword, .wordchip, .lbl, .name, .px-chip, .px-sent, .px-opt')) { if (vis(e) && (e.scrollWidth > e.clientWidth + 2)) { issues.push('text overflow: ' + e.innerText.slice(0, 30)); break; } }
  // small touch targets
  const small = [];
  for (const e of document.querySelectorAll('button')) { if (!vis(e) || e.closest('.overlay') || e.closest('.chips')) continue; const r = e.getBoundingClientRect(); if (Math.min(r.width, r.height) / (window.STAGE || 1) < 40) small.push((e.className || 'btn').split(' ')[0] + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  if (small.length) issues.push('small targets: ' + [...new Set(small)].slice(0, 4).join(', '));
  // Kim overlapping any visible button / card
  const kim = document.querySelector('#kim');
  const clipped = (e) => { let r = e.getBoundingClientRect(); let L = r.left, T = r.top, R = r.right, B = r.bottom; for (let p = e.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') { const q = p.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom); } } return { left: L, top: T, right: R, bottom: B }; };
  if (kim && vis(kim)) { const parts = [kim.querySelector('button'), kim.querySelector('.bub')].filter(x => x && vis(x)); for (const p of parts) { const k = p.getBoundingClientRect(); for (const e of document.querySelectorAll('main button, main .copt, main .tracker, main .chips, main .pcard, main .ltile, main .scard, main .stray')) { if (!vis(e)) continue; const r = clipped(e); const ix = Math.min(k.right, r.right) - Math.max(k.left, r.left), iy = Math.min(k.bottom, r.bottom) - Math.max(k.top, r.top); if (ix > 6 && iy > 6) { issues.push('kim' + (p.classList.contains('bub') ? ' bubble' : '') + ' covers ' + (e.className || e.tagName).split(' ')[0]); return issues; } } } }
  for (const f of document.querySelectorAll('main .field, main .sayfield, main .recap, main .chunkgrid, main .px-main, main .px-body')) { if (vis(f) && f.scrollHeight > f.clientHeight + 4) { issues.push('needs scroll: .' + f.className.split(' ').join('.') + ' ' + f.scrollHeight + '>' + f.clientHeight); break; } }
  const pm = document.querySelector('.px-main'), pb = document.querySelector('.px-body');
  if (pm && pb) { const lim = pb.getBoundingClientRect().bottom - parseFloat(getComputedStyle(pb).paddingBottom) * (window.STAGE || 1) + 2;
    for (const e of pm.querySelectorAll('button, img, .px-sent, .px-passage')) { if (!vis(e) || e.closest('.px-sheet')) continue; const r = e.getBoundingClientRect(); if (r.bottom > lim) { issues.push('into Aa strip: ' + (e.className || e.tagName).toString().split(' ')[0] + ' ' + Math.round(r.bottom - lim) + 'px'); break; } } }
  return issues;
};

const ALIGN = () => {
  const out = [], W = innerWidth, H = innerHeight;
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const R = (e) => e.getBoundingClientRect(), cx = (r) => (r.left + r.right) / 2, near = (a, b) => Math.abs(a - b) <= 4, n = (x) => Math.round(x);
  const frameOf = (cv) => { const r = R(cv); return { left: Math.max(0, r.left), right: Math.min(W, r.right), top: Math.max(0, r.top), bottom: Math.min(H, r.bottom) }; };
  /* 1. one card (S4 / S5): the sentence row, dots and button share the picture's column */
  const card = document.querySelector('.st-cards:not(.sum) .st-card');
  if (card && vis(card.querySelector('.st-pic'))) {
    const pic = R(card.querySelector('.st-pic')), qa = !!document.querySelector('.st-cards.qa');
    const two = getComputedStyle(card).display === 'contents';
    if (!two) {
      for (const ln of card.querySelectorAll('.st-line')) {
        const ks = [...ln.children].filter(vis).map(R); if (!ks.length) continue;
        const l = Math.min(...ks.map((k) => k.left)), r = Math.max(...ks.map((k) => k.right));
        if (qa) { if (!near(l, pic.left)) out.push('align: Q/A row left ' + n(l - pic.left) + 'px from picture'); if (r > pic.right + 4) out.push('align: Q/A row past picture right ' + n(r - pic.right)); }
        else if (!near((l + r) / 2, cx(pic))) out.push('align: sentence row off picture centre ' + n((l + r) / 2 - cx(pic)) + 'px');
      }
      for (const sel of ['.st-dots', '.st-cfoot .px-btn']) { const e = document.querySelector(sel); if (vis(e) && !near(cx(R(e)), cx(pic))) out.push('align: ' + sel + ' off picture centre ' + n(cx(R(e)) - cx(pic))); }
      const lr = R(card.querySelector('.st-lines')); if (lr.left < pic.left - 4 || lr.right > pic.right + 4) out.push('align: sentence block wider than picture');
    } else {
      const ref = R(document.querySelector('.st-cfoot'));
      for (const sel of ['.st-lines', '.st-dots', '.st-cfoot .px-btn']) { const e = document.querySelector(sel); if (vis(e) && !near(cx(R(e)), cx(ref))) out.push('align: ' + sel + ' off right-column centre ' + n(cx(R(e)) - cx(ref))); }
    }
  }
  /* summary / recap / done: button centred on the content column */
  for (const body of ['.st-cards.sum .st-sum', '.st-recap .st-gridwrap']) {
    const b = document.querySelector(body), bs = [...document.querySelectorAll('.st-cfoot .px-btn')].filter(vis).map(R);
    if (vis(b) && bs.length) { const c = (Math.min(...bs.map((r) => r.left)) + Math.max(...bs.map((r) => r.right))) / 2; if (!near(cx(R(b)), c)) out.push('align: buttons off ' + body + ' centre ' + n(c - cx(R(b)))); }
  }
  /* 2. watch: caption = visible frame (same edges when framed; centred on it when the picture touches a screen edge) */
  const cap = document.querySelector('.st-watch .st-cap');
  if (vis(cap)) {
    const f = frameOf(document.querySelector('.st-watch .st-canvas')), c = R(cap);
    const S_ = window.STAGE || 1, pad = Math.max(0, 12 * S_ - Math.min(f.left, W - f.right));
    if ((f.right - f.left - 2 * pad) >= 440 * S_) { if (!near(c.left, f.left + pad) || !near(c.right, f.right - pad)) out.push('align: caption edges ≠ frame (' + n(c.left - f.left - pad) + ', ' + n(f.right - pad - c.right) + ')'); }
    else if (!near(cx(c), (f.left + f.right) / 2)) out.push('align: caption off frame centre ' + n(cx(c) - (f.left + f.right) / 2));
    if (c.left < f.left - 4 + (f.right - f.left < 440 * S_ ? -999 : 0) || c.right > f.right + 4 + (f.right - f.left < 440 * S_ ? 999 : 0)) out.push('align: caption wider than frame');
    for (const e of document.querySelectorAll('.st-watch .st-bottom > :not(.st-cap)')) if (vis(e) && !near(cx(R(e)), cx(c))) out.push('align: ' + e.className.split(' ')[0] + ' off caption centre');
    for (const e of document.querySelectorAll('.st-watch .st-food')) if (vis(e)) { out.push('watch: small food card shown'); break; }
    for (const e of document.querySelectorAll('.st-watch .st-cfood')) { if (!vis(e)) continue; const r = R(e); if (r.left < -2 || r.right > W + 2 || r.top < 0 || r.bottom > c.top + 2) { out.push('watch: cart food out of view / under caption: ' + e.innerText); break; } }
  }
  /* 3. explore vocab: bar centred, clear of ✕ / back, one row on landscape; button centred on the frame */
  const wb = document.querySelector('.st-wbar');
  if (vis(wb)) {
    const b = R(wb);
    if (!near(cx(b), W / 2)) out.push('align: word bar off centre ' + n(cx(b) - W / 2));
    for (const e of [document.querySelector('.st-etop .st-x'), document.querySelector('.st-back')]) { if (!vis(e)) continue; const r = R(e); if (r.right > b.left - 4 && r.left < b.right + 4 && r.bottom > b.top && r.top < b.bottom) out.push('align: word bar collides with ' + e.className); }
    const x = R(document.querySelector('.st-etop .st-x')), bk = document.querySelector('.st-back'); if (vis(bk)) { const r = R(bk); if (r.right > x.left && r.left < x.right && r.bottom > x.top && r.top < x.bottom) out.push('align: back collides with ✕'); }
    if (W > H) { const tops = [...wb.querySelectorAll('.st-slot')].map((s) => R(s).top); if (Math.max(...tops) - Math.min(...tops) > 2) out.push('align: word bar not one row'); const cnt = R(wb.querySelector('.st-count')); if (cnt.left < Math.max(...[...wb.querySelectorAll('.st-slot')].map((s) => R(s).right))) out.push('align: count not at row end'); }
    else { const cols = new Set([...wb.querySelectorAll('.st-slot')].map((s) => n(R(s).top))); const perRow = wb.querySelectorAll('.st-slot').length / cols.size; if (perRow > 6) out.push('align: >6 per row upright'); }
    const rd = document.querySelector('.st-ready'); if (vis(rd)) { const f = frameOf(document.querySelector('.st-explore .st-canvas')); if (!near(cx(R(rd)), (f.left + f.right) / 2)) out.push('align: READY off frame centre ' + n(cx(R(rd)) - (f.left + f.right) / 2)); }
    const tr = document.querySelector('.st-tray'); if (vis(tr) && !near(cx(R(tr)), W / 2)) out.push('align: tray off centre');
    for (const e of document.querySelectorAll('.st-explore .st-cfood')) { const l = e.querySelector('.lbl'); if (!vis(l)) continue; const a = R(e), r = R(l); if (r.left < a.left - 1 || r.right > a.right + 1 || r.bottom > a.bottom + 1) { out.push('align: label outside its food (ring would cut it): ' + l.innerText); break; } }
  }
  /* 4. practice screens: the main blocks share the column centre (not the sideways two-column layout) */
  const pm = document.querySelector('.px .px-main');
  if (vis(pm) && getComputedStyle(pm).flexDirection === 'column') {
    const col = cx(R(pm));
    for (const e of pm.children) { if (!vis(e) || getComputedStyle(e).position === 'absolute') continue; if (!near(cx(R(e)), col)) out.push('align: px block ' + (e.className || e.tagName).toString().split(' ')[0] + ' off column ' + n(cx(R(e)) - col)); }
    const fb = document.querySelector('.px .px-foot .px-btn'); if (vis(fb) && !near(cx(R(fb)), col)) out.push('align: px button off column ' + n(cx(R(fb)) - col));
  }
  return out;
};
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const report = []; let k = 0;
  const worker = async () => {
    while (k < jobs.length) {
      const j = jobs[k++]; const [w, h] = VPS[j.vp];
      const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: !['laptop', 'short', 'ipadl', 'big', 'mac'].includes(j.vp) });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push('JS ' + e.message.slice(0, 80)));
      try {
        await p.goto(`http://127.0.0.1:8766/?a=${k}#${j.hash}`);
        await p.waitForTimeout(900);
        const st = await p.$('button:has-text("Start")'); if (st) await st.click().catch(() => {});
        await p.waitForTimeout(j.wait);
        await p.waitForFunction(() => !document.getAnimations().some((a) => typeof CSSTransition !== 'undefined' && a instanceof CSSTransition && a.playState === 'running'), null, { timeout: 2500 }).catch(() => {});
        const issues = (await p.evaluate(CHECK)).concat(await p.evaluate(ALIGN));
        await p.screenshot({ path: `${OUT}/${j.name}-${j.vp}.png` });
        report.push({ name: j.name, vp: j.vp, issues: [...errs, ...issues] }); if (errs.length || issues.length) console.log('LIVE', j.name, j.vp, '→', [...errs, ...issues].join(' ; '));
      } catch (e) { report.push({ name: j.name, vp: j.vp, issues: ['FAILED ' + e.message.slice(0, 80)] }); }
      await ctx.close();
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
  await b.close();
  fs.writeFileSync(OUT + '/report.json', JSON.stringify(report, null, 1));
  for (const r of report.sort((a, b) => (a.name + a.vp).localeCompare(b.name + b.vp))) if (r.issues.length) console.log(r.name, r.vp, '→', r.issues.join(' ; '));
  console.log('done', report.length);
})();
