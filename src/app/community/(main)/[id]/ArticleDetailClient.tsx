'use client';

import { useState, useTransition, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import DOMPurify from 'isomorphic-dompurify';
import {
  Heart,
  Eye,
  Link2,
  Bookmark,
  Loader2,
  Trash2,
  AlertTriangle,
  Pencil,
  User,
  MoreHorizontal,
  MessageCircle
} from 'lucide-react';
import type { ArticleResponse, CommentResponse } from '@/lib/api/types';
import ReportModal from '@/common/components/ReportModal';
import { deleteArticle, toggleArticleLike, toggleArticleBookmark } from '@/lib/api/article';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';
import { signOutOnce } from '@/lib/auth/signout';
import { ensureEncodedUrl } from '@/lib/utils';

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    if (showMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, showMobileMenu]);

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

  // Note: sanitizedContent is sanitized with DOMPurify above (line 85-97)
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        articleId={article.id}
        accessToken={accessToken}
      />

      {/* Article */}
      <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        {/* Header */}
        <header className="pb-6 border-b border-gray-100">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900 mb-5">
            {article.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/user/${article.author.id}`} className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50 transition-transform hover:scale-105">
                {article.author.profileImage ? (
                  <img
                    src={ensureEncodedUrl(article.author.profileImage)}
                    alt={article.author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </Link>
              <div className="flex flex-col">
                <Link href={`/user/${article.author.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                  {article.author.name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(article.createdAt)}</span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {article.views}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop: More Menu */}
            <div className="hidden sm:block relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10">
                  {isMine ? (
                    <>
                      <Link
                        href={`/community/write?id=${article.id}`}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4" />
                        수정하기
                      </Link>
                      <button
                        onClick={handleDeleteArticle}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제하기
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsReportModalOpen(true);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      신고하기
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: More Menu */}
            <div className="sm:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10">
                  {isMine ? (
                    <>
                      <Link
                        href={`/community/write?id=${article.id}`}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4" />
                        수정하기
                      </Link>
                      <button
                        onClick={handleDeleteArticle}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제하기
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsReportModalOpen(true);
                        setShowMobileMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      신고하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="py-8">
          <div
            className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:underline prose-img:rounded-xl prose-p:text-gray-700 prose-p:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-gray-200 [&_table]:rounded-lg [&_table]:overflow-hidden [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-900 [&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-700 [&_tr:hover]:bg-gray-50/50"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* Desktop Action Bar */}
        <div className="hidden lg:flex items-center justify-between py-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${liked
                ? 'bg-pink-50 text-pink-600 border border-pink-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleBookmark}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${bookmarked
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
              <span>저장</span>
            </button>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            <Link2 className="h-4 w-4" />
            <span>공유</span>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section id="comments-section" className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          댓글
          <span className="text-sm font-medium text-gray-500">{comments.length}</span>
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:border-gray-300 focus-within:bg-white transition-all">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={accessToken ? "댓글을 작성해주세요..." : "로그인 후 댓글을 남길 수 있습니다."}
              rows={3}
              disabled={!accessToken}
              className="w-full resize-none border-none bg-transparent px-4 pt-4 pb-2 text-sm placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
            />
            <div className="flex justify-end px-3 pb-3">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '등록'}
              </button>
            </div>
          </div>
        </form>

        {/* Comment List */}
        <div className="space-y-1">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`group py-5 ${index !== comments.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex gap-3">
                <Link href={`/user/${comment.author.id}`} className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                  {comment.author.profileImage ? (
                    <img
                      src={ensureEncodedUrl(comment.author.profileImage)}
                      alt={comment.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/user/${comment.author.id}`} className="font-semibold text-sm text-gray-900 hover:underline">
                      {comment.author.name}
                    </Link>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      disabled={isPending}
                      className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    {comment.isMine && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="py-16 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">아직 댓글이 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">첫 번째 댓글을 남겨보세요!</p>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-2.5 safe-area-bottom lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${liked ? 'text-pink-600' : 'text-gray-500'}`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{likeCount}</span>
          </button>
          <button
            onClick={() => {
              const commentsSection = document.getElementById('comments-section');
              commentsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-500"
          >
            <div className="relative">
              <MessageCircle className="h-5 w-5" />
              {comments.length > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-pink-500 px-0.5 text-[9px] font-bold text-white">
                  {comments.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">댓글</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${bookmarked ? 'text-amber-500' : 'text-gray-500'}`}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">저장</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-500"
          >
            <Link2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">공유</span>
          </button>
        </div>
      </div>
    </div>
  );
}
