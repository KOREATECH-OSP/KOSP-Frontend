# KOSP Feature Spec Update

> 작성일: 2026-05-20  
> 대상 브랜치: develop

---

## 1. 이력서 목록 탭 UI (가로 탭 + 페이지네이션)

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| 목적 | 다중 이력서를 한눈에 파악하고 빠르게 전환 |
| UI 위치 | `/user/resume` 페이지 상단 |

**주요 동작**
- 이력서 목록을 가로 탭 버튼으로 표시 (드롭다운 제거)
- 선택된 탭은 주황색 테두리+배경으로 강조
- 기본 이력서에는 ★ 아이콘 표시
- 10개 초과 시 `<` / `>` 버튼으로 페이지 전환 (페이지당 10개)
- 새 이력서 생성 시 마지막 탭 페이지로 자동 이동
- 탭 아래 "기본으로 설정" / "이 이력서 삭제" 링크 표시

**관련 파일**
- `src/app/user/resume/ResumePageClient.tsx` — `resumeTabPage` state, 탭 렌더링 영역

---

## 2. 이력서 PDF 내보내기 수정

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| 목적 | 이력서 내용만 PDF로 다운로드 |
| UI 위치 | `/user/resume` 상단/하단 바 "PDF 다운로드" 버튼 |

**버그 원인 및 수정**
- `jspdf` v4.x는 named export `{ jsPDF }`를 지원하지 않음
- `import('jspdf')` → `{ jsPDF }` 를 `{ default: jsPDF }` 로 수정

**동작**
- `id="resume-print-area"` div만 html2canvas로 캡처 → A4 PDF 생성
- 헤더/버튼/탭 등 `print:hidden` 영역은 캡처 제외
- 이력서 전환 후에도 정상 작동 (캡처 대상 DOM 고정)

**관련 파일**
- `src/common/components/PdfDownloadButton.tsx`

---

## 3. 빈 필드 숨기기 (미리보기/PDF)

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| 목적 | 비어있는 섹션/항목을 미리보기·PDF에서 숨겨 깔끔한 출력물 제공 |

**동작**
- 각 섹션은 핵심 필드가 하나 이상 채워진 항목만 표시
  - 학력: `school` 필드 존재하는 항목만
  - 경력: `company` 필드 존재하는 항목만
  - 프로젝트: `name` 필드 존재하는 항목만
  - 교육이력: `title` 필드 존재하는 항목만
  - 수상이력: `name` 필드 존재하는 항목만
  - 자격증: `name` 필드 존재하는 항목만
  - 자기소개서: `content` 필드 존재하는 항목만
- 편집 UI에는 영향 없음 (빈 행 추가/삭제 가능)

**관련 파일**
- `src/app/user/resume/components/ResumeReadOnlyView.tsx`

---

## 4. 커스텀 섹션

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| 목적 | 기본 제공 섹션 외에 자유 형식의 항목 추가 |
| UI 위치 | `/user/resume` 편집 페이지 하단 |

**데이터 구조**
```typescript
customSections: [
  {
    id: string,           // 랜덤 ID
    title: string,        // 섹션명 (예: "대외활동")
    fields: [
      {
        id: string,
        label: string,    // 항목명 (예: "활동명")
        value: string,    // 내용
      }
    ]
  }
]
```

**동작**
- "항목 추가 (커스텀 섹션)" 버튼으로 새 섹션 생성
- 섹션명은 인라인 input으로 수정
- 섹션 내 필드 추가/삭제 가능
- 섹션 삭제 버튼으로 전체 섹션 제거
- 미리보기/PDF: 섹션명 + 필드(label: value) 형태로 표시, 비어있으면 숨김
- localStorage 자동저장, 서버 저장 시 포함됨

**관련 파일**
- `src/app/user/resume/hooks/useResumeStorage.ts` — `CustomSectionItem`, `CustomFieldItem`, `customSections` state
- `src/app/user/resume/ResumePageClient.tsx` — 편집 UI
- `src/app/user/resume/components/ResumeReadOnlyView.tsx` — 미리보기/PDF 렌더링
- `src/lib/api/types.ts` — `ResumeCustomSection`, `ResumeCustomField`, `ResumeData.customSections`
- `backend/.../resume/dto/request/ResumeSaveRequest.java` — `CustomSectionItem`, `CustomFieldItem` 중첩 레코드

**Notes**
- DB 마이그레이션 불필요: `resume_data` 컬럼이 JSONB이므로 임의 필드 저장 가능
- 백엔드 `ResumeSaveRequest`에 명시적 필드 추가 필요 (미추가 시 JSON 직렬화에서 누락됨)

---

## 5. 대표 칭호 위치 변경

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| 목적 | 이름 옆에 대표 칭호를 배치해 한눈에 파악 |
| UI 위치 | `/user` 프로필 카드 |

