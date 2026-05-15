---
name: frontend-design
description: 도로 점검 플랫폼 (Road Inspection Assistant) 프론트엔드 작업 스킬. React + 다크모드 디자인 시스템 기반으로 컴포넌트를 추가하거나 수정할 때 사용. 색상 토큰, 컴포넌트 패턴, API 연동 위치를 자동으로 인식하고 일관성 있게 작업.
---

## 프로젝트 개요
도로 손상 탐지 및 분석 웹 플랫폼. LiteRaceSegNet AI 모델 연동.
- 파일 구조: 단일 파일 src/App.jsx
- 스택: React 18, Vite, Recharts, CSS-in-JS
- 테마: 다크모드 전용 (#0D1117 베이스)

## 색상 토큰 (C 객체)
cyan: "#22D3EE" — 주요 포인트 컬러
cyanLt: "rgba(34,211,238,0.12)"
cyanBdr: "rgba(34,211,238,0.25)"
bg: "#0D1117" — 페이지 베이스
bgCard: "#161B22" — 카드
bgEl: "#1C2128" — 인풋
bdr: "rgba(255,255,255,0.08)"
txtPri: "#F0F6FC"
txtSec: "#8B949E"
txtMut: "#484F58"

## 디자인 원칙
1. 다크 전용 — 라이트모드 없음
2. 시안 포인트 — CTA, 강조는 C.cyan
3. 배경 3단계 — bg → bgCard → bgEl
4. SVG 아이콘 — 이모지 사용 금지
5. wordBreak: keep-all — 한국어 줄바꿈 방지
6. uppercase 레이블 — 섹션 타이틀
7. 시안 버튼 글로우 — boxShadow: "0 4px 20px rgba(34,211,238,0.25)"

## API 연동 위치
LoginPage → POST /api/auth/verify
UploadPage → POST /api/analyze
ResultPage → POST /api/report
ReportPage → POST /api/report/pdf

## 금지사항
- 이모지를 UI 아이콘으로 사용 금지
- 하드코딩 색상 금지 (C 토큰 사용)
- 라이트 배경색 금지
- 새 파일 생성 금지 (App.jsx 단일 파일 유지)
