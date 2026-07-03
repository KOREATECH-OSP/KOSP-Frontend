'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight } from 'lucide-react';
import { getAdminUsers, getRoles, getPolicies, getPermissions, runSeasonRankingBatch } from '@/lib/api/admin';
import { toast } from '@/lib/toast';
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
  const [batchRunning, setBatchRunning] = useState(false);

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

  const handleRunRankingBatch = async () => {
    if (!session?.accessToken) return;
    setBatchRunning(true);
    try {
      await runSeasonRankingBatch({ accessToken: session.accessToken });
      toast.success('시즌 랭킹 배치가 실행되었습니다.');
    } catch {
      toast.error('랭킹 배치 실행에 실패했습니다.');
    } finally {
      setBatchRunning(false);
    }
  };

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
        <div className="mx-auto max-w-4xl">
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
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-0.5 text-sm text-gray-500">시스템 전체 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button
            onClick={() => router.push('/admin/users/list')}
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

        {/* 시즌 관리 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">시즌 관리</h2>
            <p className="text-sm text-gray-500">시즌 랭킹 배치를 수동으로 실행합니다</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunRankingBatch}
              disabled={batchRunning}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {batchRunning && <Loader2 className="h-4 w-4 animate-spin" />}
              랭킹 배치 강제 실행
            </button>
            <p className="text-xs text-gray-400">커밋·챌린지 점수 재계산 → 순위 갱신 → 티어 적용</p>
          </div>
        </div>

        {/* 최근 가입한 사용자 */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">최근 가입한 사용자</h2>
              <p className="text-sm text-gray-500">최근 {recentUsers.length}명</p>
            </div>
            <button
              onClick={() => router.push('/admin/users/list')}
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              전체 보기
            </button>
          </div>

          {recentUsers.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      {user.roles && user.roles.length > 0 && (
                        <div className="flex gap-1">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{user.kutEmail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{getTimeAgo(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">최근 가입한 사용자가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}
