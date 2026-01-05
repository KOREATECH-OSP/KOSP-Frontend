'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import {
  User,
  Github,
  Edit,
  GitBranch,
  GitPullRequest,
  GitCommit,
  MessageCircle,
  Bookmark,
  ExternalLink,
  Eye,
  FileText,
  ChevronRight,
  Trophy,
  Star,
  AlertCircle,
} from 'lucide-react';

interface GithubActivity {
  id: number;
  type: 'pr' | 'commit';
  repoName: string;
  title: string;
  date: string;
  url: string;
}

interface Post {
  id: number;
  title: string;
  createdAt: string;
  views: number;
  comments: number;
}

interface CommentItem {
  id: number;
  postTitle: string;
  content: string;
  createdAt: string;
}

interface UserStats {
  posts: number;
  comments: number;
  challenges: number;
}

interface GithubRepoStats {
  repoName: string;
  projectName: string;
  description: string | null;
  stars: number;
  commits: number;
  prs: number;
  lastCommitDate: string;
  url: string;
}

interface GithubContributionSummary {
  contributedRepos: number;
  totalCommits: number;
  totalLines: number;
  totalIssues: number;
  totalPRs: number;
}

interface GithubContributionComparison {
  average: {
    commits: number;
    stars: number;
    prs: number;
    issues: number;
  };
  mine: {
    commits: number;
    stars: number;
    prs: number;
    issues: number;
  };
}

interface GithubContributionScore {
  activityLevel: number;
  diversity: number;
  impact: number;
  total: number;
}

type TabType = '활동' | '작성글' | '댓글' | '즐겨찾기';

interface UserPageClientProps {
  session: Session | null;
}

