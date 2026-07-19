'use client';

import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  FileText,
  ArrowLeft,
  Loader2,
  LinkIcon,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Code2,
  Layers,
  X,
  FolderGit,
  Trophy,
  Star,
  Save,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import PdfDownloadButton from '@/common/components/PdfDownloadButton';
import ResumeReadOnlyView from './components/ResumeReadOnlyView';
import type { AuthSession } from '@/lib/auth/types';
import {
  getUserProfile, getMyResume, saveMyResume,
  getMyResumes, createResume, updateResumeById,
  deleteResumeById, setDefaultResume,
} from '@/lib/api/user';
import type { GithubResumeProjectResponse, MaterialItemResponse } from '@/lib/api/types';
import ImportGithubProjectsModal from './components/ImportGithubProjectsModal';
import ImportMaterialsModal from './components/ImportMaterialsModal';
import { ensureEncodedUrl } from '@/lib/utils';
import type { UserProfileResponse, ResumeSummaryResponse, ResumeData } from '@/lib/api/types';
import { useResumeStorage, newId } from './hooks/useResumeStorage';
import type {
  LinkItem,
  EducationItem,
  CareerItem,
  ExperienceItem,
  ProjectItem,
  AwardItem,
  CertificationItem,
  CoverLetterItem,
  CustomSectionItem,
} from './hooks/useResumeStorage';
import EditableListSection from './components/EditableListSection';

// ── 섹션 내비게이션 앵커 ─────────────────────────────────────────
const SECTION_ANCHORS = [
  { id: 'sec-basic',         label: '기본정보' },
  { id: 'sec-bio',           label: '간단소개' },
  { id: 'sec-jobRole',       label: '개발직무' },
  { id: 'sec-techStack',     label: '기술스택' },
  { id: 'sec-links',         label: '링크' },
  { id: 'sec-education',     label: '학력' },
  { id: 'sec-career',        label: '경력' },
  { id: 'sec-projects',      label: '프로젝트' },
  { id: 'sec-experience',    label: '교육이력' },
  { id: 'sec-awards',        label: '수상이력' },
  { id: 'sec-certifications',label: '자격증' },
  { id: 'sec-coverLetters',  label: '자기소개서' },
] as const;

type SectionId = typeof SECTION_ANCHORS[number]['id'];

// 기본값: 전체 섹션 표시
const DEFAULT_VISIBLE_SECTIONS: Record<SectionId, boolean> = Object.fromEntries(
  SECTION_ANCHORS.map(({ id }) => [id, true])
) as Record<SectionId, boolean>;

interface ResumePageClientProps {
  session: AuthSession;
}

