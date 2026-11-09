'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Share2, Heart } from 'lucide-react';
import { useState } from 'react';
import type { OrganizationResponse } from '@/lib/api/organization';
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

  const organizations = activeTab === 'mine' ? myOrganizations : allOrganizations;
  const filtered = organizations.filter((org) => {
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
          <h2 className="mb-4 text-xl font-bold text-gray-900">조직</h2>

          <nav className="space-y-1">
            <button
              onClick={() => handleTabChange('all')}
              className={[
                'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                activeTab === 'all'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              전체
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={[
                'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                activeTab === 'mine'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              내 조직
            </button>
          </nav>

          <div className="mt-4">
            <Link
              href="/organization/register"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'mine' ? '새로운 조직 만들기' : '조직 등록하기'}
            </Link>
          </div>
        </aside>

        {/* 우측 메인 */}
        <div className="flex-1 min-w-0">
          <h1 className="mb-4 text-xl font-bold text-gray-900">
            {activeTab === 'mine' ? '내 조직' : '전체'}
          </h1>

          {/* 검색창 */}
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-12 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
