'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import Image from 'next/image';
import { Search, Users, Loader2, Coins, RefreshCcw, X } from 'lucide-react';
import { getAdminUsers } from '@/lib/api/admin';
import type { AdminUserResponse } from '@/types/admin';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';
import { ensureEncodedUrl } from '@/lib/utils';

const PAGE_SIZE = 20;

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function UserAvatar({
  name,
  profileImageUrl,
}: {
  name: string;
  profileImageUrl: string | null;
}) {
  if (profileImageUrl) {
    return (
      <Image
        src={ensureEncodedUrl(profileImageUrl)}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
      {name[0]}
    </div>
  );
}

function UserStatusBadge({ isDeleted }: { isDeleted: boolean }) {
  return isDeleted ? (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      탈퇴
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      활성
    </span>
  );
}

function matchesUserSearch(user: AdminUserResponse, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return [user.name, user.kutId, user.kutEmail].some((value) =>
    value.toLowerCase().includes(normalizedKeyword)
  );
}

export default function AdminPointsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [excludeDeleted, setExcludeDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);
  const userCacheRef = useRef(new Map<number, AdminUserResponse>());
  const loadedPagesRef = useRef(new Set<number>());
  const knownTotalPagesRef = useRef<number | null>(null);
  const isSearchMode = searchQuery.trim().length > 0;

  const resetUserCache = useCallback(() => {
    userCacheRef.current.clear();
    loadedPagesRef.current.clear();
    knownTotalPagesRef.current = null;
  }, []);

  const cacheUserPage = useCallback((page: number, data: { users?: AdminUserResponse[]; totalPages?: number }) => {
    loadedPagesRef.current.add(page);
    data.users?.forEach((user) => {
      userCacheRef.current.set(user.id, user);
    });
    if (data.totalPages !== undefined) {
      knownTotalPagesRef.current = data.totalPages;
    }
  }, []);

  const fetchUserPage = useCallback(async (page: number) => {
    if (!session?.accessToken) {
      return { users: [], totalPages: 1, totalElements: 0 };
    }

    const usersData = await getAdminUsers(
      { page, size: PAGE_SIZE },
      { accessToken: session.accessToken }
    );

    cacheUserPage(page, usersData);
    return usersData;
  }, [cacheUserPage, session?.accessToken]);

  const fetchUsers = useCallback(async (requestId: number) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const usersData = await fetchUserPage(currentPage);

      if (requestId !== requestIdRef.current) return;

      setUsers(usersData.users || []);
      setTotalPages(usersData.totalPages || 1);
      setTotalItems(usersData.totalElements || 0);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error('Failed to fetch users:', err);
      toast.error('포인트 관리 대상을 불러오는데 실패했습니다.');
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, fetchUserPage, session?.accessToken]);

  const ensureAllUsersLoaded = useCallback(async () => {
    if (!session?.accessToken) return;

    if (!loadedPagesRef.current.has(1)) {
      await fetchUserPage(1);
    }

    const totalPageCount = knownTotalPagesRef.current ?? 1;

    for (let page = 1; page <= totalPageCount; page += 1) {
      if (loadedPagesRef.current.has(page)) {
        continue;
      }

      await fetchUserPage(page);
    }
  }, [fetchUserPage, session?.accessToken]);

  const searchUsers = useCallback(async (keyword: string, requestId: number) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      await ensureAllUsersLoaded();

      if (requestId !== requestIdRef.current) return;

      const matchedUsers = Array.from(userCacheRef.current.values()).filter((user) =>
        matchesUserSearch(user, keyword)
      );

      setUsers(matchedUsers);
      setTotalPages(1);
      setTotalItems(matchedUsers.length);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error('Failed to search users:', err);
      toast.error('포인트 관리 사용자 검색에 실패했습니다.');
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [ensureAllUsersLoaded, session?.accessToken]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, router]);

  useEffect(() => {
    resetUserCache();
  }, [resetUserCache, session?.accessToken]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const keyword = searchQuery.trim();

    if (!keyword) {
      void fetchUsers(requestId);
      return;
    }

    const timer = window.setTimeout(() => {
      void searchUsers(keyword, requestId);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [status, session?.accessToken, searchQuery, currentPage, fetchUsers, searchUsers]);

  const filteredUsers = users.filter((user) => {
    if (excludeDeleted && user.isDeleted) return false;
    return true;
  });

  const trimmedSearchQuery = searchQuery.trim();
  const visibleCount = filteredUsers.length;
  const activeVisibleCount = filteredUsers.filter((user) => !user.isDeleted).length;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    if (!session?.accessToken) return;

    resetUserCache();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    await (trimmedSearchQuery ? searchUsers(trimmedSearchQuery, requestId) : fetchUsers(requestId));
  };

  const handleUserClick = (userId: number) => {
    router.push(`/admin/points/${userId}`);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">포인트 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isSearchMode
                ? `검색 결과 ${totalItems.toLocaleString()}명`
                : `전체 ${totalItems.toLocaleString()}명 · 현재 표시 ${visibleCount.toLocaleString()}명 · 활성 ${activeVisibleCount.toLocaleString()}명`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[440px]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="이름, 학번, 이메일로 검색"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                />
                {trimmedSearchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="검색어 지우기"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <RefreshCcw className="h-4 w-4" />
                새로고침
              </button>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={excludeDeleted}
                onChange={(e) => setExcludeDeleted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              탈퇴 회원 제외
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-1 border-b border-gray-200 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{trimmedSearchQuery ? `검색어: ${trimmedSearchQuery}` : '포인트 관리 대상 목록'}</span>
            <span>{excludeDeleted ? '탈퇴 회원 제외 적용됨' : '전체 사용자 표시 중'}</span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {trimmedSearchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3">사용자</th>
                      <th className="px-4 py-3">학번/사번</th>
                      <th className="px-4 py-3">이메일</th>
                      <th className="px-4 py-3">가입일</th>
                      <th className="px-4 py-3">상태</th>
                      <th className="px-4 py-3 text-right">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUserClick(user.id)}
                              className="shrink-0"
                            >
                              <UserAvatar name={user.name} profileImageUrl={user.profileImageUrl} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUserClick(user.id)}
                              className="truncate text-left font-medium text-gray-900 hover:underline"
                            >
                              {user.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.kutId}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.kutEmail}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <UserStatusBadge isDeleted={user.isDeleted} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleUserClick(user.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                            >
                              <Coins className="h-3.5 w-3.5" />
                              포인트 관리
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-gray-100 md:hidden">
                {filteredUsers.map((user) => (
                  <li key={user.id} className="space-y-3 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => handleUserClick(user.id)} className="shrink-0">
                        <UserAvatar name={user.name} profileImageUrl={user.profileImageUrl} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUserClick(user.id)}
                            className="truncate text-left font-medium text-gray-900 hover:underline"
                          >
                            {user.name}
                          </button>
                          <UserStatusBadge isDeleted={user.isDeleted} />
                        </div>
                        <div className="mt-1 space-y-1 text-xs text-gray-500">
                          <p>{user.kutId}</p>
                          <p className="truncate">{user.kutEmail}</p>
                          <p>{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUserClick(user.id)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                    >
                      <Coins className="h-3.5 w-3.5" />
                      포인트 관리
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {!isSearchMode && filteredUsers.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
