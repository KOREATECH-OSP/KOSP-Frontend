'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, Search } from 'lucide-react';
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
      {/* 헤더 */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀 찾기</h1>
          <p className="mt-2 text-sm text-gray-500">
            프로젝트를 함께할 팀을 찾거나 새로운 팀을 만들어보세요.
          </p>
        </div>

        {session && (
          <Link
            href="/team/create"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
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
          <div className="relative flex w-full items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 기술스택 검색"
              className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-base"
            />
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
