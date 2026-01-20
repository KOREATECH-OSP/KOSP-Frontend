'use client';

import { useState, useTransition, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DOMPurify from 'isomorphic-dompurify';
import {
  ArrowLeft,
  Heart,
  Eye,
  Link2,
  Star,
  Loader2,
  Trash2,
  AlertTriangle,
  Pencil,
  MoreVertical
} from 'lucide-react';
import type { ArticleResponse, CommentResponse } from '@/lib/api/types';
import ReportModal from '@/common/components/ReportModal';
import { deleteArticle, toggleArticleLike, toggleArticleBookmark } from '@/lib/api/article';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';
import { signOutOnce } from '@/lib/auth/signout';

function decodeHtmlEntities(value: string): string {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.textContent = value;
  const decoded = textarea.textContent || value;
  return decoded;
}

function normalizeHtmlContent(value: string): string {
  let normalized = value ?? '';
  for (let i = 0; i < 2; i += 1) {
    const looksEscaped =
      !normalized.includes('<') && /&(?:lt|gt|amp|quot|#\d+);/i.test(normalized);
    if (!looksEscaped) break;
    const decoded = decodeHtmlEntities(normalized);
    if (decoded === normalized) break;
    normalized = decoded;
  }
  return normalized;
}

interface ArticleDetailClientProps {
  article: ArticleResponse;
  initialComments: CommentResponse[];
  currentUserId: number | null;
}

export default function ArticleDetailClient({
  article,
  initialComments,
  currentUserId,
}: ArticleDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  
  const accessToken = session?.accessToken;

  const [liked, setLiked] = useState(article.isLiked);
  const [likeCount, setLikeCount] = useState(article.likes);
  const [bookmarked, setBookmarked] = useState(article.isBookmarked);
  const [comments, setComments] = useState<CommentResponse[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMine = currentUserId === article.author.id;

  const handleUnauthorized = () => {
    signOutOnce({
      callbackUrl: '/login',
      toastMessage: '로그인이 만료되었습니다. 다시 로그인해주세요.',
    });
  };

  // XSS 방어를 위한 HTML sanitization
  const sanitizedContent = useMemo(() => {
    const normalizedContent = normalizeHtmlContent(article.content);
    return DOMPurify.sanitize(normalizedContent, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div', 'hr'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }, [article.content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleLike = async () => {
    if (!accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    try {
      const response = await toggleArticleLike(article.id, { accessToken });
      setLiked(response.isLiked);
      setLikeCount((prev) => (response.isLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handleBookmark = async () => {
    if (!accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    try {
      const response = await toggleArticleBookmark(article.id, { accessToken });
      setBookmarked(response.isBookmarked);
    } catch (error) {
      console.error('북마크 실패:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    if (!accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const postRes = await fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });
      if (postRes.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!postRes.ok) throw new Error('댓글 작성에 실패했습니다.');
      setNewComment('');
      router.refresh();
      const res = await fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      setComments(data.comments);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      const message = error instanceof Error ? error.message : '댓글 작성에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    if (!accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }

    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
          if (!res.ok) throw new Error('댓글 삭제에 실패했습니다.');
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        })
        .catch((error) => {
          console.error('댓글 삭제 실패:', error);
          const message = error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.';
          toast.error(message);
        });
    });
  };

  const handleCommentLike = (commentId: number) => {
    if (!accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles/${article.id}/comments/${commentId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      })
        .then((res) => {
          if (res.status === 401) {
            handleUnauthorized();
            return null;
          }
          return res.json();
        })
        .then((response: { isLiked: boolean } | null) => {
          if (!response) return;
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

  const handleDeleteArticle = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    if (!accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    try {
      await deleteArticle(article.id, { accessToken });
      toast.success('게시글이 삭제되었습니다.');
      router.push('/community');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      const message = error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('링크가 복사되었습니다.');
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
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        articleId={article.id}
        accessToken={accessToken}
      />

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
          <div className="flex justify-between items-start">
            <div className="flex-1">
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
            </div>
            
            <div ref={menuRef} className="relative ml-2">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 z-10 w-32 origin-top-right rounded-lg bg-white py-1 shadow-lg focus:outline-none">
                  {isMine ? (
                    <>
                      <Link
                        href={`/community/write?id=${article.id}`}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </Link>
                      <button
                        onClick={handleDeleteArticle}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsReportModalOpen(true);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      신고
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${article.author.id}`}
                className="font-medium text-gray-900 hover:underline"
              >
                {article.author.name}
              </Link>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" strokeWidth={1.5} />
                {article.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" strokeWidth={1.5} />
                {likeCount}
              </span>
            </div>
          </div>
        </div>

        {/* 본문 - sanitizedContent는 DOMPurify로 XSS 방어 처리됨 */}
        <div className="px-5 py-8 sm:px-6">
          <div
            className="prose prose-gray max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-headings:text-gray-900"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                liked
                  ? 'text-rose-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} strokeWidth={1.5} />
              {likeCount}
            </button>
            <button
              onClick={handleBookmark}
              disabled={isPending}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                bookmarked
                  ? 'text-amber-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} strokeWidth={1.5} />
            </button>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            <Link2 className="h-4 w-4" strokeWidth={1.5} />
            공유
          </button>
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-6">
        {/* 댓글 헤더 */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-900">
            댓글 {comments.length}개
          </h2>
        </div>

        {/* 댓글 입력 */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              등록
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="group">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/user/${comment.author.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {comment.author.name}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      disabled={isPending}
                      className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors disabled:opacity-50 ${
                        comment.isLiked
                          ? 'text-rose-500 opacity-100'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`}
                        strokeWidth={1.5}
                      />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    {comment.isMine && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        disabled={isPending}
                        className="rounded p-0.5 text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
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
