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
          <div className="mb-6 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 활동 탭 */}
          {activeTab === '활동' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Github className="h-4 w-4" />
                  최근 GitHub 활동
                </h2>
              </div>

              {githubActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Github className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-gray-500">GitHub 활동이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {githubActivities.map((activity) => (
                    <a
                      key={activity.id}
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80"
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                          activity.type === 'pr'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {activity.type === 'pr' ? (
                          <GitPullRequest className="h-4 w-4" />
                        ) : (
                          <GitCommit className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                          <GitBranch className="h-3 w-3" />
                          {activity.repoName}
                        </div>
                        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {activity.title}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDate(activity.date)}
                        </span>
                      </div>

                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
                    </a>
                  ))}
                </div>
              )}
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
