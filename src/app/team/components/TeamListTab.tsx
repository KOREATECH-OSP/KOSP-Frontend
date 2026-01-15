'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, User, ChevronRight, Eye, MessageSquare, Megaphone } from 'lucide-react';
import type { TeamResponse, RecruitResponse } from '@/lib/api/types';

interface TeamListTabProps {
  teams: TeamResponse[];
  recruits?: RecruitResponse[];
  onShowMoreRecruits?: () => void;
}

export default function TeamListTab({ teams, recruits = [], onShowMoreRecruits }: TeamListTabProps) {
  const router = useRouter();
  const openRecruits = recruits.filter((r) => r.status === 'OPEN');

  const handleAuthorClick = (e: React.MouseEvent, authorId: number) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/user/${authorId}`);
  };

  if (teams.length === 0 && openRecruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">팀이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 모집공고 섹션 */}
      {openRecruits.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <Megaphone className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">모집공고</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {openRecruits.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {openRecruits.slice(0, 5).map((recruit) => (
              <Link
                key={recruit.id}
                href={`/recruit/${recruit.id}`}
                className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50/80"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      모집중
                    </span>
                    <h3 className="truncate text-[15px] font-medium text-gray-900 group-hover:text-blue-600">
                      {recruit.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {recruit.tags && recruit.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recruit.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="h-3 w-px bg-gray-200" />
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <button
                        onClick={(e) => handleAuthorClick(e, recruit.author.id)}
                        className="flex items-center gap-1 hover:text-gray-700 hover:underline"
                      >
                        <User className="h-3.5 w-3.5" />
                        {recruit.author.name}
                      </button>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {recruit.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {recruit.comments}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
              </Link>
            ))}
            {openRecruits.length > 5 && (
              <div className="px-4 py-3 text-center">
                <button
                  onClick={onShowMoreRecruits}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                >
                  모집공고 더보기 ({openRecruits.length - 5}개 더)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 팀 목록 섹션 */}
      {teams.length > 0 && (
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <Users className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900">팀</h3>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {teams.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {teams.map((team) => (
              <TeamCard team={team} key={team.id} />
            ))}
          </div>
        </div>
      )}
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
