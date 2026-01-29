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
  User
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8">
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        articleId={article.id}
        accessToken={accessToken}
      />

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Box 1: Author Info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col items-center text-center">
                <Link href={`/user/${article.author.id}`} className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border border-gray-100 bg-gray-50 transition-transform hover:scale-105">
                  {article.author.profileImage ? (
                    <img
                      src={article.author.profileImage}
                      alt={article.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                </Link>
                <Link href={`/user/${article.author.id}`} className="mb-1 block text-lg font-bold text-gray-900 hover:underline">
                  {article.author.name}
                </Link>
              </div>
            </div>

            {/* Box 2: Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleLike}
                  disabled={isPending}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-95 ${liked
                    ? 'border-pink-200 bg-pink-50 text-pink-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  <span>좋아요 {likeCount > 0 && likeCount}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={isPending}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-95 ${bookmarked
                    ? 'border-yellow-200 bg-yellow-50 text-amber-500'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  <span>저장</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
                >
                  <Link2 className="h-4 w-4" />
                  <span>공유</span>
                </button>
              </div>

              {/* Management Actions */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex justify-center gap-2">
                  {isMine ? (
                    <>
                      <Link
                        href={`/community/write?id=${article.id}`}
                        className="flex h-9 items-center justify-center rounded-lg px-3 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      >
                        수정
                      </Link>
                      <button
                        onClick={handleDeleteArticle}
                        className="flex h-9 items-center justify-center rounded-lg px-3 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      신고하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0">
          {/* Article Card */}
          <article className="rounded-2xl border border-gray-200 bg-white mb-8 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-8 sm:px-10">
              {article.tags && article.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-white border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl mb-4">
                {article.title}
              </h1>

              {/* Mobile Author Info */}
              <div className="mb-4 flex items-center gap-2 lg:hidden">
                <Link href={`/user/${article.author.id}`} className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-100">
                  {article.author.profileImage ? (
                    <img
                      src={article.author.profileImage}
                      alt={article.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </Link>
                <Link href={`/user/${article.author.id}`} className="text-sm font-bold text-gray-900 hover:underline">
                  {article.author.name}
                </Link>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" title="조회수">
                    <Eye className="h-4 w-4" />
                    {article.views}
                  </span>
                  <span className="flex items-center gap-1.5" title="댓글">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    {comments.length}
                  </span>
                </div>
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>

            {/* Mobile Action Bar Removed */}

            {/* Body */}
            <div className="px-6 py-10 sm:px-10">
              <div
                className="prose prose-gray max-w-none prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:underline prose-img:rounded-xl [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-gray-200 [&_table]:rounded-lg [&_table]:overflow-hidden [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-900 [&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-700 [&_tr:hover]:bg-gray-50/50"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>

            {/* Mobile: Management Actions */}
            {(isMine || !isMine) && (
              <div className="lg:hidden border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
                {isMine ? (
                  <div className="flex items-center gap-3">
                    <Link href={`/community/write?id=${article.id}`} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                      <Pencil className="h-3.5 w-3.5" /> 수정
                    </Link>
                    <button onClick={handleDeleteArticle} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                      <Trash2 className="h-3.5 w-3.5" /> 삭제
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> 신고
                  </button>
                )}
              </div>
            )}
          </article>

          {/* Comments Section */}
          <section id="comments-section" className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              댓글
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{comments.length}</span>
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-10">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={accessToken ? "이 글에 대한 생각을 남겨주세요." : "로그인 후 댓글을 남길 수 있습니다."}
                  rows={3}
                  disabled={!accessToken}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-black disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '등록'}
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-8">
              {comments.map((comment) => (
                <div key={comment.id} className="group flex gap-4 sm:gap-6">
                  <Link href={`/user/${comment.author.id}`} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100 text-gray-400">
                    {comment.author.profileImage ? (
                      <img
                        src={comment.author.profileImage}
                        alt={comment.author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link href={`/user/${comment.author.id}`} className="font-bold text-gray-900 text-sm hover:underline">
                          {comment.author.name}
                        </Link>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          disabled={isPending}
                          className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-gray-50 ${comment.isLiked ? 'text-rose-500' : 'text-gray-400'
                            }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                        {comment.isMine && (
                          <button
                            onClick={() => handleCommentDelete(comment.id)}
                            className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <div className="flex justify-center mb-2">
                    <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </div>
                  <p>아직 댓글이 없습니다.</p>
                  <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div >
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 safe-area-bottom lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${liked ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'}`}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${bookmarked ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
            >
              <Bookmark className={`h-6 w-6 ${bookmarked ? 'fill-current' : ''}`} />
              <span>저장</span>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                const commentsSection = document.getElementById('comments-section');
                commentsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-gray-600 hover:text-gray-900"
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                {comments.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {comments.length}
                  </span>
                )}
              </div>
              <span>댓글</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-gray-600 hover:text-gray-900"
            >
              <Link2 className="h-6 w-6" />
              <span>공유</span>
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}
