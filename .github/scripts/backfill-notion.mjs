// 과거 커밋을 팀 노션 DB 에 일괄 기록(backfill)한다.
// commits.json (아래 형식) 을 읽어 커밋 1건당 노션 페이지 1개를 생성한다.
// Notion API rate limit(~3req/s) 대응으로 요청 간 딜레이를 둔다.
//
// 사용:
//   NOTION_TOKEN=ntn_xxx NOTION_DB_ID=xxxx node .github/scripts/backfill-notion.mjs commits.json
//
// commits.json 형식:
//   [{ sha, date, author, subject, type, backend, frontend, entityDto, migration, total }, ...]

import { readFileSync } from 'node:fs';

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DB_ID;
const file = process.argv[2] || 'commits.json';

if (!token || !dbId) {
  console.error('NOTION_TOKEN / NOTION_DB_ID 환경변수가 필요합니다.');
  process.exit(1);
}

const commits = JSON.parse(readFileSync(file, 'utf8'));
const projectName = process.env.PROJECT_NAME || 'KOSP-Backend';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => Number.parseInt(v || '0', 10) || 0;

let ok = 0;
let fail = 0;

for (const [i, c] of commits.entries()) {
  const props = {
    '작업명': { title: [{ text: { content: (c.subject || c.sha).slice(0, 200) } }] },
    '프로젝트': { select: { name: projectName } },
    '날짜': { date: { start: c.date } },
    '브랜치': { rich_text: [{ text: { content: 'develop' } }] },
    '커밋해시': { rich_text: [{ text: { content: (c.sha || '').slice(0, 7) } }] },
    '작성자': { rich_text: [{ text: { content: c.author || '' } }] },
    '작업유형': { select: { name: c.type || 'chore' } },
    '이벤트': { select: { name: 'push' } },
    '백엔드변경파일수': { number: num(c.backend) },
    '프론트변경파일수': { number: num(c.frontend) },
    '엔티티DTO변경수': { number: num(c.entityDto) },
    '마이그레이션변경수': { number: num(c.migration) },
    '총변경파일수': { number: num(c.total) },
    '테스트통과': { checkbox: false },
    '배포환경': { select: { name: 'none' } },
    '배포성공': { checkbox: false },
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parent: { database_id: dbId }, properties: props }),
  });

  if (res.ok) {
    ok++;
    console.log(`[${i + 1}/${commits.length}] OK  ${(c.sha || '').slice(0, 7)} ${c.subject || ''}`);
  } else {
    fail++;
    console.error(`[${i + 1}/${commits.length}] FAIL ${(c.sha || '').slice(0, 7)}:`, await res.text());
  }
  await sleep(400); // rate limit 대응
}

console.log(`\n완료: 성공 ${ok} / 실패 ${fail}`);
