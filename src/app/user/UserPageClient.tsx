'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Eye,
  FileText,
  ChevronRight, Trophy,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  getUserPosts,
  getUserComments,
  getUserBookmarks,
  getUserGithubAnalysis,
  getUserProfile,
} from '@/lib/api/user';
import type {
  ArticleResponse,
  CommentResponse,
  GithubAnalysisResponse,
  UserProfileResponse,
} from '@/lib/api/types';

interface UserPageClientProps {
  session: Session | null;
}

type TabType = '활동' | '작성글' | '댓글' | '즐겨찾기';

export default function UserPageClient({ session }: UserPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('활동');
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [posts, setPosts] = useState<ArticleResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [bookmarks, setBookmarks] = useState<ArticleResponse[]>([]);
  const [githubAnalysis, setGithubAnalysis] = useState<GithubAnalysisResponse | null>(null);
  
  const [counts, setCounts] = useState({ posts: 0, comments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const profileData = await getUserProfile(userId);
        setProfile(profileData);

        const [postsRes, commentsRes] = await Promise.all([
          getUserPosts(userId),
          getUserComments(userId),
        ]);
        setCounts({
          posts: postsRes.pagination.totalItems,
          comments: commentsRes.meta.totalItems,
        });

        if (profileData.githubUrl) {
           const urlParts = profileData.githubUrl.split('/');
           const username = urlParts[urlParts.length - 1];
           
           if (username) {
             const analysisRes = await getUserGithubAnalysis(username).catch(() => null);
             setGithubAnalysis(analysisRes);
           }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchTabData = async () => {
      try {
        if (activeTab === '활동') {
          if (profile?.githubUrl) {
            const urlParts = profile.githubUrl.split('/');
            const username = urlParts[urlParts.length - 1];
            if (username) {
              const analysisRes = await getUserGithubAnalysis(username).catch(() => null);
              setGithubAnalysis(analysisRes);
            }
          }
        } else if (activeTab === '작성글') {
          const res = await getUserPosts(userId);
          setPosts(res.posts);
          setCounts(prev => ({ ...prev, posts: res.pagination.totalItems }));
        } else if (activeTab === '댓글') {
          const res = await getUserComments(userId);
          setComments(res.comments);
          setCounts(prev => ({ ...prev, comments: res.meta.totalItems }));
        } else if (activeTab === '즐겨찾기') {
          const res = await getUserBookmarks(userId);
          setBookmarks(res.posts);
        }
      } catch (error) {
        console.error('Failed to fetch tab data:', error);
      }
    };

    fetchTabData();
  }, [activeTab, userId, profile?.githubUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRankInfo = (tier: number = 0) => {
    if (tier >= 5) return { 
      grade: 'S', 
      color: 'from-amber-400 to-yellow-500', 
      label: 'Legendary',
      stars: 5
    };
    if (tier === 4) return { 
      grade: 'A', 
      color: 'from-purple-500 to-purple-600', 
      label: 'Expert',
      stars: 4
    };
    if (tier === 3) return { 
      grade: 'B', 
      color: 'from-blue-500 to-blue-600', 
      label: 'Advanced',
      stars: 3
    };
    if (tier === 2) return { 
      grade: 'C', 
      color: 'from-emerald-500 to-emerald-600', 
      label: 'Intermediate',
      stars: 2
    };
    return { 
      grade: 'D', 
      color: 'from-gray-400 to-gray-500', 
      label: 'Beginner',
      stars: 1
    };
  };

  const rankInfo = getRankInfo(githubAnalysis?.tier);

  if (!session || !userId) {
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

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: '활동', label: '활동' },
    { key: '작성글', label: '작성한 글' },
    { key: '댓글', label: '작성한 댓글' },
    { key: '즐겨찾기', label: '즐겨찾기' },
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
                <Link
                  href="/user/edit"
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </div>

              <h1 className="mb-1 text-xl font-bold text-gray-900">
                {profile?.name}
              </h1>

              <p className="mb-2 text-sm text-gray-500">{session.user?.email}</p>

              <p className="break-all text-xs text-gray-400">
                ID: {userId}
              </p>
              
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
                    <FileText className="h-4 w-4" />
                    작성한 글
                  </span>
                  <span className="font-medium text-gray-900">
                    {counts.posts}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    작성한 댓글
                  </span>
                  <span className="font-medium text-gray-900">
                    {counts.comments}
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
              {/* GitHub Analysis */}
              {githubAnalysis ? (
                  <>
                  {/* Contribution Rank (using rankInfo) */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100">
                    <div className="border-b border-gray-200/50 bg-white/60 px-6 py-4 backdrop-blur-sm">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Contribution Rank
                        </h2>
                    </div>
                    <div className="p-4 sm:p-6 flex items-center justify-center flex-col">
                        <div className={`text-4xl font-black mb-2 bg-gradient-to-r ${rankInfo.color} bg-clip-text text-transparent`}>
                            {rankInfo.grade}
                        </div>
                        <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < rankInfo.stars ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">{rankInfo.label}</span>
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
                        <div className="text-2xl font-bold text-white sm:text-3xl">{githubAnalysis.stats.totalCommits}</div>
                        <div className="text-[10px] text-gray-400 sm:text-xs">Total Commits</div>
                      </div>
                      <div className="text-center">
                        <GitPullRequest className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                        <div className="text-2xl font-bold text-white sm:text-3xl">{githubAnalysis.stats.totalPrs}</div>
                        <div className="text-[10px] text-gray-400 sm:text-xs">Pull Requests</div>
                      </div>
                      <div className="text-center">
                        <Star className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                        <div className="text-2xl font-bold text-white sm:text-3xl">{githubAnalysis.stats.totalStars}</div>
                        <div className="text-[10px] text-gray-400 sm:text-xs">Stars</div>
                      </div>
                      <div className="text-center">
                        <AlertCircle className="mx-auto mb-1.5 h-5 w-5 text-gray-400 sm:mb-2 sm:h-6 sm:w-6" />
                        <div className="text-2xl font-bold text-white sm:text-3xl">{githubAnalysis.stats.totalIssues}</div>
                        <div className="text-[10px] text-gray-400 sm:text-xs">Issues</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Repository */}
                  {githubAnalysis.analysis.bestRepository && (
                      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 sm:mb-4">
                            <GitBranch className="h-4 w-4" />
                            Best Repository
                        </h2>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="font-semibold text-lg text-blue-600 mb-2">
                                {githubAnalysis.analysis.bestRepository.name}
                            </div>
                            <div className="flex gap-4 text-sm text-gray-500">
                                <span>Commits: {githubAnalysis.analysis.bestRepository.totalCommits}</span>
                                <span>Lines: {githubAnalysis.analysis.bestRepository.totalLines}</span>
                            </div>
                        </div>
                      </div>
                  )}
                  </>
              ) : (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
                    GitHub 계정이 연동되지 않았거나 분석 정보가 없습니다.
                  </div>
              )}
            </div>
          )}

          {/* 작성한 글 탭 */}
          {activeTab === '작성글' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900">
                  작성한 글 ({posts.length})
                </h2>
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
                <h2 className="text-sm font-bold text-gray-900">
                  작성한 댓글 ({comments.length})
                </h2>
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
                  즐겨찾기한 글 ({bookmarks.length})
                </h2>
              </div>

              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Bookmark className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">즐겨찾기한 글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookmarks.map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/${post.id}`}
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
