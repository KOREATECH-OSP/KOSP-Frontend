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
  const [articles, setArticles] = useState<ArticleResponse[]>(initialArticles);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  
  const [isLoading, setIsLoading] = useState(false);

  // If initialArticles is empty but totalItems > 0 (unlikely for page 1), or if we just want to ensure sync

  const fetchArticles = (boardId: number, page: number) => {
    setIsLoading(true);
    startTransition(() => {
      fetch(`${API_BASE_URL}/v1/community/articles?boardId=${boardId}&page=${page}&size=10`)
        .then((res) => res.json())
        .then((data: ArticleListResponse) => {
          setArticles(data.posts);
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
        {session && (
          <Link
            href="/community/write"
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            글쓰기
          </Link>
        )}
      </div>

      {/* 게시판 탭 */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
        {initialBoards.map((board) => (
          <button
            key={board.id}
            onClick={() => handleBoardChange(board.id)}
            disabled={isPending || isLoading}
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

      {/* 게시글 리스트 */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {isPending || isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-500">게시글이 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        ) : (
          <div>
            {articles.map((post) => (
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
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
