// 앱 데이터 ↔ 고시 원문(law_tables.js) 대조 — usage: node verify_app.js <repoDir>
const fs=require('fs');const L=require('./law_tables');const s=fs.readFileSync(process.argv[2]+'/index.html','utf8');
let USAGES,SUPERVISION_TABLE,DESIGN_TABLE,GREEN_OPTS,IBS_OPTS,ZERO_OPTS,ENG_UNIT,ENG_SECTORS;
eval(s.slice(s.indexOf('const USAGES=['),s.indexOf('function engTasksOf')).replace(/const (USAGES|SUPERVISION_TABLE|DESIGN_TABLE|GREEN_OPTS|IBS_OPTS|ZERO_OPTS|ENG_UNIT|ENG_SECTORS)=/g,'$1='));
const eq=(a,b)=>Math.abs(a-b)<1e-9;let R=[];
let bad=0,n=0;DESIGN_TABLE.forEach((r,i)=>{if(!eq(r.cost,L.COST17[i]*1e8))bad++;const law=L.B4[i];[['type3',0],['type2',3],['type1',6]].forEach(([k,o])=>{[2,1,0].forEach((lv,j)=>{n++;if(!eq(r[k][lv],law[o+j])){bad++;console.log('B4',i,k,lv,r[k][lv],law[o+j]);}})});});R.push(['별표4 설계 요율 '+n+'개(17구간×3종×3등급)',bad===0]);
bad=0;n=0;SUPERVISION_TABLE.forEach((r,i)=>{const law=L.B5[i];['type3','type2','type1'].forEach((k,j)=>{n++;if(!eq(r[k],law[j])){bad++;console.log('B5',i,k);}})});R.push(['별표5 감리 요율 '+n+'개(17구간×3종)',bad===0]);
const cnt=t=>USAGES.filter(u=>u.type===t).length;R.push(['별표3 용도 수 1종 5 · 2종 23 · 3종 11',cnt('type1')===5&&cnt('type2')===23&&cnt('type3')===11]);
R.push(['제11조④ 인증 가산율(녹색 4 · 지능형 5 · 제로에너지 5)',JSON.stringify(GREEN_OPTS.slice(1).map(o=>o.value))===JSON.stringify(L.CERT.green)&&JSON.stringify(IBS_OPTS.slice(1).map(o=>o.value))===JSON.stringify(L.CERT.ibs)&&JSON.stringify(ZERO_OPTS.slice(1).map(o=>o.value))===JSON.stringify(L.CERT.zero)]);
bad=0;n=0;const cmp=(tbl,law,cols)=>{tbl.forEach((r,i)=>{if(!eq(r[0],law[i][0])){bad++;console.log('cost',r[0],law[i][0]);}cols.forEach((c,j)=>{n++;if(!eq(r[j+1],law[i][c])){bad++;console.log('ENG',i,j,r[j+1],law[i][c]);}})});if(tbl.length!==law.length){bad++;console.log('len',tbl.length,law.length);}};
const E=ENG_SECTORS;cmp(E['건설'].tasks['기본설계'].table,L.ENG['건설|기본설계'],[1,2,3,4]);cmp(E['건설'].tasks['실시설계'].table,L.ENG['건설|실시설계'],[1,2,3,4,5]);cmp(E['건설'].tasks['공사감리'].table,L.ENG['건설|공사감리'],[1]);
cmp(E['통신'].tasks['기본설계'].table,L.ENG['통신|전체'],[1,2,3,4]);cmp(E['통신'].tasks['실시설계'].table,L.ENG['통신|전체'],[5,6,7,8]);cmp(E['통신'].tasks['공사감리'].table,L.ENG['통신|전체'],[9]);
cmp(E['산업플랜트'].tasks['기본설계'].table,L.ENG['산업플랜트|전체'],[1]);cmp(E['산업플랜트'].tasks['실시설계'].table,L.ENG['산업플랜트|전체'],[2]);cmp(E['산업플랜트'].tasks['공사감리'].table,L.ENG['산업플랜트|전체'],[3]);
cmp(E['시공상세도'].tasks['작성비'].table,L.ENG['시공상세도|작성비'],[1,2,3]);R.push(['엔지니어링 별표1~4 요율 '+n+'개',bad===0]);
bad=0;n=0;for(const k in L.FORMULA){const [sec,task]=k.split('|');const f=E[sec].tasks[task].formula;for(const fld in L.FORMULA[k]){n++;if(JSON.stringify(f[fld])!==JSON.stringify(L.FORMULA[k][fld])){bad++;console.log('F',k,fld,f[fld]);}}}R.push(['엔지니어링 5,000억 초과 공식 계수 '+n+'개',bad===0]);
// 독립 계산
const ip=(x,x2,x1,y1,y2)=>y1-(x-x2)*(y1-y2)/(x1-x2);const fl=v=>Math.floor(Math.round(v*1e6)/1e6/1000)*1000;
const d=ip(16,10,20,5.32,4.72),sv=ip(16,10,20,1.23,1.13),en=ip(16,10,20,6.16,5.47);
R.push(['독립 계산 설계 16억·2종·중급 = 4.960% → 79,360,000원',d.toFixed(3)==='4.960'&&fl(1.6e9*4.96/100)===79360000]);
R.push(['독립 계산 감리 16억·2종 = 1.170% → 18,720,000원',sv.toFixed(3)==='1.170'&&fl(1.6e9*1.17/100)===18720000]);
R.push(['독립 계산 엔지니어링 실시설계 도로 16억 = 5.746% → 91,936,000원',en.toFixed(3)==='5.746'&&fl(1.6e9*5.746/100)===91936000]);
R.push(['독립 계산 인증 체감 녹색 9.5 + 제로 10 = 10 + 9.5/2 = 14.75% → +11,705,000원',fl(79360000*14.75/100)===11705000]);
module.exports=R;if(require.main===module){console.log('| # | 항목 | 결과 |\n|---|---|---|');R.forEach((r,i)=>console.log(`| ${i+1} | ${r[0]} | ${r[1]?'✓':'✗'} |`));}
