'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, User } from 'lucide-react';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import type { TeamRecruitment } from '@/types/recruit';

interface TeamRecruitTabProps {
  teams: TeamRecruitment[];
  searchQuery: string;
}

export default function TeamRecruitTab({ teams, searchQuery }: TeamRecruitTabProps) {
  const filtered = teams.filter((team) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    return (
      team.name.toLowerCase().includes(q) ||
      team.description.toLowerCase().includes(q) ||
      team.createdBy.toLowerCase().includes(q) ||
      (team.positions && team.positions.some((p) => p.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-4">
      {filtered.map((team) => (
        <TeamCard team={team} key={team.id} />
      ))}

      {filtered.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}

function TeamCard({ team }: { team: TeamRecruitment }) {
  return (
    <Link
      href={`/team/${team.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* 팀 이미지 */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
            {team.imageUrl ? (
              <Image 
                src={team.imageUrl} 
                alt={team.name} 
                fill 
                className="object-cover rounded-lg" 
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                <Image 
                  src={KoriSupport} 
                  alt="default icon" 
                  width={40} 
                  height={40} 
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </div>
            )}
          </div>

          {/* 팀 정보 */}
          <div className="flex-1 min-w-0">
            {/* 팀 이름 */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
              {team.name}
            </h3>

            {/* 팀 설명 - 2줄 제한 */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {team.description}
            </p>

            {/* 모집 포지션 */}
            {team.positions && team.positions.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1.5">모집 중인 포지션</p>
                <div className="flex flex-wrap gap-1.5">
                  {team.positions.map((position: string) => (
                    <span
                      key={position}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200"
                    >
                      {position}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 sm:gap-4 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{team.createdBy}</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{team.memberCount}명</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}