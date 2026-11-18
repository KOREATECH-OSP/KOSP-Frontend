import type { ReactNode } from 'react';
import type { ResumeData } from '@/lib/api/types';
import { RESUME_PRINT_TARGET_ID } from '@/common/utils/generateResumePdf';
import { formatPeriod } from '@/lib/utils/resumeDate';
import { ensureEncodedUrl } from '@/lib/utils';
import styles from './ResumePrintLayout.module.css';

/**
 * 이력서 PDF 출력 전용 양식.
 *
 * <p>화면 컴포넌트({@code ResumeReadOnlyView})와 <b>의도적으로 공유하지 않는다</b>.
 * 화면은 반응형 카드 UI, 출력은 A4 고정 폭의 정형 이력서로 목적이 다르다. 화면을 그대로
 * 캡처하던 방식이 "페이지를 이어 붙인 것은 이력서가 아니다" 라는 지적을 받은 원인이다.</p>
 *
 * <h2>레이아웃</h2>
 * <p>사업단 제출 레퍼런스(resume-format.html)를 옮긴 것이다. 섹션 순서는 고정이며
 * 레퍼런스에 있는 섹션(학력·경력·자격증·기술 스택·프로젝트·자기소개서) 사이에
 * 레퍼런스에 없는 섹션을 같은 구성 요소(표 / 박스)로 끼워 넣는다.</p>
 *
 * <h2>표시 규칙</h2>
 * <ul>
 *   <li>사용자가 끈 섹션({@code visibleSections[id] === false})은 출력하지 않는다.</li>
 *   <li>내용이 없는 섹션은 "없습니다" 문구 대신 섹션 자체를 생략한다.</li>
 *   <li>커스텀 섹션은 화면과 같게 표시 토글을 적용하지 않는다.</li>
 * </ul>
 *
 * <h2>페이지 절단</h2>
 * <p>{@code generateResumePdf} 는 캡처 루트의 직계 자식과 {@code data-pdf-cut} 요소의 아래 끝을
 * 절단 후보로 쓴다. 루트의 직계 자식은 {@code .page} 하나뿐이므로 섹션·표 행·박스마다
 * {@code data-pdf-cut} 을 붙인다. 섹션 제목에는 붙이지 않는다 — 제목 바로 뒤에서 잘리면
 * 제목만 앞 페이지에 남는다.</p>
 *
 * <p>{@code resume_data} 는 서버 검증 없이 저장되므로 모든 값을 방어적으로 읽는다.</p>
 */

interface ResumePrintProfile {
  /** 이름. 프로필에서 온다 (resume_data 에는 없다). */
  name?: string | null;
  /** 프로필 사진 URL */
  profileImageUrl?: string | null;
  /** GitHub 주소 */
  githubUrl?: string | null;
}

interface Props {
  data: ResumeData;
  profile: ResumePrintProfile;
  /** 표시할 섹션. 없으면 전체 표시. */
  visibleSections?: Record<string, boolean>;
}

const CERT_STATUS_SUFFIX: Record<string, string> = {
  EXPIRED: ' (만료)',
};

/**
 * 프로젝트 라벨/값 2열에 들어갈 항목. 레퍼런스의 개요·담당·기술·성과 순서를 지키고,
 * 레퍼런스에 없는 필드는 그 사이와 뒤에 둔다. 빈 값은 행 자체를 뺀다.
 */
function projectFields(project: Record<string, unknown>): [label: string, value: string][] {
  const entries: [string, string][] = [
    ['개요', text(project.summary)],
    ['담당', text(project.role)],
    ['기술', strings(project.techStack).join(', ')],
    ['주요 기능', text(project.mainFeatures)],
    ['기여', text(project.myContributions)],
    ['문제 해결', text(project.problemSolving)],
    ['성과', text(project.result)],
    ['GitHub', text(project.githubLink)],
    ['배포', text(project.deployLink)],
    ['문서', text(project.docLink)],
  ];
  return entries.filter(([, value]) => value);
}

// ── 방어적 읽기 ──────────────────────────────────────────────────

/** 문자열이면 앞뒤 공백을 제거해 돌려주고, 아니면 빈 문자열. */
function text(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

/** 배열이면 객체 요소만 남기고, 아니면 빈 배열. */
function records(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is Record<string, unknown> => v !== null && typeof v === 'object');
}

