# 매뉴얼 생성 도구 (공공기관 건축사 업무대가 산출기)

| 파일 | 하는 일 |
|---|---|
| `build.sh <repo> <raw>` | 캡처 → WebP → HTML → PDF → 검증을 한 번에 |
| `capture_fee.js` | 앱 화면 21장 캡처, 번호 표시점(`_marks.json`) · 예제 값(`_example.json`) 기록 (1440×900, 배율 1.25, 날짜 고정 2026-10-11) |
| `serve.js` | 로컬 서버 + CDN(React · Babel · html2canvas · 글꼴)을 로컬 사본으로 대체 |
| `dump_app.js` | 앱 내장 요율표를 `_appdata.json`으로 추출(4장 표 생성용) |
| `gen_manual_fee.py` · `manual_engine.py` | 매뉴얼 본문 → `manual/index.html` |
| `pdf_fee.js` | A4 PDF |
| `law_tables.js` | 고시 원문 요율표(법령 원문 조회로 옮긴 값) |
| `verify_app.js` · `verify_app_run.js` | 앱 내장 데이터 ↔ 원문 대조 |
| `verify_fee_calc.js` | 금액 절사(mmFee · mmAdj) ↔ 정확 계산 전수 대조 |
| `verify_manual.js` | 매뉴얼 4장 표 ↔ 원문, 예제 수치, 표시점·범례·링크 검사 |

환경 변수: `MM_PW`(playwright 모듈 경로) · `MM_VENDOR`(CDN 로컬 사본 폴더) · `MANUAL_DIR`(생성 대상 manual 폴더)

고시가 개정되면 ① `law_tables.js`와 앱 데이터를 원문대로 고치고 ② `gen_manual_fee.py`의 고시번호·조문 표를 고친 뒤 ③ `build.sh`를 다시 돌린다.
