'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import TabNavigation, { Tab } from '@/common/components/TabNavigation';

import TeamRecruitTab from './components/TeamRecruitTab';
import TeamListTab from './components/TeamListTab';
import MyTeamListTab from './components/MyTeamListTab';

import type { TeamRecruitment, Team } from '@/types/recruit';

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const teams: Team[] = [ 
    { 
      id: 1, 
      name: 'React 스터디 그룹', 
      description: 'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.', 
      memberCount: 5, 
      createdBy: '김개발',
    }, 
    { 
      id: 2, 
      name: '오픈소스 컨트리뷰션 팀', 
      description: 'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.', 
      memberCount: 3, 
      createdBy: '이코드', 
    }, 
    { 
      id: 3, 
      name: 'AI 연구 동아리', 
      description: '머신러닝과 딥러닝을 함께 연구하고 프로젝트를 진행하는 동아리입니다. 초보자도 환영하며, 매주 스터디와 세미나를 진행합니다.', 
      memberCount: 8, 
      createdBy: '박연구', 
    }, 
  ];

  const teamRecruits: TeamRecruitment[] = [ 
    { 
      id: 1, 
      name: 'React 스터디 그룹', 
      description: 'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.', 
      memberCount: 3, 
      createdBy: '이코드', 
      positions: ['프론트엔드', '백엔드'], 
    }, 
    { 
      id: 2, 
      name: '오픈소스 컨트리뷰션 팀', 
      description: 'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.', 
      memberCount: 3, 
      createdBy: '이코드', 
      positions: ['프론트엔드', '백엔드', 'DevOps'], 
    }, 
    { 
      id: 3, 
      name: 'AI 연구 동아리',
      description: '머신러닝과 딥러닝을 함께 연구하고 프로젝트를 진행하는 동아리입니다. 초보자도 환영하며, 매주 스터디와 세미나를 진행합니다.', 
      memberCount: 8, 
      createdBy: '박연구',
      positions: ['AI/ML'], 
    }, 
  ];

  const tabs: Tab[] = [
    { id: '전체', label: '전체' },
    { id: '모집중', label: '모집중' },
    { id: '나의팀', label: '나의 팀' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">팀 게시판</h1>
          <p className="text-sm sm:text-base text-gray-600">
            함께 프로젝트를 진행할 팀원을 찾거나 팀을 둘러보세요
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/team/create"
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F28A03] text-white rounded-lg hover:bg-[#d97706] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            팀 만들기
          </Link>
        </div>
      </div>

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === '전체' && <TeamListTab teams={teams} searchQuery={searchQuery} />}
      {activeTab === '모집중' && <TeamRecruitTab teams={teamRecruits} searchQuery={searchQuery} />}
      {activeTab === '나의팀' && <MyTeamListTab />}
    </div>
  );
}