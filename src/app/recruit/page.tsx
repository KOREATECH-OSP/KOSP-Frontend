'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, MapPin, Search, Plus, Award, Code } from 'lucide-react';

type TabType = '팀모집' | '전체팀';

interface TeamRecruit {
  id: number;
  title: string;
  description: string;
  tags: string[];
  positions: string[];
  currentMembers: number;
  maxMembers: number;
  deadline: string;
  status: '모집중' | '마감임박' | '마감';
  author: string;
  createdAt: string;
  views: number;
}

interface Team {
  id: number;
  name: string;
  description: string;
  tags: string[];
  memberCount: number;
  projectCount: number;
  createdAt: string;
  isRecruiting: boolean;
}

export default function TeamRecruitPage() {
  const [activeTab, setActiveTab] = useState<TabType>('팀모집');
  const [searchQuery, setSearchQuery] = useState('');

  const teamRecruits: TeamRecruit[] = [
    {
      id: 1,
      title: '사이드 프로젝트 팀원 모집 (React, Node.js)',
      description: 'AI 기반 학습 관리 플랫폼을 함께 만들 팀원을 찾습니다. 장기 프로젝트이며 포트폴리오 제작에 좋습니다.',
      tags: ['React', 'Node.js', 'MongoDB', 'AI'],
      positions: ['프론트엔드', '백엔드', 'UI/UX'],
      currentMembers: 3,
      maxMembers: 5,
      deadline: 'D-7',
      status: '모집중',
      author: '프로젝트리더',
      createdAt: '2시간 전',
      views: 234
    },
    {
      id: 2,
      title: '스타트업 공동창업자 찾습니다',
      description: '에듀테크 스타트업 창업을 준비 중입니다. 기술 공동창업자를 찾고 있습니다.',
      tags: ['창업', 'EdTech', 'Full-Stack', 'AI'],
      positions: ['CTO', '풀스택 개발자'],
      currentMembers: 2,
      maxMembers: 4,
      deadline: 'D-14',
      status: '모집중',
      author: '스타트업대표',
      createdAt: '5시간 전',
      views: 456
    },
    {
      id: 3,
      title: '해커톤 참가 팀원 구합니다',
      description: '다음 주 해커톤에 참가할 팀원을 모집합니다. 경험자 우대합니다.',
      tags: ['Python', 'ML', 'Data', '해커톤'],
      positions: ['데이터 분석가', 'ML 엔지니어', '기획자'],
      currentMembers: 4,
      maxMembers: 5,
      deadline: 'D-3',
      status: '마감임박',
      author: '해커톤러버',
      createdAt: '1일 전',
      views: 789
    },
    {
      id: 4,
      title: '오픈소스 프로젝트 기여자 모집',
      description: 'Next.js 기반 블로그 플랫폼 오픈소스 프로젝트에 기여할 개발자를 찾습니다.',
      tags: ['Next.js', 'TypeScript', 'Tailwind'],
      positions: ['프론트엔드', '백엔드'],
      currentMembers: 5,
      maxMembers: 10,
      deadline: '상시모집',
      status: '모집중',
      author: '오픈소스메인테이너',
      createdAt: '2일 전',
      views: 567
    }
  ];

  // 샘플 전체팀 데이터
  const teams: Team[] = [
    {
      id: 1,
      name: 'DevNinjas',
      description: '웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.',
      tags: ['React', 'Node.js', 'AWS'],
      memberCount: 8,
      projectCount: 12,
      createdAt: '2023-01-15',
      isRecruiting: true
    },
    {
      id: 2,
      name: 'AI Innovators',
      description: '인공지능과 머신러닝에 특화된 팀입니다.',
      tags: ['Python', 'TensorFlow', 'PyTorch'],
      memberCount: 6,
      projectCount: 8,
      createdAt: '2023-03-20',
      isRecruiting: false
    },
    {
      id: 3,
      name: 'Mobile Masters',
      description: '모바일 앱 개발 전문 팀입니다.',
      tags: ['Flutter', 'React Native', 'Swift'],
      memberCount: 5,
      projectCount: 10,
      createdAt: '2023-05-10',
      isRecruiting: true
    },
    {
      id: 4,
      name: 'Cloud Architects',
      description: '클라우드 인프라와 DevOps에 강점이 있는 팀입니다.',
      tags: ['AWS', 'Docker', 'Kubernetes'],
      memberCount: 7,
      projectCount: 15,
      createdAt: '2023-02-28',
      isRecruiting: false
    },
    {
      id: 5,
      name: 'Design & Dev',
      description: '디자인과 개발을 함께하는 크리에이티브 팀입니다.',
      tags: ['Figma', 'React', 'Animation'],
      memberCount: 9,
      projectCount: 20,
      createdAt: '2023-04-05',
      isRecruiting: true
    }
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
            href="/team-recruit/write"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            팀원 모집하기
          </Link>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('팀모집')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === '팀모집'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              팀원 모집
            </button>
            <button
              onClick={() => setActiveTab('전체팀')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === '전체팀'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              전체 팀 목록
            </button>
          </div>
        </div>

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

                <div className="flex flex-wrap gap-2 mb-4">
                  {team.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      +{team.tags.length - 3}
                    </span>
                  )}
                </div>

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

        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg ${
                  page === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}