export default function UserPageClient({ session }: UserPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('활동');

  // 세션에서 사용자 정보 추출
  const userName = session?.user?.name ?? '사용자';
  const userEmail = session?.user?.email;
  const userId = session?.user?.id;

  // TODO: 실제 API에서 가져와야 함
  const stats: UserStats = {
    posts: 12,
    comments: 48,
    challenges: 3,
  };

  // TODO: 실제 GitHub 연동 시 사용자별 데이터 조회
  const githubActivities: GithubActivity[] = [
    {
      id: 1,
      type: 'pr',
      repoName: 'koreatech/kosp-web',
      title: 'feat: 팀 모집 페이지 UI 개선',
      date: '2024-11-28',
      url: 'https://github.com/koreatech/kosp-web/pull/123',
    },
    {
      id: 2,
      type: 'commit',
      repoName: 'koreatech/kosp-api',
      title: 'fix: 회원가입 API 버그 수정',
      date: '2024-11-27',
      url: 'https://github.com/koreatech/kosp-api/commit/abc123',
    },
    {
      id: 3,
      type: 'pr',
      repoName: 'facebook/react',
      title: 'docs: Update Korean translation',
      date: '2024-11-25',
      url: 'https://github.com/facebook/react/pull/456',
    },
  ];

  const recentRepos: GithubRepoStats[] = [
    {
      repoName: 'koreatech/kosp-web',
      projectName: 'KOSP Web',
      description: '한국기술교육대학교 오픈소스 프로젝트 웹 플랫폼',
      stars: 42,
      commits: 156,
      prs: 23,
      lastCommitDate: '2024-11-28',
      url: 'https://github.com/koreatech/kosp-web',
    },
    {
      repoName: 'facebook/react',
      projectName: 'React',
      description: 'The library for web and native user interfaces.',
      stars: 228000,
      commits: 3,
      prs: 2,
      lastCommitDate: '2024-11-25',
      url: 'https://github.com/facebook/react',
    },
    {
      repoName: 'vercel/next.js',
      projectName: 'Next.js',
      description: 'The React Framework',
      stars: 126000,
      commits: 12,
      prs: 5,
      lastCommitDate: '2024-11-20',
      url: 'https://github.com/vercel/next.js',
    },
  ];

  const contributionSummary: GithubContributionSummary = {
    contributedRepos: 8,
    totalCommits: 342,
    totalLines: 15420,
    totalIssues: 28,
    totalPRs: 47,
  };

  const contributionComparison: GithubContributionComparison = {
    average: {
      commits: 120,
      stars: 45,
      prs: 18,
      issues: 12,
    },
    mine: {
      commits: 342,
      stars: 89,
      prs: 47,
      issues: 28,
    },
  };

  const contributionScore: GithubContributionScore = {
    activityLevel: 2.5,
    diversity: 0.8,
    impact: 3.2,
    total: 6.5,
  };

  const achievements = [
    { id: 1, name: 'Pull Shark', description: '128개의 PR 병합', tier: 2, color: 'from-purple-500 to-purple-600' },
    { id: 2, name: 'Commit Master', description: '1,000+ 커밋', tier: 3, color: 'from-blue-500 to-blue-600' },
    { id: 3, name: 'Code Reviewer', description: '50개 리뷰 완료', tier: 1, color: 'from-emerald-500 to-emerald-600' },
    { id: 4, name: 'Open Source', description: '오픈소스 기여자', tier: 2, color: 'from-amber-500 to-amber-600' },
  ];

  const getRankInfo = (score: number) => {
    if (score >= 8) return { 
      grade: 'S', 
      color: 'from-amber-400 to-yellow-500', 
      textColor: 'text-amber-900',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      shadowClass: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
      stars: 5,
      label: 'Legendary'
    };
    if (score >= 6) return { 
      grade: 'A', 
      color: 'from-purple-500 to-purple-600', 
      textColor: 'text-white',
      glowColor: 'rgba(168, 85, 247, 0.6)',
      shadowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]',
      stars: 4,
      label: 'Expert'
    };
    if (score >= 4) return { 
      grade: 'B', 
      color: 'from-blue-500 to-blue-600', 
      textColor: 'text-white',
      glowColor: 'rgba(59, 130, 246, 0.6)',
      shadowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      stars: 3,
      label: 'Advanced'
    };
    if (score >= 2) return { 
      grade: 'C', 
      color: 'from-emerald-500 to-emerald-600', 
      textColor: 'text-white',
      glowColor: 'rgba(16, 185, 129, 0.6)',
      shadowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      stars: 2,
      label: 'Intermediate'
    };
    return { 
      grade: 'D', 
      color: 'from-gray-400 to-gray-500', 
      textColor: 'text-white',
      glowColor: 'transparent',
      shadowClass: '',
      stars: 1,
      label: 'Beginner'
    };
  };

  const rankInfo = getRankInfo(contributionScore.total);

  const myPosts: Post[] = [
    {
      id: 1,
      title: 'React 18 심화 스터디 멤버를 모집합니다!',
      createdAt: '2024-11-28',
      views: 156,
      comments: 8,
    },
    {
      id: 2,
      title: 'Next.js 프로젝트 함께 하실 분 구합니다',
      createdAt: '2024-11-20',
      views: 234,
      comments: 15,
    },
  ];

  const myComments: CommentItem[] = [
    {
      id: 1,
      postTitle: '오픈소스 컨트리뷰션 팀 모집',
      content: '프론트엔드 지원하고 싶습니다! 연락 주세요~',
      createdAt: '2024-11-27',
    },
    {
      id: 2,
      postTitle: 'AI 연구 동아리 멤버 모집',
      content: 'TypeScript 경험이 있는데 참여 가능할까요?',
      createdAt: '2024-11-26',
    },
  ];

  const bookmarkedPosts: Post[] = [
    {
      id: 1,
      title: '백엔드 개발자 모집 (Spring Boot)',
      createdAt: '2024-11-25',
      views: 432,
      comments: 23,
    },
  ];

  const tabs: { key: TabType; label: string }[] = [
    { key: '활동', label: '활동' },
    { key: '작성글', label: '작성한 글' },
    { key: '댓글', label: '작성한 댓글' },
    { key: '즐겨찾기', label: '즐겨찾기' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 로그인하지 않은 경우
  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-20">
        <User className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          로그인이 필요합니다
        </h2>
        <p className="mb-6 text-gray-500">
          내 정보를 확인하려면 로그인해주세요.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 사이드바 - 프로필 */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* 프로필 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="relative h-20 w-20">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-900">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
                <Link
                  href="/user/edit"
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </div>

              <h1 className="mb-1 text-xl font-bold text-gray-900">
                {userName}
              </h1>

              {userEmail && (
                <p className="mb-2 text-sm text-gray-500">{userEmail}</p>
              )}

              {userId && (
                <p className="break-all text-xs text-gray-400">
                  ID: {userId}
                </p>
              )}
            </div>

            {/* 통계 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">활동 통계</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <FileText className="h-4 w-4" />
                    작성한 글
                  </span>
                  <span className="font-medium text-gray-900">
                    {stats.posts}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    작성한 댓글
                  </span>
                  <span className="font-medium text-gray-900">
                    {stats.comments}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Trophy className="h-4 w-4" />
                    완료한 챌린지
                  </span>
                  <span className="font-medium text-gray-900">
                    {stats.challenges}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 탭 필터 */}
          <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === '활동' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 sm:mb-4">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </h2>
                <div className="-mx-4 px-4 sm:-mx-6 sm:px-6">
                  <div className="flex gap-3 overflow-x-auto pb-2 pt-2 sm:gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="group flex flex-shrink-0 flex-col items-center"
                      >
                        <div
                          className={`relative mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${achievement.color} shadow-lg transition-transform duration-200 hover:scale-110 sm:h-16 sm:w-16`}
                        >
                          {achievement.id === 1 && <GitPullRequest className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
                          {achievement.id === 2 && <GitCommit className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
                          {achievement.id === 3 && <Eye className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
                          {achievement.id === 4 && <Star className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
                          {achievement.tier > 1 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-900 shadow sm:h-5 sm:w-5 sm:text-xs">
                              x{achievement.tier}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-gray-900 sm:text-xs">{achievement.name}</span>
                        <span className="text-[10px] text-gray-500 sm:text-xs">{achievement.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white sm:mb-6">
                  <Github className="h-4 w-4" />
                  Contribution Overview
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                  <div className="text-center">
                    <GitCommit className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                    <div className="text-2xl font-bold text-white sm:text-3xl">{contributionSummary.totalCommits}</div>
                    <div className="text-[10px] text-gray-400 sm:text-xs">Total Commits</div>
                  </div>
                  <div className="text-center">
                    <GitPullRequest className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                    <div className="text-2xl font-bold text-white sm:text-3xl">{contributionSummary.totalPRs}</div>
                    <div className="text-[10px] text-gray-400 sm:text-xs">Pull Requests</div>
                  </div>
                  <div className="text-center">
                    <Eye className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                    <div className="text-2xl font-bold text-white sm:text-3xl">{contributionComparison.mine.stars}</div>
                    <div className="text-[10px] text-gray-400 sm:text-xs">Code Reviews</div>
                  </div>
                  <div className="text-center">
                    <AlertCircle className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                    <div className="text-2xl font-bold text-white sm:text-3xl">{contributionSummary.totalIssues}</div>
                    <div className="text-[10px] text-gray-400 sm:text-xs">Issues</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 sm:mb-4">
                  <GitBranch className="h-4 w-4" />
                  Top Repositories
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {recentRepos.map((repo) => (
                    <a
                      key={repo.repoName}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-300 hover:shadow-md sm:p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                            <GitBranch className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-semibold text-blue-600 group-hover:underline">
                            {repo.repoName}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                      <p className="mb-3 line-clamp-2 text-xs text-gray-500">
                        {repo.description || '설명 없음'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          TypeScript
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stars.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitCommit className="h-3 w-3" />
                          {repo.commits}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100">
                <div className="border-b border-gray-200/50 bg-white/60 px-6 py-4 backdrop-blur-sm">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Contribution Rank
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                    <div className="flex flex-col items-center">
                      <div className="group relative">
                        <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${rankInfo.color} opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40 ${rankInfo.grade === 'S' ? 'animate-pulse' : ''}`} />
                        <div className="relative transition-transform duration-300 hover:scale-105">
                          <svg className="h-32 w-32 drop-shadow-2xl sm:h-40 sm:w-40" viewBox="0 0 100 100">
                            <defs>
                              <linearGradient id="hexGradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={rankInfo.grade === 'S' ? '#fef3c7' : rankInfo.grade === 'A' ? '#f3e8ff' : rankInfo.grade === 'B' ? '#dbeafe' : rankInfo.grade === 'C' ? '#d1fae5' : '#f3f4f6'} />
                                <stop offset="100%" stopColor={rankInfo.grade === 'S' ? '#fde68a' : rankInfo.grade === 'A' ? '#e9d5ff' : rankInfo.grade === 'B' ? '#bfdbfe' : rankInfo.grade === 'C' ? '#a7f3d0' : '#e5e7eb'} />
                              </linearGradient>
                              <linearGradient id="hexGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={rankInfo.grade === 'S' ? '#fbbf24' : rankInfo.grade === 'A' ? '#a855f7' : rankInfo.grade === 'B' ? '#3b82f6' : rankInfo.grade === 'C' ? '#10b981' : '#9ca3af'} />
                                <stop offset="50%" stopColor={rankInfo.grade === 'S' ? '#f59e0b' : rankInfo.grade === 'A' ? '#9333ea' : rankInfo.grade === 'B' ? '#2563eb' : rankInfo.grade === 'C' ? '#059669' : '#6b7280'} />
                                <stop offset="100%" stopColor={rankInfo.grade === 'S' ? '#d97706' : rankInfo.grade === 'A' ? '#7c3aed' : rankInfo.grade === 'B' ? '#1d4ed8' : rankInfo.grade === 'C' ? '#047857' : '#4b5563'} />
                              </linearGradient>
                              <filter id="innerShadow">
                                <feOffset dx="0" dy="2" />
                                <feGaussianBlur stdDeviation="2" result="offset-blur" />
                                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                                <feFlood floodColor="black" floodOpacity="0.2" result="color" />
                                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                              </filter>
                              <filter id="glowEffect">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            <polygon
                              points="50,2 95,26 95,74 50,98 5,74 5,26"
                              fill="url(#hexGradientBg)"
                              opacity="0.5"
                            />
                            <polygon
                              points="50,8 88,28 88,72 50,92 12,72 12,28"
                              fill="url(#hexGradientMain)"
                              filter={rankInfo.grade !== 'D' ? 'url(#glowEffect)' : 'url(#innerShadow)'}
                            />
                            <polygon
                              points="50,15 80,31 80,69 50,85 20,69 20,31"
                              fill="none"
                              stroke="rgba(255,255,255,0.4)"
                              strokeWidth="0.5"
                            />
                            <polygon
                              points="50,20 74,33 74,67 50,80 26,67 26,33"
                              fill="rgba(255,255,255,0.1)"
                            />
                            <text
                              x="50"
                              y="58"
                              textAnchor="middle"
                              fill={rankInfo.grade === 'S' ? '#78350f' : '#ffffff'}
                              style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'system-ui' }}
                              filter="url(#innerShadow)"
                            >
                              {rankInfo.grade}
                            </text>
                          </svg>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 transition-all duration-300 ${i < rankInfo.stars ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]' : 'fill-gray-200 text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className={`mt-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${rankInfo.grade === 'S' ? 'bg-amber-100 text-amber-700' : rankInfo.grade === 'A' ? 'bg-purple-100 text-purple-700' : rankInfo.grade === 'B' ? 'bg-blue-100 text-blue-700' : rankInfo.grade === 'C' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {rankInfo.label}
                      </span>
                    </div>
                    <div className="w-full flex-1 space-y-3 sm:space-y-4">
                      <div className="rounded-lg bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
                        <div className="mb-2 flex items-center justify-between sm:mb-3">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-xs">Score Breakdown</span>
                        </div>
                        <div className="space-y-2.5 sm:space-y-3">
                          <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">활동 수준</span>
                              <span className="text-xs text-gray-500">{contributionScore.activityLevel} / 3</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-700 ease-out"
                                style={{ width: `${(contributionScore.activityLevel / 3) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">활동 다양성</span>
                              <span className="text-xs text-gray-500">{contributionScore.diversity} / 1</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-700 ease-out"
                                style={{ width: `${contributionScore.diversity * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">활동 영향성</span>
                              <span className="text-xs text-gray-500">{contributionScore.impact} / 5</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 transition-all duration-700 ease-out"
                                style={{ width: `${(contributionScore.impact / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 shadow-lg sm:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">Total Score</span>
                            <div className="mt-0.5 flex items-baseline gap-1 sm:mt-1">
                              <span className="text-2xl font-black text-white sm:text-3xl">{contributionScore.total}</span>
                              <span className="text-xs text-gray-500 sm:text-sm">/ 9 pts</span>
                            </div>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 sm:h-12 sm:w-12">
                            <Trophy className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-700 sm:mt-3 sm:h-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 transition-all duration-700 ease-out"
                            style={{ width: `${(contributionScore.total / 9) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 작성한 글 탭 */}
          {activeTab === '작성글' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  작성한 글 ({myPosts.length})
                </h2>
              </div>

              {myPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성한 글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/recruit/${post.id}`}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 작성한 댓글 탭 */}
          {activeTab === '댓글' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  작성한 댓글 ({myComments.length})
                </h2>
              </div>

              {myComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageCircle className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성한 댓글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myComments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/recruit/${comment.id}`}
                      className="group block px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <p className="mb-1 text-xs text-blue-600 group-hover:text-blue-700">
                        {comment.postTitle}
                      </p>
                      <p className="mb-2 text-sm text-gray-700">
                        {comment.content}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 즐겨찾기 탭 */}
          {activeTab === '즐겨찾기' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  즐겨찾기한 글 ({bookmarkedPosts.length})
                </h2>
              </div>

              {bookmarkedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Bookmark className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">즐겨찾기한 글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookmarkedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/recruit/${post.id}`}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Bookmark className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
                          <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {post.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
