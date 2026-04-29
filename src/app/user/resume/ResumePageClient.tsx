'use client';

import { useState, useEffect, useCallback, type SyntheticEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Github,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  FolderGit,
  Star,
  Trophy,
  FileText,
  Printer,
  ArrowLeft,
  MessageCircle,
  Loader2,
  LinkIcon,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Globe,
  Copy,
  Check,
  Code2,
  Layers,
  X,
  Settings,
} from 'lucide-react';
import type { AuthSession } from '@/lib/auth/types';
import {
  getUserProfile,
  getUserGithubOverallHistory,
  getUserGithubContributionScore,
  getMyTitles,
  getMyPointHistory,
  setDisplayTitle as apiSetDisplayTitle,
} from '@/lib/api/user';
import { getChallenges } from '@/lib/api/challenge';
import { ensureEncodedUrl } from '@/lib/utils';
import GithubRankCard, { getRankFromScore } from '@/common/components/GithubRankCard';
import type {
  UserProfileResponse,
  GithubOverallHistoryResponse,
  GithubContributionScoreResponse,
  UserTitleResponse,
} from '@/lib/api/types';
import { useResumeStorage, newId } from './hooks/useResumeStorage';
import type {
  LinkItem,
  EducationItem,
  CareerItem,
  ExperienceItem,
  ProjectItem,
  AwardItem,
  CertificationItem,
} from './hooks/useResumeStorage';

const RARITY_LABELS: Record<string, string> = {
  COMMON: '일반',
  RARE: '희귀',
  EPIC: '영웅',
  LEGENDARY: '전설',
};

const TITLE_CATEGORY_EMOJI: Record<string, string> = {
  COMMIT: '✏️',
  STREAK: '🔥',
  CHALLENGE: '🏆',
  COLLABORATION: '🤝',
  COMMUNITY: '💬',
  INFLUENCE: '⭐',
  PROJECT: '📁',
  OPEN_SOURCE: '🐙',
  SEASON: '🌟',
  HONOR: '👑',
};
import EditableListSection from './components/EditableListSection';
import SectionToggleCard from './components/SectionToggleCard';

interface ResumePageClientProps {
  session: AuthSession;
}

