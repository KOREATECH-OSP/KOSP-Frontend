// 팀 노션에 "작업/배포 로그" DB 를 1회 생성하는 헬퍼 스크립트.
// 로컬에서 한 번만 실행하면 된다. 결과로 나오는 DB ID 를 NOTION_DB_ID 시크릿에 등록.
//
// 사전 준비:
//   1) notion.so/my-integrations 에서 Integration 생성 → Internal Token 확보
//   2) DB 를 넣을 팀 노션 "부모 페이지" 를 하나 만들고, 그 페이지 우측 상단
//      ··· → Connections → 방금 만든 Integration 연결 (안 하면 404/403)
//   3) 부모 페이지 ID 확보 (페이지 URL 끝의 32자리 hex)
//
// 실행:
//   NOTION_TOKEN=ntn_xxx NOTION_PARENT_PAGE_ID=xxxxxxxx node .github/scripts/create-notion-db.mjs

const token = process.env.NOTION_TOKEN;
const parent = process.env.NOTION_PARENT_PAGE_ID;

if (!token || !parent) {
  console.error('NOTION_TOKEN / NOTION_PARENT_PAGE_ID 환경변수가 필요합니다.');
  process.exit(1);
}

const body = {
  parent: { type: 'page_id', page_id: parent },
  title: [{ type: 'text', text: { content: 'KOSP 작업/배포 로그' } }],
  properties: {
    '작업명': { title: {} },
    '프로젝트': {
      select: {
        options: [
          { name: 'KOSP-Backend', color: 'blue' },
          { name: 'KOSP-Frontend', color: 'green' },
        ],
      },
    },
    '날짜': { date: {} },
    '브랜치': { rich_text: {} },
    '커밋해시': { rich_text: {} },
    '작성자': { rich_text: {} },
    'PR번호': { number: {} },
    'PR제목': { rich_text: {} },
    'PR병합됨': { checkbox: {} },
    '작업유형': {
      select: {
        options: [
          { name: 'feat', color: 'blue' },
          { name: 'fix', color: 'red' },
          { name: 'docs', color: 'gray' },
          { name: 'refactor', color: 'purple' },
          { name: 'chore', color: 'default' },
          { name: 'test', color: 'yellow' },
          { name: 'style', color: 'pink' },
          { name: 'perf', color: 'orange' },
        ],
      },
    },
    '이벤트': {
      select: {
        options: [
          { name: 'push', color: 'green' },
          { name: 'pull_request', color: 'blue' },
          { name: 'deploy', color: 'orange' },
        ],
      },
    },
    '백엔드변경파일수': { number: {} },
    '프론트변경파일수': { number: {} },
    '엔티티DTO변경수': { number: {} },
    '마이그레이션변경수': { number: {} },
    '총변경파일수': { number: {} },
    '테스트통과': { checkbox: {} },
    '배포환경': {
      select: {
        options: [
          { name: 'dev', color: 'yellow' },
          { name: 'prod', color: 'red' },
          { name: 'none', color: 'gray' },
        ],
      },
    },
    '배포성공': { checkbox: {} },
    '개선전': { rich_text: {} },
    '개선후': { rich_text: {} },
    '개선효과': { rich_text: {} },
    '수치화지표': { rich_text: {} },
    '전캡처': { url: {} },
    '후캡처': { url: {} },
    '회고': { rich_text: {} },
    'ActionRunURL': { url: {} },
  },
};

const res = await fetch('https://api.notion.com/v1/databases', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const json = await res.json();
if (!res.ok) {
  console.error(`DB 생성 실패 (${res.status}):`, JSON.stringify(json, null, 2));
  process.exit(1);
}
console.log('DB 생성 완료!');
console.log('NOTION_DB_ID =', json.id);
console.log('URL =', json.url);
