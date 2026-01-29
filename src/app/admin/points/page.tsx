'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import Image from 'next/image';
import { Search, Users, Loader2, Coins } from 'lucide-react';
import { getAdminUsers } from '@/lib/api/admin';
import type { AdminUserResponse } from '@/types/admin';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';

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

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
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

        {/* 회원 목록 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                  onClick={() => handleUserClick(user.id)}
                >
                  {user.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                      {user.name[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-gray-900">{user.name}</span>
                      {user.isDeleted ? (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">탈퇴</span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">활성</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{user.kutId}</span>
                      <span>{user.kutEmail}</span>
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.id);
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    <Coins className="h-3.5 w-3.5" />
                    포인트 관리
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>

        {/* 페이지네이션 */}
        {filteredUsers.length > 0 && (
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
