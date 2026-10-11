// 건축사 업무대가 산출기 매뉴얼 화면 캡처 — usage: node capture_fee.js <repoDir> <outDir>
// RTS·EPI·열관류율 매뉴얼과 같은 규격: 1440×900 · DSF 1.25 · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8893;
/* 예제 = 앱 초기값: 공사비 16억 · 공동주택(제2종) · 건축설계 · 중급 → 요율 4.960% · 79,360,000원(VAT 별도) */
const FREEZE=`(()=>{const T=new Date(2026,9,11,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear()}catch(e){}})()`;
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__btn=(t)=>{const b=[...document.querySelectorAll('#root button')].find(b=>__vis(b)&&b.textContent.includes(t));if(b)b.click();return !!b;};
window.__sel=(labelText,val)=>{const lab=[...document.querySelectorAll('#root label,#root .flabel,#root div')].filter(e=>__vis(e)&&e.children.length===0&&e.textContent.trim().startsWith(labelText))[0];let el=lab;while(el&&!(el.parentElement.querySelector('select')))el=el.parentElement;const s=el.parentElement.querySelector('select');const st=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;st.call(s,String(val));s.dispatchEvent(new Event('change',{bubbles:true}));return s.value;};
window.__card=(t)=>{const h=[...document.querySelectorAll('.card-head')].find(e=>__vis(e)&&e.textContent.includes(t));return h?h.parentElement:null;};
window.__modalTab=(t)=>{const ov=document.querySelector('.modal-bg');const b=[...ov.querySelectorAll('button')].find(b=>b.textContent.includes(t));b&&b.click();};
window.__modalClose=()=>{const ov=document.querySelector('.modal-bg');if(!ov)return;const b=[...ov.querySelectorAll('button')].find(b=>b.textContent.trim()==='✕');b&&b.click();};
window.__find=(sel)=>{const vis=__vis;
 if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('cardsel:')){const [c,i]=sel.slice(8).split('|');return __card(c).querySelectorAll('select')[+i]||null;}
 if(sel.startsWith('cardin:')){const [c,i]=sel.slice(7).split('|');return __card(c).querySelectorAll('input')[+i]||null;}
 if(sel.startsWith('cardbtn:')){const [c,i]=sel.slice(8).split('|');return __card(c).querySelectorAll('button')[+i]||null;}
 if(sel.startsWith('cardchk:')){const [c,i]=sel.slice(8).split('|');return __card(c).querySelectorAll('label.chk-item')[+i]||null;}
 if(sel.startsWith('row:')){const [c,i]=sel.slice(4).split('|');return __card(c).querySelectorAll('table tr')[+i]||null;}
 if(sel.startsWith('a4tbl:')){return document.querySelectorAll('#a4Page table')[+sel.slice(6)]||null;}
 if(sel.startsWith('text~')){const t=sel.slice(5);const els=[...document.querySelectorAll('div,span,b,strong,td,th,label,p')].filter(e=>vis(e)&&e.textContent.includes(t));return els.sort((a,b)=>a.textContent.length-b.textContent.length)[0]||null;}
 if(sel.startsWith('text:')){const t=sel.slice(5);const els=[...document.querySelectorAll('button,a')].filter(e=>vis(e)&&e.textContent.trim().startsWith(t));return els.sort((a,b)=>a.textContent.length-b.textContent.length)[0]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(vis);if(e)return e;}return null;};`;
const A='card:추가 업무 할증',B='기본 정보 입력',P='공사 정보',D='산출 근거 상세';
const SHOTS=[
 {id:'s01_overview',tab:'main',clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar-wrap','요약 스트립'],['card:공사 정보','공사 정보'],['card:대가기준 선택','대가기준 선택'],['.result-card','산출 결과'],['card:산출 근거 상세','산출 근거'],['#fab-group','초기화·이용안내']]},
 {id:'s02_tabs',tab:'main',clip:'.app-header',m:[['.tb:nth-of-type(1)','입력·산출'],['.tb:nth-of-type(2)','A4 산출서'],['.tb-manual','매뉴얼'],['.hdr-right','근거 고시']]},
 {id:'s03_project',tab:'main',clip:'card:공사 정보',m:[['cardin:공사 정보|0','용역명'],['cardin:공사 정보|1','발주처'],['cardin:공사 정보|2','작성자'],['cardin:공사 정보|3','작성일']]},
 {id:'s04_standard',tab:'main',clip:'card:대가기준 선택',union:'.info-strip',m:[['cardbtn:대가기준 선택|0','건축사 대가'],['cardbtn:대가기준 선택|1','엔지니어링 대가'],['.info-strip','적용 고시 안내']]},
 {id:'s05_basic',tab:'main',clip:'card:기본 정보 입력',m:[['cardin:기본 정보 입력|0','예정 공사비'],['text~억원','억원 환산'],['cardsel:기본 정보 입력|0','건축물 용도'],['text~자동 판정','종별 자동 판정']]},
 {id:'s06_task',tab:'main',clip:'card:업무 유형 선택',union:'card:세부 조건',m:[['cardbtn:업무 유형 선택|0','건축설계'],['cardbtn:업무 유형 선택|1','공사감리'],['cardbtn:세부 조건|0','도서작성 기본'],['cardbtn:세부 조건|1','중급'],['cardbtn:세부 조건|2','상급'],['cardchk:세부 조건|0','특수 설비 요구']]},
 {id:'s07_surcharge',tab:'main',clip:'card:추가 업무 할증',m:[['cardchk:추가 업무 할증|0','리모델링·인테리어'],['cardchk:추가 업무 할증|1','BF 인증'],['cardsel:추가 업무 할증|0','녹색건축 인증'],['cardsel:추가 업무 할증|1','지능형건축물'],['cardsel:추가 업무 할증|2','제로에너지 인증']]},
 {id:'s08_result',tab:'main',clip:'.result-card',m:[['.result-amount-box','최종 산출금액'],['.vc-n','적용 요율'],['.vc-a','공사비'],['.vc-p','종별']]},
 {id:'s09_detail',tab:'main',clip:'card:산출 근거 상세',union:'card:적용 근거',m:[['row:산출 근거 상세|1','예정 공사비'],['row:산출 근거 상세|2','적용 난이도'],['row:산출 근거 상세|3','공사비요율 Y'],['row:산출 근거 상세|4','보간 산출식'],['row:산출 근거 상세|5','최종 산출 대가'],['card:적용 근거','적용 근거']]},
 {id:'s10_cert',tab:'main',pre:"__sel('녹색건축 인증',9.5);__sel('제로에너지 인증',10)",post:"__sel('녹색건축 인증',0);__sel('제로에너지 인증',0)",clip:'.result-card',union:'card:적용 근거',m:[['.result-amount-box','할증 포함 금액'],['text~세부 할증','할증 내역']]},
 {id:'s11_sup',tab:'main',pre:"__btn('공사감리')",post:"__btn('건축설계')",clip:'viewport',m:[['.sum-bar-wrap','요약 스트립'],['.result-card','감리 대가'],['card:산출 근거 상세','별표5 보간']]},
 {id:'s12_a4',tab:'print',clip:'viewport',m:[['.mm-btn-print','인쇄 / PDF 저장'],['#btn-jpg','JPG 저장'],['#a4Page','A4 산출서']]},
 {id:'s13_a4page',tab:'print',clip:'#a4Page',m:[['a4tbl:0','용역 개요'],['a4tbl:1','산출 내역'],['a4tbl:2','산출 근거'],['text~법적 근거','법적 근거'],['text~(인)','작성자 서명란']]},
 {id:'s14_eng_input',tab:'main',pre:"__btn('엔지니어링 대가')",wait:900,clip:'card:기본 정보 입력',union:'card:엔지니어링 부문',m:[['cardin:기본 정보 입력|0','예정 공사비'],['cardsel:엔지니어링 부문|0','부문 선택'],['cardbtn:엔지니어링 부문|1','업무 단계'],['cardsel:엔지니어링 부문|1','분야']]},
 {id:'s15_eng_result',tab:'main',clip:'viewport',m:[['cardbtn:대가기준 선택|1','엔지니어링 대가'],['.sum-bar-wrap','요약 스트립'],['.result-card','산출 결과'],['card:산출 근거 상세','산출 근거']]},
 {id:'s16_eng_a4page',tab:'print',clip:'#a4Page',m:[]},
 {id:'s17_help_interp',tab:'main',pre:"__btn('건축사 대가');setTimeout(()=>{window.__feeModal();setTimeout(()=>__modalTab('보간법'),350)},500)",wait:1700,clip:'viewport',m:[]},
 {id:'s18_help_type',tab:null,pre:"__modalTab('건물종별')",clip:'viewport',m:[]},
 {id:'s19_help_eng',tab:null,pre:"__modalTab('엔지니어링')",post:"__modalClose()",clip:'viewport',m:[]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(3000);
 await pg.evaluate(HELP);
 const readEx=()=>pg.evaluate(()=>{const q=s=>((document.querySelector(s)||{}).innerText||'').replace(/\s+/g,' ').trim();return {sum:q('.sum-bar-wrap'),amount:q('.result-amount-box'),rate:q('.vc-n'),rows:[...document.querySelectorAll('.rtbl tr')].map(r=>r.innerText.replace(/\s+/g,' ').trim())};});
 const ex={example:await readEx()};const meta={};
 for(const S of SHOTS){
  if(S.tab){await pg.evaluate(t=>{goTab(t);window.scrollTo(0,0);},S.tab);await pg.waitForTimeout(700);}
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.id==='s10_cert')ex.cert=await readEx(); if(S.id==='s11_sup')ex.sup=await readEx(); if(S.id==='s15_eng_result')ex.eng=await readEx();
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}
     if(S.maxH&&clip.height>S.maxH)clip.height=S.maxH;}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(a.w/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(cl.height),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(500);}
 }
 await pg.evaluate(()=>{goTab('main');window.scrollTo(0,0)});await pg.waitForTimeout(500);ex.after=await readEx();
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(3000);
 await mp.screenshot({path:path.join(out,'s20_mobile_main.png')});meta['s20_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const h=document.querySelector('.result-card');window.scrollTo(0,h.getBoundingClientRect().top+scrollY-110);});await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s21_mobile_result.png')});meta['s21_mobile_result']={w:390,h:844,marks:[]};
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x>100||m.y>100)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y);}));
 console.log(JSON.stringify({ex,same:JSON.stringify(ex.example)===JSON.stringify(ex.after),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
