# 공공기관 건축사 업무대가 산출기 [MANMIN-Ver3.0]

> 공공발주사업에 대한 건축사의 업무범위와 대가기준 (국토교통부고시 제2020-635호)  
> 건축사법 제19조의3 — 설계·감리 대가 자동 산출 PWA

## 🚀 GitHub Pages 배포 방법

### 1단계 — 파일 업로드
이 저장소에 아래 파일들을 **모두** 업로드합니다.

```
📁 저장소 루트
├── index.html          ← 메인 앱
├── manifest.json       ← PWA 매니페스트
├── sw.js               ← 서비스 워커
├── favicon.ico         ← 브라우저 파비콘
└── icons/
    ├── brand-icon.png
    ├── apple-touch-icon.png
    ├── favicon-16x16.png
    ├── favicon-32.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-256x256.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

### 2단계 — GitHub Pages 활성화
1. 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **root**
4. **Save** 클릭

### 3단계 — 접속 & 설치
- 배포 URL: `https://[계정명].github.io/[저장소명]/`
- **모바일**: 접속 후 표시되는 설치 다이얼로그에서 **설치하기** 탭
- **iOS**: Safari → 공유 버튼 → 홈 화면에 추가

---

## 📱 PWA 설치 플로우

| 환경 | 동작 |
|------|------|
| Android Chrome / Edge | 설치 다이얼로그 자동 팝업 (2.5초 후) |
| iOS Safari | 홈 화면 추가 안내 모달 |
| 헤더 설치 버튼 | 항상 표시 (이미 설치된 경우 숨김) |
| 재방문 시 | 하단 배너로 재안내 |

---

## ⚙️ 기술 스펙

- **React 18** (CDN, Babel standalone)
- **PWA**: Cache-First 전략, 오프라인 완전 지원
- **폰트**: Noto Sans KR (본고딕), JetBrains Mono
- **출력**: A4 인쇄, Galaxy S24 Ultra JPG 저장, 공유

## 📋 적용 기준

- 국토교통부고시 제2020-635호 (2020.09.14 시행)
- 별표4 — 건축설계 대가요율 (직선보간법)
- 별표5 — 건축공사감리 대가요율

---

*ARCHITECT KIM MANMIN · 만민건축사사무소*
