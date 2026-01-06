'use client';

import { useState } from 'react';
import { Search, Key } from 'lucide-react';
import type { Permission } from '@/types/admin';

const MOCK_PERMISSIONS: Permission[] = [
  { id: 1, name: 'USER_CREATE', description: '사용자 생성 권한' },
  { id: 2, name: 'USER_READ', description: '사용자 조회 권한' },
  { id: 3, name: 'USER_UPDATE', description: '사용자 수정 권한' },
  { id: 4, name: 'USER_DELETE', description: '사용자 삭제 권한' },
  { id: 5, name: 'ARTICLE_CREATE', description: '게시글 작성 권한' },
  { id: 6, name: 'ARTICLE_READ', description: '게시글 조회 권한' },
  { id: 7, name: 'ARTICLE_UPDATE', description: '게시글 수정 권한' },
  { id: 8, name: 'ARTICLE_DELETE', description: '게시글 삭제 권한' },
  { id: 9, name: 'CHALLENGE_MANAGE', description: '챌린지 관리 권한' },
  { id: 10, name: 'REPORT_MANAGE', description: '신고 관리 권한' },
];

export default function AdminPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPermissions = MOCK_PERMISSIONS.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">권한(Permission) 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            시스템의 기본 권한을 조회합니다 (읽기 전용)
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Key className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">전체 권한</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {MOCK_PERMISSIONS.length}개
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="권한 이름 또는 설명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    권한 이름
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    설명
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPermissions.map((permission) => (
                  <tr
                    key={permission.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-400">
                      #{permission.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {permission.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {permission.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPermissions.length === 0 && (
            <div className="py-12 text-center">
              <Key className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
