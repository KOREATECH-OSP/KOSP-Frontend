'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Search } from 'lucide-react';
import type { GlobalSearchResponse } from '@/lib/api/types';
import type { Session } from 'next-auth';
import Header from '@/common/components/Header';
import Footer from '@/common/components/Footer';


interface SearchPageClientProps {
  keyword: string;
  initialData: GlobalSearchResponse | null;
  session: Session | null;
}

type TabType = 'ALL' | 'ARTICLE' | 'RECRUIT' | 'TEAM' | 'CHALLENGE';

export default function SearchPageClient({ keyword, initialData, session }: SearchPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState(keyword);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!keyword) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header session={session} />
        {/* 검색 입력창 */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 rounded-xl bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B] px-6 py-3 font-medium text-white shadow-sm hover:opacity-90"
              >
                검색
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-center px-4">
          <p className="text-gray-500">검색어를 입력해주세요.</p>
          <Link href="/" className="mt-4 text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header session={session} />
        {/* 검색 입력창 */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 rounded-xl bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B] px-6 py-3 font-medium text-white shadow-sm hover:opacity-90"
              >
                검색
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-center px-4">
          <p className="text-gray-500">검색 결과를 불러오는데 실패했습니다.</p>
        </div>
        <Footer />
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
            <div className="text-sm text-gray-500">{item.teamName}</div>
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
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />

      {/* 검색 입력창 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <button
              type="submit"
              className="flex-shrink-0 rounded-xl bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B] px-6 py-3 font-medium text-white shadow-sm hover:opacity-90"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
                className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === tab.key
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
      </main>
      <Footer />
    </div>
  );
}
