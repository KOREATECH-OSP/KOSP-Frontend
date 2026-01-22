'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { deleteAdminArticle } from '@/lib/api/admin';
import { clientApiClient } from '@/lib/api/client';
import { getComments } from '@/lib/api/comment';
import { toast } from '@/lib/toast';
import type { CommentResponse } from '@/lib/api/types';

interface ArticleDetail {
  id: number;
  title: string;
  content: string;
  boardId: number;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt?: string;
  author: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

const BOARDS = [
  { id: 1, name: '자유게시판' },
  { id: 2, name: '질문게시판' },
  { id: 3, name: '정보게시판' },
] as const;

function getBoardName(boardId: number): string {
  return BOARDS.find((b) => b.id === boardId)?.name || '알 수 없음';
}

function getBoardBadgeColor(boardId: number): string {
  switch (boardId) {
    case 1:
      return 'bg-blue-100 text-blue-700';
    case 2:
      return 'bg-green-100 text-green-700';
    case 3:
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const [articleData, commentsData] = await Promise.all([
        clientApiClient<ArticleDetail>(`/v1/community/articles/${id}`, {
          accessToken: session.accessToken,
          cache: 'no-store',
        }),
        getComments(Number(id), session.accessToken),
      ]);
      setArticle(articleData);
      setComments(commentsData.comments || []);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      toast.error('게시글을 불러오는데 실패했습니다.');
      router.push('/admin/contents/articles');
    } finally {
      setLoading(false);
    }
  }, [id, session?.accessToken, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchArticle();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchArticle, router]);

  // XSS 방어를 위한 HTML sanitization (DOMPurify 사용)
  const sanitizedContent = useMemo(() => {
    if (!article?.content) return '';
    return DOMPurify.sanitize(article.content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
    });
  }, [article?.content]);

  const handleDeleteArticle = async () => {
    if (!article || !session?.accessToken) return;

    try {
      setDeleting(true);
      await deleteAdminArticle(article.id, { accessToken: session.accessToken });
      toast.success('게시글이 삭제되었습니다.');
      router.push('/admin/contents/articles');
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.error('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !session?.accessToken) return;

    try {
      setDeleting(true);
      await clientApiClient(
        `/v1/admin/comments/${selectedComment.id}`,
        {
          method: 'DELETE',
          accessToken: session.accessToken,
        }
      );
      toast.success('댓글이 삭제되었습니다.');
      setComments((prev) => prev.filter((c) => c.id !== selectedComment.id));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('댓글 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteCommentModal(false);
      setSelectedComment(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
              <button
                onClick={() => router.push('/admin/contents/articles')}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 상단 네비게이션 */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/contents/articles')}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>목록으로</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>

        {/* 게시글 카드 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getBoardBadgeColor(article.boardId)}`}>
                {getBoardName(article.boardId)}
              </span>
              <h1 className="text-xl font-bold text-gray-900">{article.title}</h1>
            </div>

            {/* 메타 정보 */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{article.author.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>조회 {article.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>좋아요 {article.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>댓글 {comments.length}</span>
              </div>
            </div>

            {/* 태그 */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 본문 - DOMPurify로 sanitize된 안전한 HTML */}
          <div className="px-6 py-6">
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">
              댓글 <span className="text-gray-500">({comments.length})</span>
            </h2>
          </div>

          {comments.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              댓글이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <li key={comment.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {comment.author.profileImage ? (
                        <Image
                          src={comment.author.profileImage}
                          alt={comment.author.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                          {comment.author.name[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Heart className="h-3.5 w-3.5" />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedComment(comment);
                        setShowDeleteCommentModal(true);
                      }}
                      className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 게시글 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">게시글 삭제</h2>
              <p className="mt-1 text-sm text-gray-500">{article.title}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600">
                이 게시글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteArticle}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 확인 모달 */}
      {showDeleteCommentModal && selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">댓글 삭제</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600">
                이 댓글을 정말 삭제하시겠습니까?
              </p>
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-700">{selectedComment.content}</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setSelectedComment(null);
                }}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteComment}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
