'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Search } from 'lucide-react';

import TeamRecruitTab from './components/TeamRecruitTab';
import TeamListTab from './components/TeamListTab';
import MyTeamListTab from './components/MyTeamListTab';

import type { TeamRecruitment, Team } from '@/types/recruit';

type TabType = '전체' | '모집중' | '나의팀';

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const teams: Team[] = [
    {
      id: 1,
      name: 'React 스터디 그룹',
      description:
        'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.',
      memberCount: 5,
      createdBy: '김개발',
    },
    {
      id: 2,
      name: '오픈소스 컨트리뷰션 팀',
      description:
        'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.',
      memberCount: 3,
      createdBy: '이코드',
    },
    {
      id: 3,
      name: 'AI 연구 동아리',
      description:
        '머신러닝과 딥러닝을 함께 연구하고 프로젝트를 진행하는 동아리입니다. 초보자도 환영하며, 매주 스터디와 세미나를 진행합니다.',
      memberCount: 8,
      createdBy: '박연구',
    },
  ];

  const teamRecruits: TeamRecruitment[] = [
    {
      id: 1,
      name: 'React 스터디 그룹',
      description:
        'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.',
      memberCount: 3,
      createdBy: '이코드',
      positions: ['프론트엔드', '백엔드'],
    },
    {
      id: 2,
      name: '오픈소스 컨트리뷰션 팀',
      description:
        'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.',
      memberCount: 3,
      createdBy: '이코드',
      positions: ['프론트엔드', '백엔드', 'DevOps'],
    },
    {
      id: 3,
      name: 'AI 연구 동아리',
      description:
        '머신러닝과 딥러닝을 함께 연구하고 프로젝트를 진행하는 동아리입니다. 초보자도 환영하며, 매주 스터디와 세미나를 진행합니다.',
      memberCount: 8,
      createdBy: '박연구',
      positions: ['AI/ML'],
    },
  ];

  const tabs: TabType[] = ['전체', '모집중', '나의팀'];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

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
        <Link
          href="/team/create"
          className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Users className="mr-1.5 h-4 w-4" />
          팀 만들기
        </Link>
      </div>

      {/* 검색바 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            onClick={() => handleTabChange(tab)}
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
          <TeamListTab teams={teams} searchQuery={searchQuery} />
        )}
        {activeTab === '모집중' && (
          <TeamRecruitTab teams={teamRecruits} searchQuery={searchQuery} />
        )}
        {activeTab === '나의팀' && <MyTeamListTab />}
      </div>
    </div>
  );
}
