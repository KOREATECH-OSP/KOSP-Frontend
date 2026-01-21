import { Users, Megaphone, ArrowRight } from 'lucide-react';
import type { TeamResponse, RecruitResponse } from '@/lib/api/types';
import RecruitPostCard from '@/common/components/team/RecruitPostCard';
import TeamCard from '@/common/components/team/TeamCard';

interface TeamListTabProps {
  teams: TeamResponse[];
  recruits?: RecruitResponse[];
  onShowMoreRecruits?: () => void;
}

export default function TeamListTab({ teams, recruits = [], onShowMoreRecruits }: TeamListTabProps) {
  const openRecruits = recruits.filter((r) => r.status === 'OPEN');

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
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xl font-bold text-gray-900">최근 모집 공고</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                {openRecruits.length}
              </span>
            </div>
            {openRecruits.length > 3 && (
              <button
                onClick={onShowMoreRecruits}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                더보기
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {openRecruits.slice(0, 4).map((recruit) => (
              <RecruitPostCard key={recruit.id} recruit={recruit} />
            ))}
          </div>
        </section>
      )}

      {/* 팀 목록 섹션 */}
      {teams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-gray-900" />
            <h3 className="text-xl font-bold text-gray-900">등록된 팀</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
              {teams.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {teams.map((team) => (
              <TeamCard team={team} key={team.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
