'use client';

import Link from 'next/link';
import { Users, User, ChevronRight, Crown } from 'lucide-react';

interface MyTeam {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  isLeader: boolean;
}

export default function MyTeamListTab() {
  const myTeams: MyTeam[] = [
    {
      id: 1,
      name: 'React 스터디 그룹',
      description:
        'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.',
      memberCount: 5,
      createdBy: '김개발',
      isLeader: true,
    },
    {
      id: 2,
      name: '오픈소스 컨트리뷰션 팀',
      description:
        'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.',
      memberCount: 8,
      createdBy: '이코드',
      isLeader: false,
    },
  ];

  if (myTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">참여한 팀이 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">
          새로운 팀을 만들거나 다른 팀에 참여해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {myTeams.map((team) => (
        <MyTeamCard team={team} key={team.id} />
      ))}
    </div>
  );
}

function MyTeamCard({ team }: { team: MyTeam }) {
  return (
    <Link
      href={`/team/${team.id}`}
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50/80"
    >
      {/* 팀 아이콘 */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
          team.isLeader
            ? 'bg-amber-50 text-amber-600'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {team.isLeader ? (
          <Crown className="h-5 w-5" />
        ) : (
          <Users className="h-5 w-5" />
        )}
      </div>

      {/* 팀 정보 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          {team.isLeader && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              리더
            </span>
          )}
          <h3 className="truncate text-[15px] font-medium text-gray-900 group-hover:text-blue-600">
            {team.name}
          </h3>
        </div>
        <p className="mb-2 line-clamp-1 text-sm text-gray-500">
          {team.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {team.createdBy}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {team.memberCount}명
          </span>
        </div>
      </div>

      {/* 화살표 */}
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
    </Link>
  );
}
