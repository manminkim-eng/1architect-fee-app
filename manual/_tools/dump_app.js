// 앱 내장 데이터 → JSON (매뉴얼 4장 표 생성용) — usage: node dump_app.js <repoDir> > _appdata.json
const fs=require('fs');const s=fs.readFileSync(process.argv[2]+'/index.html','utf8');
let USAGES,SUPERVISION_TABLE,DESIGN_TABLE,GREEN_OPTS,IBS_OPTS,ZERO_OPTS,ENG_UNIT,ENG_SECTORS;
eval(s.slice(s.indexOf('const USAGES=['),s.indexOf('function engTasksOf')).replace(/const (USAGES|SUPERVISION_TABLE|DESIGN_TABLE|GREEN_OPTS|IBS_OPTS|ZERO_OPTS|ENG_UNIT|ENG_SECTORS)=/g,'$1='));
console.log(JSON.stringify({USAGES,SUPERVISION_TABLE,DESIGN_TABLE,ENG_SECTORS}));
