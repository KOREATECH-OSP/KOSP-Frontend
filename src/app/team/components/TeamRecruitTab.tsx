import { Users } from 'lucide-react';
import type { RecruitResponse } from '@/lib/api/types';
import RecruitPostCard from '@/common/components/team/RecruitPostCard';

interface TeamRecruitTabProps {
  recruits: RecruitResponse[];
}

export default function TeamRecruitTab({ recruits }: TeamRecruitTabProps) {
  const openRecruits = recruits.filter((r) => r.status === 'OPEN');

  if (openRecruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
          <Users className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">모집 중인 공고가 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">새로운 팀원을 찾는 첫 번째 주인공이 되어보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {openRecruits.map((recruit) => (
        <RecruitPostCard key={recruit.id} recruit={recruit} />
      ))}
    </div>
  );
}
