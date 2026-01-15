'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Shield, FileText, Lock, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { getAdminStats, getAdminUsers, getRoles, getPolicies, getPermissions } from '@/lib/api/admin';
import type { AdminUserResponse } from '@/types/admin';

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalPolicies: number;
  totalPermissions: number;
}

export default function AdminDashboard() {
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

      // 병렬로 모든 데이터 가져오기
      const [statsData, usersData, rolesData, policiesData, permissionsData] = await Promise.all([
        getAdminStats(auth).catch(() => null),
        getAdminUsers({ page: 1, size: 10 }, auth).catch(() => ({ users: [], pagination: { totalItems: 0, currentPage: 0, totalPages: 0 } })),
        getRoles(auth).catch(() => ({ roles: [] })),
        getPolicies(auth).catch(() => ({ policies: [] })),
        getPermissions(auth).catch(() => ({ permissions: [] })),
      ]);

      setStats({
        totalUsers: statsData?.totalUsers || usersData.pagination?.totalItems || 0,
        totalRoles: rolesData.roles?.length || statsData?.totalRoles || 0,
        totalPolicies: policiesData.policies?.length || statsData?.totalPolicies || 0,
        totalPermissions: permissionsData.permissions?.length || statsData?.totalPermissions || 0,
      });

      // 최근 가입한 사용자 (가입일 기준 정렬)
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

  // 시간 차이 계산
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

  // 이름에서 첫 글자 추출
  const getInitial = (name: string) => {
    return name?.charAt(0) || '?';
  };

  // 사용자별 색상 생성 (이름 기반)
  const getUserColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-gray-400" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">시스템 전체 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">전체 사용자</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.totalRoles}</div>
            <div className="text-sm text-gray-600">역할(Roles)</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.totalPolicies}</div>
            <div className="text-sm text-gray-600">정책(Policies)</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Lock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.totalPermissions}</div>
            <div className="text-sm text-gray-600">권한(Permissions)</div>
          </div>
        </div>

        {/* 최근 가입한 사용자 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">최근 가입한 사용자</h2>
                <p className="mt-1 text-sm text-gray-600">가장 최근에 가입한 사용자 목록입니다</p>
              </div>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ${getUserColor(user.name)}`}
                    >
                      {getInitial(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        {user.roles && user.roles.length > 0 && (
                          <div className="flex gap-1">
                            {user.roles.map((role, index) => (
                              <span
                                key={index}
                                className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"
                              >
                                {typeof role === 'string' ? role : role.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="truncate text-sm text-gray-600">{user.email}</div>
                    </div>
                    <div className="whitespace-nowrap text-sm text-gray-500">
                      {getTimeAgo(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">최근 가입한 사용자가 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
