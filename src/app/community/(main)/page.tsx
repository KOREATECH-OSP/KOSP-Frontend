import { Suspense } from 'react';
import { getBoards, getArticles } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import { auth } from '@/lib/auth/server';
import CommunityPageClient from './CommunityPageClient';
import Link from 'next/link';

async function fetchCommunityData(accessToken?: string) {
  try {
    const boardsResponse = await getBoards();
    const boards = boardsResponse.boards.filter((board) => !board.isRecruitAllowed);

    const defaultBoardId = 1;
    const articlesResponse = await getArticles(defaultBoardId, { accessToken });

    return { boards, articlesResponse, error: null };
  } catch (error) {
    if (error instanceof ApiException && error.status === 401) {
      return { boards: [], articlesResponse: null, error: 'unauthorized' };
    }
    throw error;
  }
}

export default async function CommunityPage() {
  const session = await auth();
  const { boards, articlesResponse, error } = await fetchCommunityData(session?.accessToken);

  if (error === 'unauthorized') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">로그인이 필요합니다</h1>
          <p className="mb-6 text-gray-500">커뮤니티를 이용하려면 로그인해주세요.</p>
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      }
    >
      <CommunityPageClient
        initialBoards={boards}
        initialArticles={articlesResponse?.posts ?? []}
        initialPagination={articlesResponse?.pagination ?? { currentPage: 1, totalPages: 1, totalItems: 0 }}
      />
    </Suspense>
  );
}
