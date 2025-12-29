'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, Share2 } from 'lucide-react';

interface Comment {
  id: number;
  authorId: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

export default function PostDetailPage() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(23);
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
    authorId: 'user123',
    author: '해커톤매니저',
    views: 342,
    createdAt: '2024.11.28',
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      authorId: 'user456',
      author: '프론트엔드개발자',
      content: '관심있습니다! React 3년차 경험 있습니다.',
      createdAt: '2024.11.28',
      likes: 5,
    },
    {
      id: 2,
      authorId: 'user789',
      author: 'UI디자이너',
      content: 'Figma로 작업 가능합니다. 참여하고 싶어요!',
      createdAt: '2024.11.28',
      likes: 3,
    },
    {
      id: 3,
      authorId: 'user101',
      author: '백엔드개발자',
      content: 'Node.js와 Python 둘 다 가능합니다. 연락 주세요~',
      createdAt: '2024.11.28',
      likes: 4,
    },
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: comments.length + 1,
      authorId: 'currentUser',
      author: '나',
      content: newComment,
      createdAt: '2024.11.28',
      likes: 0,
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다.');
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Link>

      {/* 게시글 카드 */}
      <article className="rounded-2xl border border-gray-200/70 bg-white">
        {/* 헤더 */}
        <div className="px-5 py-5 sm:px-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {post.category}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{post.title}</h1>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${post.authorId}`}
                className="font-medium text-gray-900 hover:underline"
              >
                {post.author}
              </Link>
              <span className="text-gray-300">|</span>
              <span>{post.createdAt}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {likeCount}
              </span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="mx-5 border-t border-gray-100 sm:mx-6" />

        {/* 본문 */}
        <div className="px-5 py-6 sm:px-6">
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
            {post.content}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
              liked
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            추천 {likeCount}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            <Share2 className="h-4 w-4" />
            공유
          </button>
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-4 rounded-2xl border border-gray-200/70 bg-white">
        {/* 댓글 헤더 */}
        <div className="px-5 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <MessageSquare className="h-5 w-5" />
            댓글 {comments.length}
          </h2>
        </div>

        {/* 댓글 입력 */}
        <form onSubmit={handleCommentSubmit} className="border-t border-gray-100 px-5 py-4 sm:px-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-300 focus:outline-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
            >
              등록
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <div className="border-t border-gray-100">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={`px-5 py-4 sm:px-6 ${
                  index !== comments.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/user/${comment.authorId}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {comment.author}
                    </Link>
                    <span className="text-gray-400">{comment.createdAt}</span>
                  </div>
                  <button
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
                      comment.likes > 0
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
