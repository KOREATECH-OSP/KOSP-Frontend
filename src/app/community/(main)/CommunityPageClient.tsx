'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth/AuthContext';
import { MessageSquare, Plus, Loader2, ChevronDown } from 'lucide-react';
import type { BoardResponse, ArticleResponse, PageMeta, ArticleListResponse } from '@/lib/api/types';
import Pagination from '@/common/components/Pagination';
import CommunityPostCard from '@/common/components/community/CommunityPostCard';
import { API_BASE_URL } from '@/lib/api/config';

type SortOrder = 'latest' | 'oldest';

interface CommunityPageClientProps {
  initialBoards: BoardResponse[];
  initialArticles: ArticleResponse[];
  initialPagination: PageMeta;
}

export default function CommunityPageClient({
  initialBoards,
  initialArticles,
  initialPagination,
}: CommunityPageClientProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [activeBoard, setActiveBoard] = useState<number | null>(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortArticles = (posts: ArticleResponse[], order: SortOrder) => {
    return [...posts].sort((a, b) => {
      // 고정 게시글은 항상 최상단
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 날짜 정렬
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'latest' ? dateB - dateA : dateA - dateB;
    });
  };

  const [articles, setArticles] = useState<ArticleResponse[]>(sortArticles(initialArticles, 'latest'));
  // Pagination state (API는 0-based, UI는 1-based)
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage + 1);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);

  const [isLoading, setIsLoading] = useState(false);

  const fetchArticles = (boardId: number, page: number, order: SortOrder = sortOrder) => {
    setIsLoading(true);
    const headers: HeadersInit = {};
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles?boardId=${boardId}&page=${page - 1}&size=10`, {
        headers,
      })
        .then((res) => res.json())
        .then((data: ArticleListResponse) => {
          setArticles(sortArticles(data.posts, order));
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage + 1);
        })
        .catch((error) => {
          console.error('게시글 조회 실패:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    setIsDropdownOpen(false);
    setArticles(sortArticles(articles, order));
  };

  const handleBoardChange = (boardId: number | null) => {
    if (boardId === null) return; // 전체 보기 미지원 시
    setActiveBoard(boardId);
    setCurrentPage(1);
    fetchArticles(boardId, 1);
  };

  const handlePageChange = (page: number) => {
    if (activeBoard) {
      fetchArticles(activeBoard, page);
    }
  };

  const activeBoardName = initialBoards.find((b) => b.id === activeBoard)?.name;
  const isNoticeBoard = activeBoardName === '공지사항';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Mobile Header & Tabs (< lg) */}
      <div className="lg:hidden">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
            <p className="mt-1 text-sm text-gray-500">
              개발자들과 소통하고 정보를 나눠보세요
            </p>
          </div>
          {session && !isNoticeBoard && (
            <Link
              href="/community/write"
              className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              글쓰기
            </Link>
          )}
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2">
            {initialBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => handleBoardChange(board.id)}
                disabled={isPending || isLoading}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${activeBoard === board.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {board.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop Sidebar (>= lg) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 px-2">커뮤니티</h2>
              <div className="space-y-1">
                {initialBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => handleBoardChange(board.id)}
                    disabled={isPending || isLoading}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${activeBoard === board.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>

            {session && !isNoticeBoard && (
              <Link
                href="/community/write"
                className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 shadow-lg shadow-gray-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                새 글 작성하기
              </Link>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0">
          <div className="mb-6 hidden lg:flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{activeBoardName}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">총 {initialPagination.totalItems}개의 글</span>
              {/* 정렬 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'latest' ? '최신순' : '오래된순'}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-28 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <button
                        onClick={() => handleSortChange('latest')}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${sortOrder === 'latest' ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                      >
                        최신순
                      </button>
                      <button
                        onClick={() => handleSortChange('oldest')}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${sortOrder === 'oldest' ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                      >
                        오래된순
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 모바일 정렬 */}
          <div className="mb-4 flex justify-end lg:hidden">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'latest' ? '최신순' : '오래된순'}
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-28 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => handleSortChange('latest')}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${sortOrder === 'latest' ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                    >
                      최신순
                    </button>
                    <button
                      onClick={() => handleSortChange('oldest')}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${sortOrder === 'oldest' ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                    >
                      오래된순
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isPending || isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-20 text-center">
                <MessageSquare className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-gray-500 font-medium">게시글이 없습니다.</p>
                <p className="mt-1 text-sm text-gray-400">
                  첫 번째 게시글을 작성해보세요!
                </p>
              </div>
            ) : (
              articles.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  boardName={undefined} // Already in board specific view, usually reduntant unless 'All' view
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages >= 1 && articles.length > 0 && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
