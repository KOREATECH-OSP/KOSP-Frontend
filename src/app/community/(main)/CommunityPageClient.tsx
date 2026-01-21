'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import type { BoardResponse, ArticleResponse, PageMeta, ArticleListResponse } from '@/lib/api/types';
import Pagination from '@/common/components/Pagination';
import CommunityPostCard from '@/common/components/community/CommunityPostCard';
import { API_BASE_URL } from '@/lib/api/config';

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

  const sortByPinned = (posts: ArticleResponse[]) => {
    return [...posts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  };

  const [articles, setArticles] = useState<ArticleResponse[]>(sortByPinned(initialArticles));
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);

  const [isLoading, setIsLoading] = useState(false);

  const fetchArticles = (boardId: number, page: number) => {
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
          setArticles(sortByPinned(data.posts));
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
        })
        .catch((error) => {
          console.error('게시글 조회 실패:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
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
            <span className="text-sm text-gray-500">총 {initialPagination.totalItems}개의 글</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {isPending || isLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : articles.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-20 text-center">
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
          {totalPages > 1 && (
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
