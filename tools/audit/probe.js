const {chromium}=require('playwright');
const [hash,vp,sel]=[process.argv[2],process.argv[3]||'390x844',process.argv[4]||'.px-top,.px-main,.px-head,.px-opts,.px-grid,.px-grid>*,.px-foot,.px-body'];
(async()=>{const b=await chromium.launch({args:['--mute-audio']});const [w,h]=vp.split('x').map(Number);const p=await (await b.newContext({viewport:{width:w,height:h},hasTouch:h>w})).newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8766/?p='+Date.now()+'#'+hash);await p.waitForTimeout(800);const s=await p.$('button:has-text("START")');if(s)await s.click();await p.waitForTimeout(+(process.argv[5]||4000));
console.log(await p.evaluate((sel)=>{const S=window.STAGE||1;return 'STAGE '+S+'\n'+[...document.querySelectorAll(sel)].slice(0,40).map(e=>{const r=e.getBoundingClientRect();return (e.className||e.tagName).toString().slice(0,40).padEnd(40)+' '+[r.left,r.top,r.width,r.height].map(x=>Math.round(x/S)).join(',')}).join('\n')},sel));
await b.close()})();
