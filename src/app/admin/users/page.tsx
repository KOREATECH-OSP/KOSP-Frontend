'use client';

import { useState } from 'react';
import { Search, Users, Shield, Plus, CheckCircle2, X } from 'lucide-react';
import type { AdminUser, Role } from '@/types/admin';

const MOCK_USERS: AdminUser[] = [
  {
    id: '1',
    name: '김혜준',
    email: 'hyejun@koreatech.ac.kr',
    department: '컴퓨터공학부',
    studentId: '2020136000',
    roles: ['ADMIN'],
    joinedAt: '2023-03-15',
    lastActive: '2024-01-04',
  },
  {
    id: '2',
    name: '박지민',
    email: 'jimin@koreatech.ac.kr',
    department: '소프트웨어공학과',
    studentId: '2021145000',
    roles: ['MEMBER'],
    joinedAt: '2023-06-20',
    lastActive: '2024-01-03',
  },
  {
    id: '3',
    name: '이서준',
    email: 'seojun@koreatech.ac.kr',
    department: '컴퓨터공학부',
    studentId: '2022136001',
    roles: ['MANAGER', 'MEMBER'],
    joinedAt: '2023-09-01',
    lastActive: '2024-01-04',
  },
];

const MOCK_ROLES: Role[] = [
  { name: 'ADMIN', description: '시스템 관리자', policies: ['ALL_ACCESS'] },
  { name: 'MANAGER', description: '콘텐츠 관리자', policies: ['CONTENT_MANAGE', 'USER_VIEW'] },
  { name: 'MEMBER', description: '일반 회원', policies: ['CONTENT_VIEW'] },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.studentId.includes(searchQuery)
  );

  const handleUpdateUserRoles = (userId: string, newRoles: string[]) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u)));
    setShowRoleModal(false);
  };

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
            <p className="text-2xl font-bold text-gray-900">{users.length}명</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">역할 보유자</span>
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.roles.length > 0).length}명
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">오늘 활동</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.lastActive === '2024-01-04').length}명
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
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
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
                    {user.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      {user.department} · {user.studentId}
                    </div>
                  </div>
                </div>
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
                    {user.roles.map((roleName) => (
                      <div
                        key={roleName}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {roleName}
                        </span>
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
                <span>가입일: {user.joinedAt}</span>
                <span className="flex items-center gap-1">
                  최근 활동: {user.lastActive}
                  {user.lastActive === '2024-01-04' && (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}

        {showRoleModal && selectedUser && (
          <UserRoleModal
            user={selectedUser}
            roles={MOCK_ROLES}
            onClose={() => setShowRoleModal(false)}
            onSave={handleUpdateUserRoles}
          />
        )}
      </div>
    </div>
  );
}

function UserRoleModal({
  user,
  roles,
  onClose,
  onSave,
}: {
  user: AdminUser;
  roles: Role[];
  onClose: () => void;
  onSave: (userId: string, roles: string[]) => void;
}) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">역할 관리</h2>
            <p className="text-sm text-gray-500">
              {user.name}님에게 부여할 역할을 선택하세요
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
          선택된 역할:{' '}
          <span className="font-semibold text-gray-900">{selectedRoles.length}</span>개
        </div>

        <div className="mb-6 space-y-3">
          {roles.map((role) => (
            <label
              key={role.name}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                selectedRoles.includes(role.name)
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.name)}
                onChange={() => toggleRole(role.name)}
                className="mt-0.5 h-5 w-5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
              />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{role.name}</span>
                  {selectedRoles.includes(role.name) && (
                    <CheckCircle2 className="h-4 w-4 text-gray-900" />
                  )}
                </div>
                <p className="mb-2 text-sm text-gray-600">{role.description}</p>
                {role.policies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {role.policies.map((policy) => (
                      <span
                        key={policy}
                        className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600"
                      >
                        {policy}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => onSave(user.id, selectedRoles)}
            className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
