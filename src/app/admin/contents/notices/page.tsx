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

const PAGE_SIZE = 20;

export default function NoticesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notices, setNotices] = useState<AdminNoticeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<AdminNoticeResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const { posts, pagination } = await getAdminNotices(
        { accessToken: session.accessToken },
        currentPage - 1,
        PAGE_SIZE
      );

      setNotices(posts);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.totalItems);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      toast.error('공지사항을 불러오는데 실패했습니다.');
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, currentPage]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchNotices();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchNotices, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotices();
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

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

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
            <p className="mt-0.5 text-sm text-gray-500">전체 {totalItems.toLocaleString()}개</p>
          </div>

          {/* 검색 및 생성 버튼 */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="w-full sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="제목 또는 내용으로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                />
              </div>
            </form>
            <button
              onClick={() => router.push('/admin/contents/notices/create')}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              작성
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    내용
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    작성일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <Bell className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? '검색 결과가 없습니다' : '등록된 공지사항이 없습니다'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{notice.title}</div>
                          <div className="text-xs text-gray-400">ID: {notice.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="line-clamp-2 text-sm text-gray-600">
                          {notice.content || '-'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {notice.createdAt
                            ? new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })
                            : '-'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedNotice(notice);
                            setShowDeleteModal(true);
                          }}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-600">
                총 {totalItems.toLocaleString()}개 중{' '}
                <span className="font-medium">
                  {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalItems)}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  처음
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  마지막
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteModal && selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">공지사항 삭제</h2>
                <p className="text-sm text-gray-500">{selectedNotice.title}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600">
                  이 공지사항을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="flex gap-2 border-t border-gray-200 px-5 py-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedNotice(null);
                  }}
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
    </div>
  );
}
