'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Shield, Key, Activity, FileText, TrendingUp, UserPlus, Loader2 } from 'lucide-react';
import { getAdminStats, getAdminActivities } from '@/lib/api/admin';
import type { AdminStatsResponse, AdminActivityItem } from '@/types/admin';

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  USER_JOINED: '가입했습니다',
  ROLE_ASSIGNED: '역할이 부여되었습니다',
  ARTICLE_CREATED: '게시글을 작성했습니다',
  TEAM_CREATED: '팀을 생성했습니다',
  CHALLENGE_COMPLETED: '챌린지를 완료했습니다',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const [statsData, activitiesData] = await Promise.all([
          getAdminStats({ accessToken: session.accessToken }),
          getAdminActivities({ accessToken: session.accessToken }, 10),
        ]);
        setStats(statsData);
        setActivities(activitiesData.activities);
      } catch (err) {
        console.error('Admin data fetch failed:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        setStats({
          totalUsers: 0,
          totalRoles: 0,
          totalPolicies: 0,
          totalPermissions: 0,
          activeUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
        });
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [session?.accessToken]);

  const statCards = stats
    ? [
        { name: '전체 회원', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
        { name: '역할(Roles)', value: stats.totalRoles.toLocaleString(), icon: Shield, color: 'bg-purple-50 text-purple-600' },
        { name: '정책(Policies)', value: stats.totalPolicies.toLocaleString(), icon: FileText, color: 'bg-green-50 text-green-600' },
        { name: '권한(Permissions)', value: stats.totalPermissions.toLocaleString(), icon: Key, color: 'bg-amber-50 text-amber-600' },
      ]
    : [];

  const trendCards = stats
    ? [
        { name: '오늘 활동', value: stats.activeUsersToday, icon: Activity, trend: '+12%' },
        { name: '이번 주 신규', value: stats.newUsersThisWeek, icon: UserPlus, trend: '+8%' },
        { name: '이번 달 신규', value: stats.newUsersThisMonth, icon: TrendingUp, trend: '+15%' },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">관리자 현황을 한눈에 확인하세요</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {error} 목업 데이터를 표시합니다.
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.name}</div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trendCards.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <item.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">{item.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{item.value}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                    {item.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">최근 활동</h2>
            {activities.length > 0 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                최근 {activities.length}개
              </span>
            )}
          </div>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Activity className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">최근 활동이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                    {activity.userName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      <span className="font-semibold">{activity.userName}</span>
                      님이 {activity.description || ACTIVITY_TYPE_LABELS[activity.type] || '활동했습니다'}
                    </div>
                    <div className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
