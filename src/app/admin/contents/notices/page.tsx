'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Bell,
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchNotices}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
          <p className="mt-1 text-sm text-gray-500">공지사항을 작성하고 관리합니다</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">전체 공지사항</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}개</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">페이지</span>
              <p className="text-lg font-bold text-gray-900">
                {currentPage + 1} / {totalPages || 1}
              </p>
            </div>
          </div>
        </div>

        {/* 검색 및 생성 버튼 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="제목 또는 내용으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => router.push('/admin/contents/notices/create')}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-5 w-5" />
              공지사항 작성
            </button>
          </div>
        </div>

        {/* 공지사항 목록 - 테이블 */}
        {filteredNotices.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 공지사항이 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/admin/contents/notices/create')}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
              >
                첫 공지사항 작성하기
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      제목
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      내용
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      작성일
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredNotices.map((notice) => (
                    <tr key={notice.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{notice.title}</div>
                          <div className="text-xs text-gray-400">ID: {notice.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="line-clamp-2 text-sm text-gray-600">
                          {notice.content || '-'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {notice.createdAt
                            ? new Date(notice.createdAt).toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedNotice(notice);
                            setShowDeleteModal(true);
                          }}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              처음
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              <p className="mb-2 font-medium text-gray-900">{selectedNotice.title}</p>
              <p className="mb-6 text-sm text-gray-500">
                이 공지사항을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedNotice(null);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
