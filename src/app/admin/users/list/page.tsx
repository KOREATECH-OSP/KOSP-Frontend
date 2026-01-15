'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Search, Users, ChevronLeft, ChevronRight, X, CheckCircle2, Loader2 } from 'lucide-react';
import { getAdminUsers, getRoles, updateUserRoles, deleteAdminUser } from '@/lib/api/admin';
import type { AdminUserResponse, RoleResponse } from '@/types/admin';
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

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        getAdminUsers(
          { page: currentPage, size: PAGE_SIZE },
          { accessToken: session.accessToken }
        ).catch(() => ({ users: [], totalPages: 1, totalElements: 0 })),
        getRoles({ accessToken: session.accessToken }).catch(() => ({ roles: [] })),
      ]);
      setUsers(usersData.users || []);
      setTotalPages(usersData.totalPages || 1);
      setTotalItems(usersData.totalElements || 0);
      setRoles(rolesData.roles || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('회원 목록을 불러오는데 실패했습니다.');
      setUsers([]);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 클라이언트 측 검색 필터링
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.kutEmail?.toLowerCase().includes(query) ||
      user.kutId?.toLowerCase().includes(query)
    );
  });

  const handleDeleteUser = async (user: AdminUserResponse) => {
    if (!session?.accessToken) return;
    if (!confirm(`${user.name}님을 강제 탈퇴시키겠습니까?`)) return;

    try {
      await deleteAdminUser(user.id, { accessToken: session.accessToken });
      toast.success('회원이 탈퇴 처리되었습니다.');
      fetchUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
      toast.error('회원 탈퇴 처리에 실패했습니다.');
    }
  };

  const handleRoleChange = async (userId: number, newRoles: string[]) => {
    if (!session?.accessToken) return;

    try {
      await updateUserRoles(userId, newRoles, { accessToken: session.accessToken });
      toast.success('역할이 변경되었습니다.');
      fetchUsers();
      setShowRoleModal(false);
    } catch (err) {
      console.error('Role change failed:', err);
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  const activeCount = users.filter((u) => !u.isDeleted).length;

  // 페이지 번호 배열 생성
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
            <h1 className="text-xl font-bold text-gray-900">회원 관리</h1>
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
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    회원
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    학번
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    역할
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
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <Users className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
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

                      {/* 역할 */}
                      <td className="px-4 py-3">
                        {user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.slice(0, 2).map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                              >
                                {role.replace('ROLE_', '')}
                              </span>
                            ))}
                            {user.roles.length > 2 && (
                              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                +{user.roles.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="whitespace-nowrap rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                          >
                            역할
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="whitespace-nowrap rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                          >
                            탈퇴
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

        {/* 역할 관리 모달 */}
        {showRoleModal && selectedUser && (
          <UserRoleModal
            user={selectedUser}
            allRoles={roles}
            onClose={() => setShowRoleModal(false)}
            onSave={(newRoles) => handleRoleChange(selectedUser.id, newRoles)}
          />
        )}
      </div>
    </div>
  );
}

function UserRoleModal({
  user,
  allRoles,
  onClose,
  onSave,
}: {
  user: AdminUserResponse;
  allRoles: RoleResponse[];
  onClose: () => void;
  onSave: (roles: string[]) => void;
}) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([...user.roles]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(selectedRoles);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">역할 관리</h2>
            <p className="text-sm text-gray-500">{user.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 역할 목록 */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="space-y-2">
            {allRoles.map((role, index) => {
              const hasRole = selectedRoles.includes(role.name);
              return (
                <label
                  key={role.id ?? role.name ?? index}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                    hasRole
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasRole}
                    onChange={() => toggleRole(role.name)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      hasRole
                        ? 'border-gray-900 bg-gray-900'
                        : 'border-gray-300'
                    }`}
                  >
                    {hasRole && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500">{role.description}</div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex gap-2 border-t border-gray-200 px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
