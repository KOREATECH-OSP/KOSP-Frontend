'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Search, Users, Shield, Plus, CheckCircle2, X, Loader2, ChevronLeft, ChevronRight, Ban, Check } from 'lucide-react';
import { getAdminUsers, getRoles, assignRoleToUser, removeRoleFromUser, suspendUser, activateUser } from '@/lib/api/admin';
import type { AdminUserResponse, RoleResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

const PAGE_SIZE = 10;

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">활성</span>;
    case 'SUSPENDED':
      return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">정지</span>;
    case 'DELETED':
      return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">탈퇴</span>;
    default:
      return null;
  }
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
          { page: currentPage, size: PAGE_SIZE, search: searchQuery || undefined },
          { accessToken: session.accessToken }
        ),
        getRoles({ accessToken: session.accessToken }),
      ]);
      setUsers(usersData.users);
      setTotalPages(usersData.pagination.totalPages);
      setTotalItems(usersData.pagination.totalItems);
      setRoles(rolesData.roles);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('회원 목록을 불러오는데 실패했습니다.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleStatusToggle = async (user: AdminUserResponse) => {
    if (!session?.accessToken) return;

    const action = user.status === 'ACTIVE' ? '정지' : '활성화';
    if (!confirm(`${user.name}님을 ${action}하시겠습니까?`)) return;

    try {
      if (user.status === 'ACTIVE') {
        await suspendUser(user.id, { accessToken: session.accessToken });
      } else {
        await activateUser(user.id, { accessToken: session.accessToken });
      }
      toast.success(`회원이 ${action}되었습니다.`);
      fetchUsers();
    } catch (err) {
      console.error('Status toggle failed:', err);
      toast.error(`회원 ${action}에 실패했습니다.`);
    }
  };

  const handleRoleChange = async (userId: number, roleId: number, action: 'add' | 'remove') => {
    if (!session?.accessToken) return;

    try {
      if (action === 'add') {
        await assignRoleToUser(userId, roleId, { accessToken: session.accessToken });
        toast.success('역할이 부여되었습니다.');
      } else {
        await removeRoleFromUser(userId, roleId, { accessToken: session.accessToken });
        toast.success('역할이 해제되었습니다.');
      }
      fetchUsers();
      setShowRoleModal(false);
    } catch (err) {
      console.error('Role change failed:', err);
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const roleCount = users.filter((u) => u.roles.length > 0).length;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            회원에게 역할을 부여하여 권한을 관리합니다
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">전체 회원</span>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}명</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">역할 보유자</span>
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{roleCount}명</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">활성 회원</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}명</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일, 학번으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>
        </form>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
                          {user.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.kutId}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStatusToggle(user)}
                      className={`rounded-lg p-2 transition-colors ${
                        user.status === 'ACTIVE'
                          ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                          : 'text-gray-400 hover:bg-green-50 hover:text-green-500'
                      }`}
                      title={user.status === 'ACTIVE' ? '정지' : '활성화'}
                    >
                      {user.status === 'ACTIVE' ? <Ban className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          보유 역할 ({user.roles.length})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        역할 관리
                      </button>
                    </div>

                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{role.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-400">
                        부여된 역할이 없습니다
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
                    <span>가입일: {formatDate(user.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      최근 로그인: {formatDate(user.lastLoginAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-4 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}

        {showRoleModal && selectedUser && (
          <UserRoleModal
            user={selectedUser}
            allRoles={roles}
            onClose={() => setShowRoleModal(false)}
            onRoleChange={handleRoleChange}
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
  onRoleChange,
}: {
  user: AdminUserResponse;
  allRoles: RoleResponse[];
  onClose: () => void;
  onRoleChange: (userId: number, roleId: number, action: 'add' | 'remove') => void;
}) {
  const userRoleIds = user.roles.map((r) => r.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">역할 관리</h2>
            <p className="text-sm text-gray-500">
              {user.name}님의 역할을 관리하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          현재 역할:{' '}
          <span className="font-semibold text-gray-900">{user.roles.length}</span>개
        </div>

        <div className="space-y-3">
          {allRoles.map((role) => {
            const hasRole = userRoleIds.includes(role.id);
            return (
              <div
                key={role.id}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  hasRole ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{role.name}</span>
                    {hasRole && <CheckCircle2 className="h-4 w-4 text-gray-900" />}
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                  {role.policies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {role.policies.map((policy) => (
                        <span
                          key={policy.id}
                          className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600"
                        >
                          {policy.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRoleChange(user.id, role.id, hasRole ? 'remove' : 'add')}
                  className={`ml-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    hasRole
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {hasRole ? '해제' : '부여'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
