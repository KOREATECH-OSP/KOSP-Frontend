'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users } from 'lucide-react';
import type { TeamResponse, RecruitResponse } from '@/lib/api/types';

import TeamRecruitTab from './components/TeamRecruitTab';
import TeamListTab from './components/TeamListTab';
import MyTeamListTab from './components/MyTeamListTab';
import TabNavigation from '@/common/components/TabNavigation';

type TabType = '전체' | '등록팀' | '모집공고' | '나의팀';

interface TeamPageClientProps {
  initialTeams: TeamResponse[];
  initialRecruits: RecruitResponse[];
}

export default function TeamPageClient({
  initialTeams,
  initialRecruits,
}: TeamPageClientProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        {session && (
          <Link
            href="/team/create"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <Users className="mr-2 h-4 w-4" />
            새로운 팀 만들기
          </Link>
        )}
      </div>

      {/* 검색 및 탭 */}
      <div className="mb-8 space-y-6">
        {/* 검색바 */}
        <div className="w-full">
          <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ring-1 ring-black/5 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 기술스택 검색"
              className="flex-1 border-none bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base"
            />
            <div className="border-l border-gray-100 pl-2">
              <button
                type="button"
                className="m-1 inline-flex items-center justify-center rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <TabNavigation
          tabs={[
            { id: '전체', label: '전체' },
            { id: '등록팀', label: '등록된 팀' },
            { id: '모집공고', label: '모집 공고' },
            { id: '나의팀', label: '나의 팀' }
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
          className="border-b border-gray-200"
        />
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-[500px]">
        {activeTab === '전체' && (
          <TeamListTab
            teams={filteredTeams}
            recruits={filteredRecruits}
            onShowMoreRecruits={() => setActiveTab('모집공고')}
          />
        )}
        {activeTab === '등록팀' && (
          <TeamListTab
            teams={filteredTeams}
            recruits={[]} // Hide recruits section in this tab by passing empty array
            onShowMoreRecruits={() => { }}
          />
        )}
        {activeTab === '모집공고' && <TeamRecruitTab recruits={filteredRecruits} />}
        {activeTab === '나의팀' && <MyTeamListTab />}
      </div>
    </div>
  );
}
