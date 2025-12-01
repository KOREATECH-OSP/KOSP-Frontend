'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Bookmark, Eye, User } from 'lucide-react';

import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import type { TeamRecruitment } from '@/types/recruit';

interface TeamRecruitTabProps {
  recruits: TeamRecruitment[];
  searchQuery: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case '모집중':
      return 'bg-green-100 text-green-700 border-green-200';
    case '마감':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return dateString;
};

export default function TeamRecruitTab({ recruits, searchQuery }: TeamRecruitTabProps) {
  const filtered = recruits.filter((recruit) => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();

    return (
      recruit.teamName.toLowerCase().includes(q) ||
      recruit.title.toLowerCase().includes(q) ||
      recruit.positions.some((p) => p.toLowerCase().includes(q)) ||
      recruit.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {filtered.map((recruit) => (
        <RecruitCard recruit={recruit} key={recruit.id} />
      ))}

      {filtered.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}

function RecruitCard({ recruit }: { recruit: TeamRecruitment }) {
  return (
    <Link
      href={`/recruit/${recruit.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* 이미지 */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
            {recruit.teamImageUrl ? (
              <Image 
                src={recruit.teamImageUrl} 
                alt={recruit.teamName} 
                fill 
                className="object-cover rounded-lg" 
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <Image src={KoriSupport} alt="team-icon" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            {/* 팀 이름 & 상태 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {recruit.teamName}
              </span>
              <span
                className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                  recruit.status,
                )}`}
              >
                {recruit.status}
              </span>
            </div>

            {/* 모집 제목 */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 hover:text-blue-600 line-clamp-2">
              {recruit.title}
            </h3>

            {/* 모집 포지션 */}
            <div className="mb-2 sm:mb-3">
              <p className="text-xs text-gray-500 mb-1.5 sm:mb-2">모집 포지션</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {recruit.positions.map((p, i) => (
                  <span 
                    key={i} 
                    className="px-2 sm:px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {recruit.tags.map((t, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  #{t}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{recruit.postedBy}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>{formatDate(recruit.postedAt)}</span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500">
                <Meta icon={<Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} value={recruit.likes} />
                <Meta icon={<MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} value={recruit.comments} />
                <Meta icon={<Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} value={recruit.bookmarks} />
                <Meta icon={<Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} value={recruit.views} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Meta({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span>{value}</span>
    </div>
  );
}