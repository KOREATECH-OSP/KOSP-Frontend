# 작업/배포 로그 → 팀 노션 자동 기록

KOSP-Frontend 의 PR/배포 활동을 팀 노션 DB 에 자동으로 남기는 파이프라인입니다.
(KOSP-Backend 와 동일한 팀 노션 DB 를 공유합니다. 프론트 레포에도 동일한 시크릿이 필요합니다.)

## 구성

| 파일 | 역할 |
|---|---|
| `.github/workflows/ci.yml` | Node 타입체크(`tsc`)/린트(`eslint`). 단독 실행 + `worklog.yml` 에서 재사용 |
| `.github/workflows/worklog.yml` | PR/develop-push 시 CI 실행 → diff 메트릭 계산 → 노션 기록 |
| `.github/scripts/notion-log.mjs` | 노션 DB 에 row 1건 생성 (Actions 에서 실행) |
| `.github/scripts/create-notion-db.mjs` | 노션 DB 를 1회 생성하는 헬퍼 (로컬 실행) |

## 최초 셋업 (1회)

### 1. 노션 Integration 생성
1. https://www.notion.so/my-integrations → **New integration** 생성
2. 발급된 **Internal Integration Token**(`ntn_...`) 복사

### 2. 팀 노션 DB 만들기
**방법 A — 스크립트 자동 생성 (권장)**
1. DB 를 넣을 팀 노션 부모 페이지 = `https://app.notion.com/p/DB-3922f15d9e5380a8b563d9acd0ec1e6a`
   → `NOTION_PARENT_PAGE_ID` = `3922f15d9e5380a8b563d9acd0ec1e6a`
2. 그 페이지 우측 상단 `···` → **Connections** → 위에서 만든 Integration 연결 (필수)
3. 로컬에서 실행 (`ntn_xxx` 를 본인 토큰으로 교체):
   ```bash
   NOTION_TOKEN=ntn_xxx \
   NOTION_PARENT_PAGE_ID=3922f15d9e5380a8b563d9acd0ec1e6a \
   node .github/scripts/create-notion-db.mjs
   ```
4. 출력된 `NOTION_DB_ID` 복사 → GitHub 시크릿에 등록

**방법 B — 수동 생성**
노션에서 DB(표)를 만들고 아래 컬럼을 직접 생성 (컬럼명이 `notion-log.mjs` 와 정확히 일치해야 함):
`작업명(Title)`, `프로젝트(Select)`, `날짜(Date)`, `브랜치(Text)`, `커밋해시(Text)`, `작성자(Text)`,
`PR번호(Number)`, `PR제목(Text)`, `PR병합됨(Checkbox)`, `작업유형(Select)`, `이벤트(Select)`,
`백엔드변경파일수/프론트변경파일수/엔티티DTO변경수/마이그레이션변경수/총변경파일수(Number)`,
`테스트통과(Checkbox)`, `배포환경(Select)`, `배포성공(Checkbox)`,
`개선전/개선후/개선효과/수치화지표/회고(Text)`, `전캡처/후캡처/ActionRunURL(URL)`
> 이 경우에도 DB 페이지에 Integration 을 **Connections** 로 연결해야 합니다.

### 3. GitHub 시크릿 등록
레포 **Settings → Secrets and variables → Actions → New repository secret** (레포 관리자 권한 필요):
| 이름 | 값 |
|---|---|
| `NOTION_TOKEN` | `ntn_...` |
| `NOTION_DB_ID` | 위에서 얻은 DB ID |

### 4. 동작 확인
- develop 대상 PR 을 하나 열어 본다 → Actions 탭에 `Worklog to Notion` 실행 → 팀 노션에 row 생성 확인.

## 자동 기록되는 필드
커밋/PR 메타, 작업유형(커밋 프리픽스), 백엔드/프론트/엔티티DTO/마이그레이션 변경 파일 수,
테스트 통과 여부, 배포환경/성공(develop push 기준), Actions 실행 로그 링크.

## 수동으로 채우는 필드 (회고 시)
개선 전/후/효과, 수치화 지표, 전/후 캡처 링크, 회고.
→ 자동 기록된 row 를 열어 이 칸만 채우면 포트폴리오 카드가 완성됩니다.

## 주의
- 이 워크플로는 **팀 공유 레포**에 올라가며, **팀원 전원의** develop PR/push 가 팀 노션에 기록됩니다.
- 배포 자동화(SSH → `infra/deploy.sh`)는 이 MVP 에 **포함되지 않음**. 현재 `배포성공`은
  "develop push + 테스트 통과" 기준의 논리값이며, 실제 서버 배포 연동은 2차 확장 항목입니다.
