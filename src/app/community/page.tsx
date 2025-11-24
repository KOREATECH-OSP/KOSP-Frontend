'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, ThumbsUp, Search, Plus } from 'lucide-react';

type TabType = '전체' | '홍보' | 'Q&A' | '자유';

interface Post {
  id: number;
  category: '홍보' | 'Q&A' | '자유';
  title: string;
  content: string;
  author: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  tags?: string[];
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 샘플 게시글 데이터
  const posts: Post[] = [
    {
      id: 1,
      category: '홍보',
      title: '2024 해커톤 참가자 모집합니다!',
      content: '다음 달 개최되는 해커톤에 함께할 팀원을 찾습니다...',
      author: '해커톤매니저',
      views: 342,
      likes: 23,
      comments: 12,
      createdAt: '2시간 전',
      tags: ['해커톤', '팀빌딩', '개발']
    },
    {
      id: 2,
      category: 'Q&A',
      title: 'React 상태관리 라이브러리 추천 부탁드립니다',
      content: '프로젝트에서 상태관리를 어떻게 해야할지 고민입니다...',
      author: '프론트개발자',
      views: 156,
      likes: 8,
      comments: 15,
      createdAt: '5시간 전',
      tags: ['React', '상태관리']
    },
    {
      id: 3,
      category: '자유',
      title: '개발자 커리어 고민 상담받습니다',
      content: '5년차 개발자입니다. 이직 관련 조언 나눠요!',
      author: '시니어개발자',
      views: 489,
      likes: 45,
      comments: 28,
      createdAt: '1일 전',
      tags: ['커리어', '이직']
    },
    {
      id: 4,
      category: 'Q&A',
      title: 'Docker 배포 관련 질문입니다',
      content: 'Docker로 배포할 때 환경변수 설정은 어떻게 하나요?',
      author: '주니어백엔드',
      views: 234,
      likes: 12,
      comments: 9,
      createdAt: '1일 전',
      tags: ['Docker', '배포']
    },
    {
      id: 5,
      category: '홍보',
      title: '오픈소스 프로젝트 기여자 모집',
      content: 'Next.js 기반 블로그 플랫폼 개발 중입니다',
      author: '오픈소스러버',
      views: 567,
      likes: 34,
      comments: 18,
      createdAt: '2일 전',
      tags: ['오픈소스', 'Next.js']
    },
    {
      id: 6,
      category: '자유',
      title: '코딩테스트 준비 스터디원 구합니다',
      content: '주 3회 온라인으로 모여서 문제 풀이 공유해요',
      author: '알고리즘마스터',
      views: 398,
      likes: 29,
      comments: 21,
      createdAt: '3일 전',
      tags: ['코딩테스트', '스터디']
    },
    {
      id: 7,
      category: 'Q&A',
      title: 'TypeScript 제네릭 사용법 질문',
      content: '제네릭을 활용한 타입 가드 패턴이 궁금합니다',
      author: 'TS초보',
      views: 178,
      likes: 15,
      comments: 11,
      createdAt: '3일 전',
      tags: ['TypeScript', '제네릭']
    },
    {
      id: 8,
      category: '자유',
      title: '개발자 북클럽 멤버 모집!',
      content: '클린 코드, 리팩토링 등의 책을 함께 읽어요',
      author: '책읽는개발자',
      views: 445,
      likes: 38,
      comments: 16,
      createdAt: '4일 전',
      tags: ['북클럽', '스터디']
    }
  ];

  // 탭에 따른 필터링
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
        {/* 헤더 */}
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