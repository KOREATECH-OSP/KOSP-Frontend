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
import { getAdminNotices, toggleBanner } from '@/lib/api/admin';
import type { AdminNoticeResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

const PAGE_SIZE = 20;

export default function NoticesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notices, setNotices] = useState<AdminNoticeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [togglingBanner, setTogglingBanner] = useState(false);

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

  const handleToggleBanner = async () => {
    if (!session?.accessToken || togglingBanner) return;

    try {
      setTogglingBanner(true);
      const result = await toggleBanner({ accessToken: session.accessToken });
      setBannerActive(result.isActive);
      toast.success(result.isActive ? '배너가 활성화되었습니다.' : '배너가 비활성화되었습니다.');
    } catch (err) {
      console.error('Failed to toggle banner:', err);
      toast.error('배너 설정 변경에 실패했습니다.');
    } finally {
      setTogglingBanner(false);
    }
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
            <p className="mt-0.5 text-sm text-gray-500">전체 {totalItems.toLocaleString()}개</p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="w-full sm:w-56">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색"
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

        {/* 배너 설정 */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">메인 페이지 배너</p>
            <p className="text-xs text-gray-500">활성화하면 메인 페이지 상단에 공지사항이 표시됩니다</p>
          </div>
          <button
            onClick={handleToggleBanner}
            disabled={togglingBanner}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              bannerActive ? 'bg-blue-600' : 'bg-gray-300'
            } ${togglingBanner ? 'opacity-50' : ''}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                bannerActive ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 공지사항 목록 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? '검색 결과가 없습니다' : '등록된 공지사항이 없습니다'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredNotices.map((notice) => (
                <li key={notice.id}>
                  <button
                    onClick={() => router.push(`/admin/contents/notices/${notice.id}`)}
                    className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
                      notice.isPinned
                        ? 'bg-blue-50/50 hover:bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-gray-900">
                          {notice.title}
                        </span>
                        {notice.isPinned && (
                          <span className="shrink-0 text-xs font-medium text-blue-600">
                            배너 설정됨
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {notice.content?.replace(/<[^>]*>/g, '').slice(0, 80) || '내용 없음'}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-gray-400">
                      {notice.createdAt
                        ? new Date(notice.createdAt).toLocaleDateString('ko-KR')
                        : '-'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-gray-100 py-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
