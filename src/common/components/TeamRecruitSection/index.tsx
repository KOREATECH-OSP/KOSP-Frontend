// TeamRecruitSection.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StatusTag from '../StatusTag';

export interface TeamRecruit {
  id: number;
  title: string;
  tags: string[];
  members: string;
  status: '마감임박' | '모집중' | string;
  deadline: string;
}

interface TeamRecruitSectionProps {
  teamRecruits: TeamRecruit[];
}

const STATUS_GRADIENTS: Record<string, string> = {
  마감임박: 'bg-gradient-to-l from-red-200/70 via-transparent',
  모집중: 'bg-gradient-to-l from-green-200/70 via-transparent',
};

const getStatusGradient = (status: string) =>
  STATUS_GRADIENTS[status] ?? '';

export function TeamRecruitSection({ teamRecruits }: TeamRecruitSectionProps) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
          <span>팀모집</span>
        </h2>
        <Link
          href="/recruit"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          전체보기 →
        </Link>
      </div>

      <div className="space-y-3">
        {teamRecruits.map((recruit) => (
          <TeamRecruitCard key={recruit.id} recruit={recruit} />
        ))}
      </div>
    </section>
  );
}

interface TeamRecruitCardProps {
  recruit: TeamRecruit;
}

function TeamRecruitCard({ recruit }: TeamRecruitCardProps) {
  const statusClass = getStatusGradient(recruit.status);

  return (
    <div className="relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200/70 bg-white pl-4 pr-12 py-4 transition-all duration-200 hover:border-gray-900/40 sm:px-5">
      {statusClass && (
        <div
          className={`pointer-events-none absolute inset-y-3 right-3 w-1/3 opacity-40 blur-xl ${statusClass}`}
        />
      )}

      <div className="relative z-10 mb-2 flex flex-col gap-1 text-[11px] text-gray-500 sm:text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <StatusTag recruit={recruit} />
          <span className="font-semibold text-gray-700">
            {recruit.deadline}
          </span>
          <span
            aria-hidden
            className="h-3 w-px bg-gray-300"
          />
          <span className="font-medium text-gray-700">
            {recruit.members}
          </span>
        </div>
      </div>

      <h3 className="relative z-10 mb-2 line-clamp-2 text-base font-semibold text-gray-900 sm:line-clamp-1">
        {recruit.title}
      </h3>

      <div className="relative z-10 flex flex-wrap gap-2 text-xs text-blue-700">
        {recruit.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-blue-50 px-2 py-1"
          >
            #{tag}
          </span>
        ))}
      </div>

      <ChevronRight
        className="absolute right-4 top-1/2 z-10 h-7 w-7 -translate-y-1/2 text-gray-900/70"
        aria-hidden="true"
      />
    </div>
  );
}
