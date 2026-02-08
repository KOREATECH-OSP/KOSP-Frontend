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
import { ensureEncodedUrl } from '@/lib/utils';

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
          <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-gray-200/60 bg-gray-50 px-4 pb-3 pt-4 sm:relative sm:top-0 sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 lg:static">
            <div className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((tab, index) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.key
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
            <div className="space-y-4">
              {/* 데이터가 모두 없을 때 블러 처리된 통계 UI */}
              {!overallHistory && !contributionScore && recentActivity.length === 0 ? (
                <div className="relative">
                  {/* 블러된 더미 통계 UI */}
                  <div className="pointer-events-none select-none space-y-4 blur-sm">
                    {/* 더미 GitHub Rank Card 영역 */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl bg-slate-700" />
                          <div>
                            <div className="h-6 w-32 rounded bg-slate-700" />
                            <div className="mt-2 h-4 w-24 rounded bg-slate-700/50" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 w-20 rounded bg-slate-700/50" />
                          <div className="mt-2 h-10 w-28 rounded bg-gradient-to-r from-amber-500 to-amber-300" />
                        </div>
                      </div>
                    </div>

                    {/* 더미 점수 상세 */}
                    <div className="grid grid-cols-3 gap-3">
                      {['Activity', 'Diversity', 'Impact'].map((label) => (
                        <div key={label} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 text-center">
                          <div className="mx-auto mb-2 h-5 w-5 rounded bg-slate-700" />
                          <div className="mx-auto h-6 w-12 rounded bg-slate-700" />
                          <div className="mx-auto mt-1 h-3 w-16 rounded bg-slate-700/50" />
                        </div>
                      ))}
                    </div>

                    {/* 더미 Contribution Overview */}
                    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
                      <div className="mb-4 h-5 w-40 rounded bg-slate-700" />
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="text-center">
                            <div className="mx-auto mb-2 h-6 w-6 rounded bg-slate-700" />
                            <div className="mx-auto h-7 w-16 rounded bg-slate-700" />
                            <div className="mx-auto mt-1 h-3 w-12 rounded bg-slate-700/50" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 오버레이 메시지 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-6 py-4 shadow-2xl">
                      <div className="text-center">
                        <Github className="mx-auto mb-2 h-8 w-8 text-slate-500" />
                        <p className="text-sm font-medium text-slate-300">
                          GitHub 통계를 수집 중입니다
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          잠시 후 다시 확인해주세요
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
                      tierLabel={`${profile.name}님의 티어`}
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
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-gray-200/60 bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                          <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {contributionScore.activityScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Activity</div>
                      </div>
                      <div className="rounded-2xl border border-gray-200/60 bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {contributionScore.diversityScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Diversity</div>
                      </div>
                      <div className="rounded-2xl border border-gray-200/60 bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                          <Zap className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {contributionScore.impactScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Impact</div>
                      </div>
                    </div>
                  )}

                  {/* Contribution Overview */}
                  {overallHistory && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Github className="h-4 w-4 text-gray-500" />
                          Contribution Overview
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-3">
                        <div className="flex flex-col items-center justify-center p-4 transition-colors hover:bg-gray-50 sm:p-5">
                          <GitCommit className="mb-1.5 h-5 w-5 text-gray-400" />
                          <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {overallHistory.totalCommitCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Commits</div>
                          {comparison && (
                            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${overallHistory.totalCommitCount >= comparison.avgCommitCount ? 'bg-emerald-50' : 'bg-red-50'}`}>
                              <span className={`text-[10px] font-medium ${overallHistory.totalCommitCount >= comparison.avgCommitCount ? 'text-emerald-600' : 'text-red-600'}`}>
                                {overallHistory.totalCommitCount >= comparison.avgCommitCount ? '▲' : '▼'} 평균 대비 {Math.abs(overallHistory.totalCommitCount - Math.round(comparison.avgCommitCount)).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 transition-colors hover:bg-gray-50 sm:p-5">
                          <GitPullRequest className="mb-1.5 h-5 w-5 text-gray-400" />
                          <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {overallHistory.totalPrCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Pull Requests</div>
                          {comparison && (
                            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${overallHistory.totalPrCount >= comparison.avgPrCount ? 'bg-emerald-50' : 'bg-red-50'}`}>
                              <span className={`text-[10px] font-medium ${overallHistory.totalPrCount >= comparison.avgPrCount ? 'text-emerald-600' : 'text-red-600'}`}>
                                {overallHistory.totalPrCount >= comparison.avgPrCount ? '▲' : '▼'} 평균 대비 {Math.abs(overallHistory.totalPrCount - Math.round(comparison.avgPrCount)).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 transition-colors hover:bg-gray-50 sm:p-5">
                          <AlertCircle className="mb-1.5 h-5 w-5 text-gray-400" />
                          <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {overallHistory.totalIssueCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Issues</div>
                          {comparison && (
                            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${overallHistory.totalIssueCount >= comparison.avgIssueCount ? 'bg-emerald-50' : 'bg-red-50'}`}>
                              <span className={`text-[10px] font-medium ${overallHistory.totalIssueCount >= comparison.avgIssueCount ? 'text-emerald-600' : 'text-red-600'}`}>
                                {overallHistory.totalIssueCount >= comparison.avgIssueCount ? '▲' : '▼'} 평균 대비 {Math.abs(overallHistory.totalIssueCount - Math.round(comparison.avgIssueCount)).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 transition-colors hover:bg-gray-50 sm:p-5">
                          <FolderGit className="mb-1.5 h-5 w-5 text-gray-400" />
                          <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {overallHistory.contributedRepoCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Repositories</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 transition-colors hover:bg-gray-50 sm:p-5">
                          <TrendingUp className="mb-1.5 h-5 w-5 text-emerald-500" />
                          <div className="text-xl font-bold text-emerald-600 sm:text-2xl">
                            +{overallHistory.totalAdditions.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Additions</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 transition-colors hover:bg-gray-50 sm:p-5">
                          <TrendingUp className="mb-1.5 h-5 w-5 rotate-180 text-red-500" />
                          <div className="text-xl font-bold text-red-600 sm:text-2xl">
                            -{overallHistory.totalDeletions.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Deletions</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Contributions */}
                  {recentActivity.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <FolderGit className="h-4 w-4 text-gray-500" />
                          Recent Contributions
                        </h2>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {recentActivity.length}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {(showAllRepos ? recentActivity : recentActivity.slice(0, 5)).map((repo, idx) => (
                          <a
                            key={idx}
                            href={`https://github.com/${repo.repoOwner}/${repo.repositoryName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-gray-900">
                                  {repo.repoOwner}/{repo.repositoryName}
                                </span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-400" />
                              </div>
                              {repo.description && (
                                <p className="mt-0.5 truncate text-xs text-gray-500">{repo.description}</p>
                              )}
                              <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <GitCommit className="h-3 w-3" />
                                  {repo.userCommitCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitPullRequest className="h-3 w-3" />
                                  {repo.userPrCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-500" />
                                  {repo.stargazersCount}
                                </span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                      {recentActivity.length > 5 && (
                        <div className="border-t border-gray-100 p-3">
                          <button
                            onClick={() => setShowAllRepos(!showAllRepos)}
                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
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
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

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
