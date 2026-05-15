## 개요

지자체 도로 점검 담당자가 현장에서 촬영한 도로 사진을 웹에 업로드하면, **LiteRaceSegNet 모델**이 도로 손상 영역을 세그멘테이션하고 손상 통계와 AI 점검 리포트 초안을 자동으로 생성하는 웹 기반 점검 보조 플랫폼입니다.

> **현재 상태**: 프론트엔드 MVP 완성. 백엔드 및 LLM 연동 작업 진행 중.

> ⚠️ 본 서비스는 자율주행 차량 제어, 실시간 도로 관제, 도로 안전 등급 자동 판정을 목적으로 하지 않습니다. 최종 판단은 담당자가 수행합니다.

---

## 주요 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 초대 코드 로그인 | 허가된 담당자만 접근 가능한 인증 | ✅ UI 완성 / 🔗 백엔드 연동 예정 |
| 도로 사진 업로드 | JPG, PNG 드래그&드롭, 파일 검증 | ✅ 완성 |
| AI 세그멘테이션 분석 | LiteRaceSegNet 모델 연동, 손상 영역 탐지 | ✅ UI 완성 / 🔗 백엔드 연동 예정 |
| 이미지 비교 슬라이더 | 원본 vs 분석 결과 드래그 비교 | ✅ 완성 |
| 손상 통계 시각화 | 도넛 차트, 바 차트, 전체 분포 바 | ✅ 완성 |
| AI 리포트 자동 생성 | 분석 결과 기반 점검 리포트 초안 | ✅ UI 완성 / 🔗 LLM 연동 예정 |
| 리포트 편집 및 다운로드 | 인라인 편집, TXT 저장, PDF 다운로드 | ✅ TXT 완성 / 🔗 PDF 백엔드 연동 예정 |
| 분석 이력 관리 | 과거 분석 결과 저장 및 재열람 | ✅ 완성 (localStorage) |

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18 | UI 컴포넌트 |
| Vite | 8 | 빌드 툴 |
| Recharts | - | 손상 통계 차트 |
| Space Grotesk | - | 메인 폰트 |
| JetBrains Mono | - | 숫자, 코드 폰트 |
| CSS-in-JS | - | 다크모드 디자인 시스템 |

### Backend (연동 예정)
| 기술 | 용도 |
|------|------|
| FastAPI + Python | 이미지 업로드 API, 통계 계산 |
| LiteRaceSegNet | 도로 손상 세그멘테이션 모델 |
| LLM | AI 점검 리포트 생성 |

---

## 실행 방법

### 요구사항
- Node.js 18+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 아래 초대 코드로 로그인:

```
ROAD2026
```

> ⚠️ 배포 시 반드시 백엔드 API 인증으로 교체해야 합니다.

---

## API 연동 가이드

백엔드 연동 시 `src/App.jsx` 내 아래 주석을 찾아 교체하면 됩니다.

```js
// ── 실제 API 연동 시 아래로 교체 ──────────────────
// const res = await fetch("/api/...", { ... })
// ───────────────────────────────────────────────────
```

### 엔드포인트

| Method | Endpoint | 위치 | 설명 |
|--------|----------|------|------|
| `POST` | `/api/auth/verify` | `LoginPage` | 초대 코드 검증 및 토큰 발급 |
| `POST` | `/api/analyze` | `UploadPage` | 이미지 분석 → 세그멘테이션 결과 반환 |
| `POST` | `/api/report` | `ResultPage` | 분석 결과 기반 AI 리포트 생성 |
| `POST` | `/api/report/pdf` | `ReportPage` | 리포트 PDF 변환 및 다운로드 |

### `/api/analyze` 응답 형식

```json
{
  "original_image_url": "/temp/original_001.jpg",
  "result_image_url": "/temp/result_001.png",
  "class_stats": [
    { "class_name": "crack", "label": "균열", "area_ratio": 12.4, "severity": "medium", "color": "#F59E0B" },
    { "class_name": "pothole", "label": "포트홀", "area_ratio": 4.8, "severity": "high", "color": "#F87171" }
  ],
  "summary": {
    "main_damage_type": "균열",
    "total_damage_ratio": 17.2,
    "estimated_severity": "medium"
  }
}
```

---

## 프로젝트 구조

```
road-inspection/
├── src/
│   └── App.jsx          # 전체 앱 (단일 파일 구조)
├── public/
│   └── logo.png         # 서비스 로고
├── .claude/
│   └── skills/
│       └── frontend-design/
│           └── SKILL.md # Claude 프론트엔드 작업 스킬
└── README.md
```

---

## 팀 역할

| 역할 | 담당 업무 |
|------|----------|
| **프론트엔드** | React UI, 이미지 비교 슬라이더, 통계 차트, 다크모드 디자인 시스템 |
| **백엔드** | FastAPI 서버, LiteRaceSegNet 모델 연동, 손상 통계 계산 API |
| **AI** | LiteRaceSegNet 세그멘테이션 모델 개발, LLM 리포트 생성 |
