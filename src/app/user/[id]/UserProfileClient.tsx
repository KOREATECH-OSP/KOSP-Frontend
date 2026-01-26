'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Github,
  GitPullRequest,
  GitCommit,
  MessageCircle,
  Eye,
  FileText,
  ChevronRight,
  Star,
  AlertCircle,
  Loader2,
  Code,
  FolderGit,
  ExternalLink,
  TrendingUp,
  Activity,
  Sparkles,
  Zap,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getUserPosts,
  getUserComments,
  getUserGithubOverallHistory,
  getUserGithubRecentActivity,
  getUserGithubContributionScore,
  getUserGithubContributionComparison,
} from '@/lib/api/user';
import type {
  ArticleResponse,
  CommentResponse,
  UserProfileResponse,
  GithubOverallHistoryResponse,
  GithubRecentActivityResponse,
  GithubContributionScoreResponse,
  GithubContributionComparisonResponse,
} from '@/lib/api/types';
import GithubRankCard, { getRankFromScore } from '@/common/components/GithubRankCard';

interface UserProfileClientProps {
  userId: number;
  profile: UserProfileResponse;
  counts: {
    posts: number;
    comments: number;
  };
}

type TabType = '활동' | '작성글' | '댓글';

export default function UserProfileClient({
  userId,
  profile,
  counts: initialCounts,
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('활동');
  const [posts, setPosts] = useState<ArticleResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);

  // GitHub 데이터
  const [overallHistory, setOverallHistory] = useState<GithubOverallHistoryResponse | null>(null);
  const [recentActivity, setRecentActivity] = useState<GithubRecentActivityResponse[]>([]);
  const [contributionScore, setContributionScore] = useState<GithubContributionScoreResponse | null>(null);
  const [comparison, setComparison] = useState<GithubContributionComparisonResponse | null>(null);

  const [counts, setCounts] = useState(initialCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllRepos, setShowAllRepos] = useState(false);

  const fetchGithubData = useCallback(async () => {
    const [historyRes, activityRes, scoreRes, comparisonRes] = await Promise.all([
      getUserGithubOverallHistory(userId).catch(() => null),
      getUserGithubRecentActivity(userId).catch(() => []),
      getUserGithubContributionScore(userId).catch(() => null),
      getUserGithubContributionComparison(userId).catch(() => null),
    ]);

    if (historyRes) setOverallHistory(historyRes);
    if (activityRes) setRecentActivity(activityRes);
    if (scoreRes) setContributionScore(scoreRes);
    if (comparisonRes) setComparison(comparisonRes);
  }, [userId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchGithubData();
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchGithubData]);

  useEffect(() => {
    const fetchTabData = async () => {
      try {
        if (activeTab === '활동') {
          await fetchGithubData();
        } else if (activeTab === '작성글') {
          const res = await getUserPosts(userId);
          setPosts(res.posts);
          setCounts((prev) => ({ ...prev, posts: res.pagination.totalItems }));
        } else if (activeTab === '댓글') {
          const res = await getUserComments(userId);
          setComments(res.comments);
          setCounts((prev) => ({ ...prev, comments: res.meta.totalItems }));
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      }
    };

    fetchTabData();
  }, [activeTab, userId, fetchGithubData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  if (isLoading) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: '활동', label: '활동', icon: <Activity className="h-4 w-4" /> },
    { key: '작성글', label: '작성한 글', icon: <FileText className="h-4 w-4" /> },
    { key: '댓글', label: '작성한 댓글', icon: <MessageCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        돌아가기
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 사이드바 - 프로필 */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* 프로필 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <div className="relative h-20 w-20">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
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
              </div>

              <h1 className="mb-1 text-xl font-bold text-gray-900">{profile.name}</h1>

              {profile.introduction && (
                <p className="mt-4 text-sm text-gray-600">{profile.introduction}</p>
              )}

              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                >
                  <Github className="h-4 w-4" />
                  GitHub 프로필
                  <ExternalLink className="h-3 w-3" />
                </a>
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
                  <span className="font-medium text-gray-900">{counts.posts}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    작성한 댓글
                  </span>
                  <span className="font-medium text-gray-900">{counts.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 탭 필터 */}
          <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex">
              {tabs.map((tab, index) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.key
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${index === 0 ? 'rounded-l-lg' : ''} ${index === tabs.length - 1 ? 'rounded-r-lg' : ''}`}
                  style={
                    activeTab === tab.key
                      ? { background: 'linear-gradient(180deg, #FAA61B 0%, #F36A22 100%)' }
                      : undefined
                  }
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === '활동' && (
            <div className="space-y-6">
              {/* 데이터가 모두 없을 때 블러 처리된 통계 UI */}
              {!overallHistory && !contributionScore && recentActivity.length === 0 ? (
                <div className="relative">
                  {/* 블러된 더미 통계 UI - 실제 GithubRankCard와 동일한 디자인 */}
                  <div className="pointer-events-none select-none space-y-6 blur-sm">
                    {/* 더미 GithubRankCard */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
                      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800/60 shadow-2xl">
                        {/* Header Section */}
                        <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                          {/* Profile */}
                          <div className="z-10 flex items-center gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-slate-700 shadow-2xl sm:h-20 sm:w-20">
                              <div className="flex h-full w-full items-center justify-center text-slate-500">
                                <Github className="h-8 w-8 sm:h-10 sm:w-10" />
                              </div>
                            </div>
                            <div>
                              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-2xl">
                                {profile.name}
                              </h2>
                            </div>
                          </div>
                          {/* Rank */}
                          <div className="z-10 text-left sm:text-right">
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
                              Current Rank
                            </div>
                            <div className="bg-gradient-to-r from-[#b45309] to-[#fde047] bg-clip-text text-3xl font-black text-transparent drop-shadow-lg sm:text-4xl">
                              GOLD
                            </div>
                            <div className="mt-1 text-xs font-light text-slate-400 sm:text-sm">
                              <span className="font-medium text-white">Top 12%</span> of developers
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 border-t border-white/10 bg-black/10 sm:grid-cols-4">
                          <div className="flex flex-col items-center justify-center border-r border-white/5 p-4 sm:p-6">
                            <GitCommit className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
                            <span className="text-lg font-bold text-white sm:text-xl">1,234</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">Commits</span>
                          </div>
                          <div className="flex flex-col items-center justify-center border-r-0 border-white/5 p-4 sm:border-r sm:p-6">
                            <GitPullRequest className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
                            <span className="text-lg font-bold text-white sm:text-xl">89</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">Pull Requests</span>
                          </div>
                          <div className="flex flex-col items-center justify-center border-r border-t border-white/5 p-4 sm:border-t-0 sm:p-6">
                            <AlertCircle className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
                            <span className="text-lg font-bold text-white sm:text-xl">56</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">Issues</span>
                          </div>
                          <div className="flex flex-col items-center justify-center border-t border-white/5 p-4 sm:border-t-0 sm:p-6">
                            <FolderGit className="mb-1.5 h-4 w-4 text-slate-400 sm:h-5 sm:w-5" />
                            <span className="text-lg font-bold text-white sm:text-xl">12</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">Repositories</span>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="bg-white/[0.02] p-6 sm:p-8">
                          <div className="mb-3 flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-400">Progress to next tier</span>
                            <span className="font-mono text-white">3.5 / 4.5 pts</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: '65%',
                                backgroundColor: '#fbbf24',
                                boxShadow: '0 0 15px #fbbf2480',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 더미 점수 상세 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                        <Activity className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                        <div className="text-xl font-bold text-gray-900">2.5</div>
                        <div className="text-xs text-gray-500">Activity</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                        <Sparkles className="mx-auto mb-2 h-5 w-5 text-purple-500" />
                        <div className="text-xl font-bold text-gray-900">0.8</div>
                        <div className="text-xs text-gray-500">Diversity</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                        <Zap className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                        <div className="text-xl font-bold text-gray-900">1.2</div>
                        <div className="text-xs text-gray-500">Impact</div>
                      </div>
                    </div>

                    {/* 더미 Contribution Overview */}
                    <div className="overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white sm:mb-6">
                        <Github className="h-4 w-4" />
                        Contribution Overview
                      </h2>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                        <div className="text-center">
                          <GitCommit className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">1,234</div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Commits</div>
                        </div>
                        <div className="text-center">
                          <GitPullRequest className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">89</div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Pull Requests</div>
                        </div>
                        <div className="text-center">
                          <AlertCircle className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">56</div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Issues</div>
                        </div>
                        <div className="text-center">
                          <FolderGit className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">12</div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Repositories</div>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="mx-auto mb-1.5 h-5 w-5 text-green-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-green-400 sm:text-3xl">+45,678</div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Additions</div>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="mx-auto mb-1.5 h-5 w-5 rotate-180 text-red-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-red-400 sm:text-3xl">-12,345</div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Deletions</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오버레이 메시지 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-xl border border-gray-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur-sm">
                      <div className="text-center">
                        <div className="mb-2 flex justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          GitHub 통계를 수집 중입니다
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          잠시 후 다시 방문해 주세요
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* GitHub Rank Card */}
                  {contributionScore && overallHistory && (
                    <GithubRankCard
                      name={profile.name}
                      profileImage={profile.profileImage}
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

                  {/* 점수 상세 */}
                  {contributionScore && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                        <Activity className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                        <div className="text-xl font-bold text-gray-900">
                          {contributionScore.activityScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Activity</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                        <Sparkles className="mx-auto mb-2 h-5 w-5 text-purple-500" />
                        <div className="text-xl font-bold text-gray-900">
                          {contributionScore.diversityScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Diversity</div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                        <Zap className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                        <div className="text-xl font-bold text-gray-900">
                          {contributionScore.impactScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Impact</div>
                      </div>
                    </div>
                  )}

                  {/* Contribution Overview */}
                  {overallHistory && (
                    <div className="overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white sm:mb-6">
                        <Github className="h-4 w-4" />
                        Contribution Overview
                      </h2>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                        <div className="text-center">
                          <GitCommit className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">
                            {overallHistory.totalCommitCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Commits</div>
                          {comparison && (
                            <div className="mx-auto mt-2 flex items-center justify-center gap-1.5 rounded-full bg-white/10 px-2 py-1">
                              <span className="text-[10px] text-gray-400">
                                평균 {Math.round(comparison.avgCommitCount).toLocaleString()}
                              </span>
                              <span className={`text-[10px] font-semibold ${overallHistory.totalCommitCount >= comparison.avgCommitCount ? 'text-emerald-400' : 'text-red-400'}`}>
                                {overallHistory.totalCommitCount >= comparison.avgCommitCount ? '▲' : '▼'}{Math.abs(overallHistory.totalCommitCount - comparison.avgCommitCount).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <GitPullRequest className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">
                            {overallHistory.totalPrCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Pull Requests</div>
                          {comparison && (
                            <div className="mx-auto mt-2 flex items-center justify-center gap-1.5 rounded-full bg-white/10 px-2 py-1">
                              <span className="text-[10px] text-gray-400">
                                평균 {Math.round(comparison.avgPrCount).toLocaleString()}
                              </span>
                              <span className={`text-[10px] font-semibold ${overallHistory.totalPrCount >= comparison.avgPrCount ? 'text-emerald-400' : 'text-red-400'}`}>
                                {overallHistory.totalPrCount >= comparison.avgPrCount ? '▲' : '▼'}{Math.abs(overallHistory.totalPrCount - comparison.avgPrCount).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <AlertCircle className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">
                            {overallHistory.totalIssueCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Issues</div>
                          {comparison && (
                            <div className="mx-auto mt-2 flex items-center justify-center gap-1.5 rounded-full bg-white/10 px-2 py-1">
                              <span className="text-[10px] text-gray-400">
                                평균 {Math.round(comparison.avgIssueCount).toLocaleString()}
                              </span>
                              <span className={`text-[10px] font-semibold ${overallHistory.totalIssueCount >= comparison.avgIssueCount ? 'text-emerald-400' : 'text-red-400'}`}>
                                {overallHistory.totalIssueCount >= comparison.avgIssueCount ? '▲' : '▼'}{Math.abs(overallHistory.totalIssueCount - comparison.avgIssueCount).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <FolderGit className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-white sm:text-3xl">
                            {overallHistory.contributedRepoCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Repositories</div>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="mx-auto mb-1.5 h-5 w-5 text-green-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-green-400 sm:text-3xl">
                            +{overallHistory.totalAdditions.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Additions</div>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="mx-auto mb-1.5 h-5 w-5 rotate-180 text-red-400 sm:mb-2 sm:h-6 sm:w-6" />
                          <div className="text-2xl font-bold text-red-400 sm:text-3xl">
                            -{overallHistory.totalDeletions.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 sm:text-xs">Deletions</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Contributions */}
                  {recentActivity.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 sm:mb-4">
                        <FolderGit className="h-4 w-4" />
                        Recent Contributions
                      </h2>
                      <div className="space-y-3">
                        {(showAllRepos ? recentActivity : recentActivity.slice(0, 5)).map((repo, idx) => (
                          <a
                            key={idx}
                            href={`https://github.com/${repo.repoOwner}/${repo.repositoryName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium text-gray-900">
                                  {repo.repoOwner}/{repo.repositoryName}
                                </span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-400" />
                              </div>
                              {repo.description && (
                                <p className="mt-1 truncate text-xs text-gray-500">{repo.description}</p>
                              )}
                              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <GitCommit className="h-3 w-3" />
                                  {repo.userCommitCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitPullRequest className="h-3 w-3" />
                                  {repo.userPrCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {repo.stargazersCount}
                                </span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                      {recentActivity.length > 5 && (
                        <button
                          onClick={() => setShowAllRepos(!showAllRepos)}
                          className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          {showAllRepos ? (
                            <>
                              접기
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              더보기 ({recentActivity.length - 5}개)
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* 언어 통계 (블러 처리) */}
              <div className="relative rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 sm:mb-4">
                  <Code className="h-4 w-4" />
                  Language Stats
                </h2>
                <div className="relative">
                  {/* 블러된 더미 콘텐츠 */}
                  <div className="pointer-events-none select-none blur-sm">
                    <div className="space-y-2">
                      {['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust'].map((lang, i) => (
                        <div key={lang} className="flex items-center gap-3">
                          <span className="w-20 truncate text-sm text-gray-700">{lang}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-gray-700 to-gray-900"
                              style={{ width: `${80 - i * 15}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs text-gray-500">
                            {(40 - i * 8).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 오버레이 메시지 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg bg-white/90 px-4 py-2 shadow-sm">
                      <p className="text-sm font-medium text-gray-600">
                        언어 통계는 곧 만나보실 수 있습니다.
                      </p>
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
                <h2 className="text-sm font-bold text-gray-900">작성한 글 ({posts.length})</h2>
              </div>

              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성한 글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/${post.id}`}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
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
                <h2 className="text-sm font-bold text-gray-900">작성한 댓글 ({comments.length})</h2>
              </div>

              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageCircle className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성한 댓글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {comments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/community/${comment.articleId}`}
                      className="group block px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <p className="mb-1 text-xs text-blue-600 group-hover:text-blue-700">
                        {comment.articleTitle}
                      </p>
                      <p className="mb-2 text-sm text-gray-700">{comment.content}</p>
                      <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
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
