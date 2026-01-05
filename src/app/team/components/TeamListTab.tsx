'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, User, ChevronRight } from 'lucide-react';
import type { TeamResponse } from '@/lib/api/types';

interface TeamListTabProps {
  teams: TeamResponse[];
}

export default function TeamListTab({ teams }: TeamListTabProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">팀이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {teams.map((team) => (
        <TeamCard team={team} key={team.id} />
      ))}
    </div>
  );
}

function TeamCard({ team }: { team: TeamResponse }) {
  return (
    <Link
      href={`/team/${team.id}`}
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50/80"
    >
      {/* 팀 아이콘 */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {team.imageUrl ? (
          <Image
            src={team.imageUrl}
            alt={team.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <Users className="h-5 w-5" />
        )}
      </div>

      {/* 팀 정보 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
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
