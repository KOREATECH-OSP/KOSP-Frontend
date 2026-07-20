// 하루치 커밋을 모아 "포트폴리오형 개발기록 문서"를 생성해 팀 노션 DB에 페이지로 남긴다.
//
// 동작:
//   1) git log 로 지정 기간(SINCE, 기본 "1 day ago")의 커밋 + 변경파일을 수집
//   2) Claude(Anthropic Messages API)로 [양식]에 맞춘 포트폴리오 문서(마크다운) 생성
//   3) 마크다운을 노션 블록으로 변환해 DB에 페이지 생성(본문 포함)
//
// 필요한 env:
//   NOTION_TOKEN, NOTION_DB_ID, ANTHROPIC_API_KEY, PROJECT_NAME
//   (선택) WORKLOG_MODEL(기본 claude-opus-4-8), SINCE, BRANCH,
//          GITHUB_SERVER_URL / GITHUB_REPOSITORY / GITHUB_RUN_ID (ActionRunURL 용)
//
// Node 18+ (fetch 내장). 학습/자동화용 스크립트.

import { execSync } from 'node:child_process';

const P = process.env;
const MODEL = P.WORKLOG_MODEL || 'claude-opus-4-8';
const SINCE = P.SINCE || '1 day ago';
const PROJECT = P.PROJECT_NAME || 'KOSP-Backend';
const MAX_COMMITS = 40; // LLM 입력 토큰 방어

if (!P.NOTION_TOKEN || !P.NOTION_DB_ID) {
  console.error('NOTION_TOKEN / NOTION_DB_ID 가 없습니다.');
  process.exit(1);
}
if (!P.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY 가 없습니다. GitHub 시크릿에 등록하세요.');
  process.exit(1);
}

// ── 1) 커밋 수집 ────────────────────────────────────────────────────

function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

const US = '\x1f'; // 필드 구분
const RS = '\x1e'; // 레코드 구분
let raw = '';
try {
  raw = git(`log --since="${SINCE}" --date=short --no-merges --pretty=format:'%H${US}%an${US}%ad${US}%s${US}%b${RS}'`);
} catch (e) {
  console.error('git log 실패:', e.message);
  process.exit(1);
}

const commits = raw
  .split(RS)
  .map((r) => r.trim())
  .filter(Boolean)
  .map((r) => {
    const [hash, author, date, subject, body] = r.split(US);
    return { hash: (hash || '').trim(), author, date, subject, body: (body || '').trim() };
  })
  .filter((c) => c.hash);

if (commits.length === 0) {
  console.log(`대상 기간(${SINCE})에 커밋이 없어 종료합니다.`);
  process.exit(0);
}

// 변경 파일 집계 (기간 첫 커밋의 부모 ~ HEAD)
const oldest = commits[commits.length - 1].hash;
let base;
try {
  base = git(`rev-parse ${oldest}^`).trim();
} catch {
  base = git('rev-parse --max-parents=0 HEAD').trim().split('\n')[0]; // 루트 커밋
}
let files = [];
try {
  files = git(`diff --name-only ${base} HEAD`).split('\n').map((s) => s.trim()).filter(Boolean);
} catch {
  files = [];
}

const count = (re) => files.filter((f) => re.test(f)).length;
const metrics = {
  totalFiles: files.length,
  backendFiles: count(/\.java$/),
  frontendFiles: count(/^src\/|\.(t|j)sx?$/),
  migrationFiles: count(/db\/migration\/.*\.sql$/),
  entityDtoFiles: count(/(Entity|Dto|\/dto\/|\/model\/|\/request\/|\/response\/|\/types\.ts$)/),
};

// 대표 작업유형 (conventional commit prefix 최빈값)
const typeCounts = {};
for (const c of commits) {
  const m = /^(feat|fix|docs|refactor|chore|test|style|perf|ci|build)/i.exec(c.subject || '');
  const t = (m ? m[1] : 'chore').toLowerCase();
  typeCounts[t] = (typeCounts[t] || 0) + 1;
}
const workType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

