'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Bookmark } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(23);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');

  const post = {
    id: 1,
    category: '홍보',
    title: '2024 해커톤 참가자 모집합니다!',
    content: `안녕하세요! 다음 달 개최되는 해커톤에 함께할 팀원을 찾습니다.

🎯 해커톤 정보
- 일시: 2024년 12월 15일 (토) 09:00 - 18:00
- 장소: 코리아텍 산학협력관
- 주제: AI를 활용한 캠퍼스 생활 개선 솔루션

👥 모집 분야
- Frontend Developer (React, Next.js)
- Backend Developer (Node.js, Python)
- UI/UX Designer
- 기획자

✨ 혜택
- 우수팀 상금 500만원
- 창업 지원 프로그램 연계
- 네트워킹 기회

관심 있으신 분들은 댓글이나 DM 주세요!`,
    author: '해커톤매니저',
    views: 342,
    likes: likeCount,
    createdAt: '2024-11-19',
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '프론트엔드개발자',
      content: '관심있습니다! React 3년차 경험 있습니다.',
      createdAt: '3시간 전',
      likes: 5,
    },
    {
      id: 2,
      author: 'UI디자이너',
      content: 'Figma로 작업 가능합니다. 참여하고 싶어요!',
      createdAt: '2시간 전',
      likes: 3,
    },
    {
      id: 3,
      author: '백엔드개발자',
      content: 'Node.js와 Python 둘 다 가능합니다. 연락 주세요~',
      createdAt: '1시간 전',
      likes: 4,
    },
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: comments.length + 1,
      author: '현재사용자',
      content: newComment,
      createdAt: '방금 전',
      likes: 0,
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 게시글 */}
          <article className="rounded-xl border border-gray-200 bg-white">
            {/* 헤더 */}
            <div className="border-b border-gray-100 p-6">
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-gray-900">{post.category}</span>
                <span>·</span>
                <span>{post.createdAt}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
            </div>

            {/* 작성자 정보 */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                  {post.author.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {post.author}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {comments.length}
                </span>
              </div>
            </div>

            {/* 본문 */}
            <div className="p-6">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
                {post.content}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  liked
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${liked ? 'fill-current' : ''}`}
                />
                좋아요 {likeCount}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  bookmarked
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`}
                />
                북마크
              </button>
            </div>
          </article>

          {/* 댓글 섹션 */}
          <section className="mt-6 rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900">
                댓글 {comments.length}
              </h2>
            </div>

            {/* 댓글 작성 */}
            <form onSubmit={handleCommentSubmit} className="border-b border-gray-100 p-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  댓글 작성
                </button>
              </div>
            </form>

            {/* 댓글 목록 */}
            <div className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                        {comment.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-400">
                        {comment.createdAt}
                      </span>
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-gray-700">{comment.content}</p>
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {comment.likes}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 사이드바 */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-4">
            {/* 작성자 정보 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-medium text-white">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author}</p>
                  <p className="text-xs text-gray-400">작성자</p>
                </div>
              </div>
              <button className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                프로필 보기
              </button>
            </div>

            {/* 관련 게시글 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                관련 게시글
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="line-clamp-2 text-gray-600 hover:text-gray-900"
                  >
                    KOSP 2024 Spring 챌린지 참가자 모집
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="line-clamp-2 text-gray-600 hover:text-gray-900"
                  >
                    해커톤 준비 팁 공유합니다
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="line-clamp-2 text-gray-600 hover:text-gray-900"
                  >
                    첫 해커톤 후기 (우수상 수상!)
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
