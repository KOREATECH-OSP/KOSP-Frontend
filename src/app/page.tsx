import { getBoards, getArticles, getRecruits } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import { auth } from '@/auth';
import HomePageClient from './HomePageClient';
import type { ArticleResponse, RecruitResponse } from '@/lib/api/types';

async function fetchHomeData(): Promise<{
  articles: ArticleResponse[];
  recruits: RecruitResponse[];
}> {
  try {
    // 게시판 목록 조회
    const boardsResponse = await getBoards();

    // 일반 게시판에서 최신 글 4개 가져오기
    const generalBoard = boardsResponse.boards.find((b) => !b.isRecruitAllowed);
    const articlesResponse = generalBoard
      ? await getArticles(generalBoard.id, { size: 4 })
      : { posts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };

    // 모집공고 게시판에서 최신 모집글 4개 가져오기
    const recruitBoard = boardsResponse.boards.find((b) => b.isRecruitAllowed);
    const recruitsResponse = recruitBoard
      ? await getRecruits(recruitBoard.id, { size: 4 })
      : { recruits: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };

    return {
      articles: articlesResponse.posts,
      recruits: recruitsResponse.recruits,
    };
  } catch (error) {
    if (error instanceof ApiException && error.status === 401) {
      // 인증 필요한 경우 빈 데이터 반환
      return { articles: [], recruits: [] };
    }
    throw error;
  }
}

export default async function Home() {
  const [{ articles, recruits }, session] = await Promise.all([
    fetchHomeData(),
    auth(),
  ]);

  return <HomePageClient articles={articles} recruits={recruits} session={session} />;
}
