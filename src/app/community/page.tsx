'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, ThumbsUp, Search, Plus, Star } from 'lucide-react';
import { posts } from '@/mocks/community/communityList.mock';
import type { TabType } from '@/types/community';
import Pagination from '@/common/components/Pagination';

const POSTS_PER_PAGE = 10;

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('홍보');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === '홍보' || post.category === activeTab;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // 탭이나 검색어 변경 시 첫 페이지로 이동
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const tabs: TabType[] = [ '홍보', '정보', 'Q&A', '자유'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '홍보':
        return 'bg-purple-100 text-purple-700';
      case '정보':
        return 'bg-green-100 text-green-700';
      case 'Q&A':
        return 'bg-blue-100 text-blue-700';
      case '자유':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
        <p className="text-gray-600">개발자들과 소통하고 정보를 나눠보세요</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="게시글 검색..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Link
          href="/community/write"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          글쓰기
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-6 min-w-max sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 리스트 */}
      <div className="min-h-[600px]">
        {currentPosts.length === 0 ? (
          <div className="bg-white rounded-lg text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-0 sm:bg-white sm:rounded-lg">
            {currentPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block bg-white sm:bg-transparent rounded-lg sm:rounded-none px-4 py-4 sm:px-6 sm:py-6 transition hover:bg-gray-50 shadow-sm sm:shadow-none"
              >
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span
                      className={` flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        post.category,
                      )}`}
                    >
                      {post.category}
                    </span>
                    <h2 className="truncate flex-1 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                      {post.title}
                    </h2>
                  </div>

                  {/* 작성자 정보 + 통계 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-gray-500">
                    {/* 작성자 & 날짜 */}
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700">{post.author}</span>
                      <span className="text-xs sm:text-sm">{post.createdAt}</span>
                    </div>

                    {/* 통계 정보 */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">{post.views}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">{post.comments}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">{post.bookmarks}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {index < currentPosts.length - 1 && (
                  <div className="hidden sm:block mt-6 border-b border-gray-100"></div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* {totalPages > 1 && ( */}
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      {/* )} */}
    </div>
  );
}