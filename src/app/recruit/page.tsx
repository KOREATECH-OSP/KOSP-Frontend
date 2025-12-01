'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import TabNavigation, { Tab } from '@/common/components/TabNavigation';

import TeamRecruitTab from './components/TeamRecruitTab';
import TeamListTab from './components/TeamListTab';

import type { TeamRecruitment, Team } from '@/types/recruit';

export default function TeamRecruitPage() {
  const [activeTab, setActiveTab] = useState('팀모집');
  const [searchQuery, setSearchQuery] = useState('');

  const teamRecruits: TeamRecruitment[] = [ { id: 1, teamName: 'React 스터디 그룹', title: 'React 18 심화 스터디 멤버를 모집합니다!', positions: ['프론트엔드', '백엔드'], tags: ['React', 'Next.js', 'TypeScript', '스터디'], postedAt: '2024-11-28', postedBy: '김개발', status: '모집중', likes: 24, comments: 8, bookmarks: 12, views: 156, }, { id: 2, teamName: '오픈소스 컨트리뷰션 팀', title: 'Hacktoberfest 함께 참여하실 분 구합니다', positions: ['프론트엔드', '백엔드', 'DevOps'], tags: ['오픈소스', 'Git', 'GitHub', '프로젝트'], postedAt: '2024-11-27', postedBy: '이코드', status: '모집중', likes: 45, comments: 15, bookmarks: 28, views: 342, }, { id: 3, teamName: 'AI 연구 동아리', title: '머신러닝 스터디원 모집 (초보 환영)', positions: ['AI/ML'], tags: ['Python', 'TensorFlow', 'PyTorch', '머신러닝'], postedAt: '2024-11-25', postedBy: '박연구', status: '마감', likes: 67, comments: 23, bookmarks: 41, views: 521, }, ];
  const teams: Team[] = [ { id: 1, name: 'React 스터디 그룹', description: 'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.', memberCount: 5, createdBy: '김개발', }, { id: 2, name: '오픈소스 컨트리뷰션 팀', description: 'Hacktoberfest를 준비하며 함께 오픈소스에 기여하는 팀입니다.', memberCount: 3, createdBy: '이코드', }, { id: 3, name: 'AI 연구 동아리', description: '머신러닝과 딥러닝을 함께 연구하고 프로젝트를 진행하는 동아리입니다. 초보자도 환영하며, 매주 스터디와 세미나를 진행합니다.', memberCount: 8, createdBy: '박연구', }, ];

  const tabs: Tab[] = [
    { id: '팀모집', label: '팀원 모집' },
    { id: '전체팀', label: '전체 팀 목록' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">팀 모집</h1>
          <p className="text-sm sm:text-base text-gray-600">
            함께 프로젝트를 진행할 팀원을 찾거나 팀을 둘러보세요
          </p>
        </div>
        <Link
          href="/recruit/write"
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          팀원 모집하기
        </Link>
      </div>



      {/* 탭 네비게이션 */}
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 컨텐츠 */}
      {activeTab === '팀모집' && <TeamRecruitTab recruits={teamRecruits} searchQuery={searchQuery} />}
      {activeTab === '전체팀' && <TeamListTab teams={teams} searchQuery={searchQuery} />}
    </div>
  );
}