import { getTeams, getBoards, getRecruits } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import TeamPageClient from './TeamPageClient';
import Link from 'next/link';

async function fetchTeamData() {
  try {
    const [teamsResponse, boardsResponse] = await Promise.all([
      getTeams(),
      getBoards(),
    ]);

    const recruitBoard = boardsResponse.boards.find((b) => b.isRecruitAllowed);
    const recruitsResponse = recruitBoard
      ? await getRecruits(recruitBoard.id)
      : { recruits: [], pagination: { currentPage: 0, totalPages: 1, totalItems: 0 } };

    return {
      teams: teamsResponse.teams,
      recruits: recruitsResponse.recruits,
      recruitPagination: recruitsResponse.pagination,
      recruitBoardId: recruitBoard?.id || 5,
      error: null,
    };
  } catch (error) {
    if (error instanceof ApiException && error.status === 401) {
      return { teams: [], recruits: [], recruitPagination: { currentPage: 0, totalPages: 1, totalItems: 0 }, recruitBoardId: 5, error: 'unauthorized' };
    }
    throw error;
  }
}

export default async function TeamPage() {
  const { teams, recruits, recruitPagination, recruitBoardId, error } = await fetchTeamData();

  if (error === 'unauthorized') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">로그인이 필요합니다</h1>
          <p className="mb-6 text-gray-500">팀 게시판을 이용하려면 로그인해주세요.</p>
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
    <TeamPageClient
      initialTeams={teams}
      initialRecruits={recruits}
      recruitPagination={recruitPagination}
      recruitBoardId={recruitBoardId}
    />
  );
}