/** 문자열 배열 또는 콤마 구분 문자열을 문자열 배열로. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(value)) return [];
  return value.map(text).filter(Boolean);
}

/** 새 형식(startDate/endDate)을 우선하고, 없으면 레거시 자유 입력 period. */
function periodOf(item: Record<string, unknown>): string {
  return formatPeriod(text(item.startDate), text(item.endDate)) || text(item.period);
}

/** 연락처 표기용으로 URL 의 프로토콜과 끝 슬래시를 뗀다. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
}

// ── 구성 요소 ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section} data-pdf-cut>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

interface Row {
  key: string;
  period: string;
  org: string;
  content: string;
}

/** 기간 34mm | 기관 46mm | 내용 표. */
function PeriodTable({ rows }: { rows: Row[] }) {
  return (
    <table className={styles.table}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} data-pdf-cut>
            <td className={styles.period}>{row.period}</td>
            <td className={styles.org}>{row.org}</td>
            <td className={styles.multiline}>{row.content}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── 본체 ────────────────────────────────────────────────────────

export default function ResumePrintLayout({ data, profile, visibleSections }: Props) {
  const show = (id: string) => !visibleSections || visibleSections[id] !== false;

  const name = text(profile.name) || text(data.resumeTitle) || '이력서';
  const headline = show('sec-basic') ? text(data.headline) : '';
  const photoUrl = text(profile.profileImageUrl);
  // normalizeJobRole 은 배열 요소가 문자열이라고 가정한다. 검증 없는 데이터에 대비해 strings() 를 쓴다.
  const jobRoles = show('sec-jobRole') ? strings(data.jobRole) : [];
  const githubUrl = text(profile.githubUrl);
  const links = show('sec-links')
    ? records(data.links).filter((l) => text(l.url))
    : [];

  const education: Row[] = show('sec-education')
    ? records(data.education)
        .filter((e) => text(e.school))
        .map((e, i) => ({
          key: text(e.id) || `edu-${i}`,
          period: periodOf(e),
          org: text(e.school),
          content: text(e.major),
        }))
    : [];

  const career: Row[] = show('sec-career')
    ? records(data.career)
        .filter((c) => text(c.company))
        .map((c, i) => ({
          key: text(c.id) || `career-${i}`,
          period: periodOf(c),
          org: text(c.company),
          content: text(c.role),
        }))
    : [];

  const experience: Row[] = show('sec-experience')
    ? records(data.experience)
        .filter((e) => text(e.title))
        .map((e, i) => ({
          key: text(e.id) || `exp-${i}`,
          period: periodOf(e),
          org: text(e.title),
          content: text(e.description),
        }))
    : [];

  const certifications: Row[] = show('sec-certifications')
    ? records(data.certifications)
        .filter((c) => text(c.name))
        .map((c, i) => ({
          key: text(c.id) || `cert-${i}`,
          period: text(c.date),
          org: text(c.name) + (CERT_STATUS_SUFFIX[text(c.status)] ?? ''),
          content: text(c.organization),
        }))
    : [];

  const awards: Row[] = show('sec-awards')
    ? records(data.awards)
        .filter((a) => text(a.name))
        .map((a, i) => ({
          key: text(a.id) || `award-${i}`,
          period: text(a.date),
          org: text(a.name),
          content: [text(a.organization), text(a.description)].filter(Boolean).join('\n'),
        }))
    : [];

  const techStack = show('sec-techStack') ? strings(data.techStack) : [];
  const projects = show('sec-projects') ? records(data.projects).filter((p) => text(p.name)) : [];
  const bio = show('sec-bio') ? text(data.bio) : '';
  const coverLetters = show('sec-coverLetters')
    ? records(data.coverLetters).filter((c) => text(c.content))
    : [];
  const customSections = records(data.customSections)
    .filter((s) => text(s.title))
    .map((s) => ({
      id: text(s.id),
      title: text(s.title),
      fields: records(s.fields).filter((f) => text(f.label) || text(f.value)),
    }))
    .filter((s) => s.fields.length > 0);

  return (
    <div id={RESUME_PRINT_TARGET_ID} className={styles.root}>
      <div className={styles.page}>
        {/* ── 머리 ── */}
        <div className={styles.head} data-pdf-cut>
          <div className={styles.info}>
            <h1 className={styles.name}>{name}</h1>
            {headline && <div className={styles.tagline}>{headline}</div>}
            <div className={styles.contact}>
              {jobRoles.length > 0 && (
                <span><b>직무</b> {jobRoles.join(', ')}</span>
              )}
              {githubUrl && (
                <span><b>GitHub</b> {displayUrl(githubUrl)}</span>
              )}
              {links.map((link, i) => (
                <span key={text(link.id) || `link-${i}`}>
                  <b>{text(link.label) || '링크'}</b> {displayUrl(text(link.url))}
                </span>
              ))}
            </div>
          </div>
          {show('sec-basic') && (
            <div className={styles.photo}>
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ensureEncodedUrl(photoUrl)} alt="" />
              ) : (
                <span>사진<br />3 × 4</span>
              )}
            </div>
          )}
        </div>

        {education.length > 0 && (
          <Section title="학력"><PeriodTable rows={education} /></Section>
        )}
        {career.length > 0 && (
          <Section title="경력"><PeriodTable rows={career} /></Section>
        )}
        {experience.length > 0 && (
          <Section title="교육 이력"><PeriodTable rows={experience} /></Section>
        )}
        {certifications.length > 0 && (
          <Section title="자격증"><PeriodTable rows={certifications} /></Section>
        )}
        {awards.length > 0 && (
          <Section title="수상 이력"><PeriodTable rows={awards} /></Section>
        )}

        {techStack.length > 0 && (
          <Section title="기술 스택">
            <div className={styles.stack}>
              {techStack.map((tag, i) => (
                <span key={`${tag}-${i}`}>{tag}</span>
              ))}
            </div>
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="프로젝트">
            {projects.map((project, i) => {
              const period = periodOf(project);
              return (
                <div key={text(project.id) || `proj-${i}`} className={styles.proj} data-pdf-cut>
                  <div className={styles.ptop}>
                    <span className={styles.pname}>{text(project.name)}</span>
                    {period && <span className={styles.pperiod}>{period}</span>}
                  </div>
                  <dl>
                    {projectFields(project).map(([label, value]) => (
                      <ProjectField key={label} label={label} value={value} />
                    ))}
                  </dl>
                </div>
              );
            })}
          </Section>
        )}

        {bio && (
          <Section title="간단 소개">
            <div className={styles.letter} data-pdf-cut>
              <p>{bio}</p>
            </div>
          </Section>
        )}

        {coverLetters.length > 0 && (
          <Section title="자기소개서">
            {coverLetters.map((letter, i) => (
              <div key={text(letter.id) || `letter-${i}`} className={styles.letter} data-pdf-cut>
                {text(letter.title) && <h3 className={styles.letterTitle}>{text(letter.title)}</h3>}
                <p>{text(letter.content)}</p>
              </div>
            ))}
          </Section>
        )}

        {customSections.map((section, i) => (
          <Section key={section.id || `custom-${i}`} title={section.title}>
            <table className={styles.table}>
              <tbody>
                {section.fields.map((field, j) => (
                  <tr key={text(field.id) || `field-${j}`} data-pdf-cut>
                    <th>{text(field.label)}</th>
                    <td className={styles.multiline}>{text(field.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ))}

        <div className={styles.foot} data-pdf-cut>
          {today()} · {name}
        </div>
      </div>
    </div>
  );
}

/**
 * 출력 양식을 화면 밖에 렌더한다.
 *
 * <p>{@code display:none} 이나 {@code visibility:hidden} 은 쓸 수 없다. html2canvas 는
 * 레이아웃이 잡힌 요소만 그리므로 크기가 0 이 되거나 투명하게 캡처된다. 그래서 요소는 정상
 * 렌더하되 {@code position:fixed} 로 뷰포트 왼쪽 바깥에 둔다. fixed 라서 스크롤 위치와
 * 무관하고 문서 높이·가로 스크롤에도 영향을 주지 않는다. 캡처할 때는
 * {@code generateResumePdf} 의 onclone 이 클론을 body 최상위로 옮기고 position 을 static 으로
 * 되돌리므로 좌표가 0 에서 시작한다.</p>
 *
 * <p>브라우저 인쇄(window.print)에는 섞이지 않도록 {@code print:hidden} 을 붙인다.
 * 인쇄는 기존대로 화면 쪽 {@code #resume-print-area} 를 쓴다.</p>
 */
export function ResumePrintOffscreen(props: Props) {
  return (
    <div
      aria-hidden="true"
      className="print:hidden"
      style={{ position: 'fixed', left: '-10000px', top: 0, pointerEvents: 'none' }}
    >
      <ResumePrintLayout {...props} />
    </div>
  );
}

function ProjectField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
