'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import type { GlobalSearchResponse } from '@/lib/api/types';

interface SearchPageClientProps {
  keyword: string;
  initialData: GlobalSearchResponse | null;
}

type TabType = 'ALL' | 'ARTICLE' | 'RECRUIT' | 'TEAM' | 'CHALLENGE';

export default function SearchPageClient({ keyword, initialData }: SearchPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  if (!keyword) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-center px-4">
        <p className="text-gray-500">검색어를 입력해주세요.</p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-center px-4">
        <p className="text-gray-500">검색 결과를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const { articles, recruits, teams, challenges } = initialData;

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'ALL', label: '전체', count: articles.length + recruits.length + teams.length + challenges.length },
    { key: 'ARTICLE', label: '게시글', count: articles.length },
    { key: 'RECRUIT', label: '모집공고', count: recruits.length },
    { key: 'TEAM', label: '팀', count: teams.length },
    { key: 'CHALLENGE', label: '챌린지', count: challenges.length },
  ];

  const renderArticles = () => (
    <div className="space-y-4">
      {articles.length === 0 ? (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      ) : (
        articles.map((item) => (
          <Link
            key={item.id}
            href={`/community/${item.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
          >
            <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{item.authorName}</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  const renderRecruits = () => (
    <div className="space-y-4">
      {recruits.length === 0 ? (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      ) : (
        recruits.map((item) => (
          <Link
            key={item.id}
            href={`/recruit/${item.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
               <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">모집중</span>
               <span className="text-xs text-gray-500">~{new Date(item.endDate).toLocaleDateString()}</span>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
            <div className="text-sm text-gray-500">{item.authorName}</div>
          </Link>
        ))
      )}
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-4">
      {teams.length === 0 ? (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      ) : (
        teams.map((item) => (
          <Link
            key={item.id}
            href={`/team/${item.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
          >
            <h3 className="mb-2 text-lg font-bold text-gray-900">{item.name}</h3>
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{item.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="h-4 w-4" />
              <span>{item.memberCount}명</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-4">
      {challenges.length === 0 ? (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      ) : (
        challenges.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600">
                    {item.tier}
                </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          &quot;<span className="text-blue-600">{keyword}</span>&quot; 검색 결과
        </h1>
      </div>

      {/* 탭 */}
      <div className="mb-6 overflow-x-auto border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 리스트 */}
      <div className="min-h-[300px]">
        {activeTab === 'ALL' && (
          <div className="space-y-8">
            {articles.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">게시글</h2>
                    {renderArticles()}
                </section>
            )}
            {recruits.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">모집공고</h2>
                    {renderRecruits()}
                </section>
            )}
            {teams.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">팀</h2>
                    {renderTeams()}
                </section>
            )}
            {challenges.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">챌린지</h2>
                    {renderChallenges()}
                </section>
            )}
            {articles.length === 0 && recruits.length === 0 && teams.length === 0 && challenges.length === 0 && (
                 <p className="py-16 text-center text-gray-500">검색 결과가 없습니다.</p>
            )}
          </div>
        )}
        {activeTab === 'ARTICLE' && renderArticles()}
        {activeTab === 'RECRUIT' && renderRecruits()}
        {activeTab === 'TEAM' && renderTeams()}
        {activeTab === 'CHALLENGE' && renderChallenges()}
      </div>
    </div>
  );
}
