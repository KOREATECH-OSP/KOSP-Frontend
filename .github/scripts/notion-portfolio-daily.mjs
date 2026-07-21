// 하루치 커밋을 모아 "포트폴리오형 개발기록 문서"를 만들어
//   (1) 팀 노션 DB 에 본문 페이지로 남기고
//   (2) portfolio-output.md 파일로도 저장한다(워크플로가 메일 첨부/아티팩트로 사용).
//
// AI(유료 API) 없이 커밋 메시지 + 변경파일 수치를 [양식]에 채우는 무료 템플릿 버전.
//
// 필요한 env: NOTION_TOKEN, NOTION_DB_ID, PROJECT_NAME
//   (선택) SINCE(기본 "1 day ago"), BRANCH, FORCE(수동실행 시 중복 무시),
//          GITHUB_SERVER_URL / GITHUB_REPOSITORY / GITHUB_RUN_ID (ActionRunURL 용)
//
// Node 18+ (fetch 내장). 외부 의존성 없음.

import { execSync } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const P = process.env;
const SINCE = P.SINCE || '1 day ago';
const PROJECT = P.PROJECT_NAME || 'KOSP-Backend';
const BRANCH = P.BRANCH || 'develop';
const MAX_COMMITS = 60;
const OUTPUT_MD = 'portfolio-output.md';

function fail(msg) {
  console.log(`::error::${msg}`);
  console.error(msg);
  process.exit(1);
}

const missing = ['NOTION_TOKEN', 'NOTION_DB_ID'].filter((k) => !P[k]);
if (missing.length) {
  fail(`필수 시크릿 누락: ${missing.join(', ')} — 레포 Settings → Secrets and variables → Actions 에 등록하세요.`);
}

// ── 1) 커밋 수집 ────────────────────────────────────────────────────

function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

const US = '\x1f';
const RS = '\x1e';
let raw = '';
try {
  raw = git(`log --since="${SINCE}" --date=short --no-merges --pretty=format:'%H${US}%an${US}%ad${US}%s${US}%b${RS}'`);
} catch (e) {
  fail(`git log 실패: ${e.message}`);
}

const commits = raw
  .split(RS)
  .map((r) => r.trim())
  .filter(Boolean)
  .map((r) => {
    const [hash, author, date, subject, body] = r.split(US);
    return { hash: (hash || '').trim(), author, date, subject: (subject || '').trim(), body: (body || '').trim() };
  })
  .filter((c) => c.hash);

if (commits.length === 0) {
  console.log(`대상 기간(${SINCE})에 커밋이 없어 종료합니다.`);
  process.exit(0);
}