export default function ResumePageClient({ session }: ResumePageClientProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [overallHistory, setOverallHistory] = useState<GithubOverallHistoryResponse | null>(null);
  const [contributionScore, setContributionScore] = useState<GithubContributionScoreResponse | null>(null);
  const [displayTitle, setDisplayTitle] = useState<UserTitleResponse | null>(null);
  const [allTitles, setAllTitles] = useState<UserTitleResponse[]>([]);
  const [challengeRate, setChallengeRate] = useState<{ completed: number; total: number } | null>(null);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const userId = session.user?.id ? parseInt(session.user.id, 10) : null;
  const accessToken = session.accessToken as string | undefined;

  // ── localStorage 기반 편집 상태 ──────────────────────────
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
    jobRole, setJobRole,
    techStack, setTechStack,
    visibleSections, toggleSection,
    isPublic, setIsPublic,
  } = useResumeStorage(userId);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId || !accessToken) return;

    try {
      const [profileData, historyData, scoreData, titlesData, pointData, challengeData] =
        await Promise.all([
          getUserProfile(userId).catch(() => null),
          getUserGithubOverallHistory(userId).catch(() => null),
          getUserGithubContributionScore(userId).catch(() => null),
          getMyTitles({ accessToken }).catch(() => null),
          getMyPointHistory({ accessToken }, 1, 1).catch(() => null),
          getChallenges({ accessToken }).catch(() => null),
        ]);

      if (profileData) setProfile(profileData);
      if (historyData) setOverallHistory(historyData);
      if (scoreData) setContributionScore(scoreData);
      if (titlesData) {
        setAllTitles(titlesData.titles);
        setDisplayTitle(titlesData.titles.find((t) => t.isDisplay) ?? null);
      }
      if (pointData) setPointBalance(pointData.currentBalance);
      if (challengeData) {
        const total = challengeData.challenges.length;
        const completed = challengeData.challenges.filter((c) => c.isCompleted).length;
        setChallengeRate({ completed, total });
      }
    } catch (error) {
      console.error('Failed to fetch resume data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/resume/${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleSetDisplayTitle = async (userTitleId: number) => {
    if (!accessToken) return;
    try {
      await apiSetDisplayTitle(userTitleId, { accessToken });
      setAllTitles((prev: UserTitleResponse[]) =>
        prev.map((t: UserTitleResponse) => ({ ...t, isDisplay: t.userTitleId === userTitleId }))
      );
      const selected = allTitles.find((t: UserTitleResponse) => t.userTitleId === userTitleId) ?? null;
      setDisplayTitle(selected ? { ...selected, isDisplay: true } : null);
      setShowTitleModal(false);
    } catch (err) {
      console.error('대표 칭호 변경 실패:', err);
    }
  };

  // 편집형 섹션 헬퍼 함수들
  const addLink = () =>
    setLinks([...links, { id: newId(), label: '', url: '' }]);
  const removeLink = (id: string) =>
    setLinks(links.filter((l) => l.id !== id));
  const updateLink = (id: string, key: string, value: string) =>
    setLinks(links.map((l) => (l.id === id ? { ...l, [key]: value } : l)) as LinkItem[]);

  const addEducation = () =>
    setEducation([...education, { id: newId(), school: '', major: '', period: '' }]);
  const removeEducation = (id: string) =>
    setEducation(education.filter((e) => e.id !== id));
  const updateEducation = (id: string, key: string, value: string) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, [key]: value } : e)) as EducationItem[]);

  const addCareer = () =>
    setCareer([...career, { id: newId(), company: '', role: '', period: '' }]);
  const removeCareer = (id: string) =>
    setCareer(career.filter((c) => c.id !== id));
  const updateCareer = (id: string, key: string, value: string) =>
    setCareer(career.map((c) => (c.id === id ? { ...c, [key]: value } : c)) as CareerItem[]);

  const addExperience = () =>
    setExperience([...experience, { id: newId(), title: '', description: '', period: '' }]);
  const removeExperience = (id: string) =>
    setExperience(experience.filter((e) => e.id !== id));
  const updateExperience = (id: string, key: string, value: string) =>
    setExperience(experience.map((e) => (e.id === id ? { ...e, [key]: value } : e)) as ExperienceItem[]);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const rarityColors: Record<string, string> = {
    COMMON: 'bg-gray-100 text-gray-600',
    RARE: 'bg-blue-100 text-blue-700',
    EPIC: 'bg-purple-100 text-purple-700',
    LEGENDARY: 'bg-amber-100 text-amber-700',
  };

  const addTechTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
    setTechInput('');
  };

  const removeTechTag = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  // 프로젝트
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

  // 수상 / 성과
  const addAward = () =>
    setAwards([...awards, { id: newId(), name: '', organization: '', date: '', relatedProject: '', description: '' }]);
  const removeAward = (id: string) => setAwards(awards.filter((a) => a.id !== id));
  const updateAward = (id: string, key: string, value: string) =>
    setAwards(awards.map((a) => (a.id === id ? { ...a, [key]: value } : a)) as AwardItem[]);

  // 자격증
  const addCertification = () =>
    setCertifications([...certifications, { id: newId(), name: '', organization: '', date: '', status: 'ACQUIRED' }]);
  const removeCertification = (id: string) => setCertifications(certifications.filter((c) => c.id !== id));
  const updateCertification = (id: string, key: string, value: string) =>
    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [key]: value } : c)) as CertificationItem[]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 상단 뒤로가기 */}
      <div className="mb-6">
        <Link
          href="/user"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          내 정보로 돌아가기
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* ── 왼쪽 사이드바 ── */}
        <aside className="print:hidden lg:w-60 lg:flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* 프로필 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="relative h-20 w-20">
                  {profile?.profileImage ? (
                    <Image
                      src={ensureEncodedUrl(profile.profileImage)}
                      alt={profile.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-900">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>
                <Link
                  href="/user/edit"
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 text-xs"
                >
                  편집
                </Link>
              </div>

              <h1 className="mb-1 text-xl font-bold text-gray-900">{profile?.name}</h1>

              {/* 대표 칭호 */}
              {displayTitle && (
                <div className="mb-2 flex items-center gap-1.5">
                  {displayTitle.iconUrl && (
                    <img
                      src={displayTitle.iconUrl}
                      alt={displayTitle.titleName}
                      className="h-4 w-4 object-contain"
                      onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-xs font-medium text-amber-600">
                    {displayTitle.titleName}
                  </span>
                </div>
              )}

              <p className="mb-2 text-sm text-gray-500">{session.user?.email}</p>

              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  {profile.githubUrl.replace('https://github.com/', '@')}
                </a>
              )}

              {profile?.introduction && (
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  {profile.introduction}
                </p>
              )}
            </div>

            {/* 활동 통계 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">활동 통계</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Star className="h-4 w-4" />
                    보유 포인트
                  </span>
                  <span className="font-medium text-gray-900">{pointBalance.toLocaleString()}P</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Trophy className="h-4 w-4" />
                    챌린지 달성
                  </span>
                  <span className="font-medium text-gray-900">
                    {challengeRate ? `${challengeRate.completed}/${challengeRate.total}` : '-'}
                  </span>
                </div>
                <div className="my-2 border-t border-gray-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <GitCommit className="h-4 w-4" />
                    커밋
                  </span>
                  <span className="font-medium text-gray-900">
                    {overallHistory?.totalCommitCount?.toLocaleString() ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <GitPullRequest className="h-4 w-4" />
                    PR
                  </span>
                  <span className="font-medium text-gray-900">
                    {overallHistory?.totalPrCount?.toLocaleString() ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    이슈
                  </span>
                  <span className="font-medium text-gray-900">
                    {overallHistory?.totalIssueCount?.toLocaleString() ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <FolderGit className="h-4 w-4" />
                    기여 저장소
                  </span>
                  <span className="font-medium text-gray-900">
                    {overallHistory?.contributedRepoCount?.toLocaleString() ?? '-'}
                  </span>
                </div>
              </div>
            </div>
            {/* 섹션 설정 카드 */}
            <SectionToggleCard
              visibleSections={visibleSections}
              onToggle={toggleSection}
            />

            {/* 공개설정 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                공개 설정
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">이력서 공개</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublic}
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublic ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isPublic ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {isPublic && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] text-gray-400">공개 URL</p>
                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="flex-1 truncate text-[11px] text-gray-500">
                      {/* TODO: 공개 라우트 (/resume/[userId]) 구현 후 실제 URL로 교체 */}
                      /resume/{userId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label="URL 복사"
                    >
                      {copiedUrl ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] text-amber-600">
                    ※ 공개 페이지는 준비 중입니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── 오른쪽 이력서 본문 ── */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* 상단 헤더: 이력서 제목 입력 + 버튼들 */}
          <div className="print:hidden flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-gray-500" />
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="이력서 제목을 입력하세요"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <Link
              href="/user/edit"
              className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              수정하기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              <Printer className="h-4 w-4" />
              인쇄 / PDF
            </button>
          </div>
          {/* 인쇄 시에만 보이는 이력서 제목 */}
          {resumeTitle && (
            <h2 className="hidden text-2xl font-bold text-gray-900 print:block">{resumeTitle}</h2>
          )}

          {/* 프로필 카드 (이력서 상단) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-5">
              {/* 프로필 이미지 */}
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
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>

              {/* 이름 + 칭호 + 이메일 */}
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{profile?.name ?? '-'}</h3>

                {/* 대표 칭호 + 이모지 */}
                {displayTitle ? (
                  <div className="mt-1 flex items-center gap-1.5">
                    {displayTitle.iconUrl && (
                      <img
                        src={displayTitle.iconUrl}
                        alt={displayTitle.titleName}
                        className="h-5 w-5 object-contain"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-sm font-semibold text-amber-600">
                      {displayTitle.titleName}
                    </span>
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        rarityColors[displayTitle.rarity] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {RARITY_LABELS[displayTitle.rarity] ?? displayTitle.rarity}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">대표 칭호 없음</p>
                )}

                <p className="mt-1.5 text-sm text-gray-500">{session.user?.email}</p>

                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    {profile.githubUrl}
                  </a>
                )}
              </div>
            </div>

            {profile?.introduction && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-sm leading-relaxed text-gray-600">{profile.introduction}</p>
              </div>
            )}
          </div>

          {/* 한 줄 소개 + 자기소개 */}
          {draftLoaded && (visibleSections.headline || visibleSections.bio) && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <User className="h-4 w-4 text-gray-500" />
                  소개
                  <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">임시저장</span>
                </h3>
              </div>
              <div className="space-y-4 px-6 py-4">
                {visibleSections.headline && (
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
                )}
                {visibleSections.bio && (
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
                )}
              </div>
            </div>
          )}

          {/* GitHub 랭크 카드 */}
          {contributionScore && overallHistory && (
            <GithubRankCard
              name={profile?.name || '사용자'}
              profileImage={profile?.profileImage}
              rank={getRankFromScore(contributionScore.totalScore)}
              totalScore={contributionScore.totalScore}
              stats={{
                commits: overallHistory.totalCommitCount,
                pullRequests: overallHistory.totalPrCount,
                issues: overallHistory.totalIssueCount,
                repositories: overallHistory.contributedRepoCount,
              }}
            />
          )}

          {/* GitHub 기여 요약 */}
          {overallHistory && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Github className="h-4 w-4 text-gray-500" />
                  GitHub 기여 요약
                </h3>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-3">
                {[
                  { icon: <GitCommit className="h-5 w-5 text-gray-400" />, value: overallHistory.totalCommitCount, label: 'Commits' },
                  { icon: <GitPullRequest className="h-5 w-5 text-gray-400" />, value: overallHistory.totalPrCount, label: 'Pull Requests' },
                  { icon: <AlertCircle className="h-5 w-5 text-gray-400" />, value: overallHistory.totalIssueCount, label: 'Issues' },
                  { icon: <FolderGit className="h-5 w-5 text-gray-400" />, value: overallHistory.contributedRepoCount, label: 'Repositories' },
                  { icon: <span className="text-emerald-500 font-bold text-sm">+</span>, value: overallHistory.totalAdditions, label: 'Additions' },
                  { icon: <span className="text-red-500 font-bold text-sm">−</span>, value: overallHistory.totalDeletions, label: 'Deletions' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="flex flex-col items-center justify-center p-4 sm:p-5">
                    <div className="mb-1.5">{icon}</div>
                    <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {value.toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 보유 칭호 목록 */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Trophy className="h-4 w-4 text-gray-500" />
                보유 칭호
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {allTitles.length}
                </span>
              </h3>
            </div>

            {allTitles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Trophy className="mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">아직 획득한 칭호가 없습니다.</p>
                <Link
                  href="/challenge"
                  className="mt-3 text-xs text-gray-400 underline hover:text-gray-700"
                >
                  챌린지에서 칭호를 획득해보세요
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {allTitles.map((title) => (
                  <div
                    key={title.userTitleId}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    {/* 아이콘 */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50">
                      {title.iconUrl ? (
                        <img
                          src={title.iconUrl}
                          alt={title.titleName}
                          className="h-6 w-6 object-contain"
                          onError={(e: SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Trophy className="h-5 w-5 text-gray-300" />
                      )}
                    </div>

                    {/* 칭호 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {title.titleName}
                        </span>
                        {title.isDisplay && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            대표
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            rarityColors[title.rarity] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {RARITY_LABELS[title.rarity] ?? title.rarity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{title.description}</p>
                    </div>

                    {/* 획득일 */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(title.grantedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-300">{title.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 챌린지 달성 현황 */}
          {visibleSections.challenge && challengeRate && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  챌린지 달성 현황
                </h3>
                <span className="text-sm font-semibold text-gray-900">
                  {challengeRate.completed} / {challengeRate.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{
                    width:
                      challengeRate.total > 0
                        ? `${Math.round((challengeRate.completed / challengeRate.total) * 100)}%`
                        : '0%',
                  }}
                />
              </div>
              <p className="mt-2 text-right text-xs text-gray-400">
                {challengeRate.total > 0
                  ? `${Math.round((challengeRate.completed / challengeRate.total) * 100)}% 달성`
                  : '진행 중인 챌린지 없음'}
              </p>
            </div>
          )}

          {/* ── 편집형 섹션 (localStorage 임시저장) ─────────────────── */}
          {draftLoaded && (
            <>
              {/* 개발 직무 */}
              {visibleSections.jobRole && (
                <div className="rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Code2 className="h-4 w-4 text-gray-500" />
                      개발 직무
                      <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
                        임시저장
                      </span>
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
                </div>
              )}

              {/* 기술 스택 */}
              {visibleSections.techStack && (
                <div className="rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Layers className="h-4 w-4 text-gray-500" />
                      기술 스택
                      <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
                        임시저장
                      </span>
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    {/* 태그 목록 */}
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
                    {/* 태그 입력 */}
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
                </div>
              )}

              {/* 링크 */}
              {visibleSections.links && (
                <EditableListSection
                  title="링크"
                  icon={<LinkIcon className="h-4 w-4 text-gray-500" />}
                  items={links}
                  fields={[
                    { key: 'label', label: '링크 이름', placeholder: '예: GitHub, 블로그', span: 'half' },
                    { key: 'url', label: 'URL', placeholder: 'https://', span: 'half' },
                  ]}
                  addLabel="링크 추가"
                  emptyMessage="등록된 링크가 없습니다."
                  onAdd={addLink}
                  onRemove={removeLink}
                  onUpdate={updateLink}
                />
              )}

              {/* 학력 */}
              {visibleSections.education && (
                <EditableListSection
                  title="학력"
                  icon={<GraduationCap className="h-4 w-4 text-gray-500" />}
                  items={education}
                  fields={[
                    { key: 'school', label: '학교명', placeholder: '예: 한국기술교육대학교', span: 'half' },
                    { key: 'major', label: '전공', placeholder: '예: 컴퓨터공학부', span: 'half' },
                    { key: 'period', label: '기간', placeholder: '예: 2021.03 ~ 2025.02', span: 'full' },
                  ]}
                  addLabel="학력 추가"
                  emptyMessage="등록된 학력이 없습니다."
                  onAdd={addEducation}
                  onRemove={removeEducation}
                  onUpdate={updateEducation}
                />
              )}

              {/* 경력 */}
              {visibleSections.career && (
                <EditableListSection
                  title="경력"
                  icon={<Briefcase className="h-4 w-4 text-gray-500" />}
                  items={career}
                  fields={[
                    { key: 'company', label: '회사명', placeholder: '예: KOREATECH', span: 'half' },
                    { key: 'role', label: '직무', placeholder: '예: 백엔드 개발', span: 'half' },
                    { key: 'period', label: '기간', placeholder: '예: 2024.07 ~ 2024.12', span: 'full' },
                  ]}
                  addLabel="경력 추가"
                  emptyMessage="등록된 경력이 없습니다."
                  onAdd={addCareer}
                  onRemove={removeCareer}
                  onUpdate={updateCareer}
                />
              )}

              {/* 경험 */}
              {visibleSections.experience && (
                <EditableListSection
                  title="경험 / 활동"
                  icon={<Lightbulb className="h-4 w-4 text-gray-500" />}
                  items={experience}
                  fields={[
                    { key: 'title', label: '활동명', placeholder: '예: 오픈소스 포털 개발', span: 'half' },
                    { key: 'period', label: '기간', placeholder: '예: 2024.03 ~ 2024.06', span: 'half' },
                    { key: 'description', label: '설명', placeholder: '주요 역할과 기여 내용을 입력하세요.', multiline: true, span: 'full' },
                  ]}
                  addLabel="경험 추가"
                  emptyMessage="등록된 경험이 없습니다."
                  onAdd={addExperience}
                  onRemove={removeExperience}
                  onUpdate={updateExperience}
                />
              )}

              {/* 프로젝트 (상세) */}
              {visibleSections.projects && (
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
              )}

              {/* 수상 / 성과 */}
              {visibleSections.awards && (
                <EditableListSection
                  title="수상 / 성과"
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
              )}

              {/* 자격증 */}
              {visibleSections.certifications && (
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
                      { value: 'PREPARING', label: '준비 중' },
                      { value: 'SCHEDULED', label: '예정' },
                      { value: 'EXPIRED', label: '만료' },
                    ]},
                  ]}
                  addLabel="자격증 추가"
                  emptyMessage="등록된 자격증이 없습니다."
                  onAdd={addCertification}
                  onRemove={removeCertification}
                  onUpdate={updateCertification}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
