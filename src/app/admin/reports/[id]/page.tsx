'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  FileText,
  Loader2,
  Ban,
  Trash2,
} from 'lucide-react';
import { getAdminReports, processAdminReport } from '@/lib/api/admin';
import { clientApiClient } from '@/lib/api/client';
import { getComments } from '@/lib/api/comment';
import { toast } from '@/lib/toast';
import type { AdminReportResponse } from '@/types/admin';
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

function getReasonName(reason: string) {
  switch (reason) {
    case 'SPAM':
      return '스팸';
    case 'ABUSE':
      return '욕설/비방';
    case 'INAPPROPRIATE':
      return '부적절한 콘텐츠';
    case 'OTHER':
      return '기타';
    default:
      return reason;
  }
}

function getTargetTypeName(type: string) {
  switch (type) {
    case 'ARTICLE':
      return '게시글';
    case 'USER':
      return '사용자';
    case 'COMMENT':
      return '댓글';
    default:
      return '기타';
  }
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [report, setReport] = useState<AdminReportResponse | null>(null);
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);

      // 신고 목록에서 해당 신고 찾기
      const reportsResponse = await getAdminReports({ accessToken: session.accessToken });
      const foundReport = reportsResponse.reports.find((r) => r.id === Number(id));

      if (!foundReport) {
        toast.error('신고 정보를 찾을 수 없습니다.');
        router.push('/admin/reports/list');
        return;
      }

      setReport(foundReport);

      // 게시글 신고인 경우 게시글 정보도 조회
      if (foundReport.targetType === 'ARTICLE') {
        try {
          const [articleData, commentsData] = await Promise.all([
            clientApiClient<ArticleDetail>(`/v1/community/articles/${foundReport.targetId}`, {
              accessToken: session.accessToken,
              cache: 'no-store',
            }),
            getComments(foundReport.targetId, session.accessToken),
          ]);
          setArticle(articleData);
          setComments(commentsData.comments || []);
        } catch (error) {
          console.error('Failed to fetch article:', error);
          // 게시글이 이미 삭제되었을 수 있음
          setArticle(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('신고 정보를 불러오는데 실패했습니다.');
      router.push('/admin/reports/list');
    } finally {
      setLoading(false);
    }
  }, [id, session?.accessToken, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchData, router]);

  // XSS 방어를 위한 HTML sanitization (DOMPurify 사용 - 기존 게시글 상세 페이지와 동일)
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

  const handleProcess = async (action: 'DELETE_CONTENT' | 'REJECT') => {
    if (!report || !session?.accessToken) return;

    try {
      setProcessing(true);
      await processAdminReport(report.id, action, { accessToken: session.accessToken });
      toast.success(action === 'DELETE_CONTENT' ? '콘텐츠가 삭제되었습니다.' : '신고가 기각되었습니다.');
      router.push('/admin/reports/list');
    } catch (error) {
      console.error('Failed to process report:', error);
      toast.error('신고 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
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

  if (!report) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">신고 정보를 찾을 수 없습니다.</p>
              <button
                onClick={() => router.push('/admin/reports/list')}
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
            onClick={() => router.push('/admin/reports/list')}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>목록으로</span>
          </button>

          {/* 신고 처리 버튼 - 대기중인 경우만 표시 */}
          {report.status === 'PENDING' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleProcess('REJECT')}
                disabled={processing}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                기각
              </button>
              <button
                onClick={() => handleProcess('DELETE_CONTENT')}
                disabled={processing}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                삭제 처리
              </button>
            </div>
          )}
        </div>

        {/* 신고 정보 카드 */}
        <div className="mb-6 overflow-hidden rounded-xl border border-orange-200 bg-orange-50">
          <div className="border-b border-orange-200 bg-orange-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h2 className="font-semibold text-orange-900">신고 정보</h2>
              {report.status === 'PENDING' ? (
                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  대기중
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  처리완료
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-orange-600">신고 대상</p>
              <p className="mt-1 font-medium text-gray-900">
                {getTargetTypeName(report.targetType)} #{report.targetId}
              </p>
            </div>
            <div>
              <p className="text-xs text-orange-600">신고 사유</p>
              <p className="mt-1 font-medium text-gray-900">
                <span className="rounded bg-red-100 px-2 py-0.5 text-sm text-red-700">
                  {getReasonName(report.reason)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-orange-600">신고자</p>
              <p className="mt-1 font-medium text-gray-900">{report.reporterName}</p>
            </div>
            <div>
              <p className="text-xs text-orange-600">신고일</p>
              <p className="mt-1 font-medium text-gray-900">
                {new Date(report.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {report.description && (
              <div className="sm:col-span-2">
                <p className="text-xs text-orange-600">상세 내용</p>
                <p className="mt-1 text-gray-700">{report.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 게시글 내용 (게시글 신고인 경우) */}
        {report.targetType === 'ARTICLE' && (
          <>
            {article ? (
              <>
                {/* 게시글 카드 */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {/* 헤더 */}
                  <div className="border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="py-16 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">게시글이 이미 삭제되었거나 존재하지 않습니다.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* 댓글 신고인 경우 */}
        {report.targetType === 'COMMENT' && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">신고된 댓글</h2>
              </div>
            </div>
            <div className="py-12 text-center text-sm text-gray-500">
              댓글 ID: {report.targetId}
              <p className="mt-2 text-xs text-gray-400">댓글 상세 조회 기능은 추후 추가될 예정입니다.</p>
            </div>
          </div>
        )}

        {/* 사용자 신고인 경우 */}
        {report.targetType === 'USER' && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">신고된 사용자</h2>
              </div>
            </div>
            <div className="py-12 text-center text-sm text-gray-500">
              사용자 ID: {report.targetId}
              <p className="mt-2 text-xs text-gray-400">사용자 상세 조회 기능은 추후 추가될 예정입니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
