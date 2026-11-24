// node cap.js <outdir> [vps] [names]
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2];fs.mkdirSync(OUT,{recursive:true});
const VPS={phone:[390,844],laptop:[1440,900],l1280:[1280,720],small:[360,640],tablet:[820,1180],land:[844,390],ipadl:[1180,820],short:[1366,640],mac:[1728,1117]};
const vps=(process.argv[3]||'phone,laptop').split(',');
const ALL=[['pick','i1--g-p1',4500],['bubbles','i1--v-p1',4500],['names','i1--f-p1',4500],['choosepic','i2--v-p1',4500],['choosesent','i2--g-p1',4500],['choosemark','i5--f-p1',6000],['chooseL','i3--g-p1',6000],['choosew','i4--v-p2',4500],['choosel','i5--v-p3',6000],
['spell','i2--v-p2',4500],['build','i2--g-p2',4500],['sort','i5--v-p1',4500],['gaptext','i5--g-p2',4500],['say','i1--v-p2',4500],['lid','i1--g-p2',4500],['answer','i1--f-p2',4500],['race','i5--f-p2',4500],
['grammar','i1--g-explore',3500],['talk','i1--f-explore',3500],['recap','i1--v-recap',4000],['done','i1--g-done',4000],['units','units',2500],['passport','passport',2500],['watch','i1--v-watch',4200],['explore','i1--v-explore',3000],['road','i1',2500]];
const only=process.argv[4]?process.argv[4].split(','):null;
const shots=ALL.filter(s=>!only||only.includes(s[0]));
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const v of vps){const [w,h]=VPS[v];let i=0;
 const work=async()=>{while(i<shots.length){const [name,hash,wait]=shots[i++];const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:h>w});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto(`http://127.0.0.1:8766/?c=${name}${v}#${hash}`);await p.waitForTimeout(800);const s=await p.$('button:has-text("START")');if(s)await s.click().catch(()=>{});
  await p.waitForTimeout(wait);
  await p.screenshot({path:`${OUT}/${v}-${name}.png`});if(errs.length)console.log(v,name,'ERR',errs.join(' | ').slice(0,300));await ctx.close();}};
 await Promise.all([work(),work(),work(),work(),work(),work()]);}
await b.close();console.log('ok')})();
