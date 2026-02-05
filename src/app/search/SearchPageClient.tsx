'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Users, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { GlobalSearchResponse, UserSearchSummary } from '@/lib/api/types';
import type { AuthSession } from '@/lib/auth/types';
import Header from '@/common/components/Header';
import Footer from '@/common/components/Footer';
import { ensureEncodedUrl } from '@/lib/utils';

interface SearchPageClientProps {
  keyword: string;
  initialData: GlobalSearchResponse | null;
  session: AuthSession | null;
}

type TabType = 'ALL' | 'ARTICLE' | 'RECRUIT' | 'TEAM' | 'CHALLENGE' | 'USER';

const MAX_ITEMS_ALL_TAB = 10; // 전체 탭에서 각 카테고리별 최대 개수
const PAGE_SIZE_OPTIONS = [20, 50, 100];

// 사용자 아바타 컴포넌트
function UserAvatar({ user, size = 'md' }: { user: UserSearchSummary; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  if (user.profileImageUrl) {
    return (
      <Image
        src={ensureEncodedUrl(user.profileImageUrl)}
        alt={user.name}
        width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
        height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500`}>
      <span className={`${textSizeClasses[size]} font-medium text-white`}>
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// 사용자 카드 - 그리드 레이아웃용 컴팩트 디자인
function UserCard({ user }: { user: UserSearchSummary }) {
  return (
    <Link
      href={`/user/${user.id}`}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
    >
      <UserAvatar user={user} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">{user.name}</h3>
        {user.githubLogin && (
          <p className="truncate text-sm text-gray-500">@{user.githubLogin}</p>
        )}
        {user.githubName && user.githubName !== user.name && (
          <p className="truncate text-xs text-gray-400">{user.githubName}</p>
        )}
      </div>
    </Link>
  );
}

// 전체 탭용 사용자 미니 카드
function UserMiniCard({ user }: { user: UserSearchSummary }) {
  return (
    <Link
      href={`/user/${user.id}`}
      className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 transition hover:border-gray-200 hover:bg-white"
    >
      <UserAvatar user={user} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
        {user.githubLogin && (
          <p className="truncate text-xs text-gray-500">@{user.githubLogin}</p>
        )}
      </div>
    </Link>
  );
}

// 검색 입력 폼 컴포넌트
function SearchForm({
  searchQuery,
  setSearchQuery,
  onSubmit,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 팀, 사용자를 검색해보세요."
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
  );
}

// 페이지네이션 컴포넌트
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  const endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="text-sm text-gray-500">
        총 {totalItems}개 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${
              currentPage === page
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function SearchPageClient({ keyword, initialData, session }: SearchPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState(keyword);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // 검색어 없는 경우
  if (!keyword) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header session={session} />
        <SearchForm searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleSearch} />
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

  // 데이터 로드 실패
  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header session={session} />
        <SearchForm searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleSearch} />
        <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-center px-4">
          <p className="text-gray-500">검색 결과를 불러오는데 실패했습니다.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { articles, recruits, teams, challenges, users = [] } = initialData;

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'ALL', label: '전체', count: articles.length + recruits.length + teams.length + challenges.length + users.length },
    { key: 'ARTICLE', label: '게시글', count: articles.length },
    { key: 'RECRUIT', label: '모집공고', count: recruits.length },
    { key: 'TEAM', label: '팀', count: teams.length },
    { key: 'CHALLENGE', label: '챌린지', count: challenges.length },
    { key: 'USER', label: '사용자', count: users.length },
  ];

  // 페이지네이션 헬퍼
  const getPaginatedItems = <T,>(items: T[], isAllTab: boolean): { paginatedItems: T[]; totalPages: number } => {
    if (isAllTab) {
      return { paginatedItems: items.slice(0, MAX_ITEMS_ALL_TAB), totalPages: 1 };
    }

    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return { paginatedItems, totalPages };
  };

  // 더보기 링크
  const renderSeeMoreLink = (tab: TabType, count: number) => {
    if (count <= MAX_ITEMS_ALL_TAB) return null;

    return (
      <button
        onClick={() => handleTabChange(tab)}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <span>전체 {count}개 보기</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  };

  const renderArticles = (isAllTab: boolean) => {
    const { paginatedItems, totalPages } = getPaginatedItems(articles, isAllTab);

    if (paginatedItems.length === 0) {
      return <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>;
    }

    return (
      <>
        <div className="space-y-4">
          {paginatedItems.map((item) => (
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
          ))}
        </div>
        {!isAllTab && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={articles.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  const renderRecruits = (isAllTab: boolean) => {
    const { paginatedItems, totalPages } = getPaginatedItems(recruits, isAllTab);

    if (paginatedItems.length === 0) {
      return <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>;
    }

    return (
      <>
        <div className="space-y-4">
          {paginatedItems.map((item) => (
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
          ))}
        </div>
        {!isAllTab && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={recruits.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  const renderTeams = (isAllTab: boolean) => {
    const { paginatedItems, totalPages } = getPaginatedItems(teams, isAllTab);

    if (paginatedItems.length === 0) {
      return <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>;
    }

    return (
      <>
        <div className="space-y-4">
          {paginatedItems.map((item) => (
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
          ))}
        </div>
        {!isAllTab && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={teams.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  const renderChallenges = (isAllTab: boolean) => {
    const { paginatedItems, totalPages } = getPaginatedItems(challenges, isAllTab);

    if (paginatedItems.length === 0) {
      return <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>;
    }

    return (
      <>
        <div className="space-y-4">
          {paginatedItems.map((item) => (
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
          ))}
        </div>
        {!isAllTab && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={challenges.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  const renderUsers = (isAllTab: boolean) => {
    const { paginatedItems, totalPages } = getPaginatedItems(users, isAllTab);

    if (paginatedItems.length === 0) {
      return <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>;
    }

    // 전체 탭에서는 컴팩트한 그리드 레이아웃
    if (isAllTab) {
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {paginatedItems.map((user) => (
            <UserMiniCard key={user.id} user={user} />
          ))}
        </div>
      );
    }

    // 개별 탭에서는 더 자세한 카드 그리드
    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={users.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />

      <SearchForm searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSubmit={handleSearch} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            &quot;<span className="text-blue-600">{keyword}</span>&quot; 검색 결과
          </h1>
        </div>

        {/* 탭 */}
        <div className="mb-6 overflow-x-auto border-b border-gray-200">
          <div className="flex gap-4 sm:gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === tab.key
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

        {/* 페이지 크기 선택 (전체 탭 제외) */}
        {activeTab !== 'ALL' && (
          <div className="mb-6 flex items-center justify-end gap-2">
            <span className="text-sm text-gray-500">표시 개수:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}개
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 결과 리스트 */}
        <div className="min-h-[300px]">
          {activeTab === 'ALL' && (
            <div className="space-y-8">
              {users.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">사용자</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {users.length}
                    </span>
                  </div>
                  {renderUsers(true)}
                  {renderSeeMoreLink('USER', users.length)}
                </section>
              )}
              {articles.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">게시글</h2>
                  {renderArticles(true)}
                  {renderSeeMoreLink('ARTICLE', articles.length)}
                </section>
              )}
              {recruits.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">모집공고</h2>
                  {renderRecruits(true)}
                  {renderSeeMoreLink('RECRUIT', recruits.length)}
                </section>
              )}
              {teams.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">팀</h2>
                  {renderTeams(true)}
                  {renderSeeMoreLink('TEAM', teams.length)}
                </section>
              )}
              {challenges.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">챌린지</h2>
                  {renderChallenges(true)}
                  {renderSeeMoreLink('CHALLENGE', challenges.length)}
                </section>
              )}
              {articles.length === 0 && recruits.length === 0 && teams.length === 0 && challenges.length === 0 && users.length === 0 && (
                <p className="py-16 text-center text-gray-500">검색 결과가 없습니다.</p>
              )}
            </div>
          )}
          {activeTab === 'ARTICLE' && renderArticles(false)}
          {activeTab === 'RECRUIT' && renderRecruits(false)}
          {activeTab === 'TEAM' && renderTeams(false)}
          {activeTab === 'CHALLENGE' && renderChallenges(false)}
          {activeTab === 'USER' && renderUsers(false)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
