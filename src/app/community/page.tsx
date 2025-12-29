'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { posts } from '@/mocks/community/communityList.mock';
import type { TabType, Post } from '@/types/community';
import Pagination from '@/common/components/Pagination';
import CommunityPostCard from '@/common/components/community/CommunityPostCard';

const POSTS_PER_PAGE = 15;

type SortType = 'latest' | 'popular' | 'comments';

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'comments', label: '댓글순' },
];

const sortPosts = (posts: Post[], sortBy: SortType): Post[] => {
  const sorted = [...posts];
  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.views - a.views);
    case 'comments':
      return sorted.sort((a, b) => b.comments - a.comments);
    case 'latest':
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesTab = activeTab === '전체' || post.category === activeTab;
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
    return sortPosts(filtered, sortBy);
  }, [activeTab, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredAndSortedPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortType) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const tabs: TabType[] = ['전체', '홍보', '정보', 'Q&A', '자유'];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
          <p className="mt-1 text-sm text-gray-500">
            개발자들과 소통하고 정보를 나눠보세요
          </p>
        </div>
        <Link
          href="/community/write"
          className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          글쓰기
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
            placeholder="제목으로 검색..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 탭 필터 */}
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 정렬 옵션 */}
        <div className="flex items-center gap-1 text-sm">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`rounded px-2 py-1 transition-colors ${
                sortBy === option.value
                  ? 'font-medium text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 수 표시 */}
      <div className="mb-2 text-xs text-gray-400">
        총 {filteredAndSortedPosts.length}개의 게시글
      </div>

      {/* 게시글 리스트 */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {currentPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-500">게시글이 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        ) : (
          <div>
            {currentPosts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
