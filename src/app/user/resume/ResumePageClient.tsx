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
} from 'lucide-react';
import PdfDownloadButton from '@/common/components/PdfDownloadButton';
import type { AuthSession } from '@/lib/auth/types';
import {
  getUserProfile, getMyResume, saveMyResume,
  getMyResumes, createResume, updateResumeById,
  deleteResumeById, setDefaultResume,
} from '@/lib/api/user';
import { ensureEncodedUrl } from '@/lib/utils';
import type { UserProfileResponse, ResumeSummaryResponse } from '@/lib/api/types';
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
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_SECTIONS);

  // ── 다중 이력서 상태 ──────────────────────────────────────────
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [resumeList, setResumeList] = useState<ResumeSummaryResponse[]>([]);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
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
    jobRole, setJobRole,
    techStack, setTechStack,
  } = useResumeStorage(userId);

  const [techInput, setTechInput] = useState('');

  // ── 이력서 데이터를 상태에 반영하는 헬퍼 ─────────────────────
  const applyResumeData = useCallback((d: {
    resumeTitle?: string; headline?: string; bio?: string; jobRole?: string;
    techStack?: string[]; links?: unknown; education?: unknown; career?: unknown;
    experience?: unknown; projects?: unknown; awards?: unknown; certifications?: unknown;
    coverLetters?: unknown; isPublic?: boolean; visibleSections?: Record<string, boolean>;
  }) => {
    if (d.resumeTitle !== undefined) setResumeTitle(d.resumeTitle);
    if (d.headline !== undefined) setHeadline(d.headline);
    if (d.bio !== undefined) setBio(d.bio);
    if (d.jobRole !== undefined) setJobRole(d.jobRole);
    if (d.techStack !== undefined) setTechStack(d.techStack);
    if (d.links !== undefined) setLinks(d.links as unknown as LinkItem[]);
    if (d.education !== undefined) setEducation(d.education as unknown as EducationItem[]);
    if (d.career !== undefined) setCareer(d.career as unknown as CareerItem[]);
    if (d.experience !== undefined) setExperience(d.experience as unknown as ExperienceItem[]);
    if (d.projects !== undefined) setProjects(d.projects as unknown as ProjectItem[]);
    if (d.awards !== undefined) setAwards(d.awards as unknown as AwardItem[]);
    if (d.certifications !== undefined) setCertifications(d.certifications as unknown as CertificationItem[]);
    if (d.coverLetters !== undefined) setCoverLetters(d.coverLetters as unknown as CoverLetterItem[]);
    if (d.isPublic !== undefined) setIsPublic(d.isPublic);
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
      if (listData) setResumeList(listData.resumes);
      if (resumeData?.resumeData) {
        if (resumeData.resumeId) setResumeId(resumeData.resumeId);
        applyResumeData(resumeData.resumeData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, accessToken, applyResumeData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!showResumeDropdown) return;
    const handler = () => setShowResumeDropdown(false);
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [showResumeDropdown]);

  // ── 이력서 전환 ───────────────────────────────────────────────
  const handleSwitchResume = async (id: number) => {
    if (!accessToken || id === resumeId) { setShowResumeDropdown(false); return; }
    setShowResumeDropdown(false);
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
    setShowResumeDropdown(false);
    try {
      const newResume = await createResume(
        { resumeTitle: '새 이력서', headline: '', bio: '', jobRole: '', techStack: [],
          links: [], education: [], career: [], experience: [], projects: [],
          awards: [], certifications: [], coverLetters: [], isPublic: false },
        { accessToken }
      );
      if (newResume.resumeId) {
        setResumeId(newResume.resumeId);
        // 목록 갱신
        const list = await getMyResumes({ accessToken });
        setResumeList(list.resumes);
        // 새 이력서 빈 상태로 초기화
        applyResumeData({ resumeTitle: '새 이력서', headline: '', bio: '', jobRole: '',
          techStack: [], links: [], education: [], career: [], experience: [], projects: [],
          awards: [], certifications: [], coverLetters: [], isPublic: false });
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
          awards: [], certifications: [], coverLetters: [], isPublic: false });
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

    const payload = {
      resumeTitle, headline, bio, jobRole, techStack,
      links, education, career, experience, projects,
      awards, certifications, coverLetters, isPublic, visibleSections,
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

        {/* ── 이력서 선택 드롭다운 (인쇄 제외) ──────────────── */}
        <div className="mb-3 print:hidden relative">
          <div className="flex items-center gap-2">
            {/* 현재 이력서 선택 버튼 */}
            <button
              type="button"
              onClick={() => setShowResumeDropdown((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-0 max-w-xs"
            >
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate">
                {resumeList.find((r) => r.resumeId === resumeId)?.resumeTitle ||
                  resumeTitle ||
                  '이력서'}
              </span>
              {resumeList.find((r) => r.resumeId === resumeId)?.isDefault && (
                <Star className="h-3 w-3 shrink-0 text-orange-400 fill-orange-400" />
              )}
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            </button>

            {/* 새 이력서 버튼 */}
            <button
              type="button"
              onClick={handleCreateResume}
              disabled={isCreatingResume}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors disabled:opacity-50"
              title="새 이력서 만들기"
            >
              {isCreatingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              새 이력서
            </button>

            {/* 현재 이력서 기본 설정 버튼 (기본이 아닌 경우만) */}
            {resumeId && !resumeList.find((r) => r.resumeId === resumeId)?.isDefault && (
              <button
                type="button"
                onClick={handleSetDefaultResume}
                disabled={isSettingDefault}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors disabled:opacity-50"
                title="기본 이력서로 설정"
              >
                {isSettingDefault ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                기본으로
              </button>
            )}

            {/* 삭제 버튼 (이력서가 2개 이상일 때만) */}
            {resumeId && resumeList.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteResume}
                disabled={isDeletingResume}
                className="flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                title="이 이력서 삭제"
              >
                {isDeletingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          {/* 드롭다운 패널 */}
          {showResumeDropdown && (
            <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
              {resumeList.map((r) => (
                <button
                  key={r.resumeId}
                  type="button"
                  onClick={() => handleSwitchResume(r.resumeId)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                    r.resumeId === resumeId ? 'bg-orange-50' : ''
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex-1 truncate text-gray-700">
                    {r.resumeTitle || '(제목 없음)'}
                  </span>
                  {r.isDefault && (
                    <span className="shrink-0 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                      기본
                    </span>
                  )}
                  {!r.isPublic && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
                      비공개
                    </span>
                  )}
                  {r.resumeId === resumeId && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

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

        {/* ── 이력서 본문 (출력 대상) ────────────────────────────── */}
        <div id="resume-print-area" className="space-y-4">

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
                      <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">임시저장</span>
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
                      <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">임시저장</span>
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <textarea
                      rows={3}
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
                      <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">임시저장</span>
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
        </div>
        {/* /resume-print-area */}

      </div>
      {/* /main container */}

      {/* ── 하단 고정 저장 바 (인쇄 제외) ───────────────────────────
          TODO: 백엔드 이력서 저장 API 구현 후 handleSave를 서버 저장으로 교체.
                현재는 localStorage 자동저장 확인 용도 (toast 피드백만 제공).
      ────────────────────────────────────────────────────────── */}
      <div className="print:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block">
            변경사항은 브라우저에 임시저장됩니다.
            {/* TODO: 서버 저장 API 연결 후 이 문구 제거 */}
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
