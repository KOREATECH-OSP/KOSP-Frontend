'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Eye,
  Loader2,
} from 'lucide-react';
import { deleteAdminNotice } from '@/lib/api/admin';
import { clientApiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';

interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isPinned?: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchNotice = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const data = await clientApiClient<NoticeDetail>(
        `/v1/community/articles/${id}`,
        {
          accessToken: session.accessToken,
          cache: 'no-store',
        }
      );
      setNotice(data);
    } catch (error) {
      console.error('Failed to fetch notice:', error);
      toast.error('공지사항을 불러오는데 실패했습니다.');
      router.push('/admin/contents/notices');
    } finally {
      setLoading(false);
    }
  }, [id, session?.accessToken, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchNotice();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchNotice, router]);

  // XSS 방어를 위한 HTML sanitization
  const sanitizedContent = useMemo(() => {
    if (!notice?.content) return '';
    return DOMPurify.sanitize(notice.content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
    });
  }, [notice?.content]);

  const handleDelete = async () => {
    if (!notice || !session?.accessToken) return;

    try {
      setDeleting(true);
      await deleteAdminNotice(notice.id, { accessToken: session.accessToken });
      toast.success('공지사항이 삭제되었습니다.');
      router.push('/admin/contents/notices');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      toast.error('공지사항 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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

  if (!notice) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">공지사항을 찾을 수 없습니다.</p>
              <button
                onClick={() => router.push('/admin/contents/notices')}
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
            onClick={() => router.push('/admin/contents/notices')}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>목록으로</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/contents/notices/edit/${notice.id}`)}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Edit className="h-4 w-4" />
              수정
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          </div>
        </div>

        {/* 공지사항 카드 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {notice.title}
              </h1>
              {notice.isPinned && (
                <span className="text-sm font-medium text-blue-600">
                  배너 설정됨
                </span>
              )}
            </div>

            {/* 메타 정보 */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {notice.author && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{notice.author.name}</span>
                </div>
              )}
              {notice.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {notice.viewCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>조회 {notice.viewCount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* 태그 */}
            {notice.tags && notice.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {notice.tags.map((tag, index) => (
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

          {/* 본문 */}
          <div className="px-6 py-6">
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>

        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">공지사항 삭제</h2>
              <p className="mt-1 text-sm text-gray-500">{notice.title}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600">
                이 공지사항을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
                onClick={handleDelete}
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
