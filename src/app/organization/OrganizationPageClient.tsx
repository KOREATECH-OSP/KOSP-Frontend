'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Share2, Heart } from 'lucide-react';
import { useState } from 'react';
import type { OrganizationResponse, OrganizationType } from '@/lib/api/organization';
import { ORGANIZATION_TYPE_LABELS } from '@/lib/api/organization';
import OrganizationCard from '@/common/components/organization/OrganizationCard';

interface OrganizationPageClientProps {
  allOrganizations: OrganizationResponse[];
  myOrganizations: OrganizationResponse[];
  activeTab: 'all' | 'mine';
}

export default function OrganizationPageClient({
  allOrganizations,
  myOrganizations,
  activeTab,
}: OrganizationPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrganizationType | null>(null);

  const TYPE_FILTERS: { value: OrganizationType | null; label: string }[] = [
    { value: null, label: '전체' },
    { value: 'RESEARCH_LAB', label: ORGANIZATION_TYPE_LABELS.RESEARCH_LAB },
    { value: 'CLUB', label: ORGANIZATION_TYPE_LABELS.CLUB },
    { value: 'DEPARTMENT', label: ORGANIZATION_TYPE_LABELS.DEPARTMENT },
    { value: 'OTHER', label: ORGANIZATION_TYPE_LABELS.OTHER },
  ];

  const organizations = activeTab === 'mine' ? myOrganizations : allOrganizations;
  const filtered = organizations.filter((org) => {
    if (typeFilter && org.organizationType !== typeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      org.displayName.toLowerCase().includes(q) ||
      org.githubOrgName.toLowerCase().includes(q)
    );
  });

  function handleTabChange(tab: 'all' | 'mine') {
    router.push(`/organization?tab=${tab}`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        {/* 좌측 사이드바 */}
        <aside className="w-56 flex-shrink-0">
          <div className="pb-4 pt-6 px-2">
            <h2 className="text-[24px] font-bold text-[#101828] leading-[1.5]">조직</h2>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => handleTabChange('all')}
              className={[
                'w-full h-12 rounded-[6px] px-2 text-left text-[17px] transition-colors',
                activeTab === 'all'
                  ? 'bg-[#f3f4f6] text-[#101828] font-semibold'
                  : 'text-[#6a7282] hover:bg-gray-50',
              ].join(' ')}
            >
              전체
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={[
                'w-full h-12 rounded-[6px] px-2 text-left text-[17px] transition-colors',
                activeTab === 'mine'
                  ? 'bg-[#f3f4f6] text-[#101828] font-semibold'
                  : 'text-[#6a7282] hover:bg-gray-50',
              ].join(' ')}
            >
              내 조직
            </button>
          </nav>

          <div className="mt-6">
            <Link
              href="/organization/register"
              className="flex w-full h-12 items-center justify-center gap-1 rounded-[6px] bg-black px-4 text-[17px] text-white transition hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'mine' ? '새로운 조직 만들기' : '조직 등록하기'}
            </Link>
          </div>
        </aside>

        {/* 우측 메인 */}
        <div className="flex-1 min-w-0">
          <div className="py-6 flex flex-col gap-4">
            <h1 className="text-[24px] font-bold text-[#131416] leading-[1.5]">
              {activeTab === 'mine' ? '내 조직' : '전체'}
            </h1>

            {/* 검색창 */}
            <div className="relative">
              <input
                type="text"
                placeholder="검색어를 입력해주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[8px] border border-[#cdd1d5] bg-white py-4 pl-4 pr-12 text-[17px] text-gray-700 placeholder-[#99a1af] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 leading-[1.5]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>

            {/* 조직 유형 필터 */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_FILTERS.map(({ value, label }) => (
                <button
                  key={value ?? 'all'}
                  onClick={() => setTypeFilter(value)}
                  className={[
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    typeFilter === value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-[#cdd1d5] text-[#6a7282] hover:bg-gray-50',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 카드 그리드 */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <p className="text-base font-medium text-gray-500">
                {searchQuery ? '검색 결과가 없습니다.' : '등록된 조직이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((org) => (
                <OrganizationCard key={org.id} organization={org} fromTab={activeTab} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
