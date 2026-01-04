'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  MessageSquare,
  Share2,
  Bookmark,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { ArticleResponse, CommentResponse } from '@/lib/api/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ArticleDetailClientProps {
  article: ArticleResponse;
  initialComments: CommentResponse[];
}

export default function ArticleDetailClient({
  article,
  initialComments,
}: ArticleDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [liked, setLiked] = useState(article.isLiked);
  const [likeCount, setLikeCount] = useState(article.likes);
  const [bookmarked, setBookmarked] = useState(article.isBookmarked);
  const [comments, setComments] = useState<CommentResponse[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = () => {
    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((response: { isLiked: boolean }) => {
          setLiked(response.isLiked);
          setLikeCount((prev) => (response.isLiked ? prev + 1 : prev - 1));
        })
        .catch((error) => {
          console.error('좋아요 실패:', error);
        });
    });
  };

  const handleBookmark = () => {
    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((response: { isBookmarked: boolean }) => {
          setBookmarked(response.isBookmarked);
        })
        .catch((error) => {
          console.error('북마크 실패:', error);
        });
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      router.refresh();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then(() => {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        })
        .catch((error) => {
          console.error('댓글 삭제 실패:', error);
          alert('댓글 삭제에 실패했습니다.');
        });
    });
  };

  const handleCommentLike = (commentId: number) => {
    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments/${commentId}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((response: { isLiked: boolean }) => {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    isLiked: response.isLiked,
                    likes: response.isLiked ? c.likes + 1 : c.likes - 1,
                  }
                : c
            )
          );
        })
        .catch((error) => {
          console.error('댓글 좋아요 실패:', error);
        });
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다.');
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
          {article.tags && article.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${article.author.id}`}
                className="font-medium text-gray-900 hover:underline"
              >
                {article.author.name}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views}
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
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              liked
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            추천 {likeCount}
          </button>
          <button
            onClick={handleBookmark}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              bookmarked
                ? 'bg-amber-50 text-amber-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            저장
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
        <form
          onSubmit={handleCommentSubmit}
          className="border-t border-gray-100 px-5 py-4 sm:px-6"
        >
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
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
                      href={`/user/${comment.author.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {comment.author.name}
                    </Link>
                    <span className="text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      disabled={isPending}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-50 ${
                        comment.isLiked
                          ? 'text-blue-600'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                    >
                      <ThumbsUp
                        className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`}
                      />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    {comment.isMine && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        disabled={isPending}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
