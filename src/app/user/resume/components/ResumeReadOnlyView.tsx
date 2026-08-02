import { ExternalLink } from 'lucide-react';
import type { ResumeData, ResumeProjectItem } from '@/lib/api/types';
import { normalizeJobRole } from '@/lib/constants/resume';
import { formatPeriod } from '@/lib/utils/resumeDate';
import ProjectCarousel from './ProjectCarousel';

// ── 자격증 상태 라벨 ──────────────────────────────────────────────
const CERT_STATUS_LABEL: Record<string, string> = {
  ACQUIRED: '취득',
  EXPIRED: '만료',
};

// ── 섹션 공통 래퍼 ───────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

// ── PDF 전용 프로젝트 목록 ───────────────────────────────────────
/**
 * 프로젝트를 모든 필드와 함께 세로로 펼쳐 렌더링한다.
 *
 * <p>화면에서는 캐러셀(가로 스크롤) + 상세 모달을 쓰지만, 두 방식 모두 PDF 캡처에
 * 담기지 않는다. 캐러셀은 화면 밖 카드가 overflow 로 잘리고, 모달 내용은 DOM 에
 * 열려 있지 않기 때문이다. PDF 에서는 이 컴포넌트로 대체해 누락을 없앤다.</p>
 */
function ProjectPdfList({ projects }: { projects: ResumeData['projects'] }) {
  const FIELD_LABELS: [keyof ResumeProjectItem, string][] = [
    ['role', '역할'],
    ['summary', '요약'],
    ['mainFeatures', '주요 기능'],
    ['myContributions', '기여한 부분'],
    ['problemSolving', '문제 해결'],
    ['result', '성과'],
  ];

  return (
    <div className="space-y-5">
      {projects.map((proj, i) => (
        <div key={proj.id ?? i}>
          {i > 0 && <Divider />}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{proj.name}</p>
            {periodOf(proj) && <span className="shrink-0 text-xs text-gray-400">{periodOf(proj)}</span>}
          </div>

          {proj.techStack && proj.techStack.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-medium text-gray-600">기술스택</span> · {proj.techStack.join(', ')}
            </p>
          )}

          <div className="mt-2 space-y-1.5">
            {FIELD_LABELS.map(([key, label]) => {
              const value = proj[key] as unknown;
              if (!value || typeof value !== 'string') return null;
              return (
                <div key={label} className="flex items-start gap-2">
                  <span className="w-20 shrink-0 text-xs font-medium text-gray-500">{label}</span>
                  <span className="text-sm text-gray-700 whitespace-pre-wrap">{value}</span>
                </div>
              );
            })}
          </div>

          {(proj.githubLink || proj.deployLink || proj.docLink) && (
            <div className="mt-2 space-y-1">
              {([['githubLink', 'GitHub'], ['deployLink', '배포'], ['docLink', '문서']] as const).map(
                ([key, label]) => proj[key] ? (
                  <div key={label} className="flex items-start gap-2">
                    <span className="w-20 shrink-0 text-xs font-medium text-gray-500">{label}</span>
                    <span className="break-all text-xs text-blue-600">{proj[key]}</span>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── 빈 값 처리 ───────────────────────────────────────────────────
function Empty({ message = '입력된 내용이 없습니다.' }: { message?: string }) {
  return <p className="text-sm text-gray-400">{message}</p>;
}

/**
 * 항목의 기간 표시 문자열.
 * 새 형식(startDate/endDate)을 우선하고, 없으면 과거 자유 입력 period 를 그대로 쓴다.
 */
function periodOf(item: { period?: string; startDate?: string; endDate?: string }): string {
  const fromDates = formatPeriod(item.startDate, item.endDate);
  return fromDates || item.period || '';
}

// ── 항목 구분선 ──────────────────────────────────────────────────
function Divider() {
  return <hr className="my-4 border-gray-100" />;
}

interface Props {
  data: ResumeData;
  /** 작성자 프로필 이미지 (없으면 기본 아이콘) */
  profileImageUrl?: string | null;
  /** 이력서 제목 (인쇄 시 표시) */
  resumeTitle?: string;
  /** 표시할 섹션 목록. 없으면 전체 표시. */
  visibleSections?: Record<string, boolean>;
}

/**
 * 공개 이력서 읽기 전용 뷰.
 * 작성 페이지의 입력 UI 없이 저장된 이력서 데이터를 렌더링한다.
 */
export default function ResumeReadOnlyView({ data, profileImageUrl, resumeTitle, visibleSections }: Props) {
  const show = (id: string) => !visibleSections || visibleSections[id] !== false;
  // 과거 이력서는 jobRole 이 단일 문자열이므로 배열로 정규화해서 렌더링한다.
  const jobRoles = normalizeJobRole(data.jobRole);
  return (
    <div id="resume-print-area" className="space-y-4">

      {/* 인쇄 시 제목 */}
      {resumeTitle && (
        <h2 className="hidden text-2xl font-bold text-gray-900 print:block mb-6">{resumeTitle}</h2>
      )}

      {/* ── 기본정보 ─────────────────────────────────────── */}
      {show('sec-basic') && (
        <section id="sec-basic" className="rounded-xl border border-gray-200 bg-white px-6 py-5">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImageUrl} alt="프로필" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 fill-current">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              {data.headline ? (
                <p className="text-lg font-semibold text-gray-900">{data.headline}</p>
              ) : (
                <Empty message="한 줄 소개가 없습니다." />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 개발 직무 ────────────────────────────────────── */}
      {/* 이전에는 기본정보 안에 라벨 없이 인라인 표시되어 PDF에서 어떤 항목인지 알 수 없었다.
          독립 섹션으로 분리해 제목이 항상 함께 출력되게 한다. */}
      {show('sec-jobRole') && jobRoles.length > 0 && (
        <section id="sec-jobRole" className="rounded-xl border border-gray-200 bg-white px-6 py-5">
          <h3 className="mb-3 text-sm font-bold text-gray-900">개발 직무</h3>
          <div className="flex flex-wrap gap-2">
            {jobRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 border border-orange-100"
              >
                {role}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── 간단소개 ─────────────────────────────────────── */}
      {show('sec-bio') && data.bio && (
        <section id="sec-bio" className="rounded-xl border border-gray-200 bg-white px-6 py-5">
          <h3 className="mb-3 text-sm font-bold text-gray-900">간단소개</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.bio}</p>
        </section>
      )}

      {/* ── 기술스택 ─────────────────────────────────────── */}
      {show('sec-techStack') && data.techStack && data.techStack.length > 0 && (
        <section id="sec-techStack" className="rounded-xl border border-gray-200 bg-white px-6 py-5">
          <h3 className="mb-3 text-sm font-bold text-gray-900">기술스택</h3>
          <div className="flex flex-wrap gap-2">
            {data.techStack.map((tag) => (
              <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 border border-orange-100">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── 링크 ─────────────────────────────────────────── */}
      {show('sec-links') && data.links && data.links.length > 0 && (
        <Section title="링크">
          <div className="space-y-2">
            {data.links.map((link, i) => (
              <div key={link.id ?? i} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-gray-400">{link.label || '링크'}</span>
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-500 hover:underline truncate">
                    {link.url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 학력 ─────────────────────────────────────────── */}
      {show('sec-education') && data.education?.filter((e) => e.school).length > 0 && (
        <Section title="학력">
          <div className="space-y-4">
            {data.education.filter((e) => e.school).map((edu, i) => (
              <div key={edu.id ?? i}>
                {i > 0 && <Divider />}
                <p className="text-sm font-semibold text-gray-900">{edu.school}</p>
                {edu.major && <p className="mt-0.5 text-sm text-gray-500">{edu.major}</p>}
                {periodOf(edu) && <p className="mt-0.5 text-xs text-gray-400">{periodOf(edu)}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 경력 ─────────────────────────────────────────── */}
      {show('sec-career') && data.career?.filter((c) => c.company).length > 0 && (
        <Section title="경력">
          <div className="space-y-4">
            {data.career.filter((c) => c.company).map((c, i) => (
              <div key={c.id ?? i}>
                {i > 0 && <Divider />}
                <p className="text-sm font-semibold text-gray-900">{c.company}</p>
                {c.role && <p className="mt-0.5 text-sm text-gray-500">{c.role}</p>}
                {periodOf(c) && <p className="mt-0.5 text-xs text-gray-400">{periodOf(c)}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 프로젝트 ─────────────────────────────────────── */}
      {show('sec-projects') && data.projects?.filter((p) => p.name).length > 0 && (
        <Section title="프로젝트">
          {/* 화면용: 가로 캐러셀. PDF 캡처 시에는 제외한다
              (overflow 로 화면 밖 카드가 잘리고, 상세는 모달 안이라 캡처되지 않기 때문) */}
          <div data-pdf-hidden>
            <ProjectCarousel projects={data.projects.filter((p) => p.name)} />
          </div>
          {/* PDF용: 모든 프로젝트를 모든 필드와 함께 세로로 펼쳐 렌더링 */}
          <div data-pdf-only style={{ display: 'none' }}>
            <ProjectPdfList projects={data.projects.filter((p) => p.name)} />
          </div>
        </Section>
      )}

      {/* ── 교육이력 ─────────────────────────────────────── */}
      {show('sec-experience') && data.experience?.filter((e) => e.title).length > 0 && (
        <Section title="교육이력">
          <div className="space-y-4">
            {data.experience.filter((e) => e.title).map((exp, i) => (
              <div key={exp.id ?? i}>
                {i > 0 && <Divider />}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                  {periodOf(exp) && <span className="shrink-0 text-xs text-gray-400">{periodOf(exp)}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 수상이력 ─────────────────────────────────────── */}
      {show('sec-awards') && data.awards?.filter((a) => a.name).length > 0 && (
        <Section title="수상이력">
          <div className="space-y-4">
            {data.awards.filter((a) => a.name).map((award, i) => (
              <div key={award.id ?? i}>
                {i > 0 && <Divider />}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{award.name}</p>
                  {award.date && <span className="shrink-0 text-xs text-gray-400">{award.date}</span>}
                </div>
                {award.organization && <p className="mt-0.5 text-xs text-gray-500">{award.organization}</p>}
                {award.description && (
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{award.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 자격증 ───────────────────────────────────────── */}
      {show('sec-certifications') && data.certifications?.filter((c) => c.name).length > 0 && (
        <Section title="자격증">
          <div className="space-y-3">
            {data.certifications.filter((c) => c.name).map((cert, i) => (
              <div key={cert.id ?? i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                  {cert.organization && <p className="text-xs text-gray-500">{cert.organization}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  {cert.date && <p className="text-xs text-gray-400">{cert.date}</p>}
                  {cert.status && (
                    <span className={`text-xs font-medium ${cert.status === 'ACQUIRED' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {CERT_STATUS_LABEL[cert.status] ?? cert.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 자기소개서 ───────────────────────────────────── */}
      {show('sec-coverLetters') && data.coverLetters?.filter((cl) => cl.content).length > 0 && (
        <Section title="자기소개서">
          <div className="space-y-6">
            {data.coverLetters.filter((cl) => cl.content).map((cl, i) => (
              <div key={cl.id ?? i}>
                {i > 0 && <Divider />}
                {cl.title && <p className="mb-2 text-sm font-semibold text-gray-900">{cl.title}</p>}
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {cl.content}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 커스텀 섹션 ─────────────────────────────────── */}
      {data.customSections?.filter((s) => s.title && s.fields.some((f) => f.label || f.value)).map((section) => (
        <Section key={section.id} title={section.title}>
          <div className="space-y-2">
            {section.fields.filter((f) => f.label || f.value).map((field) => (
              <div key={field.id} className="flex items-start gap-3">
                {field.label && (
                  <span className="w-24 shrink-0 text-xs font-medium text-gray-500 pt-0.5">{field.label}</span>
                )}
                <span className={`text-sm text-gray-700 ${!field.label ? '' : ''}`}>{field.value}</span>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
