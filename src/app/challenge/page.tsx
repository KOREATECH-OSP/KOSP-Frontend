'use client';

import { useState } from 'react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  current: number;
  total: number;
  category: 'contribution' | 'learning' | 'community';
}

export default function ChallengePage() {
  const [challenges] = useState<Challenge[]>([
    {
      id: 1,
      title: 'First Contribution',
      description: '첫 번째 오픈소스 기여를 완료하세요',
      icon: '🌱',
      current: 1,
      total: 1,
      category: 'contribution'
    },
    {
      id: 2,
      title: 'Pull Request Master',
      description: '10개의 Pull Request를 생성하세요',
      icon: '🔀',
      current: 7,
      total: 10,
      category: 'contribution'
    },
    {
      id: 3,
      title: 'Issue Hunter',
      description: '20개의 이슈를 해결하세요',
      icon: '🎯',
      current: 12,
      total: 20,
      category: 'contribution'
    },
    {
      id: 4,
      title: 'Code Reviewer',
      description: '30개의 코드 리뷰를 작성하세요',
      icon: '👀',
      current: 5,
      total: 30,
      category: 'contribution'
    },
    {
      id: 5,
      title: 'Documentation Writer',
      description: '5개의 문서를 작성하거나 개선하세요',
      icon: '📝',
      current: 2,
      total: 5,
      category: 'learning'
    },
    {
      id: 6,
      title: 'Star Collector',
      description: '프로젝트에 50개의 스타를 받으세요',
      icon: '⭐',
      current: 23,
      total: 50,
      category: 'community'
    },
    {
      id: 7,
      title: 'Fork Master',
      description: '10개의 프로젝트를 Fork하세요',
      icon: '🍴',
      current: 10,
      total: 10,
      category: 'learning'
    },
    {
      id: 8,
      title: 'Commit Streak',
      description: '30일 연속으로 커밋하세요',
      icon: '🔥',
      current: 15,
      total: 30,
      category: 'contribution'
    },
    {
      id: 9,
      title: 'Community Helper',
      description: '50개의 댓글로 커뮤니티를 도와주세요',
      icon: '💬',
      current: 32,
      total: 50,
      category: 'community'
    },
    {
      id: 10,
      title: 'Language Explorer',
      description: '5가지 다른 프로그래밍 언어로 기여하세요',
      icon: '🌐',
      current: 3,
      total: 5,
      category: 'learning'
    },
    {
      id: 11,
      title: 'Open Source Advocate',
      description: '3명의 새로운 기여자를 초대하세요',
      icon: '🤝',
      current: 1,
      total: 3,
      category: 'community'
    }
  ]);

  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter(c => c.current >= c.total).length;
  const overallProgress = Math.round((challenges.reduce((sum, c) => sum + (c.current / c.total), 0) / totalChallenges) * 100);

  const getCategoryColor = (category: Challenge['category']) => {
    switch (category) {
      case 'contribution':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'learning':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'community':
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getCategoryName = (category: Challenge['category']) => {
    switch (category) {
      case 'contribution':
        return '기여';
      case 'learning':
        return '학습';
      case 'community':
        return '커뮤니티';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">도전 과제</h1>
          <p className="text-gray-600">
            오픈소스 활동을 통해 다양한 도전 과제를 완료하고 성장하세요
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">전체 진행도</h2>
              <p className="text-gray-600">
                <span className="text-2xl font-bold text-blue-600">{completedChallenges}</span>
                <span className="text-gray-400"> / {totalChallenges}</span>
                <span className="ml-2 text-sm">도전 과제 완료</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-500">평균 진행률</div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const progress = Math.round((challenge.current / challenge.total) * 100);
            const isCompleted = challenge.current >= challenge.total;

            return (
              <div
                key={challenge.id}
                className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  isCompleted 
                    ? 'border-green-300 bg-green-50/30' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{challenge.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {challenge.title}
                        </h3>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full border ${getCategoryColor(challenge.category)}`}>
                          {getCategoryName(challenge.category)}
                        </span>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-semibold text-gray-900">
                        {challenge.current} / {challenge.total}
                        <span className="ml-2 text-blue-600">({progress}%)</span>
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">도전 과제 안내</h3>
              <p className="text-sm text-blue-800">
                도전 과제는 여러분의 오픈소스 활동을 기록하고 성장을 돕기 위해 만들어졌습니다. 
                각 활동은 자동으로 추적되며, 완료된 도전 과제는 프로필에 뱃지로 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}