**변경 전**: 이름 아래 별도 줄  
**변경 후**: 이름과 같은 flex row, `rounded-full border border-amber-200 bg-amber-50` 배지 형태

**관련 파일**
- `src/app/user/UserPageClient.tsx` — 이름+칭호 flex row 영역

---

## 6. 보유 칭호 전체 표시 + 대표 칭호 강조

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| UI 위치 | `/user` 프로필 카드 이름 아래 |

**동작**
- 보유한 모든 칭호 아이콘을 가로로 나열
- 대표 칭호(`isDisplay = true`): 크기 40×40px, 주황색 링 강조
- 비대표 칭호: 크기 28×28px, 기본 회색 테두리
- 각 아이콘에 `title` 속성으로 칭호명 tooltip 표시

**관련 파일**
- `src/app/user/UserPageClient.tsx`

---

## 7. CurrentRank (시즌 랭킹 카드)에 대표 칭호 이미지 표시

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 일반 유저 |
| UI 위치 | `/user` 시즌 랭킹 카드 — 티어/점수 영역 하단 |

**동작**
- `SeasonRankingCard`에 `displayTitle` prop 추가
- 대표 칭호가 있을 경우 아이콘 + 칭호명 표시
- 없을 경우 아무것도 표시하지 않음 (레이아웃 깨짐 없음)

**관련 파일**
- `src/app/user/UserPageClient.tsx` — `SeasonRankingCard` 컴포넌트 및 호출부

---

## 8. 칭호 시드 데이터 확장

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 어드민/시스템 |
| 목적 | 더 다양한 마일스톤으로 유저 동기부여 강화 |

### 추가된 칭호 목록

#### COMMIT 계열 (4개 추가, 총 7개)
| 칭호명 | 코드 | 조건 | 등급 |
|---|---|---|---|
| 커밋 장인 | COMMIT_100 | 커밋 100개 이상 | EPIC |
| 커밋 머신 | COMMIT_300 | 커밋 300개 이상 | EPIC |
| 잔디밭 관리자 | COMMIT_500 | 커밋 500개 이상 | LEGENDARY |
| 깃허브 정복자 | COMMIT_1000 | 커밋 1000개 이상 | LEGENDARY |

#### STREAK 계열 (4개 추가, 총 6개)
| 칭호명 | 코드 | 조건 | 등급 |
|---|---|---|---|
| 의지의 개발자 | STREAK_14 | 14일 연속 접속 | RARE |
| 한 달의 수호자 | STREAK_30 | 30일 연속 접속 | EPIC |
| 두 달의 철인 | STREAK_60 | 60일 연속 접속 | LEGENDARY |
| 전설의 개근왕 | STREAK_100 | 100일 연속 접속 | LEGENDARY |

#### SEASON 계열 (8개 신규)
| 칭호명 | 코드 | 조건 | 등급 |
|---|---|---|---|
| 시즌 참여자 | SEASON_PARTICIPANT | MANUAL | COMMON |
| 시즌 브론즈 | SEASON_BRONZE | MANUAL | COMMON |
| 시즌 실버 | SEASON_SILVER | MANUAL | RARE |
| 시즌 골드 | SEASON_GOLD | MANUAL | EPIC |
| 시즌 TOP 10 | SEASON_TOP10 | MANUAL | EPIC |
| 시즌 TOP 3 | SEASON_TOP3 | MANUAL | LEGENDARY |
| 시즌 1위 | SEASON_FIRST | MANUAL | LEGENDARY |
| 시즌 성장왕 | SEASON_GROWTH | MANUAL | EPIC |

**관련 파일**
- `flyway/.../db/migration/V13__expanded_title_seed_data.sql`

**TODO — 시즌 자동 지급**
- 시즌 종료 시 배치가 순위 기반으로 칭호를 자동 지급하려면:
  1. `TitleConditionType`에 `SEASON_RANK_LTE` (또는 `SEASON_TIER_GTE`) 추가
  2. 해당 evaluator 구현
  3. 시즌 종료 배치에서 `TitleEvaluationService` 호출
  4. V14 마이그레이션으로 기존 MANUAL 조건을 자동 조건으로 교체

---

## 9. 관리자 칭호 이미지 업로드 가이드라인

| 항목 | 내용 |
|---|---|
| 사용자 유형 | 어드민 |
| UI 위치 | `/admin/titles` 페이지 상단 |

**가이드라인**
- 권장 크기: 128×128 px (1:1 비율)
- 허용 형식: PNG · JPG · WebP (최대 5MB)
- 렌더링 위치: 칭호 목록, 프로필 카드, 이력서 (56×56px)
- 이미지 없으면 카테고리 이모지로 대체

**관련 파일**
- `src/app/admin/titles/page.tsx`
- `backend/.../admin/title/service/AdminTitleService.java` — S3 업로드 로직
- `backend/.../admin/title/api/AdminTitleApi.java` — `POST /v1/admin/titles/{id}/image`
