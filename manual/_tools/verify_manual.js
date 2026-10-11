// 검증: 앱 데이터 ↔ 고시 원문(verify_app) · 매뉴얼 4장 표 ↔ 원문 · 예제 수치 · 표시점·범례
const fs=require('fs');const repo=process.argv[2];const L=require('./law_tables');
const h=fs.readFileSync(repo+'/manual/index.html','utf8');const txt=h.replace(/<[^>]+>/g,'|').replace(/\|+/g,'|');
const R=require('./verify_app_run')(repo).concat((()=>{process.argv[2]=repo;return require('./verify_fee_calc').R.map(r=>[r[0],r[1]]);})());
const f2=v=>v.toFixed(2);const lab=(c,first)=>c===0.5?first:(c>=1?c.toLocaleString('en-US')+'억원':'');
let bad=0,n=0;const s43=txt.slice(txt.indexOf('4-3. 별표4 건축설계 대가요율',txt.indexOf('id="ch4"')>0?0:0));
const sec=(a,b)=>{const i=txt.lastIndexOf(a);return txt.slice(i,txt.indexOf(b,i));};
const t43=sec('4-3. 별표4 건축설계 대가요율','4-4. 별표5'),t44=sec('4-4. 별표5 건축공사감리 대가요율','4-5. 직선보간'),t48=sec('4-8. 엔지니어링사업대가의 기준','4-9. 적용 시점');
L.B4.forEach((r,i)=>{n+=9;const row='|'+lab(L.COST17[i],'5,000만원 이하')+'|'+r.map(f2).join('|')+'|';if(!t43.includes(row)){bad++;console.log('B4 row',row);}});
const c1=['매뉴얼 4-3 표 = 원문 별표4 '+n+'개',bad===0];bad=0;n=0;
L.B5.forEach((r,i)=>{n+=3;const row='|'+lab(L.COST17[i],'5천만원 이하')+'|'+r.map(f2).join('|')+'|';if(!t44.includes(row)){bad++;console.log('B5 row',row);}});
const c2=['매뉴얼 4-4 표 = 원문 별표5 '+n+'개',bad===0];bad=0;n=0;
['건설|실시설계','건설|기본설계'].forEach(k=>L.ENG[k].forEach(r=>{n+=r.length-1;const row='|'+r[0].toLocaleString('en-US')+'억원|'+r.slice(1).map(f2).join('|')+'|';if(!t48.includes(row)){bad++;console.log('ENG row',k,row);}}));
const c3=['매뉴얼 4-8 표 = 원문 엔지니어링 별표1(기본·실시설계) '+n+'개',bad===0];
const ex=JSON.parse(fs.readFileSync(repo+'/manual/_tools/_example.json','utf8'));const mk=JSON.parse(fs.readFileSync(repo+'/manual/images/_marks.json','utf8'));
let out=0,tot=0;Object.values(mk).forEach(v=>v.marks.forEach(m=>{tot++;if(m.miss||m.x<0||m.y<0||m.x>100||m.y>100||m.x+m.w>100.5||m.y+m.h>100.5)out++;}));
const figs=[...h.matchAll(/id="fig-(s\d+_[a-z_0-9]+)"[\s\S]*?<\/figure>/g)];let legBad=0;figs.forEach(f=>{const pins=(f[0].match(/class="pin"/g)||[]).length;const li=(f[0].match(/<li>/g)||[]).length;if(li&&pins!==li){legBad++;console.log('legend≠pins',f[1],pins,li);}});
const imgs=[...h.matchAll(/src="images\/([^"]+)"/g)].map(m=>m[1]);const miss=imgs.filter(f=>!fs.existsSync(repo+'/manual/images/'+f));
const ids=new Set([...h.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]));const dead=[...h.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]).filter(a=>!ids.has(a));
const C=R.concat([c1,c2,c3,
['예제 설계 4.960% · 79,360,000원 (앱 캡처값 = 매뉴얼)',ex.example.sum.includes('4.960')&&ex.example.sum.includes('79,360,000')&&h.includes('79,360,000')],
['인증 할증 +14.75% · 91,065,000원 (앱 캡처값 = 매뉴얼)',ex.cert.sum.includes('+14.75')&&ex.cert.sum.includes('91,065,000')&&h.includes('91,065,000')],
['감리 1.170% · 18,720,000원 (앱 캡처값 = 매뉴얼)',ex.sup.sum.includes('1.170')&&ex.sup.sum.includes('18,720,000')&&h.includes('18,720,000')&&!h.includes('18,719,000')],
['엔지니어링 5.746% · 91,936,000원 (앱 캡처값 = 매뉴얼)',ex.eng.sum.includes('5.746')&&ex.eng.sum.includes('91,936,000')&&h.includes('91,936,000')],
['VAT 포함 합계 87,296,000 · 100,171,500 · 20,592,000 · 101,129,600',79360000*1.1===87296000&&Math.round(91065000*1.1)===100171500&&Math.round(18720000*1.1)===20592000&&Math.round(91936000*1.1)===101129600],
['캡처 전후 예제 값 동일(복원)',JSON.stringify(ex.example)===JSON.stringify(ex.after)],
['표시점 '+tot+'개 모두 이미지 안',out===0],['그림 '+figs.length+'개 — 범례 수 = 번호 수',legBad===0],['그림 파일 '+imgs.length+'개 모두 존재',miss.length===0],['문서 안 링크 끊김 없음',dead.length===0],
['고시번호·시행일 표기',h.includes('국토교통부고시 제2020-635호(2020.9.14. 시행)')&&h.includes('산업통상자원부고시 제2024-217호(2024.12.31. 시행)')]]);
if(dead.length)console.log('dead',dead);if(miss.length)console.log('miss',miss);
console.log('| # | 항목 | 결과 |\n|---|---|---|');C.forEach((c,i)=>console.log(`| ${i+1} | ${c[0]} | ${c[1]?'✓':'✗'} |`));
process.exit(C.every(c=>c[1])?0:1);