export default function ResumePageClient({ session }: ResumePageClientProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_SECTIONS);

  // ── 다중 이력서 상태 ──────────────────────────────────────────
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [resumeList, setResumeList] = useState<ResumeSummaryResponse[]>([]);
  const [resumeTabPage, setResumeTabPage] = useState(0); // 탭 페이지 (10개씩)
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const accessToken = session.accessToken ?? null;
  const userId = session.user?.id ? parseInt(session.user.id, 10) : null;

  // ── localStorage 기반 편집 상태 ──────────────────────────────
  const {
    loaded: draftLoaded,
    resumeTitle, setResumeTitle,
    headline, setHeadline,
    bio, setBio,
    links, setLinks,
    education, setEducation,
    career, setCareer,
    experience, setExperience,
    projects, setProjects,
    awards, setAwards,
    certifications, setCertifications,
    coverLetters, setCoverLetters,
    customSections, setCustomSections,
    jobRole, setJobRole,
    techStack, setTechStack,
  } = useResumeStorage(userId, resumeId);

  const [techInput, setTechInput] = useState('');

  // ── 이력서 데이터를 상태에 반영하는 헬퍼 ─────────────────────
  const applyResumeData = useCallback((d: {
    resumeTitle?: string; headline?: string; bio?: string; jobRole?: string;
    techStack?: string[]; links?: unknown; education?: unknown; career?: unknown;
    experience?: unknown; projects?: unknown; awards?: unknown; certifications?: unknown;
    coverLetters?: unknown; customSections?: unknown; isPublic?: boolean; visibleSections?: Record<string, boolean>;
  }) => {
    if (d.resumeTitle !== undefined) setResumeTitle(d.resumeTitle ?? '');
    if (d.headline !== undefined) setHeadline(d.headline ?? '');
    if (d.bio !== undefined) setBio(d.bio ?? '');
    if (d.jobRole !== undefined) setJobRole(d.jobRole ?? '');
    if (d.techStack !== undefined) setTechStack((d.techStack as unknown as string[]) ?? []);
    if (d.links !== undefined) setLinks((d.links as unknown as LinkItem[]) ?? []);
    if (d.education !== undefined) setEducation((d.education as unknown as EducationItem[]) ?? []);
    if (d.career !== undefined) setCareer((d.career as unknown as CareerItem[]) ?? []);
    if (d.experience !== undefined) setExperience((d.experience as unknown as ExperienceItem[]) ?? []);
    if (d.projects !== undefined) {
      const converted = ((d.projects as unknown as { techStack?: string | string[] }[]) ?? []).map(
        (p) => ({ ...p, techStack: Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.techStack ?? '') })
      );
      setProjects(converted as unknown as ProjectItem[]);
    }
    if (d.awards !== undefined) setAwards((d.awards as unknown as AwardItem[]) ?? []);
    if (d.certifications !== undefined) setCertifications((d.certifications as unknown as CertificationItem[]) ?? []);
    if (d.coverLetters !== undefined) setCoverLetters((d.coverLetters as unknown as CoverLetterItem[]) ?? []);
    if (d.customSections !== undefined) setCustomSections((d.customSections as unknown as CustomSectionItem[]) ?? []);
    if (d.isPublic !== undefined) setIsPublic(d.isPublic ?? false);
    if (d.visibleSections) setVisibleSections({ ...DEFAULT_VISIBLE_SECTIONS, ...d.visibleSections });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 초기 데이터 로딩: 서버 → localStorage → 빈값 순서 ────────
  const fetchData = useCallback(async () => {
    if (!userId) { setIsLoading(false); return; }
    try {
      const [profileData, resumeData, listData] = await Promise.all([
        getUserProfile(userId).catch(() => null),
        accessToken ? getMyResume({ accessToken }).catch(() => null) : Promise.resolve(null),
        accessToken ? getMyResumes({ accessToken }).catch(() => null) : Promise.resolve(null),
      ]);
      if (profileData) setProfile(profileData);
      if (listData?.resumes) setResumeList(listData.resumes);
      if (resumeData?.resumeData) {
        if (resumeData.resumeId) setResumeId(resumeData.resumeId);
        applyResumeData(resumeData.resumeData as unknown as Record<string, unknown>);
      }
    } catch (err) {
      console.error('[ResumePageClient] 초기 로딩 오류:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, accessToken, applyResumeData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── 이력서 전환 ───────────────────────────────────────────────
  const handleSwitchResume = async (id: number) => {
    if (!accessToken || id === resumeId) return;
    setIsLoading(true);
    try {
      const res = await getMyResumes({ accessToken });
      // 선택한 이력서의 전체 데이터는 단건 API로 로드
      const { getMyResumeById } = await import('@/lib/api/user');
      const detail = await getMyResumeById(id, { accessToken });
      setResumeId(id);
      setResumeList(res.resumes);
      if (detail.resumeData) applyResumeData(detail.resumeData);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 새 이력서 생성 ────────────────────────────────────────────
  const handleCreateResume = async () => {
    if (!accessToken || isCreatingResume) return;
    setIsCreatingResume(true);
    try {
      const emptyResume = {
        resumeTitle: '새 이력서', headline: '', bio: '', jobRole: '', techStack: [],
        links: [], education: [], career: [], experience: [], projects: [],
        awards: [], certifications: [], coverLetters: [], customSections: [],
        isPublic: false, visibleSections: DEFAULT_VISIBLE_SECTIONS,
      };
      const newResume = await createResume(emptyResume, { accessToken });
      if (newResume.resumeId) {
        setResumeId(newResume.resumeId);
        // 목록 갱신
        const list = await getMyResumes({ accessToken });
        setResumeList(list.resumes);
        // 새 이력서가 추가됐으므로 마지막 탭 페이지로 이동
        setResumeTabPage(Math.floor((list.resumes.length - 1) / 10));
        // 새 이력서 빈 상태로 초기화
        applyResumeData(emptyResume);
      }
    } finally {
      setIsCreatingResume(false);
    }
  };

  // ── 이력서 삭제 ───────────────────────────────────────────────
  const handleDeleteResume = async () => {
    if (!accessToken || !resumeId || isDeletingResume) return;
    if (!confirm('이 이력서를 삭제하시겠습니까? 삭제된 이력서는 복구할 수 없습니다.')) return;
    setIsDeletingResume(true);
    try {
      await deleteResumeById(resumeId, { accessToken });
      // 목록 갱신 후 기본 이력서로 전환
      const list = await getMyResumes({ accessToken });
      setResumeList(list.resumes);
      const defaultResume = list.resumes.find((r) => r.isDefault) ?? list.resumes[0] ?? null;
      if (defaultResume) {
        const { getMyResumeById } = await import('@/lib/api/user');
        const detail = await getMyResumeById(defaultResume.resumeId, { accessToken });
        setResumeId(defaultResume.resumeId);
        if (detail.resumeData) applyResumeData(detail.resumeData);
      } else {
        setResumeId(null);
        applyResumeData({ resumeTitle: '', headline: '', bio: '', jobRole: '',
          techStack: [], links: [], education: [], career: [], experience: [], projects: [],
          awards: [], certifications: [], coverLetters: [], customSections: [], isPublic: false });
      }
    } finally {
      setIsDeletingResume(false);
    }
  };

  // ── 기본 이력서 설정 ──────────────────────────────────────────
  const handleSetDefaultResume = async () => {
    if (!accessToken || !resumeId || isSettingDefault) return;
    setIsSettingDefault(true);
    try {
      await setDefaultResume(resumeId, { accessToken });
      const list = await getMyResumes({ accessToken });
      setResumeList(list.resumes);
    } finally {
      setIsSettingDefault(false);
    }
  };

  // ── 저장하기: resumeId가 있으면 해당 이력서 업데이트, 없으면 기본 이력서 upsert ──
  const handleSave = async () => {
    if (isSaving) return;
    setSaveError(false);
    setIsSaving(true);

    const apiProjects = projects.map((p) => ({
      ...p,
      techStack: p.techStack
        ? p.techStack.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));
    const payload = {
      resumeTitle, headline, bio, jobRole, techStack,
      links, education, career, experience,
      projects: apiProjects,
      awards, certifications, coverLetters, customSections, isPublic, visibleSections,
    };

    try {
      if (accessToken) {
        let saved;
        if (resumeId) {
          saved = await updateResumeById(resumeId, payload, { accessToken });
        } else {
          saved = await saveMyResume(payload, { accessToken });
          if (saved.resumeId) setResumeId(saved.resumeId);
        }
        // 목록 업데이트 (제목·공개 여부 변경 반영)
        const list = await getMyResumes({ accessToken });
        setResumeList(list.resumes);
      }
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // handlePrint는 PdfDownloadButton으로 대체됨

  const toggleSection = (id: string) =>
    setVisibleSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectAllSections = () => setVisibleSections(DEFAULT_VISIBLE_SECTIONS);
  const deselectAllSections = () =>
    setVisibleSections(Object.fromEntries(SECTION_ANCHORS.map(({ id }) => [id, false])));

  // ── 편집 헬퍼 ────────────────────────────────────────────────
  const addLink = () => setLinks([...links, { id: newId(), label: '', url: '' }]);
  const removeLink = (id: string) => setLinks(links.filter((l) => l.id !== id));
  const updateLink = (id: string, key: string, value: string) =>
    setLinks(links.map((l) => (l.id === id ? { ...l, [key]: value } : l)) as LinkItem[]);

  const addEducation = () => setEducation([...education, { id: newId(), school: '', major: '', period: '' }]);
  const removeEducation = (id: string) => setEducation(education.filter((e) => e.id !== id));
  const updateEducation = (id: string, key: string, value: string) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, [key]: value } : e)) as EducationItem[]);

  const addCareer = () => setCareer([...career, { id: newId(), company: '', role: '', period: '' }]);
  const removeCareer = (id: string) => setCareer(career.filter((c) => c.id !== id));
  const updateCareer = (id: string, key: string, value: string) =>
    setCareer(career.map((c) => (c.id === id ? { ...c, [key]: value } : c)) as CareerItem[]);

  const addExperience = () => setExperience([...experience, { id: newId(), title: '', description: '', period: '' }]);
  const removeExperience = (id: string) => setExperience(experience.filter((e) => e.id !== id));
  const updateExperience = (id: string, key: string, value: string) =>
    setExperience(experience.map((e) => (e.id === id ? { ...e, [key]: value } : e)) as ExperienceItem[]);

  const addProject = () =>
    setProjects([...projects, {
      id: newId(), name: '', period: '', summary: '', role: '',
      techStack: '', mainFeatures: '', myContributions: '',
      problemSolving: '', result: '', githubLink: '', deployLink: '',
      docLink: '', featured: 'false',
    }]);
  const removeProject = (id: string) => setProjects(projects.filter((p) => p.id !== id));
  const updateProject = (id: string, key: string, value: string) =>
    setProjects(projects.map((p) => (p.id === id ? { ...p, [key]: value } : p)) as ProjectItem[]);

  // GitHub 저장소 → 이력서 프로젝트 가져오기
  const [showGithubImport, setShowGithubImport] = useState(false);
  const githubLinkToKey = (link: string): string => {
    const m = link.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    return m ? `${m[1]}/${m[2]}`.toLowerCase() : '';
  };
  const existingRepoKeys = new Set(
    projects.map((p) => githubLinkToKey(p.githubLink)).filter(Boolean),
  );
  const importGithubProjects = (repos: GithubResumeProjectResponse[]) => {
    const existing = new Set(existingRepoKeys);
    const additions: ProjectItem[] = repos
      .filter((r) => !existing.has(r.repoKey))
      .map((r) => ({
        id: newId(),
        name: r.name ?? '',
        period: r.period ?? '',
        summary: r.summary ?? '',
        role: '',
        techStack: r.techStack ?? '',
        mainFeatures: '',
        myContributions: r.myContributions ?? '',
        problemSolving: '',
        result: r.result ?? '',
        githubLink: r.githubLink ?? '',
        deployLink: '',
        docLink: '',
        featured: r.isOwned ? 'true' : 'false',
      }));
    if (additions.length > 0) setProjects([...projects, ...additions]);
  };

  // 첨부파일(학습자료) → 이력서 프로젝트 가져오기
  const [showMaterialImport, setShowMaterialImport] = useState(false);
  const importMaterialsAsProjects = (materials: MaterialItemResponse[]) => {
    const additions: ProjectItem[] = materials.map((m) => ({
      id: newId(),
      name: m.title ?? '',
      period: [m.materialYear, m.semester].filter(Boolean).join(' '),
      summary: m.subjectName ?? '',
      role: '',
      techStack: '',
      mainFeatures: '',
      myContributions: '',
      problemSolving: '',
      result: '',
      githubLink: '',
      deployLink: '',
      docLink: m.fileUrl ?? m.sourceUrl ?? '',
      featured: 'false',
    }));
    if (additions.length > 0) setProjects([...projects, ...additions]);
  };

  const addAward = () =>
    setAwards([...awards, { id: newId(), name: '', organization: '', date: '', relatedProject: '', description: '' }]);
  const removeAward = (id: string) => setAwards(awards.filter((a) => a.id !== id));
  const updateAward = (id: string, key: string, value: string) =>
    setAwards(awards.map((a) => (a.id === id ? { ...a, [key]: value } : a)) as AwardItem[]);

  const addCertification = () =>
    setCertifications([...certifications, { id: newId(), name: '', organization: '', date: '', status: 'ACQUIRED' }]);
  const removeCertification = (id: string) => setCertifications(certifications.filter((c) => c.id !== id));
  const updateCertification = (id: string, key: string, value: string) =>
    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [key]: value } : c)) as CertificationItem[]);

  const addCoverLetter = () =>
    setCoverLetters([...coverLetters, { id: newId(), title: '', content: '' }]);
  const removeCoverLetter = (id: string) => setCoverLetters(coverLetters.filter((c) => c.id !== id));
  const updateCoverLetter = (id: string, key: string, value: string) =>
    setCoverLetters(coverLetters.map((c) => (c.id === id ? { ...c, [key]: value } : c)) as CoverLetterItem[]);

  const addTechTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !techStack.includes(trimmed)) setTechStack([...techStack, trimmed]);
    setTechInput('');
  };
  const removeTechTag = (tag: string) => setTechStack(techStack.filter((t) => t !== tag));

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <FileText className="h-8 w-8 text-red-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">이력서를 불러오는 데 실패했습니다.</p>
          <p className="mt-1 text-xs text-gray-400">잠시 후 다시 시도해 주세요.</p>
        </div>
        <button
          type="button"
          onClick={() => { setLoadError(false); setIsLoading(true); fetchData(); }}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────
          이력서 작성 영역  (print:hidden 클래스 없는 것들만 출력됨)
      ───────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-28">

        {/* 뒤로가기 */}
        <div className="mb-6 print:hidden">
          <Link
            href="/user"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            내 정보로 돌아가기
          </Link>
        </div>

        {/* ── 이력서 탭 (인쇄 제외) ──────────────────────────── */}
        {resumeList.length > 0 && (() => {
          const TAB_PAGE_SIZE = 10;
          const totalPages = Math.ceil(resumeList.length / TAB_PAGE_SIZE);
          const pageResumes = resumeList.slice(
            resumeTabPage * TAB_PAGE_SIZE,
            (resumeTabPage + 1) * TAB_PAGE_SIZE,
          );
          return (
            <div className="mb-3 print:hidden">
              {/* 탭 목록 + 새 이력서 버튼 — 2줄 구조로 분리 */}
              <div className="flex items-center gap-1">
                {/* 이전 페이지 */}
                {resumeTabPage > 0 && (
                  <button
                    type="button"
                    onClick={() => setResumeTabPage((p) => p - 1)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5 rotate-90" />
                  </button>
                )}

                {/* 탭 목록 — 가로 스크롤, 줄바꿈 없음 */}
                <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {pageResumes.map((r) => {
                    const isActive = r.resumeId === resumeId;
                    return (
                      <button
                        key={r.resumeId}
                        type="button"
                        onClick={() => handleSwitchResume(r.resumeId)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors max-w-[180px] ${
                          isActive
                            ? 'border-orange-400 bg-orange-50 text-orange-600 font-medium'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-orange-400' : 'text-gray-400'}`} />
                        <span className="truncate max-w-[120px]">
                          {r.resumeTitle || '(제목 없음)'}
                        </span>
                        {r.isDefault && (
                          <Star className={`h-3 w-3 shrink-0 ${isActive ? 'text-orange-400 fill-orange-400' : 'text-gray-300 fill-gray-300'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 다음 페이지 */}
                {resumeTabPage < totalPages - 1 && (
                  <button
                    type="button"
                    onClick={() => setResumeTabPage((p) => p + 1)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                )}

                {/* 새 이력서 버튼 — 탭과 같은 줄, 오른쪽 끝에 고정 */}
                <button
                  type="button"
                  onClick={handleCreateResume}
                  disabled={isCreatingResume}
                  className="ml-1 flex h-8 shrink-0 items-center gap-1 rounded-lg border border-dashed border-gray-300 px-2.5 text-xs font-medium text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors disabled:opacity-50"
                  title="새 이력서 만들기"
                >
                  {isCreatingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  새 이력서
                </button>
              </div>

              {/* 선택된 이력서 액션 버튼 (탭 아래) */}
              {resumeId && (
                <div className="mt-1.5 flex items-center gap-2">
                  {!resumeList.find((r) => r.resumeId === resumeId)?.isDefault && (
                    <button
                      type="button"
                      onClick={handleSetDefaultResume}
                      disabled={isSettingDefault}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                    >
                      {isSettingDefault ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
                      기본으로 설정
                    </button>
                  )}
                  {resumeList.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      disabled={isDeletingResume}
                      className="flex items-center gap-1 text-[11px] text-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {isDeletingResume ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      이 이력서 삭제
                    </button>
                  )}
                  {totalPages > 1 && (
                    <span className="ml-auto text-[11px] text-gray-300">
                      {resumeTabPage + 1} / {totalPages} 페이지
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* 상단 컨트롤 바 (인쇄 제외) */}
        <div className="mb-4 print:hidden flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="이력서 제목을 입력하세요"
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
            />
            {/* 공개 여부 토글 */}
            <button
              type="button"
              onClick={() => setIsPublic((p) => !p)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isPublic
                  ? 'border-orange-300 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
              }`}
              title="저장 시 공개 여부가 반영됩니다"
            >
              {isPublic ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {isPublic ? '공개' : '비공개'}
            </button>
          </div>
          <PdfDownloadButton
            targetId="resume-print-area"
            fileName={resumeTitle || '이력서'}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-400 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500 disabled:opacity-60"
          />
        </div>

        {/* 인쇄 시에만 표시되는 이력서 제목 */}
        {resumeTitle && (
          <h2 className="hidden text-2xl font-bold text-gray-900 print:block mb-6">{resumeTitle}</h2>
        )}

        {/* 섹션 포함/제외 토글 (인쇄 제외) */}
        <div className="mb-6 print:hidden">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">이력서에 포함할 섹션 선택</span>
            <button
              type="button"
              onClick={selectAllSections}
              className="text-xs text-orange-500 hover:underline"
            >
              전체 포함
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAllSections}
              className="text-xs text-gray-400 hover:underline"
            >
              전체 제외
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-1 min-w-max sm:flex-wrap sm:min-w-0">
              {SECTION_ANCHORS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSection(id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    visibleSections[id]
                      ? 'border-orange-400 bg-orange-50 text-orange-500'
                      : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 이력서 본문 (편집 영역) ─────────────────────────────── */}
        <div className="space-y-4">

          {/* 기본정보 */}
          {visibleSections['sec-basic'] && <section id="sec-basic" className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-5">
              {/* 프로필 사진 */}
              <div className="h-20 w-20 flex-shrink-0">
                {profile?.profileImage ? (
                  <Image
                    src={ensureEncodedUrl(profile.profileImage)}
                    alt={profile?.name ?? ''}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 이름 / 이메일 */}
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{profile?.name ?? '-'}</h3>
                <p className="mt-1 text-sm text-gray-500">{session.user?.email}</p>
                {profile?.introduction && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{profile.introduction}</p>
                )}
              </div>
            </div>
          </section>}

          {/* draftLoaded 이후 편집 섹션 */}
          {draftLoaded && (
            <>
              {/* 간단소개 */}
              {visibleSections['sec-bio'] && (
                <section id="sec-bio" className="rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <User className="h-4 w-4 text-gray-500" />
                      간단소개
                    </h3>
                  </div>
                  <div className="space-y-4 px-6 py-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-400">한 줄 소개</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="예: Spring Boot 기반 백엔드 개발자, 서비스 기획 경험 보유"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-400">
                        자기소개
                        <span className="ml-1 text-gray-300">({bio.length} / 500자)</span>
                      </label>
                      <textarea
                        rows={5}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                        placeholder="자신의 경험, 역량, 목표를 자유롭게 작성해주세요. (300~500자 권장)"
                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* 개발 직무 */}
              {visibleSections['sec-jobRole'] && (
                <section id="sec-jobRole" className="rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Code2 className="h-4 w-4 text-gray-500" />
                      개발 직무
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', 'DevOps / 인프라', 'AI / ML 엔지니어', '모바일 개발자'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setJobRole(chip)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            jobRole === chip
                              ? 'border-orange-400 bg-orange-50 text-orange-600'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-500'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="예: 백엔드 개발자 / Java, Spring Boot 기반 서버 개발 경험 보유"
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </section>
              )}

              {/* 기술 스택 */}
              {visibleSections['sec-techStack'] && (
                <section id="sec-techStack" className="rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Layers className="h-4 w-4 text-gray-500" />
                      기술 스택
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTechTag(tag)}
                              className="ml-0.5 rounded-full hover:text-gray-300 transition-colors"
                              aria-label={`${tag} 삭제`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addTechTag(techInput);
                        }
                      }}
                      onBlur={() => { if (techInput.trim()) addTechTag(techInput); }}
                      placeholder="기술명 입력 후 Enter (예: TypeScript, React, Spring Boot)"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </section>
              )}

              {/* 링크 */}
              {visibleSections['sec-links'] && (
                <div id="sec-links">
                  <EditableListSection
                    title="링크"
                    icon={<LinkIcon className="h-4 w-4 text-gray-500" />}
                    items={links}
                    fields={[
                      { key: 'label', label: '링크 이름', placeholder: '예: GitHub, 블로그, 포트폴리오', span: 'half' },
                      { key: 'url', label: 'URL', placeholder: 'https://', span: 'half' },
                    ]}
                    addLabel="링크 추가"
                    emptyMessage="등록된 링크가 없습니다."
                    onAdd={addLink}
                    onRemove={removeLink}
                    onUpdate={updateLink}
                  />
                </div>
              )}

              {/* 학력 */}
              {visibleSections['sec-education'] && (
                <div id="sec-education">
                  <EditableListSection
                    title="학력"
                    icon={<GraduationCap className="h-4 w-4 text-gray-500" />}
                    items={education}
                    fields={[
                      { key: 'school', label: '학교명', placeholder: '예: 한국기술교육대학교', span: 'half' },
                      { key: 'major', label: '전공', placeholder: '예: 컴퓨터공학부', span: 'half' },
                      { key: 'period', label: '재학 기간', placeholder: '예: 2021.03 ~ 2025.02', span: 'full' },
                    ]}
                    addLabel="학력 추가"
                    emptyMessage="등록된 학력이 없습니다."
                    onAdd={addEducation}
                    onRemove={removeEducation}
                    onUpdate={updateEducation}
                  />
                </div>
              )}

              {/* 경력 */}
              {visibleSections['sec-career'] && (
                <div id="sec-career">
                  <EditableListSection
                    title="경력"
                    icon={<Briefcase className="h-4 w-4 text-gray-500" />}
                    items={career}
                    fields={[
                      { key: 'company', label: '회사명', placeholder: '예: KOREATECH', span: 'half' },
                      { key: 'role', label: '직무', placeholder: '예: 백엔드 개발', span: 'half' },
                      { key: 'period', label: '근무 기간', placeholder: '예: 2024.07 ~ 2024.12', span: 'full' },
                    ]}
                    addLabel="경력 추가"
                    emptyMessage="등록된 경력이 없습니다."
                    onAdd={addCareer}
                    onRemove={removeCareer}
                    onUpdate={updateCareer}
                  />
                </div>
              )}

              {/* 프로젝트 */}
              {visibleSections['sec-projects'] && (
                <div id="sec-projects">
                  <div className="mb-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMaterialImport(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4" />
                      과제/자료에서 가져오기
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGithubImport(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    >
                      <FolderGit className="h-4 w-4" />
                      GitHub에서 가져오기
                    </button>
                  </div>
                  <EditableListSection
                    title="프로젝트"
                    icon={<FolderGit className="h-4 w-4 text-gray-500" />}
                    items={projects}
                    fields={[
                      { key: 'name', label: '프로젝트명', placeholder: '예: 오픈소스 포털', span: 'half' },
                      { key: 'period', label: '기간', placeholder: '예: 2024.03 ~ 2024.06', span: 'half' },
                      { key: 'featured', label: '대표 프로젝트', span: 'half', select: [
                        { value: 'false', label: '일반' },
                        { value: 'true', label: '⭐ 대표 프로젝트' },
                      ]},
                      { key: 'role', label: '담당 역할', placeholder: '예: 백엔드 개발, API 설계, 팀장', span: 'half' },
                      { key: 'summary', label: '한 줄 요약', placeholder: '프로젝트를 한 문장으로 설명하세요.', span: 'full' },
                      { key: 'techStack', label: '사용 기술', placeholder: '예: Java, Spring Boot, MySQL, React', span: 'full' },
                      { key: 'mainFeatures', label: '주요 기능', placeholder: '프로젝트의 핵심 기능을 설명하세요.', multiline: true, span: 'full' },
                      { key: 'myContributions', label: '내가 구현한 기능', placeholder: '내가 직접 개발한 기능을 구체적으로 작성하세요.', multiline: true, span: 'full' },
                      { key: 'problemSolving', label: '문제 해결 경험', placeholder: '개발 중 겪은 문제와 해결 과정을 작성하세요.', multiline: true, span: 'full' },
                      { key: 'result', label: '결과 / 성과', placeholder: '예: 국가대회 본선 진출, 사용자 200명 달성', span: 'full' },
                      { key: 'githubLink', label: 'GitHub 링크', placeholder: 'https://github.com/...', span: 'half' },
                      { key: 'deployLink', label: '배포 링크', placeholder: 'https://...', span: 'half' },
                      { key: 'docLink', label: '발표/문서 링크', placeholder: '노션, 발표자료 등 URL', span: 'full' },
                    ]}
                    addLabel="프로젝트 추가"
                    emptyMessage="등록된 프로젝트가 없습니다."
                    onAdd={addProject}
                    onRemove={removeProject}
                    onUpdate={updateProject}
                  />
                  <ImportGithubProjectsModal
                    open={showGithubImport}
                    onClose={() => setShowGithubImport(false)}
                    accessToken={accessToken}
                    existingRepoKeys={existingRepoKeys}
                    onConfirm={importGithubProjects}
                  />
                  <ImportMaterialsModal
                    open={showMaterialImport}
                    onClose={() => setShowMaterialImport(false)}
                    accessToken={accessToken}
                    onConfirm={importMaterialsAsProjects}
                  />
                </div>
              )}

              {/* 교육이력 / 활동 */}
              {visibleSections['sec-experience'] && (
                <div id="sec-experience">
                  <EditableListSection
                    title="교육이력 / 활동"
                    icon={<Lightbulb className="h-4 w-4 text-gray-500" />}
                    items={experience}
                    fields={[
                      { key: 'title', label: '활동명', placeholder: '예: SW중심대학 해커톤, 오픈소스 기여', span: 'half' },
                      { key: 'period', label: '기간', placeholder: '예: 2024.03 ~ 2024.06', span: 'half' },
                      { key: 'description', label: '설명', placeholder: '주요 역할과 기여 내용을 입력하세요.', multiline: true, span: 'full' },
                    ]}
                    addLabel="항목 추가"
                    emptyMessage="등록된 교육이력/활동이 없습니다."
                    onAdd={addExperience}
                    onRemove={removeExperience}
                    onUpdate={updateExperience}
                  />
                </div>
              )}

              {/* 수상이력 */}
              {visibleSections['sec-awards'] && (
                <div id="sec-awards">
                  <EditableListSection
                    title="수상이력"
                    icon={<Trophy className="h-4 w-4 text-gray-500" />}
                    items={awards}
                    fields={[
                      { key: 'name', label: '수상명', placeholder: '예: ICT 이노베이션 충청권 대상', span: 'half' },
                      { key: 'organization', label: '주최 기관', placeholder: '예: 과학기술정보통신부', span: 'half' },
                      { key: 'date', label: '수상일', placeholder: '예: 2024.11', span: 'half' },
                      { key: 'relatedProject', label: '관련 프로젝트', placeholder: '예: FarmLink', span: 'half' },
                      { key: 'description', label: '설명', placeholder: '수상 내용이나 성과를 간략히 설명하세요.', multiline: true, span: 'full' },
                    ]}
                    addLabel="수상 추가"
                    emptyMessage="등록된 수상 내역이 없습니다."
                    onAdd={addAward}
                    onRemove={removeAward}
                    onUpdate={updateAward}
                  />
                </div>
              )}

              {/* 자격증 */}
              {visibleSections['sec-certifications'] && (
                <div id="sec-certifications">
                  <EditableListSection
                    title="자격증"
                    icon={<Star className="h-4 w-4 text-gray-500" />}
                    items={certifications}
                    fields={[
                      { key: 'name', label: '자격증명', placeholder: '예: 정보처리기사', span: 'half' },
                      { key: 'organization', label: '발급 기관', placeholder: '예: 한국산업인력공단', span: 'half' },
                      { key: 'date', label: '취득일', placeholder: '예: 2024.06', span: 'half' },
                      { key: 'status', label: '상태', span: 'half', select: [
                        { value: 'ACQUIRED', label: '취득' },
                        { value: 'EXPIRED',  label: '만료' },
                      ]},
                    ]}
                    addLabel="자격증 추가"
                    emptyMessage="등록된 자격증이 없습니다."
                    onAdd={addCertification}
                    onRemove={removeCertification}
                    onUpdate={updateCertification}
                  />
                </div>
              )}

              {/* 자기소개서 */}
              {visibleSections['sec-coverLetters'] && (
                <div id="sec-coverLetters">
                  <EditableListSection
                    title="자기소개서"
                    icon={<FileText className="h-4 w-4 text-gray-500" />}
                    items={coverLetters}
                    fields={[
                      { key: 'title', label: '문항 제목', placeholder: '예: 지원 동기를 작성해주세요.', span: 'full' },
                      { key: 'content', label: '내용', placeholder: '자유롭게 작성하세요. (1000자 이내 권장)', multiline: true, span: 'full' },
                    ]}
                    addLabel="문항 추가"
                    emptyMessage="등록된 자기소개서 문항이 없습니다."
                    onAdd={addCoverLetter}
                    onRemove={removeCoverLetter}
                    onUpdate={updateCoverLetter}
                  />
                </div>
              )}
            </>
          )}

          {/* ── 커스텀 섹션 ─────────────────────────────── */}
          {customSections.map((section) => (
            <section key={section.id} className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => setCustomSections(
                    customSections.map((s) => s.id === section.id ? { ...s, title: e.target.value } : s)
                  )}
                  placeholder="섹션 이름을 입력하세요"
                  className="flex-1 text-sm font-bold text-gray-900 bg-transparent focus:outline-none placeholder-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setCustomSections(customSections.filter((s) => s.id !== section.id))}
                  className="shrink-0 rounded-lg border border-red-100 px-2.5 py-1 text-xs text-red-400 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  섹션 삭제
                </button>
              </div>
              <div className="px-6 py-4 space-y-3">
                {section.fields.map((field) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => setCustomSections(
                        customSections.map((s) => s.id === section.id
                          ? { ...s, fields: s.fields.map((f) => f.id === field.id ? { ...f, label: e.target.value } : f) }
                          : s)
                      )}
                      placeholder="항목명"
                      className="w-28 shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => setCustomSections(
                        customSections.map((s) => s.id === section.id
                          ? { ...s, fields: s.fields.map((f) => f.id === field.id ? { ...f, value: e.target.value } : f) }
                          : s)
                      )}
                      placeholder="내용"
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomSections(
                        customSections.map((s) => s.id === section.id
                          ? { ...s, fields: s.fields.filter((f) => f.id !== field.id) }
                          : s)
                      )}
                      className="shrink-0 rounded-lg border border-gray-100 p-1.5 text-gray-300 hover:border-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomSections(
                    customSections.map((s) => s.id === section.id
                      ? { ...s, fields: [...s.fields, { id: newId(), label: '', value: '' }] }
                      : s)
                  )}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  항목 추가
                </button>
              </div>
            </section>
          ))}

          {/* 커스텀 섹션 추가 버튼 */}
          <button
            type="button"
            onClick={() => setCustomSections([
              ...customSections,
              { id: newId(), title: '', fields: [{ id: newId(), label: '', value: '' }] },
            ])}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            항목 추가 (커스텀 섹션)
          </button>
        </div>
        {/* /resume-print-area */}

      </div>
      {/* /main container */}

      {/* ── PDF 캡처 전용 숨김 렌더링 영역 ──────────────────────────
           position:fixed + left:-9999px → 뷰포트 밖에 위치하므로 사용자에게 보이지 않음.
           html2canvas는 getBoundingClientRect() 기준으로 해당 영역을 캡처하므로 정상 동작.
           ResumeReadOnlyView 루트 div에 id="resume-print-area"가 있어 PdfDownloadButton이 바로 타겟팅함. */}
      {draftLoaded && (
        <div
          aria-hidden="true"
          style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', pointerEvents: 'none' }}
        >
          <ResumeReadOnlyView
            data={{
              resumeTitle,
              headline,
              bio,
              jobRole,
              techStack,
              links: links as ResumeData['links'],
              education: education as ResumeData['education'],
              career: career as ResumeData['career'],
              experience: experience as ResumeData['experience'],
              projects: projects.map((p) => ({
                ...p,
                techStack: p.techStack
                  ? p.techStack.split(',').map((s) => s.trim()).filter(Boolean)
                  : [],
              })) as ResumeData['projects'],
              awards: awards as ResumeData['awards'],
              certifications: certifications as ResumeData['certifications'],
              coverLetters: coverLetters as ResumeData['coverLetters'],
              customSections: customSections as ResumeData['customSections'],
              isPublic,
              visibleSections,
            }}
            profileImageUrl={profile?.profileImage ?? null}
            resumeTitle={resumeTitle}
            visibleSections={visibleSections}
          />
        </div>
      )}

      {/* ── 하단 고정 저장 바 (인쇄 제외) ─────────────────────────── */}
      <div className="print:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block">
            편집 중인 내용은 브라우저에 임시저장되며, 저장하기 버튼으로 서버에 반영됩니다.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <PdfDownloadButton
              targetId="resume-print-area"
              fileName={resumeTitle || '이력서'}
              className="print:hidden flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
                saveError
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-orange-400 hover:bg-orange-500'
              }`}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : savedToast ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving
                ? '저장 중...'
                : savedToast
                ? '서버에 저장되었습니다.'
                : saveError
                ? '저장 실패 (브라우저엔 임시 저장됨)'
                : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
