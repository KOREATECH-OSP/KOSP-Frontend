'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, Search, Plus } from 'lucide-react';
import type { TeamResponse, RecruitResponse } from '@/lib/api/types';

import TeamRecruitTab from './components/TeamRecruitTab';
import TeamListTab from './components/TeamListTab';
import MyTeamListTab from './components/MyTeamListTab';

type TabType = '전체' | '등록팀' | '모집공고' | '나의팀';

interface TeamPageClientProps {
  initialTeams: TeamResponse[];
  initialRecruits: RecruitResponse[];
}

const TABS = [
  { id: '전체', label: '전체' },
  { id: '등록팀', label: '등록된 팀' },
  { id: '모집공고', label: '모집 공고' },
  { id: '나의팀', label: '나의 팀' },
] as const;

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

  const activeTabLabel = TABS.find((t) => t.id === activeTab)?.label;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Mobile Header & Tabs (< lg) */}
      <div className="lg:hidden">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">팀 찾기</h1>
            <p className="mt-1 text-sm text-gray-500">
              프로젝트를 함께할 팀을 찾거나 새로운 팀을 만들어보세요.
            </p>
          </div>
          {session && (
            <Link
              href="/team/create"
              className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              팀 만들기
            </Link>
          )}
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2">
            {TABS.map((tab) => {
              // Hide '나의 팀' if not logged in
              if (tab.id === '나의팀' && !session) return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop Sidebar (>= lg) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 px-2">팀게시판</h2>
              <div className="space-y-1">
                {TABS.map((tab) => {
                  // Hide '나의 팀' if not logged in
                  if (tab.id === '나의팀' && !session) return null;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {session && (
              <Link
                href="/team/create"
                className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 shadow-lg shadow-gray-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                새로운 팀 만들기
              </Link>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0">
          <div className="mb-6 space-y-4">
            {/* Desktop Section Header */}
            <div className="hidden lg:flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{activeTabLabel}</h2>
            </div>

            {/* Search Bar */}
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
                recruits={[]} // Hide recruits section in this tab
                onShowMoreRecruits={() => { }}
              />
            )}
            {activeTab === '모집공고' && <TeamRecruitTab recruits={filteredRecruits} />}
            {activeTab === '나의팀' && <MyTeamListTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
