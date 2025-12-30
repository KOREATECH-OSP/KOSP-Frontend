'use client';

import Link from 'next/link';
import { Users, User, ChevronRight, Eye, MessageSquare } from 'lucide-react';
import type { RecruitResponse } from '@/lib/api/types';

interface TeamRecruitTabProps {
  recruits: RecruitResponse[];
}

export default function TeamRecruitTab({ recruits }: TeamRecruitTabProps) {
  const openRecruits = recruits.filter((r) => r.status === 'OPEN');

  if (openRecruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">모집 중인 팀이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {openRecruits.map((recruit) => (
        <RecruitCard recruit={recruit} key={recruit.id} />
      ))}
    </div>
  );
}

function RecruitCard({ recruit }: { recruit: RecruitResponse }) {
  return (
    <Link
      href={`/recruit/${recruit.id}`}
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50/80"
    >
      {/* 팀 아이콘 */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Users className="h-5 w-5" />
      </div>

      {/* 팀 정보 */}
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
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {recruit.author.name}
            </span>
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

      {/* 화살표 */}
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
    </Link>
  );
}
