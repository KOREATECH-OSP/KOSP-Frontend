'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Search, Plus } from 'lucide-react';
import TabNavigation, { Tab } from '@/common/components/TabNavigation';
import { teamRecruits } from '@/mocks/recruit/teamRecruitList.mock';
import { teams } from '@/mocks/recruit/teamList.mock';


export default function TeamRecruitPage() {
  const [activeTab, setActiveTab] = useState('팀모집');
  const [searchQuery, setSearchQuery] = useState('');

  // 탭 정의
  const tabs: Tab[] = [
    { id: '팀모집', label: '팀원 모집' },
    { id: '전체팀', label: '전체 팀 목록' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '모집중':
        return 'bg-green-100 text-green-700 border-green-200';
      case '마감임박':
        return 'bg-red-100 text-red-700 border-red-200';
      case '마감':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">팀 모집</h1>
          <p className="text-gray-600">함께 프로젝트를 진행할 팀원을 찾거나 팀을 둘러보세요</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="팀, 기술스택 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Link
            href="/recruit/write"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            팀원 모집하기
          </Link>
        </div>

        {/* Tab Navigation - 공통 컴포넌트 사용 */}
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* 팀원 모집 탭 */}
        {activeTab === '팀모집' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamRecruits.map((recruit) => (
              <Link
                key={recruit.id}
                href={`/team-recruit/${recruit.id}`}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(recruit.status)}`}>
                    {recruit.status}
                  </span>
                  <span className="text-sm text-gray-500">{recruit.deadline}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
                  {recruit.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {recruit.description}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">모집 포지션:</p>
                  <div className="flex flex-wrap gap-2">
                    {recruit.positions.map((position, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {recruit.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {recruit.currentMembers}/{recruit.maxMembers}명
                    </span>
                    <span>{recruit.createdAt}</span>
                  </div>
                  <span className="text-xs text-gray-500">조회 {recruit.views}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 전체 팀 탭 */}
        {activeTab === '전체팀' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/team-recruit/team/${team.id}`}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  {team.isRecruiting && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      모집중
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
                  {team.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {team.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {team.memberCount}명
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}