const usedCommits = commits.slice(0, MAX_COMMITS);
const truncated = commits.length > MAX_COMMITS;

// KST 기준 날짜
const kstDate = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const runUrl = P.GITHUB_SERVER_URL && P.GITHUB_REPOSITORY && P.GITHUB_RUN_ID
  ? `${P.GITHUB_SERVER_URL}/${P.GITHUB_REPOSITORY}/actions/runs/${P.GITHUB_RUN_ID}`
  : null;

// ── 2) Claude 로 포트폴리오 문서 생성 ──────────────────────────────

const SYSTEM = `너는 이 프로젝트의 시니어 풀스택 엔지니어이자 테크리드다.
아래에 주어진 "하루치 실제 커밋 데이터"만을 근거로, 실무형 개발 기록 + 부트캠프 회고 문서를 작성한다.

[절대 규칙]
- 주어진 데이터에 없는 사실/수치는 지어내지 말 것. 추측 금지.
- 수치화 가능한 것은 반드시 숫자로 적을 것. 수치가 없으면 "정량 추정 불가"라고 쓰지 말고, 왜 불가능한지 + 대체 가능한 지표를 제안할 것.
- "개선되었다" 같은 모호한 표현 대신, 무엇이 몇 개/몇 건/몇 % 바뀌었는지로 적을 것.
- 프론트엔드 / 백엔드 / 공통을 구분할 것.
- 출력은 한국어. GitHub-flavored Markdown. 표(| |)를 적극 사용. 서두 인사말/코드펜스 없이 문서만 출력.

[출력 섹션 순서] (이 순서와 번호를 지켜라)
1. 전체 작업 요약
2. 작업 개요 (작업명/유형/기간/모듈/브랜치/커밋수/변경파일수 표)
3. 작업 배경 (왜 이 커밋들이 필요했는가 — 커밋 메시지 근거)
4. 프론트엔드 정리
5. 백엔드 정리
6. 공통 설계/인프라 정리
7. 전후 비교표 (항목/개선전/개선후/변화량/비율)
8. 정량 지표 표 (프론트/백엔드/공통)
9. 테스트/검증 상태 (근거 없으면 "커밋 기준 확인 불가"로 명시)
10. 실무형 경험 포인트 / 회고 (잘한 점·아쉬운 점·배운 점)
11. 포트폴리오용 요약 3종 (한 줄 / 3줄 / 상세 — 각 최소 1개 숫자 포함)
12. 다음 작업 추천
13. 증빙(커밋 해시 목록)

문서 제목(맨 위 h1)은 "# [${kstDate}] ${PROJECT} 일일 개발 로그" 로 시작한다.`;

const payloadForModel = {
  project: PROJECT,
  branch: P.BRANCH || 'develop',
  date_kst: kstDate,
  window: SINCE,
  commit_count: commits.length,
  dominant_work_type: workType,
  metrics,
  changed_files_sample: files.slice(0, 120),
  changed_files_truncated: files.length > 120,
  commits: usedCommits,
  commits_truncated: truncated,
};

async function generateMarkdown() {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': P.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content:
            '아래는 오늘 하루치 실제 커밋 데이터(JSON)다. 이 데이터만 근거로 [양식]대로 문서를 작성해라.\n\n' +
            '```json\n' +
            JSON.stringify(payloadForModel, null, 2) +
            '\n```',
        },
      ],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Anthropic API 실패 (${res.status}): ${text.slice(0, 400)}`);
  }
  const data = JSON.parse(text);
  if (data.stop_reason === 'refusal') {
    throw new Error('Anthropic 응답이 refusal 로 종료됨.');
  }
  const block = (data.content || []).find((b) => b.type === 'text');
  const md = block ? block.text : '';
  if (!md.trim()) throw new Error('빈 응답.');
  return md;
}

// ── 3) 마크다운 → 노션 블록 변환 ───────────────────────────────────

function richText(text) {
  const t = (text || '').replace(/\*\*/g, '').replace(/`/g, '').replace(/^#+\s*/, '');
  if (!t) return [{ type: 'text', text: { content: '' } }];
  const out = [];
  for (let i = 0; i < t.length; i += 2000) {
    out.push({ type: 'text', text: { content: t.slice(i, i + 2000) } });
  }
  return out;
}
const heading = (level, text) => ({
  object: 'block',
  type: `heading_${level}`,
  [`heading_${level}`]: { rich_text: richText(text) },
});
const para = (text) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: richText(text) } });
const bullet = (text) => ({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(text) } });
const numbered = (text) => ({ object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: richText(text) } });

