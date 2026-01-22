'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Search, Users, ChevronLeft, ChevronRight, Loader2, Coins } from 'lucide-react';
import { getAdminUsers } from '@/lib/api/admin';
import type { AdminUserResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

const PAGE_SIZE = 20;

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function AdminPointsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const usersData = await getAdminUsers(
        { page: currentPage, size: PAGE_SIZE },
        { accessToken: session.accessToken }
      ).catch(() => ({ users: [], totalPages: 1, totalElements: 0 }));

      setUsers(usersData.users || []);
      setTotalPages(usersData.totalPages || 1);
      setTotalItems(usersData.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('회원 목록을 불러오는데 실패했습니다.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, currentPage]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchUsers();
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchUsers, router]);

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.kutEmail?.toLowerCase().includes(query) ||
      user.kutId?.toLowerCase().includes(query)
    );
  });

  const handleUserClick = (userId: number) => {
    router.push(`/admin/points/${userId}`);
  };

  const activeCount = users.filter((u) => !u.isDeleted).length;

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

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">포인트 관리</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              전체 {totalItems.toLocaleString()}명 · 활성 {activeCount}명
            </p>
          </div>

          {/* 검색 */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 학번 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    회원
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    학번
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    가입일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <Users className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleUserClick(user.id)}
                    >
                      {/* 회원 정보 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <Image
                              src={user.profileImageUrl}
                              alt={user.name}
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                              {user.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {user.kutEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 학번 */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{user.kutId}</span>
                      </td>

                      {/* 상태 */}
                      <td className="px-4 py-3">
                        {user.isDeleted ? (
                          <span className="inline-flex whitespace-nowrap items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                            탈퇴
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                            활성
                          </span>
                        )}
                      </td>

                      {/* 가입일 */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* 관리 버튼 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(user.id);
                            }}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                          >
                            <Coins className="h-3.5 w-3.5" />
                            포인트 관리
                          </button>
                        </div>
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
                총 {totalItems.toLocaleString()}명 중{' '}
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
      </div>
    </div>
  );
}
