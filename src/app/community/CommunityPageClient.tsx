'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Plus, Search, Loader2 } from 'lucide-react';
import type { BoardResponse, ArticleResponse, PageMeta, ArticleListResponse } from '@/lib/api/types';
import { SORT_OPTIONS, type SortType } from '@/types/community';
import Pagination from '@/common/components/Pagination';
import CommunityPostCard from '@/common/components/community/CommunityPostCard';
import { API_BASE_URL } from '@/lib/api/config';

const POSTS_PER_PAGE = 15;

interface CommunityPageClientProps {
  initialBoards: BoardResponse[];
  initialArticles: ArticleResponse[];
  initialPagination: PageMeta;
}

const sortPosts = (posts: ArticleResponse[], sortBy: SortType): ArticleResponse[] => {
  const sorted = [...posts];
  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.views - a.views);
    case 'comments':
      return sorted.sort((a, b) => b.comments - a.comments);
    case 'latest':
    default:
      return sorted;
  }
};

export default function CommunityPageClient({
  initialBoards,
  initialArticles,
  initialPagination,
}: CommunityPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [activeBoard, setActiveBoard] = useState<number | null>(1);
  const [articles, setArticles] = useState<ArticleResponse[]>(initialArticles);
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [isLoading, setIsLoading] = useState(initialArticles.length === 0);

  // pagination은 서버 페이지네이션용으로 향후 사용
  void initialPagination;

  // 초기 데이터가 없으면 클라이언트에서 fetch
  useEffect(() => {
    if (initialArticles.length === 0) {
      fetch(`${API_BASE_URL}/v1/community/articles?boardId=1`)
        .then((res) => res.json())
        .then((data: ArticleListResponse) => {
          setArticles(data.posts);
        })
        .catch((error) => {
          console.error('게시글 조회 실패:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialArticles.length]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const boards = initialBoards;

  const handleBoardChange = (boardId: number | null) => {
    setActiveBoard(boardId);
    setCurrentPage(1);
    setSearchQuery('');

    if (boardId === null) {
      // 전체 게시글은 아직 미지원 - 첫 번째 게시판 기본값
      return;
    }

    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles?boardId=${boardId}`)
        .then((res) => res.json())
        .then((data: ArticleListResponse) => {
          setArticles(data.posts);
        })
        .catch((error) => {
          console.error('게시글 조회 실패:', error);
        });
    });
  };

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = articles.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return sortPosts(filtered, sortBy);
  }, [articles, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredAndSortedPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const handleSortChange = (sort: SortType) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const activeBoardName = boards.find((b) => b.id === activeBoard)?.name;

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
        {/* 게시판 탭 */}
        <div className="flex gap-1 overflow-x-auto">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => handleBoardChange(board.id)}
              disabled={isPending}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                activeBoard === board.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {board.name}
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
        {isPending || isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : currentPosts.length === 0 ? (
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
              <CommunityPostCard
                key={post.id}
                post={post}
                boardName={activeBoardName}
              />
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
