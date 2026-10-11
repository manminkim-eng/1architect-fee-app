// 금액 절사 검증 — 앱의 mmFee·mmAdj ↔ BigInt 정확 계산 전수 대조 · usage: node verify_fee_calc.js <repoDir>
const fs=require('fs');const s=fs.readFileSync(process.argv[2]+'/index.html','utf8');
let mmFee,mmAdj;eval(s.slice(s.indexOf('const mmFee='),s.indexOf('const fmt=')).replace('const mmFee=','mmFee=').replace('const mmAdj=','mmAdj='));
let USAGES,SUPERVISION_TABLE,DESIGN_TABLE,GREEN_OPTS,IBS_OPTS,ZERO_OPTS,ENG_UNIT,ENG_SECTORS;
eval(s.slice(s.indexOf('const USAGES=['),s.indexOf('function engTasksOf')).replace(/const (USAGES|SUPERVISION_TABLE|DESIGN_TABLE|GREEN_OPTS|IBS_OPTS|ZERO_OPTS|ENG_UNIT|ENG_SECTORS)=/g,'$1='));
const exact=(c,r)=>Number((BigInt(c)*BigInt(Math.round(r*1000))/100000000n)*1000n);
const old=(c,r)=>Math.floor(c*(r/100)/1000)*1000;
const ip=(c,c1,c2,r1,r2)=>Math.round((r1-((c-c1)*(r1-r2))/(c2-c1))*1000)/1000;
let n=0,bad=0,oldBad=0;const ex=[];
function sweep(costs,rateAt){costs.forEach(c=>{const r=rateAt(c);if(r==null)return;n++;const e=exact(c,r);if(mmFee(c,r)!==e)bad++;if(old(c,r)!==e){oldBad++;if(ex.length<4)ex.push(`${c.toLocaleString()}×${r}% 기존 ${old(c,r).toLocaleString()} → ${e.toLocaleString()}`);}})}
function costsOf(tbl){const out=[];for(let i=0;i<tbl.length-1;i++){const a=tbl[i],b=tbl[i+1];for(let k=0;k<=40;k++)out.push(Math.round(a+(b-a)*k/40));}
 let x=12345;for(let i=0;i<400;i++){x=(x*1103515245+12345)%2147483648;out.push(Math.round((tbl[0]+(tbl[tbl.length-1]-tbl[0])*(x/2147483648)**3)/1000)*1000+(i%3?0:x%1000));}return out}
const rateFn=(tbl,get)=>c=>{if(c<=tbl[0].cost)return get(tbl[0]);if(c>=tbl[tbl.length-1].cost)return get(tbl[tbl.length-1]);for(let i=0;i<tbl.length-1;i++){const a=tbl[i],b=tbl[i+1];if(c>a.cost&&c<=b.cost)return c===b.cost?get(b):ip(c,a.cost,b.cost,get(a),get(b));}};
const dc=costsOf(DESIGN_TABLE.map(r=>r.cost));
['type1','type2','type3'].forEach(k=>{[0,1,2].forEach(lv=>sweep(dc,rateFn(DESIGN_TABLE,e=>e[k][lv])));sweep(dc,rateFn(SUPERVISION_TABLE,e=>e[k]));});
for(const sec in ENG_SECTORS)for(const tk in ENG_SECTORS[sec].tasks){const T=ENG_SECTORS[sec].tasks[tk];T.fields.forEach((f,fi)=>{const tb=T.table.map(r=>({cost:r[0]*ENG_UNIT,v:r[fi+1]}));sweep(costsOf(tb.map(r=>r.cost)),rateFn(tb,e=>e.v));});}
// 할증 조정
let na=0,ba=0;const adjs=[50,8,9.5,10,14.75,16.83,64.75,7];[79360000,18720000,123456000,5000000,99999000,2465000000].forEach(b=>adjs.forEach(a=>{na++;const e=Number((BigInt(b)*BigInt(Math.round(a*100))/10000000n)*1000n);if(mmAdj(b,a)!==e)ba++;}));
const R=[['금액 절사 '+n.toLocaleString()+'건(설계·감리·엔지니어링 전 구간) = 정확 계산',bad===0,'불일치 '+bad],['할증 조정 '+na+'건 = 정확 계산',ba===0,'불일치 '+ba],
['예제 감리 16억 × 1.170 % = 18,720,000원',mmFee(1.6e9,1.17)===18720000,mmFee(1.6e9,1.17).toLocaleString()],['예제 설계 79,360,000 · 엔지니어링 91,936,000 · 조정 11,705,000',mmFee(1.6e9,4.96)===79360000&&mmFee(1.6e9,5.746)===91936000&&mmAdj(79360000,14.75)===11705000,''],
['최대 곱(5,000억 × 12.55 %)이 정수 한계 안',5e11*12550<Number.MAX_SAFE_INTEGER,(5e11*12550).toExponential(3)]];
module.exports={R,oldBad,n,ex};if(require.main===module){console.log('| # | 항목 | 결과 | 비고 |\n|---|---|---|---|');R.forEach((r,i)=>console.log(`| ${i+1} | ${r[0]} | ${r[1]?'✓':'✗'} | ${r[2]} |`));console.log('기존 식 오차 건수:',oldBad,'/',n,ex);}
