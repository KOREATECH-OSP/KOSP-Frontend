// 하루치 커밋을 모아 "포트폴리오형 개발기록 문서(고정 13섹션 양식)"를 만들어
//   (1) 팀 노션 DB 에 본문 페이지로 남기고
//   (2) portfolio-output.md 파일로도 저장한다(워크플로가 메일 첨부/아티팩트로 사용).
//
// AI(유료 API) 없이: 사실/수치/파일목록/커밋링크는 자동으로 채우고,
// 배경·설계·회고 등 통찰이 필요한 칸은 "✍️ 직접 작성" 자리로 고정 배치한다.
//
// 필요한 env: NOTION_TOKEN, NOTION_DB_ID, PROJECT_NAME
//   (선택) SINCE(기본 "1 day ago"), BRANCH, FORCE, GITHUB_SERVER_URL/REPOSITORY/RUN_ID

import { execSync } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const P = process.env;
const SINCE = P.SINCE || '1 day ago';
const PROJECT = P.PROJECT_NAME || 'KOSP-Backend';
const BRANCH = P.BRANCH || 'develop';
const MAX_COMMITS = 60;
const OUTPUT_MD = 'portfolio-output.md';
const REPO_BASE =
  P.GITHUB_SERVER_URL && P.GITHUB_REPOSITORY ? `${P.GITHUB_SERVER_URL}/${P.GITHUB_REPOSITORY}` : null;

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

// 파일 분류
const feFiles = files.filter((f) => /^src\/|\.(t|j)sx?$/.test(f));
const beFiles = files.filter((f) => /\.java$/.test(f));
const infraFiles = files.filter((f) => /db\/migration\/.*\.sql$|^\.github\/|\.ya?ml$|build\.gradle|Dockerfile/.test(f));
const etcFiles = files.filter((f) => !feFiles.includes(f) && !beFiles.includes(f) && !infraFiles.includes(f));

