'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { getAdminNotices, deleteAdminNotice } from '@/lib/api/admin';
import type { AdminNoticeResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function NoticesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notices, setNotices] = useState<AdminNoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<AdminNoticeResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  const fetchNotices = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const { posts, pagination } = await getAdminNotices(
        { accessToken: session.accessToken },
        currentPage,
        pageSize
      );

      setNotices(posts);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.totalItems);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentPage]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchNotices();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchNotices, router]);

  const handleDelete = async () => {
    if (!selectedNotice || !session?.accessToken) return;

    try {
      setDeleting(true);
      await deleteAdminNotice(selectedNotice.id, { accessToken: session.accessToken });
      toast.success('공지사항이 삭제되었습니다.');
      setShowDeleteModal(false);
      setSelectedNotice(null);
      await fetchNotices();
    } catch (err) {
      console.error('Failed to delete notice:', err);
      toast.error('공지사항 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchNotices}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">공지사항 관리</h1>
          <p className="text-gray-600">공지사항을 작성하고 관리합니다</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">전체 공지사항</span>
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalItems}개</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">현재 페이지</span>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentPage + 1} / {totalPages || 1}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">이 페이지</span>
              <Bell className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{notices.length}개</p>
          </div>
        </div>

        {/* 생성 버튼 */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <button
            onClick={() => router.push('/admin/contents/notices/create')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 md:w-auto"
          >
            <Plus className="h-5 w-5" />
            공지사항 작성
          </button>
        </div>

        {/* 공지사항 목록 */}
        {notices.length > 0 ? (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{notice.title}</h3>
                      <span className="text-xs text-gray-500">#{notice.id}</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-600">{notice.content}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNotice(notice);
                      setShowDeleteModal(true);
                    }}
                    className="ml-4 flex-shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                    title="삭제"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>게시판 ID: {notice.boardId}</span>
                  </div>
                  {notice.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-4 text-gray-500">등록된 공지사항이 없습니다</p>
            <button
              onClick={() => router.push('/admin/contents/notices/create')}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
            >
              첫 공지사항 작성하기
            </button>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              처음
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              마지막
            </button>
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">공지사항 삭제</h2>
              <p className="mb-2 text-gray-600">
                <span className="font-semibold">{selectedNotice.title}</span>
              </p>
              <p className="mb-6 text-sm text-gray-500">
                ID: {selectedNotice.id} | 게시판 ID: {selectedNotice.boardId}
                <br />
                이 공지사항을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedNotice(null);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
    </div>
  );
}
