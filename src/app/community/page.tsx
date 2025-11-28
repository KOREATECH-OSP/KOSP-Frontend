'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, ThumbsUp, Search, Plus } from 'lucide-react';
import type { TabType } from '@/types/community';
import { posts } from '@/mocks/community/communityList.mock';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === '전체' || post.category === activeTab;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs: TabType[] = ['전체', '홍보', 'Q&A', '자유'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '홍보':
        return 'bg-purple-100 text-purple-700';
      case 'Q&A':
        return 'bg-blue-100 text-blue-700';
      case '자유':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
          <p className="text-gray-600">개발자들과 소통하고 정보를 나눠보세요</p>
        </div>

        {/* 검색 및 글쓰기 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="게시글 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
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

        <div className="">
          {/* gap-1.5 flex flex-col */}
          {/* space-y-4 */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">게시글이 없습니다.</p>
            </div>
          ) : (
              filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block bg-white px-6 pt-6 transition hover:shadow-2xs"
                // border-0 border-b border-b-gray-100
                >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                      {post.title}
                    </h2>
                  </div>
                </div>

                {/* <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.content}
                </p> */}

                {/* 태그 */}
                {/* {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )} */}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-700">{post.author}</span>
                    <span>{post.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments}
                    </span>
                  </div>
                    </div>
                    <div className='flex m-[-1] bg-gray-100 h-[1px] w-[1150px] mt-6'></div>
                  </Link>
            ))
          )}

        </div>

        {/* 페이지네이션 (추후 구현) */}
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