function tableBlock(rows) {
  const width = Math.max(...rows.map((r) => r.length));
  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: width,
      has_column_header: true,
      has_row_header: false,
      children: rows.map((r) => ({
        object: 'block',
        type: 'table_row',
        table_row: { cells: Array.from({ length: width }, (_, k) => richText(r[k] || '')) },
      })),
    },
  };
}

function mdToBlocks(md) {
  const lines = md.replace(/```[a-z]*\n?/gi, '').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // 표
    if (/^\s*\|/.test(line)) {
      const tbl = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tbl.push(lines[i]);
        i++;
      }
      const rows = tbl
        .map((r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
        .filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c) || c === ''));
      if (rows.length) blocks.push(tableBlock(rows));
      continue;
    }
    let m;
    if ((m = /^#\s+(.*)/.exec(line))) blocks.push(heading(1, m[1]));
    else if ((m = /^##\s+(.*)/.exec(line))) blocks.push(heading(2, m[1]));
    else if ((m = /^#{3,}\s+(.*)/.exec(line))) blocks.push(heading(3, m[1]));
    else if ((m = /^\s*[-*]\s+(.*)/.exec(line))) blocks.push(bullet(m[1]));
    else if ((m = /^\s*\d+\.\s+(.*)/.exec(line))) blocks.push(numbered(m[1]));
    else if (line.trim() === '') {
      /* skip blank */
    } else blocks.push(para(line));
    i++;
  }
  return blocks;
}

// ── 4) 노션 페이지 생성 ────────────────────────────────────────────

async function notion(path, method, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${P.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`Notion ${method} ${path} 실패 (${res.status}): ${t.slice(0, 400)}`);
  return JSON.parse(t);
}

async function run() {
  console.log(`포트폴리오 생성 시작: ${PROJECT}, 커밋 ${commits.length}건, model=${MODEL}`);
  const md = await generateMarkdown();
  const blocks = mdToBlocks(md);

  const props = {
    작업명: { title: [{ text: { content: `[일일 개발로그] ${kstDate} · ${PROJECT}`.slice(0, 200) } }] },
    프로젝트: { select: { name: PROJECT } },
    날짜: { date: { start: new Date().toISOString() } },
    브랜치: { rich_text: [{ text: { content: P.BRANCH || 'develop' } }] },
    커밋해시: { rich_text: [{ text: { content: `${commits.length}건 (~${commits[0].hash.slice(0, 7)})` } }] },
    작성자: { rich_text: [{ text: { content: 'portfolio-bot' } }] },
    작업유형: { select: { name: workType } },
    이벤트: { select: { name: 'schedule' } },
    백엔드변경파일수: { number: metrics.backendFiles },
    프론트변경파일수: { number: metrics.frontendFiles },
    엔티티DTO변경수: { number: metrics.entityDtoFiles },
    마이그레이션변경수: { number: metrics.migrationFiles },
    총변경파일수: { number: metrics.totalFiles },
    배포환경: { select: { name: 'dev' } },
  };
  if (runUrl) props.ActionRunURL = { url: runUrl };

  // 페이지 생성(children 최대 100) → 나머지는 append
  const first = blocks.slice(0, 100);
  const page = await notion('/pages', 'POST', {
    parent: { database_id: P.NOTION_DB_ID },
    properties: props,
    children: first,
  });

  for (let i = 100; i < blocks.length; i += 100) {
    await notion(`/blocks/${page.id}/children`, 'PATCH', { children: blocks.slice(i, i + 100) });
  }

  console.log(`노션 페이지 생성 완료: ${page.id} (블록 ${blocks.length}개)`);
}

run().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