// 변경 파일 집계
const oldest = commits[commits.length - 1].hash;
let base;
try {
  base = git(`rev-parse ${oldest}^`).trim();
} catch {
  base = git('rev-parse --max-parents=0 HEAD').trim().split('\n')[0];
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

const typeCounts = {};
for (const c of commits) {
  const m = /^(feat|fix|docs|refactor|chore|test|style|perf|ci|build)/i.exec(c.subject || '');
  const t = (m ? m[1] : 'chore').toLowerCase();
  typeCounts[t] = (typeCounts[t] || 0) + 1;
}
const workType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

const usedCommits = commits.slice(0, MAX_COMMITS);
const truncated = commits.length > MAX_COMMITS;
const kstDate = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const title = `[일일 개발로그] ${kstDate} · ${PROJECT}`;
const runUrl =
  P.GITHUB_SERVER_URL && P.GITHUB_REPOSITORY && P.GITHUB_RUN_ID
    ? `${P.GITHUB_SERVER_URL}/${P.GITHUB_REPOSITORY}/actions/runs/${P.GITHUB_RUN_ID}`
    : null;

// ── 2) 마크다운 문서 생성 (무료 템플릿) ────────────────────────────

function buildMarkdown() {
  const L = [];
  L.push(`# [${kstDate}] ${PROJECT} 일일 개발 로그`);
  L.push('');

  L.push('## 1. 작업 개요');
  L.push('| 항목 | 값 |');
  L.push('| --- | --- |');
  L.push(`| 날짜(KST) | ${kstDate} |`);
  L.push(`| 프로젝트 / 브랜치 | ${PROJECT} / ${BRANCH} |`);
  L.push(`| 커밋 수 | ${commits.length}건 |`);
  L.push(`| 총 변경파일 | ${metrics.totalFiles}개 |`);
  L.push(`| 대표 작업유형 | ${workType} |`);
  if (runUrl) L.push(`| CI 실행 | ${runUrl} |`);
  L.push('');

  L.push('## 2. 커밋 내역');
  for (const c of usedCommits) {
    L.push(`- **${c.subject}** — ${c.author}, ${c.date} (\`${c.hash.slice(0, 7)}\`)`);
  }
  if (truncated) L.push(`- … 외 ${commits.length - MAX_COMMITS}건 생략`);
  L.push('');

  L.push('## 3. 정량 지표');
  L.push('| 지표 | 수치 |');
  L.push('| --- | --- |');
  L.push(`| 총 변경파일 | ${metrics.totalFiles} |`);
  L.push(`| 백엔드(.java) | ${metrics.backendFiles} |`);
  L.push(`| 프론트(src·tsx) | ${metrics.frontendFiles} |`);
  L.push(`| 마이그레이션 SQL | ${metrics.migrationFiles} |`);
  L.push(`| 엔티티/DTO | ${metrics.entityDtoFiles} |`);
  L.push('');

  L.push('## 4. 작업유형 분포');
  L.push('| 유형 | 커밋 수 |');
  L.push('| --- | --- |');
  for (const [t, n] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    L.push(`| ${t} | ${n} |`);
  }
  L.push('');

  L.push('## 5. 변경 파일 (일부)');
  for (const f of files.slice(0, 40)) L.push(`- ${f}`);
  if (files.length > 40) L.push(`- … 외 ${files.length - 40}개`);
  L.push('');

  L.push('## 6. 작업 배경/요약 (자동 정리)');
  L.push(
    `이 기간(${SINCE}) 동안 ${commits.length}개 커밋으로 총 ${metrics.totalFiles}개 파일을 변경했습니다. ` +
      `대표 작업유형은 ${workType} 이며, 작업유형 분포는 ` +
      `${Object.entries(typeCounts).map(([t, n]) => `${t} ${n}건`).join(', ')} 입니다.`,
  );
  const highlights = usedCommits.slice(0, 3).map((c) => c.subject);
  if (highlights.length) L.push(`주요 작업: ${highlights.join(' / ')}.`);
  L.push('');

  L.push('## 7. 증빙 (커밋 해시)');
  for (const c of usedCommits) L.push(`- ${c.hash} · ${c.subject}`);
  L.push('');

  return L.join('\n');
}

const md = buildMarkdown();
writeFileSync(OUTPUT_MD, md, 'utf8');
console.log(`마크다운 저장: ${OUTPUT_MD} (${md.length}자)`);

// 워크플로 후속 스텝(메일 제목 등)에서 쓰도록 노출
if (P.GITHUB_ENV) {
  appendFileSync(P.GITHUB_ENV, `PORTFOLIO_TITLE=${title}\n`);
  appendFileSync(P.GITHUB_ENV, `PORTFOLIO_MD=${OUTPUT_MD}\n`);
}

// ── 3) 마크다운 → 노션 블록 변환 ───────────────────────────────────

function richText(text) {
  const t = (text || '').replace(/\*\*/g, '').replace(/`/g, '').replace(/^#+\s*/, '');
  if (!t) return [{ type: 'text', text: { content: '' } }];
  const out = [];
  for (let i = 0; i < t.length; i += 2000) out.push({ type: 'text', text: { content: t.slice(i, i + 2000) } });
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

function mdToBlocks(text) {
  const lines = text.replace(/```[a-z]*\n?/gi, '').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
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
      /* skip */
    } else blocks.push(para(line));
    i++;
  }
  return blocks;
}

// ── 4) 노션 페이지 생성 (하루 1개 중복 방지) ───────────────────────

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

async function alreadyGeneratedToday() {
  try {
    const res = await notion(`/databases/${P.NOTION_DB_ID}/query`, 'POST', {
      page_size: 1,
      filter: {
        and: [
          { property: '프로젝트', select: { equals: PROJECT } },
          { property: '작성자', rich_text: { equals: 'portfolio-bot' } },
          { property: '날짜', date: { on_or_after: `${kstDate}T00:00:00+09:00` } },
        ],
      },
    });
    return (res.results || []).length > 0;
  } catch (e) {
    console.warn('중복 조회 실패(계속 진행):', e.message);
    return false;
  }
}

async function run() {
  const force = P.FORCE === 'true';
  if (!force && (await alreadyGeneratedToday())) {
    console.log(`오늘(${kstDate}) ${PROJECT} 노션 페이지가 이미 있어 노션 생성은 스킵합니다(메일/파일은 계속).`);
    return;
  }

  const blocks = mdToBlocks(md);
  const props = {
    작업명: { title: [{ text: { content: title.slice(0, 200) } }] },
    프로젝트: { select: { name: PROJECT } },
    날짜: { date: { start: new Date().toISOString() } },
    브랜치: { rich_text: [{ text: { content: BRANCH } }] },
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

  const page = await notion('/pages', 'POST', {
    parent: { database_id: P.NOTION_DB_ID },
    properties: props,
    children: blocks.slice(0, 100),
  });
  for (let i = 100; i < blocks.length; i += 100) {
    await notion(`/blocks/${page.id}/children`, 'PATCH', { children: blocks.slice(i, i + 100) });
  }
  console.log(`노션 페이지 생성 완료: ${page.id} (블록 ${blocks.length}개)`);
}

run().catch((e) => {
  fail(`실패: ${e.message}`);
});
