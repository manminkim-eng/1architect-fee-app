#!/bin/bash
# 매뉴얼 전체 재생성: 캡처 → WebP → HTML → PDF → 검증   usage: bash build.sh <repoDir> <rawDir>
# 환경: MM_PW(playwright 경로) · MM_VENDOR(CDN 로컬 사본 폴더)
set -e; cd "$(dirname "$0")"; REPO="$1"; RAW="$2"; M="$REPO/manual"; rm -rf "$RAW"; mkdir -p "$RAW" "$M/images"
node capture_fee.js "$REPO" "$RAW" > "$RAW/_log.json"
python3 - "$RAW" "$M" <<'PY'
import sys,glob,os,shutil
from PIL import Image
raw,M=sys.argv[1],sys.argv[2]
for f in sorted(glob.glob(raw+'/s*.png')): Image.open(f).convert('RGB').save(M+'/images/'+os.path.basename(f)[:-4]+'.webp',quality=82,method=6)
shutil.copy(raw+'/_marks.json',M+'/images/_marks.json'); shutil.copy(raw+'/_example.json',M+'/_tools/_example.json')
PY
node dump_app.js "$REPO" > _appdata.json
MANUAL_DIR="$M" python3 gen_manual_fee.py
node pdf_fee.js "$M" FEE_사용자매뉴얼_Ver-5.0.pdf "공공기관 건축사 업무대가 산출기 사용자 매뉴얼 Ver-5.0"
node verify_manual.js "$REPO"
