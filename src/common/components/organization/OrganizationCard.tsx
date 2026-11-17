import Link from 'next/link';
import Image from 'next/image';
import { Building2, Share2, Heart } from 'lucide-react';
import type { OrganizationResponse } from '@/lib/api/organization';

interface OrganizationCardProps {
  organization: OrganizationResponse;
  fromTab?: 'all' | 'mine';
}

export default function OrganizationCard({ organization, fromTab = 'all' }: OrganizationCardProps) {
  const tags = organization.tags
    ? organization.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
      {/* 상단: 아바타 + 이름 + 공유/찜 */}
      <div className="flex items-start gap-6">
        <Link href={`/organization/${organization.id}?from=${fromTab}`} className="flex-shrink-0">
          <div className="relative h-[57px] w-[57px] overflow-hidden rounded-[6px] bg-gray-100 border border-gray-100">
            {organization.avatarUrl ? (
              <Image
                src={organization.avatarUrl}
                alt={organization.displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Building2 className="h-6 w-6" />
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link href={`/organization/${organization.id}?from=${fromTab}`} className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-bold text-[#1e2124] hover:text-blue-600 transition-colors leading-[1.5]">
                {organization.displayName}
              </p>
            </Link>
            {/* 공유하기 / 찜하기 */}
            <div className="flex items-center gap-4 flex-shrink-0 h-8">
              <button
                className="flex items-center gap-1 text-[15px] text-[#1e2124] hover:text-gray-600 transition-colors"
                title="공유하기"
              >
                <Share2 className="h-4 w-4" />
                공유하기
              </button>
              <button
                className="flex items-center gap-1 text-[15px] text-[#1e2124] hover:text-red-500 transition-colors"
                title="찜하기"
              >
                <Heart className="h-4 w-4" />
                찜하기
              </button>
            </div>
          </div>
          {organization.description && (
            <p className="text-[15px] text-[#464c53] line-clamp-1 leading-[1.5]">{organization.description}</p>
          )}
        </div>
      </div>

      {/* 구분선 + 태그 */}
      <div className="border-t border-[#cdd1d5] pt-4 flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center h-8 rounded-full border border-[#cdd1d5] px-[10px] text-[15px] text-[#1e2124] leading-[1.5]"
            >
              #{tag}
            </span>
          ))
        ) : (
          <span className="text-[15px] text-gray-300">태그 없음</span>
        )}
      </div>
    </div>
  );
}