const count = (re) => files.filter((f) => re.test(f)).length;
const metrics = {
  totalFiles: files.length,
  frontendFiles: feFiles.length,
  backendFiles: beFiles.length,
  infraFiles: infraFiles.length,
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
const hasFeat = !!typeCounts.feat;
const maintTypes = ['fix', 'refactor', 'chore', 'ci', 'test', 'perf', 'build', 'style', 'docs'];
const hasMaint = Object.keys(typeCounts).some((t) => maintTypes.includes(t));
const nature = hasFeat && hasMaint ? '신규 기능 개발 + 실무형 유지보수(혼재)' : hasFeat ? '신규 기능 개발' : '실무형 유지보수(리팩터링·버그수정·설정·자동화)';

const usedCommits = commits.slice(0, MAX_COMMITS);
const truncated = commits.length > MAX_COMMITS;
const kstDate = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const title = `[개발기록] ${kstDate} · ${PROJECT}`;
const runUrl = REPO_BASE && P.GITHUB_RUN_ID ? `${REPO_BASE}/actions/runs/${P.GITHUB_RUN_ID}` : null;
const workName = usedCommits[0].subject;
const topDirs = [...new Set(files.map((f) => f.split('/')[0]))].slice(0, 8);

// ── 2) 마크다운 문서 생성 (고정 13섹션 양식) ───────────────────────

function fileList(arr, limit = 25) {
  const L = [];
  if (arr.length === 0) return ['- (해당 없음)'];
  for (const f of arr.slice(0, limit)) L.push(`- ${f}`);
  if (arr.length > limit) L.push(`- … 외 ${arr.length - limit}개`);
  return L;
}
const PEN = '✍️ [직접 작성]';

function buildMarkdown() {
  const L = [];
  L.push(`# ${title}`);
  L.push('');
  L.push(`> 자동 생성 골격. **${PEN}** 표시된 칸만 채우면 됩니다. (개요·파일목록·수치·증빙은 자동)`);
  L.push('');

  L.push('## 0. 작업 성격');
  L.push(`- **판정: ${nature}**`);
  L.push(`- 커밋유형 분포: ${Object.entries(typeCounts).map(([t, n]) => `${t} ${n}`).join(', ')}`);
  L.push('');

  L.push('## 1. 작업 개요');
  L.push('| 항목 | 값 |');
  L.push('| --- | --- |');
  L.push(`| 작업명 | ${workName}${commits.length > 1 ? ` 외 ${commits.length - 1}건` : ''} |`);
  L.push(`| 작업 유형 | ${nature} (${workType}) |`);
  L.push(`| 작업 기간 | ${usedCommits[usedCommits.length - 1].date} ~ ${usedCommits[0].date} (KST 기준 ${kstDate}) |`);
  L.push(`| 관련 서비스/모듈 | ${topDirs.join(', ') || '-'} |`);
  L.push(`| 담당자 | ${[...new Set(commits.map((c) => c.author))].join(', ')} |`);
  L.push(`| 관련 브랜치 | ${BRANCH} |`);
  L.push(`| 커밋 수 / 변경파일 | ${commits.length}건 / ${metrics.totalFiles}개 |`);
  if (REPO_BASE) L.push(`| 관련 PR/커밋 | ${REPO_BASE}/commits/${BRANCH} |`);
  L.push('');
  L.push(`- 관련 이슈/티켓: ${PEN}`);
  L.push('');

  L.push('## 2. 작업 배경');
  L.push(`${PEN} 왜 이 작업이 필요했는가 / 기존 문제 / 사용자·운영 영향 / 우선순위 · 긴급도`);
  L.push(`- (자동 힌트) 이번 기간 ${topDirs.join('·')} 영역에서 ${workType} 성격의 작업 ${commits.length}건, ${metrics.totalFiles}개 파일 변경.`);
  L.push('');

  L.push('## 3. 목표');
  L.push(`${PEN} 이번 작업의 목표 / 성공 기준 / 완료 기준(DoD)`);
  L.push(`- (자동 힌트) 주요 커밋: ${usedCommits.slice(0, 3).map((c) => c.subject).join(' / ')}`);
  L.push('');

  L.push('## 4. 작업 전 상태');
  L.push(`${PEN} 기존 동작 방식 / 기존 UI·기능 / 기존 API·DB 구조 / 기존 권한·정책 / 문제 재현 방법 / 작업 전 로그·에러`);
  L.push('');

  L.push('## 5. 요구사항 정리');
  L.push(`${PEN} 기능 요구사항 / 비기능 요구사항 / 예외 처리 / 권한 정책 / 데이터 정책 / 배포 시 주의사항`);
  L.push('');

  L.push('## 6. 설계 / 판단');
  L.push(`${PEN} 고려한 대안 A / 대안 B / 최종 선택안 / 선택 이유 / 트레이드오프 / 향후 확장 고려사항`);
  L.push('');

  L.push('## 7. 구현 내용');
  L.push('### 프론트엔드');
  L.push(...fileList(feFiles));
  L.push(`${PEN} UI/UX 변경점 · 상태 관리 변경점`);
  L.push('');
  L.push('### 백엔드');
  L.push(...fileList(beFiles));
  L.push(`${PEN} API 변경점 · 서비스/도메인 변경점 · 권한/상태값 변경점`);
  L.push('');
  L.push('### DB / 인프라');
  L.push(...fileList(infraFiles));
  if (etcFiles.length) {
    L.push('');
    L.push('### 기타');
    L.push(...fileList(etcFiles, 15));
  }
  L.push(`${PEN} 엔티티/테이블 변경 · 마이그레이션 · 환경변수 · 배포/워크플로 변경 설명`);
  L.push('');

  L.push('## 8. 테스트');
  L.push(`${PEN} 재현/정상/예외/권한 케이스 · 테스트 결과`);
  if (runUrl) L.push(`- (자동) CI 실행: ${runUrl}`);
  L.push('');

  L.push('## 9. 결과');
  L.push('| 항목 | 개선 전 | 개선 후 |');
  L.push('| --- | --- | --- |');
  L.push(`| ${PEN} | | |`);
  L.push(`- (자동) 이 기간 총 ${metrics.totalFiles}개 파일 변경 (백엔드 ${metrics.backendFiles} · 프론트 ${metrics.frontendFiles} · 인프라 ${metrics.infraFiles}).`);
  L.push(`${PEN} 개선 효과 / 사용자 입장 변화 / 운영 입장 변화`);
  L.push('');

  L.push('## 10. 수치화 (자동)');
  L.push('| 지표 | 수치 |');
  L.push('| --- | --- |');
  L.push(`| 총 변경 파일 수 | ${metrics.totalFiles} |`);
  L.push(`| 프론트 변경 파일 수 | ${metrics.frontendFiles} |`);
  L.push(`| 백엔드 변경 파일 수 | ${metrics.backendFiles} |`);
  L.push(`| DB/인프라 변경 파일 수 | ${metrics.infraFiles} |`);
  L.push(`| 마이그레이션(SQL) 수 | ${metrics.migrationFiles} |`);
  L.push(`| 엔티티/DTO 관련 파일 수 | ${metrics.entityDtoFiles} |`);
  L.push(`| 커밋 수 | ${commits.length} |`);
  L.push('');
  L.push('| 작업유형 | 커밋 수 |');
  L.push('| --- | --- |');
  for (const [t, n] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) L.push(`| ${t} | ${n} |`);
  L.push('');

  L.push('## 11. 증빙 자료');
  if (REPO_BASE) L.push(`- 커밋 목록: ${REPO_BASE}/commits/${BRANCH}`);
  if (runUrl) L.push(`- CI 실행 로그: ${runUrl}`);
  for (const c of usedCommits) {
    L.push(`- \`${c.hash.slice(0, 7)}\` ${c.subject}${REPO_BASE ? ` — ${REPO_BASE}/commit/${c.hash}` : ''}`);
  }
  if (truncated) L.push(`- … 외 ${commits.length - MAX_COMMITS}건`);
  L.push(`${PEN} 작업 전/후 캡처 · API 응답 예시 · DB 변경 증빙`);
  L.push('');

  L.push('## 12. 회고');
  L.push(`${PEN} 잘한 점 / 아쉬운 점 / 다음에 개선할 점 / 배운 점 / 실무형 경험 포인트`);
  L.push('');

  L.push('## 13. 포트폴리오용 요약');
  L.push(`- (자동 초안) ${PROJECT}에서 ${nature} ${commits.length}건 진행, ${metrics.totalFiles}개 파일 변경(백엔드 ${metrics.backendFiles}·프론트 ${metrics.frontendFiles}·인프라 ${metrics.infraFiles}).`);
  L.push(`${PEN} 한 줄 요약 / 문제 → 해결 → 결과 / 내가 맡은 역할 / 기술적으로 강조할 부분 / 협업·운영 측면 강조할 부분`);
  L.push('');

  L.push('## 부록. 취업/부트캠프 강조 포인트');
  const tips = [];
  if (metrics.migrationFiles > 0) tips.push(`DB 마이그레이션 ${metrics.migrationFiles}건 → 스키마 설계/버전관리 어필`);
  if (metrics.entityDtoFiles > 0) tips.push(`엔티티/DTO ${metrics.entityDtoFiles}개 변경 → 도메인 설계 어필`);
  if (metrics.infraFiles > 0) tips.push(`인프라/CI ${metrics.infraFiles}건 → 자동화/DevOps 어필`);
  if (hasFeat) tips.push('신규 기능 → 문제정의·설계 서술을 강화');
  if (hasMaint) tips.push('유지보수 → "왜 이렇게 고쳤는지" 트레이드오프 서술이 가치');
  if (tips.length === 0) tips.push('변경 규모가 작음 → 여러 날 묶어 하나의 스토리로 정리 권장');
  for (const t of tips) L.push(`- ${t}`);
  L.push('');

  return L.join('\n');
}

const md = buildMarkdown();
writeFileSync(OUTPUT_MD, md, 'utf8');
console.log(`마크다운 저장: ${OUTPUT_MD} (${md.length}자)`);
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
const heading = (level, text) => ({ object: 'block', type: `heading_${level}`, [`heading_${level}`]: { rich_text: richText(text) } });
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
    else if ((m = /^>\s?(.*)/.exec(line))) blocks.push(para(m[1]));
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
