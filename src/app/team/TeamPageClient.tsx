'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, Search } from 'lucide-react';
import type { TeamResponse, RecruitResponse } from '@/lib/api/types';

import TeamRecruitTab from './components/TeamRecruitTab';
import TeamListTab from './components/TeamListTab';
import MyTeamListTab from './components/MyTeamListTab';

type TabType = '전체' | '모집중' | '나의팀';

interface TeamPageClientProps {
  initialTeams: TeamResponse[];
  initialRecruits: RecruitResponse[];
}

export default function TeamPageClient({
  initialTeams,
  initialRecruits,
}: TeamPageClientProps) {
  const { data: session } = useSession();
  // 모집공고가 있으면 '모집중' 탭을 기본으로, 없으면 '전체' 탭
  const [activeTab, setActiveTab] = useState<TabType>(
    initialRecruits.length > 0 ? '모집중' : '전체'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: TabType[] = ['전체', '모집중', '나의팀'];

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return initialTeams;
    const q = searchQuery.toLowerCase();
    return initialTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
        team.description.toLowerCase().includes(q) ||
        team.createdBy.toLowerCase().includes(q)
    );
  }, [initialTeams, searchQuery]);

  const filteredRecruits = useMemo(() => {
    if (!searchQuery.trim()) return initialRecruits;
    const q = searchQuery.toLowerCase();
    return initialRecruits.filter(
      (recruit) =>
        recruit.title.toLowerCase().includes(q) ||
        recruit.content.toLowerCase().includes(q) ||
        recruit.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [initialRecruits, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀 게시판</h1>
          <p className="mt-1 text-sm text-gray-500">
            함께 프로젝트를 진행할 팀원을 찾거나 팀을 둘러보세요
          </p>
        </div>
        {session && (
          <Link
            href="/team/create"
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Users className="mr-1.5 h-4 w-4" />
            팀 만들기
          </Link>
        )}
      </div>

      {/* 검색바 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="팀 이름, 설명으로 검색..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 탭 필터 */}
      <div className="mb-6 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {activeTab === '전체' && (
          <TeamListTab
            teams={filteredTeams}
            recruits={filteredRecruits}
            onShowMoreRecruits={() => setActiveTab('모집중')}
          />
        )}
        {activeTab === '모집중' && <TeamRecruitTab recruits={filteredRecruits} />}
        {activeTab === '나의팀' && <MyTeamListTab />}
      </div>
    </div>
  );
}
