'use client';

import { useState, useEffect, useCallback, type SyntheticEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { AuthSession } from '@/lib/auth/types';
import {
  User,
  Github,
  Edit,
  GitPullRequest,
  GitCommit,
  MessageCircle,
  Bookmark,
  Eye,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  Loader2,
  FolderGit,
  ExternalLink,
  TrendingUp,
  Activity,
  Sparkles,
  Zap,
  X,
  Calendar,
  Link as LinkIcon,
  Users,
  Trophy,
  Lock,
} from 'lucide-react';
import Pagination from '@/common/components/Pagination';
import {
  getUserPosts,
  getUserComments,
  getUserBookmarks,
  getUserProfile,
  getUserGithubOverallHistory,
  getUserGithubRecentActivity,
  getUserGithubContributionScore,
  getUserGithubContributionComparison,
  getMyPointHistory,
  getMyApplications,
  getMyTitles,
  setDisplayTitle as setDisplayTitleApi,
  getMySeasonRanking,
  getMyResume,
  saveMyResume,
  getAllTitles,
} from '@/lib/api/user';
import { getBoards } from '@/lib/api/board';
import { getChallenges } from '@/lib/api/challenge';
import { ensureEncodedUrl } from '@/lib/utils';
import type {
  ArticleResponse,
  CommentResponse,
  UserProfileResponse,
  GithubOverallHistoryResponse,
  GithubRecentActivityResponse,
  GithubContributionScoreResponse,
  GithubContributionComparisonResponse,
  MyPointHistoryResponse,
  MyApplicationResponse,
  BoardResponse,
  UserTitleResponse,
  MySeasonRankingResponse,
  TitleDetailResponse,
} from '@/lib/api/types';
import GithubRankCard, { getRankFromScore } from '@/common/components/GithubRankCard';
import { TITLE_CATEGORY_EMOJI, RARITY_LABELS, RARITY_COLORS, getTitleImage } from '@/lib/constants/title';

// ─── 시즌 랭킹 카드 ───────────────────────────────────────────
const SEASON_TIER_LABELS: Record<string, string> = {
  BRONZE_4: '브론즈 4', BRONZE_3: '브론즈 3', BRONZE_2: '브론즈 2', BRONZE_1: '브론즈 1',
  SILVER_4: '실버 4',   SILVER_3: '실버 3',   SILVER_2: '실버 2',   SILVER_1: '실버 1',
  GOLD_4:   '골드 4',   GOLD_3:   '골드 3',   GOLD_2:   '골드 2',   GOLD_1:   '골드 1',
  PLATINUM_4: '플래티넘 4', PLATINUM_3: '플래티넘 3', PLATINUM_2: '플래티넘 2', PLATINUM_1: '플래티넘 1',
  DIAMOND_4: '다이아몬드 4', DIAMOND_3: '다이아몬드 3', DIAMOND_2: '다이아몬드 2', DIAMOND_1: '다이아몬드 1',
  MASTER_4: '마스터 4', MASTER_3: '마스터 3', MASTER_2: '마스터 2', MASTER_1: '마스터 1',
  CHALLENGER: '챌린저',
};

const SEASON_TIER_THRESHOLDS: Record<string, [number, number]> = {
  BRONZE_4: [0, 2.5],       BRONZE_3: [2.5, 5],     BRONZE_2: [5, 7.5],       BRONZE_1: [7.5, 10],
  SILVER_4: [10, 12.5],     SILVER_3: [12.5, 15],   SILVER_2: [15, 17.5],     SILVER_1: [17.5, 20],
  GOLD_4:   [20, 23.75],    GOLD_3:   [23.75, 27.5], GOLD_2:  [27.5, 31.25],  GOLD_1:   [31.25, 35],
  PLATINUM_4: [35, 40],     PLATINUM_3: [40, 45],   PLATINUM_2: [45, 50],     PLATINUM_1: [50, 55],
  DIAMOND_4: [55, 60],      DIAMOND_3: [60, 65],    DIAMOND_2: [65, 70],      DIAMOND_1: [70, 75],
  MASTER_4: [75, 78.75],    MASTER_3: [78.75, 82.5], MASTER_2: [82.5, 86.25], MASTER_1: [86.25, 90],
  CHALLENGER: [90, 100],
};

function getTierColor(tier: string): string {
  if (tier.startsWith('BRONZE'))   return 'text-amber-700';
  if (tier.startsWith('SILVER'))   return 'text-slate-500';
  if (tier.startsWith('GOLD'))     return 'text-yellow-500';
  if (tier.startsWith('PLATINUM')) return 'text-teal-500';
  if (tier.startsWith('DIAMOND'))  return 'text-blue-500';
  if (tier.startsWith('MASTER'))   return 'text-purple-600';
  if (tier === 'CHALLENGER')       return 'text-rose-500';
  return 'text-gray-600';
}

function getTierBarColor(tier: string): string {
  if (tier.startsWith('BRONZE'))   return 'bg-amber-600';
  if (tier.startsWith('SILVER'))   return 'bg-slate-400';
  if (tier.startsWith('GOLD'))     return 'bg-yellow-400';
  if (tier.startsWith('PLATINUM')) return 'bg-teal-400';
  if (tier.startsWith('DIAMOND'))  return 'bg-blue-400';
  if (tier.startsWith('MASTER'))   return 'bg-purple-500';
  if (tier === 'CHALLENGER')       return 'bg-rose-500';
  return 'bg-gray-400';
}

const SEASON_CATEGORIES = [
  { key: 'attendanceScore', label: '출석',    color: 'bg-blue-400' },
  { key: 'commitScore',     label: '커밋',    color: 'bg-green-400' },
  { key: 'challengeScore',  label: '챌린지',  color: 'bg-orange-400' },
  { key: 'projectScore',    label: '프로젝트', color: 'bg-purple-400' },
  { key: 'communityScore',  label: '커뮤니티', color: 'bg-pink-400' },
] as const;

function SeasonRankingCard({ ranking }: { ranking: MySeasonRankingResponse }) {
  const { tier, totalScore, rank, seasonName } = ranking;
  const [min, max] = SEASON_TIER_THRESHOLDS[tier] ?? [0, 100];
  const progress = max === min ? 100 : Math.min(100, ((totalScore - min) / (max - min)) * 100);
  const remaining = max === 100 ? 0 : Math.max(0, max - totalScore);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {/* 헤더 */}
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Trophy className="h-4 w-4 text-gray-500" />
          시즌 랭킹
          <span className="ml-auto text-[11px] text-gray-400">{seasonName}</span>
        </h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* 티어 + 순위 */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${getTierColor(tier)}`}>
              {SEASON_TIER_LABELS[tier] ?? tier}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              총점 {totalScore.toFixed(1)}점
              {remaining > 0 && (
                <span className="ml-1.5 text-gray-300">
                  다음 티어까지 {remaining.toFixed(1)}점
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">내 순위</p>
            <p className="text-xl font-bold text-gray-900">#{rank}</p>
          </div>
        </div>

        {/* 티어 진행 바 */}
        <div>
          <div className="mb-1.5 flex justify-between text-[10px] text-gray-400">
            <span>{min.toFixed(1)}</span>
            <span>{max === 100 ? 'MAX' : max.toFixed(1)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getTierBarColor(tier)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 5개 카테고리 점수 */}
        <div className="space-y-2 pt-1">
          {SEASON_CATEGORIES.map(({ key, label, color }) => {
            const score = ranking[key];
            const pct = Math.min(100, (score / 20) * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-[11px] text-gray-500">{label}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-1.5">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[11px] font-medium text-gray-700">
                  {score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────

interface UserPageClientProps {
  session: AuthSession | null;
}

type TabType = '활동' | '포인트' | '지원내역' | '작성글' | '댓글' | '즐겨찾기' | '칭호';

export default function UserPageClient({ session }: UserPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('활동');
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [posts, setPosts] = useState<ArticleResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [bookmarks, setBookmarks] = useState<ArticleResponse[]>([]);

  // GitHub 데이터 (백엔드 API에 맞춤)
  const [overallHistory, setOverallHistory] = useState<GithubOverallHistoryResponse | null>(null);
  const [recentActivity, setRecentActivity] = useState<GithubRecentActivityResponse[]>([]);
  const [contributionScore, setContributionScore] = useState<GithubContributionScoreResponse | null>(null);
  const [comparison, setComparison] = useState<GithubContributionComparisonResponse | null>(null);

  // 포인트 & 지원내역 데이터
  const [pointHistory, setPointHistory] = useState<MyPointHistoryResponse | null>(null);
  const [applications, setApplications] = useState<MyApplicationResponse[]>([]);

  // 대표 칭호
  const [displayTitle, setDisplayTitle] = useState<UserTitleResponse | null>(null);

  // 시즌 랭킹
  const [seasonRanking, setSeasonRanking] = useState<MySeasonRankingResponse | null>(null);

  // 챌린지 달성률
  const [challengeRate, setChallengeRate] = useState<{ completed: number; total: number } | null>(null);

  // 게시판 데이터 (채용공고 게시판 판별용)
  const [boards, setBoards] = useState<BoardResponse[]>([]);

  // 포인트 페이징 상태
  const [pointPage, setPointPage] = useState(1);
  const [pointTotalPages, setPointTotalPages] = useState(1);

  // 지원내역 페이징 상태
  const [applicationPage, setApplicationPage] = useState(1);
  const [applicationTotalPages, setApplicationTotalPages] = useState(1);
  const [applicationTotalItems, setApplicationTotalItems] = useState(0);

  // 작성글 페이징 상태
  const [postPage, setPostPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(1);

  // 댓글 페이징 상태
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);

  // 저장 페이징 상태
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [bookmarkTotalPages, setBookmarkTotalPages] = useState(1);

  const [counts, setCounts] = useState({ posts: 0, comments: 0, bookmarks: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAllRepos, setShowAllRepos] = useState(false);
  const recentRepositoryCount = recentActivity.length;

  // 전체 칭호 목록 (카탈로그)
  const [allTitles, setAllTitles] = useState<TitleDetailResponse[]>([]);
  // 내 보유 칭호 목록
  const [myTitles, setMyTitles] = useState<UserTitleResponse[]>([]);
  // 칭호 탭 필터
  const [titleFilter, setTitleFilter] = useState<string>('전체');
  // 칭호 대표 설정 로딩
  const [displayTitleLoading, setDisplayTitleLoading] = useState(false);

  // 이력서 공개 설정
  const [resumeIsPublic, setResumeIsPublic] = useState<boolean | null>(null);
  const [resumePublicLoading, setResumePublicLoading] = useState(false);
  const [resumePublicCopied, setResumePublicCopied] = useState(false);

  // 지원내역 모달 상태
  const [selectedApplication, setSelectedApplication] = useState<MyApplicationResponse | null>(null);

  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const accessToken = session?.accessToken as string | undefined;

  const fetchGithubData = useCallback(async () => {
    if (!userId) return;

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

  // ── 이력서 공개 설정 핸들러 ──────────────────────────────────
  const handleToggleResumePublic = async () => {
    if (!accessToken || resumePublicLoading) return;
    setResumePublicLoading(true);
    try {
      // 기존 이력서 데이터를 가져온 후 isPublic만 반전시켜 저장
      const current = await getMyResume({ accessToken }).catch(() => null);
      const currentData = current?.resumeData;
      const nextPublic = !resumeIsPublic;
      await saveMyResume(
        {
          resumeTitle: currentData?.resumeTitle ?? '',
          headline: currentData?.headline ?? '',
          bio: currentData?.bio ?? '',
          jobRole: currentData?.jobRole ?? '',
          techStack: currentData?.techStack ?? [],
          links: currentData?.links ?? [],
          education: currentData?.education ?? [],
          career: currentData?.career ?? [],
          experience: currentData?.experience ?? [],
          projects: currentData?.projects ?? [],
          awards: currentData?.awards ?? [],
          certifications: currentData?.certifications ?? [],
          coverLetters: currentData?.coverLetters ?? [],
          isPublic: nextPublic,
        },
        { accessToken }
      );
      setResumeIsPublic(nextPublic);
    } catch {
      // 실패 시 상태 유지
    } finally {
      setResumePublicLoading(false);
    }
  };

  const handleCopyResumeUrl = () => {
    if (!userId) return;
    const url = `${window.location.origin}/resume/${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      setResumePublicCopied(true);
      setTimeout(() => setResumePublicCopied(false), 2000);
    });
  };

  // ── 대표 칭호 설정 핸들러 ──────────────────────────────────────
  const handleSetDisplayTitle = async (userTitleId: number) => {
    if (!accessToken || displayTitleLoading) return;
    setDisplayTitleLoading(true);
    try {
      const updated = await setDisplayTitleApi(userTitleId, { accessToken });
      setMyTitles((prev) => prev.map((t) => ({ ...t, isDisplay: t.userTitleId === userTitleId })));
      setDisplayTitle(updated);
    } catch {
      // 실패 시 상태 유지
    } finally {
      setDisplayTitleLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const profileData = await getUserProfile(userId);
        setProfile(profileData);

        const [postsRes, commentsRes, boardsRes] = await Promise.all([
          getUserPosts(userId),
          getUserComments(userId),
          getBoards().catch(() => ({ boards: [] })),
        ]);
        setCounts({
          posts: postsRes.pagination.totalItems,
          comments: commentsRes.meta.totalItems,
          bookmarks: 0,
        });
        setBoards(boardsRes.boards);

        if (accessToken) {
          const [challengeRes, titlesRes, seasonRes, resumeRes, allTitlesRes] = await Promise.all([
            getChallenges({ accessToken }).catch(() => null),
            getMyTitles({ accessToken }).catch(() => null),
            getMySeasonRanking({ accessToken }).catch(() => null),
            getMyResume({ accessToken }).catch(() => null),
            getAllTitles().catch(() => null),
          ]);
          if (challengeRes) {
            const total = challengeRes.challenges.length;
            const completed = challengeRes.challenges.filter((c) => c.isCompleted).length;
            setChallengeRate({ completed, total });
          }
          if (titlesRes) {
            const found = titlesRes.titles.find((t) => t.isDisplay) ?? null;
            setDisplayTitle(found);
            setMyTitles(titlesRes.titles);
          }
          if (seasonRes) setSeasonRanking(seasonRes);
          if (resumeRes) setResumeIsPublic(resumeRes.resumeData?.isPublic ?? false);
          if (allTitlesRes) setAllTitles(allTitlesRes.titles);
        }

        await fetchGithubData();
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [userId, accessToken, fetchGithubData]);

  useEffect(() => {
    if (!userId) return;

    const fetchTabData = async () => {
      try {
        if (activeTab === '활동') {
          await fetchGithubData();
        } else if (activeTab === '포인트') {
          if (accessToken) {
            const res = await getMyPointHistory({ accessToken }, pointPage, 10);
            setPointHistory(res);
            setPointTotalPages(res.meta?.totalPages || 1);
          }
        } else if (activeTab === '지원내역') {
          if (accessToken) {
            const res = await getMyApplications({ accessToken }, applicationPage, 10);
            setApplications(res.applications);
            setApplicationTotalPages(res.meta?.totalPages || 1);
            setApplicationTotalItems(res.meta?.totalItems || 0);
          }
        } else if (activeTab === '작성글') {
          const res = await getUserPosts(userId, postPage, 10);
          setPosts(res.posts);
          setPostTotalPages(res.pagination.totalPages || 1);
          setCounts((prev) => ({ ...prev, posts: res.pagination.totalItems }));
        } else if (activeTab === '댓글') {
          const res = await getUserComments(userId, commentPage, 10);
          setComments(res.comments);
          setCommentTotalPages(res.meta.totalPages || 1);
          setCounts((prev) => ({ ...prev, comments: res.meta.totalItems }));
        } else if (activeTab === '즐겨찾기') {
          const res = await getUserBookmarks(userId, bookmarkPage, 10);
          setBookmarks(res.posts);
          setBookmarkTotalPages(res.pagination?.totalPages || 1);
          setCounts((prev) => ({ ...prev, bookmarks: res.pagination?.totalItems || res.posts.length }));
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      }
    };

    fetchTabData();
  }, [activeTab, userId, accessToken, fetchGithubData, pointPage, applicationPage, postPage, commentPage, bookmarkPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 채용공고 게시판인지 확인하는 함수
  const isRecruitBoard = (boardId: number) => {
    const board = boards.find((b) => b.id === boardId);
    return board?.isRecruitAllowed ?? false;
  };

  // 게시글 상세 링크 생성 함수
  const getPostDetailLink = (post: ArticleResponse) => {
    return isRecruitBoard(post.boardId) ? `/recruit/${post.id}` : `/community/${post.id}`;
  };


  if (!session || !userId) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-20">
        <User className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">로그인이 필요합니다</h2>
        <p className="mb-6 text-gray-500">내 정보를 확인하려면 로그인해주세요.</p>
        <Link
          href="/login"
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: '활동', label: '활동', icon: <Activity className="h-4 w-4" /> },
    { key: '포인트', label: '포인트', icon: <Star className="h-4 w-4" /> },
    { key: '지원내역', label: '지원내역', icon: <FileText className="h-4 w-4" /> },
    { key: '작성글', label: '작성글', icon: <Edit className="h-4 w-4" /> },
    { key: '댓글', label: '댓글', icon: <MessageCircle className="h-4 w-4" /> },
    { key: '즐겨찾기', label: '저장', icon: <Bookmark className="h-4 w-4" /> },
    { key: '칭호', label: '칭호', icon: <Trophy className="h-4 w-4" /> },
  ];

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
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </div>

              {/* 이름 + 대표 칭호 (같은 줄) */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{profile?.name}</h1>
                {displayTitle && (
                  <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5">
                    {displayTitle.iconUrl ? (
                      <img
                        src={displayTitle.iconUrl}
                        alt={displayTitle.titleName}
                        className="h-3.5 w-3.5 object-contain"
                        onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : displayTitle.category && TITLE_CATEGORY_EMOJI[displayTitle.category] ? (
                      <span className="text-xs leading-none">{TITLE_CATEGORY_EMOJI[displayTitle.category]}</span>
                    ) : (
                      <Trophy className="h-3 w-3 text-amber-500" />
                    )}
                    <span className="text-[11px] font-medium text-amber-600">{displayTitle.titleName}</span>
                  </div>
                )}
              </div>

              {/* 보유 칭호 전체 (대표 강조 + 나머지) */}
              {myTitles.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {myTitles.map((t) => {
                    const isRep = t.isDisplay;
                    return (
                      <div
                        key={t.userTitleId}
                        title={`${t.titleName}${isRep ? ' (대표)' : ''}`}
                        className={`flex items-center justify-center overflow-hidden rounded-full border text-sm transition-all ${
                          isRep
                            ? 'h-10 w-10 border-amber-300 bg-amber-50 shadow-[0_0_0_2px_#fbbf24]'
                            : 'h-7 w-7 border-gray-100 bg-gray-50'
                        }`}
                      >
                        {t.iconUrl ? (
                          <img
                            src={t.iconUrl}
                            alt={t.titleName}
                            className="h-full w-full object-cover"
                            onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : t.category && TITLE_CATEGORY_EMOJI[t.category] ? (
                          TITLE_CATEGORY_EMOJI[t.category]
                        ) : (
                          '🏅'
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mb-2 text-sm text-gray-500">{session.user?.email}</p>
              <p className="break-all text-xs text-gray-400">ID: {userId}</p>

              {profile?.introduction && (
                <p className="mt-4 text-sm text-gray-600">{profile.introduction}</p>
              )}
            </div>

            {/* 통계 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">활동 통계</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Star className="h-4 w-4" />
                    보유 포인트
                  </span>
                  <span className="font-medium text-gray-900">{pointHistory?.currentBalance?.toLocaleString() ?? 0}P</span>
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
                <div className="my-2 border-t border-gray-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <GitCommit className="h-4 w-4" />
                    커밋
                  </span>
                  <span className="font-medium text-gray-900">{overallHistory?.totalCommitCount?.toLocaleString() ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <GitPullRequest className="h-4 w-4" />
                    PR
                  </span>
                  <span className="font-medium text-gray-900">{overallHistory?.totalPrCount?.toLocaleString() ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    이슈
                  </span>
                  <span className="font-medium text-gray-900">{overallHistory?.totalIssueCount?.toLocaleString() ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* 이력서 공개 설정 카드 */}
            {accessToken && (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FileText className="h-4 w-4 text-gray-500" />
                    이력서 공개 설정
                  </h2>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {/* 공개 여부 토글 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {resumeIsPublic ? '공개 중' : '비공개'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {resumeIsPublic
                          ? '누구나 공개 URL로 볼 수 있습니다.'
                          : '본인만 이력서를 볼 수 있습니다.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleResumePublic}
                      disabled={resumePublicLoading || resumeIsPublic === null}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                        resumeIsPublic ? 'bg-orange-400' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          resumeIsPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 공개 URL 복사 / 미리보기 */}
                  {resumeIsPublic && userId && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyResumeUrl}
                        className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {resumePublicCopied ? '복사됨!' : 'URL 복사'}
                      </button>
                      <a
                        href={`/resume/${userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        미리보기
                      </a>
                    </div>
                  )}

                  {/* 이력서 작성 링크 */}
                  <Link
                    href="/user/resume"
                    className="block w-full rounded-lg bg-orange-400 py-1.5 text-center text-xs font-medium text-white hover:bg-orange-500 transition-colors"
                  >
                    이력서 작성하기
                  </Link>
                </div>
              </div>
            )}

            {/* 팔로우/팔로워 카드 — TODO: 팔로우/팔로워 API 구현 후 활성화 */}
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
                  } ${index === 0 ? 'rounded-l-lg' : ''}`}
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
              <Link
                href="/user/resume"
                className="flex flex-shrink-0 items-center gap-1.5 rounded-r-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200"
              >
                <FileText className="h-4 w-4" />
                이력서
              </Link>
            </div>
          </div>

          {activeTab === '활동' && (
            <div className="space-y-4">
              {/* 통계 수집 안내 문구 */}
              <div className="space-y-0.5 text-xs text-slate-500">
                <p>- 통계는 최초 가입 시 우선 수집되며, 이후 주기적으로 증분 수집됩니다. (마지막 수집 시점부터 현재까지)</p>
                <p>- 더 다양한 통계를 준비 중이니 기대해주세요!</p>
              </div>

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
                      name={profile?.name || '사용자'}
                      profileImage={profile?.profileImage}
                      rank={getRankFromScore(contributionScore.totalScore)}
                      totalScore={contributionScore.totalScore}
                      displayTitle={displayTitle}
                      stats={{
                        commits: overallHistory.totalCommitCount,
                        pullRequests: overallHistory.totalPrCount,
                        issues: overallHistory.totalIssueCount,
                        repositories: recentRepositoryCount,
                      }}
                    />
                  )}

                  {/* 시즌 랭킹 티어 */}
                  {seasonRanking && <SeasonRankingCard ranking={seasonRanking} />}

                  {/* 챌린지 달성 카드 */}
                  {challengeRate && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Trophy className="h-4 w-4 text-gray-500" />
                          챌린지 달성
                        </h2>
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {challengeRate.completed}
                              <span className="text-sm font-normal text-gray-400"> / {challengeRate.total}</span>
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">완료한 챌린지</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-orange-500">
                              {challengeRate.total > 0
                                ? Math.round((challengeRate.completed / challengeRate.total) * 100)
                                : 0}%
                            </p>
                            <p className="text-xs text-gray-400">달성률</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-orange-400 transition-all duration-500"
                            style={{
                              width: `${challengeRate.total > 0 ? (challengeRate.completed / challengeRate.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
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
                            {recentRepositoryCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">Recent Repos</div>
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

          {/* 포인트 탭 */}
          {activeTab === '포인트' && (
            <div className="space-y-6">
              {/* 현재 포인트 */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">보유 포인트</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {pointHistory?.currentBalance?.toLocaleString() ?? 0}
                      <span className="ml-1 text-lg font-medium text-gray-500">P</span>
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Star className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* 포인트 안내 */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>포인트는 챌린지 또는 소프트웨어중심대학에서 진행하는 행사를 통해 얻을 수 있습니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>포인트 내역은 모두 투명하게 기록됩니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>부적절한 방법으로 포인트가 적립될 경우 회수될 수 있습니다.</span>
                  </li>
                </ul>
              </div>

              {/* 포인트 내역 */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-sm font-bold text-gray-900">포인트 내역</h2>
                </div>

                {!pointHistory?.transactions || pointHistory.transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Star className="mb-3 h-12 w-12 text-gray-200" />
                    <p className="text-gray-500">포인트 내역이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-100">
                      {pointHistory.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{tx.reason}</p>
                            <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${tx.amount > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}P
                            </p>
                            <p className="text-xs text-gray-400">{tx.balanceAfter.toLocaleString()}P</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 페이지네이션 */}
                    <div className="border-t border-gray-100 px-6 py-4">
                      <Pagination
                        currentPage={pointPage}
                        totalPages={pointTotalPages}
                        onPageChange={setPointPage}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 지원내역 탭 */}
          {activeTab === '지원내역' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">지원내역 ({applicationTotalItems})</h2>
              </div>

              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">지원내역이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <button
                        key={app.applicationId}
                        onClick={() => setSelectedApplication(app)}
                        className="group block w-full px-6 py-4 text-left transition-colors hover:bg-gray-50/80"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {app.recruit.title}
                            </p>
                            <p className="text-xs text-gray-500">{app.recruit.teamName}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              지원일: {formatDate(app.appliedAt)}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              app.status === 'ACCEPTED'
                                ? 'bg-green-100 text-green-700'
                                : app.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {app.status === 'ACCEPTED' ? '승인' : app.status === 'REJECTED' ? '거절' : '대기중'}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  <div className="border-t border-gray-100 px-6 py-4">
                    <Pagination
                      currentPage={applicationPage}
                      totalPages={applicationTotalPages}
                      onPageChange={setApplicationPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 지원내역 상세 모달 */}
          {selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* 모달 헤더 */}
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-900">지원 상세</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 모달 내용 */}
                <div className="space-y-6 p-6">
                  {/* 모집공고 정보 */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Users className="h-4 w-4" />
                      모집공고 정보
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">공고 제목</p>
                        <p className="font-medium text-gray-900">{selectedApplication.recruit.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">팀 이름</p>
                        <p className="text-sm text-gray-700">{selectedApplication.recruit.teamName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500">모집 상태</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            selectedApplication.recruit.status === 'OPEN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {selectedApplication.recruit.status === 'OPEN' ? '모집중' : '마감'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">마감일</p>
                          <p className="text-sm text-gray-700">{formatDate(selectedApplication.recruit.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 지원 정보 */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <FileText className="h-4 w-4" />
                      지원 정보
                    </h4>
                    <div className="space-y-4">
                      {/* 지원 상태 */}
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <span className="text-sm text-gray-600">지원 상태</span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          selectedApplication.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-700'
                            : selectedApplication.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedApplication.status === 'ACCEPTED' ? '승인됨' : selectedApplication.status === 'REJECTED' ? '거절됨' : '검토중'}
                        </span>
                      </div>

                      {/* 지원일 */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>지원일: {formatDate(selectedApplication.appliedAt)}</span>
                      </div>

                      {/* 포트폴리오 URL */}
                      {selectedApplication.portfolioUrl && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-gray-500">포트폴리오</p>
                          <a
                            href={selectedApplication.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            {selectedApplication.portfolioUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {/* 지원 동기 */}
                      <div>
                        <p className="mb-2 text-xs font-medium text-gray-500">지원 동기</p>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                          <p className="whitespace-pre-wrap text-sm text-gray-700">
                            {selectedApplication.reason || '작성된 지원 동기가 없습니다.'}
                          </p>
                        </div>
                      </div>

                      {/* 결정 사유 (승인/거절된 경우) */}
                      {selectedApplication.decisionReason && (
                        <div>
                          <p className="mb-2 text-xs font-medium text-gray-500">
                            {selectedApplication.status === 'ACCEPTED' ? '승인 사유' : '거절 사유'}
                          </p>
                          <div className={`rounded-lg border p-4 ${
                            selectedApplication.status === 'ACCEPTED'
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}>
                            <p className={`whitespace-pre-wrap text-sm ${
                              selectedApplication.status === 'ACCEPTED' ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {selectedApplication.decisionReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 모달 푸터 */}
                <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-6 py-4">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    닫기
                  </button>
                  <Link
                    href={`/recruit/${selectedApplication.recruit.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    공고 보기
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 작성한 글 탭 */}
          {activeTab === '작성글' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">작성한 글 ({counts.posts})</h2>
              </div>

              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성한 글이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={getPostDetailLink(post)}
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

                  {/* 페이지네이션 */}
                  <div className="border-t border-gray-100 px-6 py-4">
                    <Pagination
                      currentPage={postPage}
                      totalPages={postTotalPages}
                      onPageChange={setPostPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 작성한 댓글 탭 */}
          {activeTab === '댓글' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">작성한 댓글 ({counts.comments})</h2>
              </div>

              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageCircle className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">작성한 댓글이 없습니다.</p>
                </div>
              ) : (
                <>
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

                  {/* 페이지네이션 */}
                  <div className="border-t border-gray-100 px-6 py-4">
                    <Pagination
                      currentPage={commentPage}
                      totalPages={commentTotalPages}
                      onPageChange={setCommentPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 즐겨찾기 탭 */}
          {activeTab === '즐겨찾기' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  즐겨찾기한 글 ({counts.bookmarks})
                </h2>
              </div>

              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Bookmark className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">즐겨찾기한 글이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {bookmarks.map((post) => (
                      <Link
                        key={post.id}
                        href={getPostDetailLink(post)}
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

                  {/* 페이지네이션 */}
                  <div className="border-t border-gray-100 px-6 py-4">
                    <Pagination
                      currentPage={bookmarkPage}
                      totalPages={bookmarkTotalPages}
                      onPageChange={setBookmarkPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 칭호 탭 */}
          {activeTab === '칭호' && (() => {
            const CATEGORY_FILTERS = [
              { key: '전체', label: '전체' },
              { key: '보유', label: '보유' },
              { key: '미획득', label: '미획득' },
              { key: 'COMMIT', label: '커밋' },
              { key: 'STREAK', label: '연속' },
              { key: 'CHALLENGE', label: '챌린지' },
              { key: 'COMMUNITY', label: '커뮤니티' },
              { key: 'COLLABORATION', label: '협업' },
            ];

            const filteredTitles = allTitles.filter((title) => {
              if (titleFilter === '보유') return myTitles.some((mt) => mt.titleId === title.id);
              if (titleFilter === '미획득') return !myTitles.some((mt) => mt.titleId === title.id);
              if (titleFilter !== '전체') return title.category === titleFilter;
              return true;
            });

            const ownedCount = myTitles.length;
            const totalCount = allTitles.length;

            return (
              <div className="space-y-4">
                {/* 보유 현황 요약 */}
                {totalCount > 0 && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-gray-900">{ownedCount}</span>
                      <span className="text-gray-400"> / {totalCount}</span>
                      <span className="ml-1 text-gray-500">칭호 보유 중</span>
                    </p>
                    <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${totalCount > 0 ? (ownedCount / totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 필터 바 */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setTitleFilter(f.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        titleFilter === f.key
                          ? 'bg-orange-400 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* 빈 상태 */}
                {allTitles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
                    <Trophy className="mb-3 h-12 w-12 text-gray-200" />
                    <p className="text-sm text-gray-500">칭호 목록을 불러오지 못했습니다.</p>
                  </div>
                ) : filteredTitles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
                    <Trophy className="mb-3 h-12 w-12 text-gray-200" />
                    <p className="text-sm text-gray-500">해당하는 칭호가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTitles.map((title) => {
                      const userTitle = myTitles.find((mt) => mt.titleId === title.id);
                      const isOwned = !!userTitle;
                      const isDisplayTitle = userTitle?.isDisplay ?? false;
                      const imgSrc = getTitleImage(title.code, title.iconUrl);
                      const categoryEmoji = TITLE_CATEGORY_EMOJI[title.category] ?? '🏅';
                      const rarityLabel = RARITY_LABELS[title.rarity] ?? title.rarity;
                      const rarityColor = RARITY_COLORS[title.rarity] ?? 'bg-gray-100 text-gray-600';

                      return (
                        <div
                          key={title.id}
                          className={`flex flex-col rounded-xl border bg-white p-4 transition-all ${
                            isDisplayTitle
                              ? 'border-orange-200 shadow-[0_0_0_2px_rgba(251,146,60,0.2)]'
                              : isOwned
                              ? 'border-gray-200 shadow-sm'
                              : 'border-gray-100 bg-gray-50/50 grayscale'
                          }`}
                        >
                          {/* 이미지 영역 (80×80, 중앙 정렬) */}
                          <div className="relative mx-auto mb-3 h-20 w-20">
                            {/* 원형 클립 컨테이너: overflow-hidden으로 이미지 배경을 원형에 맞게 클리핑 */}
                            <div className={`absolute inset-0 overflow-hidden rounded-full ${
                              isOwned ? 'bg-orange-50' : 'bg-gray-100'
                            }`}>
                              {imgSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imgSrc}
                                  alt={`${title.name} 칭호`}
                                  className={`h-full w-full object-contain transition-all ${
                                    isOwned ? '' : 'opacity-30'
                                  }`}
                                />
                              ) : (
                                <span className={`flex h-full w-full items-center justify-center text-3xl leading-none ${
                                  isOwned ? '' : 'opacity-30'
                                }`}>
                                  {categoryEmoji}
                                </span>
                              )}

                              {/* 미획득: 잠금 오버레이 */}
                              {!isOwned && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* 대표 칭호: 왕관 뱃지 (overflow-hidden 밖에 위치해 잘리지 않음) */}
                            {isDisplayTitle && (
                              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 shadow-sm">
                                <span className="text-[10px] leading-none">★</span>
                              </div>
                            )}
                          </div>

                          {/* 칭호명 + 뱃지 */}
                          <div className="mb-1 flex flex-wrap items-center justify-center gap-1.5">
                            <p className={`text-center text-sm font-semibold ${
                              isOwned ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {title.name}
                            </p>
                          </div>

                          {/* 등급 + 상태 뱃지 */}
                          <div className="mb-2 flex items-center justify-center gap-1.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rarityColor}`}>
                              {rarityLabel}
                            </span>
                            {isDisplayTitle && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                                대표 칭호
                              </span>
                            )}
                            {isOwned && !isDisplayTitle && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                보유
                              </span>
                            )}
                            {!isOwned && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                                미획득
                              </span>
                            )}
                          </div>

                          {/* 설명 */}
                          <p className={`mb-2 text-center text-[11px] leading-relaxed ${
                            isOwned ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {title.description}
                          </p>

                          {/* 달성 조건 */}
                          {title.conditions.length > 0 && (
                            <div className="mb-3 space-y-0.5 rounded-lg bg-gray-50 px-3 py-2">
                              {title.conditions.map((cond, i) => (
                                <p key={i} className="text-center text-[11px] text-gray-400">
                                  {cond.description ?? `${cond.conditionType} ≥ ${cond.thresholdValue}`}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* 대표 설정 버튼 — 실제 보유 중(userTitle 정의됨)이고 대표가 아닌 경우만
                              userTitle을 직접 guard로 사용해 TypeScript 타입 내로우잉 보장 */}
                          {userTitle != null && !isDisplayTitle && (
                            <button
                              type="button"
                              onClick={() => handleSetDisplayTitle(userTitle.userTitleId)}
                              disabled={displayTitleLoading}
                              className="mt-auto w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                            >
                              대표로 설정
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
