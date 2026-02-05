'use client';

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import type { TeamResponse, RecruitResponse } from '@/lib/api/types';
import RecruitPostCard from '@/common/components/team/RecruitPostCard';
import TeamCard from '@/common/components/team/TeamCard';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

interface TeamListTabProps {
  teams: TeamResponse[];
  recruits?: RecruitResponse[];
  onShowMoreRecruits?: () => void;
  hideTeamSectionHeader?: boolean;
}

export default function TeamListTab({
  teams,
  recruits = [],
  hideTeamSectionHeader = false,
}: TeamListTabProps) {
  const [recruitPage, setRecruitPage] = useState(1);
  const [teamPage, setTeamPage] = useState(1);

  const openRecruits = recruits.filter((r) => r.status === 'OPEN');

  // 모집공고 페이징
  const recruitTotalPages = Math.ceil(openRecruits.length / PAGE_SIZE) || 1;
  const paginatedRecruits = useMemo(() => {
    const start = (recruitPage - 1) * PAGE_SIZE;
    return openRecruits.slice(start, start + PAGE_SIZE);
  }, [openRecruits, recruitPage]);

  // 팀 목록 페이징
  const teamTotalPages = Math.ceil(teams.length / PAGE_SIZE) || 1;
  const paginatedTeams = useMemo(() => {
    const start = (teamPage - 1) * PAGE_SIZE;
    return teams.slice(start, start + PAGE_SIZE);
  }, [teams, teamPage]);

  if (teams.length === 0 && openRecruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
          <Users className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">등록된 팀이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">새로운 팀을 만들고 멤버를 모아보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 모집공고 섹션 */}
      {openRecruits.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">최근 모집 공고</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {paginatedRecruits.map((recruit) => (
              <RecruitPostCard key={recruit.id} recruit={recruit} />
            ))}
          </div>

          <Pagination
            currentPage={recruitPage}
            totalPages={recruitTotalPages}
            onPageChange={setRecruitPage}
          />
        </section>
      )}

      {/* 팀 목록 섹션 */}
      {teams.length > 0 && (
        <section className="space-y-6">
          {!hideTeamSectionHeader && (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">등록된 팀</h3>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {paginatedTeams.map((team) => (
              <TeamCard team={team} key={team.id} />
            ))}
          </div>

          <Pagination
            currentPage={teamPage}
            totalPages={teamTotalPages}
            onPageChange={setTeamPage}
          />
        </section>
      )}
    </div>
  );
}
