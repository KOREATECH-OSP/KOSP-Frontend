'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  X,
} from 'lucide-react';
import TabNavigation, { Tab } from '@/common/components/TabNavigation';

interface UserProfile {
  name: string;
  profileImage?: string;
  githubUrl: string;
  bio: string;
}

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

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('활동');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '김개발',
    githubUrl: 'https://github.com/kimdev',
    bio: '풀스택 개발자입니다. React와 Node.js를 주로 사용합니다.',
  });

  const [editForm, setEditForm] = useState<UserProfile>(profile);

  // Mock 데이터
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

  const tabs: Tab[] = [
    { id: '활동', label: '활동' },
    { id: '작성글', label: '작성한 글' },
    { id: '댓글', label: '작성한 댓글' },
    { id: '즐겨찾기', label: '즐겨찾기' },
  ];

  const handleEditSubmit = () => {
    setProfile(editForm);
    setIsEditModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              )}
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {profile.name}
                </h1>
                <button
                  onClick={() => {
                    setEditForm(profile);
                    setIsEditModalOpen(true);
                  }}
                  className="self-start sm:self-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>정보 수정</span>
                </button>
              </div>

              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm sm:text-base">{profile.githubUrl}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-sm sm:text-base text-gray-600">{profile.bio}</p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 활동 탭 */}
        {activeTab === '활동' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">최근 GitHub 활동</h2>
              <div className="space-y-4">
                {githubActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      {/* 아이콘 */}
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'pr' ? (
                          <GitPullRequest className="w-5 h-5 text-green-600" />
                        ) : (
                          <GitCommit className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <GitBranch className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {activity.repoName}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{activity.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.date)}
                          </span>
                          <a
                            href={activity.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            자세히 보기
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 작성한 글 탭 */}
        {activeTab === '작성글' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                작성한 글 ({myPosts.length})
              </h2>
              <div className="space-y-3">
                {myPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/recruit/${post.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>조회 {post.views}</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </Link>
                ))}

                {myPosts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    작성한 글이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 작성한 댓글 탭 */}
        {activeTab === '댓글' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                작성한 댓글 ({myComments.length})
              </h2>
              <div className="space-y-3">
                {myComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <Link
                      href={`/recruit/${comment.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 mb-2 block"
                    >
                      {comment.postTitle}
                    </Link>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                ))}

                {myComments.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    작성한 댓글이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 즐겨찾기 탭 */}
        {activeTab === '즐겨찾기' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                즐겨찾기한 글 ({bookmarkedPosts.length})
              </h2>
              <div className="space-y-3">
                {bookmarkedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/recruit/${post.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="flex-1 font-semibold text-gray-900 hover:text-blue-600">
                        {post.title}
                      </h3>
                      <Bookmark className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>조회 {post.views}</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </Link>
                ))}

                {bookmarkedPosts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    즐겨찾기한 글이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 프로필 수정 모달 */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">프로필 수정</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* GitHub URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub 주소
                    </label>
                    <input
                      type="url"
                      value={editForm.githubUrl}
                      onChange={(e) =>
                        setEditForm({ ...editForm, githubUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  {/* 자기소개 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="간단한 자기소개를 입력해주세요"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}