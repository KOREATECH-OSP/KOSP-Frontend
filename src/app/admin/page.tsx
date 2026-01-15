'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight } from 'lucide-react';
import { getAdminUsers, getRoles, getPolicies, getPermissions } from '@/lib/api/admin';
import type { AdminUserResponse } from '@/types/admin';

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalPolicies: number;
  totalPermissions: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRoles: 0,
    totalPolicies: 0,
    totalPermissions: 0,
  });
  const [recentUsers, setRecentUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const auth = { accessToken: session.accessToken };

      const [usersData, rolesData, policiesData, permissionsData] = await Promise.all([
        getAdminUsers({ page: 1, size: 10 }, auth).catch(() => ({ users: [], totalElements: 0 })),
        getRoles(auth).catch(() => ({ roles: [] })),
        getPolicies(auth).catch(() => ({ policies: [] })),
        getPermissions(auth).catch(() => ({ permissions: [] })),
      ]);

      setStats({
        totalUsers: usersData.totalElements || 0,
        totalRoles: rolesData.roles?.length || 0,
        totalPolicies: policiesData.policies?.length || 0,
        totalPermissions: permissionsData.permissions?.length || 0,
      });

      const sortedUsers = [...(usersData.users || [])].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentUsers(sortedUsers.slice(0, 5));
    } catch (err: unknown) {
      console.error('Failed to fetch dashboard data:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchDashboardData();
    }
  }, [session?.accessToken, fetchDashboardData]);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}개월 전`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">시스템 전체 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-1 text-sm text-gray-500">전체 사용자</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</span>
              <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-gray-500" />
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/roles')}
            className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-1 text-sm text-gray-500">역할</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{stats.totalRoles}</span>
              <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-gray-500" />
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/policies')}
            className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-1 text-sm text-gray-500">정책</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{stats.totalPolicies}</span>
              <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-gray-500" />
            </div>
          </button>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-1 text-sm text-gray-500">권한</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPermissions}</div>
          </div>
        </div>

        {/* 최근 가입한 사용자 */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">최근 가입한 사용자</h2>
              <p className="text-sm text-gray-500">최근 5명</p>
            </div>
            <button
              onClick={() => router.push('/admin/users')}
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              전체 보기
            </button>
          </div>

          {recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      역할
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      가입
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-600">{user.kutEmail}</span>
                      </td>
                      <td className="px-6 py-3">
                        {user.roles && user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, index) => (
                              <span
                                key={index}
                                className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        <span className="text-sm text-gray-500">{getTimeAgo(user.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">최근 가입한 사용자가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}
