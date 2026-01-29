'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth/AuthContext';
import Image from 'next/image';
import { Search, Users, X, Check, Loader2 } from 'lucide-react';
import { getAdminUsers, getRoles, updateUserRoles, deleteAdminUser } from '@/lib/api/admin';
import type { AdminUserResponse, RoleResponse } from '@/types/admin';
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

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [excludeDeleted, setExcludeDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (status === 'authenticated' && session?.accessToken) {
      fetchUsers();
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchUsers, router]);

  // 클라이언트 측 검색 필터링
  const filteredUsers = users.filter((user) => {
    // 탈퇴 회원 제외 필터
    if (excludeDeleted && user.isDeleted) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.kutEmail?.toLowerCase().includes(query) ||
      user.kutId?.toLowerCase().includes(query)
    );
  });

  const handleDeleteClick = (user: AdminUserResponse) => {
    if (user.isDeleted) {
      toast.error('이미 탈퇴 처리된 회원입니다.');
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!session?.accessToken || !selectedUser) return;
    if (selectedUser.isDeleted) {
      toast.error('이미 탈퇴 처리된 회원입니다.');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAdminUser(selectedUser.id, { accessToken: session.accessToken });
      toast.success('회원이 탈퇴 처리되었습니다.');
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Delete user failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : '회원 탈퇴 처리에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
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

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">회원 관리</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              전체 {totalItems.toLocaleString()}명 · 활성 {activeCount}명
            </p>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={excludeDeleted}
                onChange={(e) => setExcludeDeleted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              탈퇴 회원 제외
            </label>
            <div className="relative w-full sm:w-72">
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
                <li key={user.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
                  <Link href={`/user/${user.id}`}>
                    {user.profileImageUrl ? (
                      <Image
                        src={user.profileImageUrl}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full object-cover hover:ring-2 hover:ring-gray-300 transition-all"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white hover:ring-2 hover:ring-gray-300 transition-all">
                        {user.name[0]}
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/user/${user.id}`} className="truncate font-medium text-gray-900 hover:underline">{user.name}</Link>
                      {user.isDeleted ? (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">탈퇴</span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">활성</span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{user.kutId}</span>
                      <span>{user.kutEmail}</span>
                      <span>{formatDate(user.createdAt)}</span>
                      {user.roles.length > 0 && (
                        <div className="flex gap-1">
                          {user.roles.slice(0, 2).map((role) => (
                            <span key={role} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                          {user.roles.length > 2 && (
                            <span className="text-gray-400">+{user.roles.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleModal(true);
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      역할
                    </button>
                    <span className="group relative">
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.isDeleted || isDeleting}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        탈퇴
                      </button>
                      {user.isDeleted && (
                        <div className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          탈퇴 처리된 회원입니다.
                          <div className="absolute right-3 top-full border-4 border-transparent border-t-gray-900" />
                        </div>
                      )}
                    </span>
                  </div>
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

        {/* 역할 관리 모달 */}
        {showRoleModal && selectedUser && (
          <UserRoleModal
            user={selectedUser}
            allRoles={roles}
            onClose={() => setShowRoleModal(false)}
            onSave={(newRoles) => handleRoleChange(selectedUser.id, newRoles)}
          />
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">회원 탈퇴</h2>
              <p className="mb-6 text-gray-600">
                <span className="font-semibold">{selectedUser.name}</span>님을 강제 탈퇴
                처리하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      탈퇴 처리 중...
                    </>
                  ) : (
                    '탈퇴'
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
                  key={`role-${role.name}-${index}`}
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
                    {hasRole && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
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
