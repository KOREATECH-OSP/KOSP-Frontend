'use client';

import { Users, Shield, Key, Activity } from 'lucide-react';

const stats = [
  { name: '전체 회원', value: '1,234', icon: Users, color: 'bg-gray-100 text-gray-600' },
  { name: '역할(Roles)', value: '15', icon: Shield, color: 'bg-gray-100 text-gray-600' },
  { name: '정책(Policies)', value: '28', icon: Key, color: 'bg-gray-100 text-gray-600' },
  { name: '오늘 활동', value: '89', icon: Activity, color: 'bg-gray-100 text-gray-600' },
];

const recentActivities = [
  { name: '김혜준', action: '가입했습니다', time: '5분 전' },
  { name: '박지민', action: 'MANAGER 역할이 부여되었습니다', time: '1시간 전' },
  { name: '이서준', action: '게시글을 작성했습니다', time: '2시간 전' },
  { name: '정민수', action: '챌린지를 완료했습니다', time: '3시간 전' },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">관리자 현황을 한눈에 확인하세요</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-2xl border border-gray-200 bg-white p-6"
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

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">최근 활동</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {activity.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {activity.name}님이 {activity.action}
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
