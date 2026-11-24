const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const routes=['units','unit-i','i1','i1--v-watch','i1--v-explore','i1--v-p1','i1--g-explore','i1--g-p1','i2--v-p2','i3--f-watch','i5--g-p2','i1--f-p2'];
for(const [w,h,t] of [[390,844,'phone'],[1440,900,'laptop']]){
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
 await p.goto('http://127.0.0.1:8766/#units');await p.waitForTimeout(1200);const s=await p.$('button:has-text("START")');if(s)await s.click();await p.waitForTimeout(1500);
 for(const r of routes){await p.goto('http://127.0.0.1:8766/#'+r);await p.reload();await p.waitForTimeout(1200);const s2=await p.$('button:has-text("START")');if(s2)await s2.click().catch(()=>{});await p.waitForTimeout(4000);await p.screenshot({path:`eye/${t}-${r}.png`});}
 await p.close();}
await b.close()})();
