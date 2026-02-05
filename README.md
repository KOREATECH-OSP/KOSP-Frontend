<div align="center">

# K-OSP Frontend

**한국기술교육대학교 오픈소스 프로젝트 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

</div>

---

## Overview

K-OSP(Korea Open Source Platform)는 한국기술교육대학교 컴퓨터공학부 학생들을 위한 오픈소스 프로젝트 협업 플랫폼입니다. 팀 구성, 프로젝트 모집, 커뮤니티, 챌린지 등 오픈소스 활동에 필요한 기능을 통합 제공합니다.

## Features

| 기능 | 설명 |
|------|------|
| **커뮤니티** | 게시판 기반의 자유 게시글 작성 및 토론 |
| **모집공고** | 오픈소스 프로젝트 팀원 모집 및 지원 |
| **팀 관리** | 팀 생성, 초대, 멤버 관리 |
| **챌린지** | GitHub 활동 기반 챌린지 시스템 |
| **관리자 패널** | 사용자/권한/콘텐츠/정책 통합 관리 |
| **알림** | 실시간 알림 시스템 |
| **검색** | 통합 검색 기능 |

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS 4
- **Rich Text Editor** — Lexical
- **Code Editor** — Monaco Editor
- **UI Components** — Radix UI, Headless UI
- **Animation** — GSAP
- **Icons** — Lucide React, Bootstrap Icons
- **Toast** — Sonner
- **Validation** — Zod

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# 저장소 클론
git clone https://github.com/KOREATECH-OSP/KOSP-Frontend.git
cd KOSP-Frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### Scripts

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버 실행
npm run lint      # 코드 린트
```

## Project Structure

```
src/
├── app/                  # App Router 페이지 및 레이아웃
│   ├── admin/            # 관리자 페이지
│   ├── auth/             # 인증 콜백
│   ├── challenge/        # 챌린지
│   ├── community/        # 커뮤니티 게시판
│   ├── recruit/          # 모집공고
│   ├── team/             # 팀 관리
│   ├── user/             # 사용자 프로필
│   ├── notification/     # 알림
│   └── search/           # 검색
├── common/               # 공용 컴포넌트, 훅, 유틸리티
├── lib/                  # API 클라이언트, 인증, 유틸리티
├── assets/               # 정적 자원
├── mocks/                # 목업 데이터
└── types/                # 타입 정의
```

## Contributing

1. `develop` 브랜치에서 새 브랜치를 생성합니다.
2. 변경 사항을 커밋합니다.
3. `main` 브랜치로 Pull Request를 생성합니다.

## License

이 프로젝트는 [MIT License](./LICENSE)에 따라 배포됩니다.

Copyright (c) 2025 Korea University of Technology and Education
