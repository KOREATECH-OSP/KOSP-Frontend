import { Suspense } from 'react';

import Header from '@/common/components/Header';
import Footer from '@/common/components/Footer';
import { getMySeasonRanking, getMyGithubRanking, getSeasonRankings, getGithubRankings } from '@/lib/api';
import type { MyGithubRankingResponse } from '@/lib/api/types';
import { auth } from '@/lib/auth/server';

import RankingPageClient from './RankingPageClient';

export const metadata = {
  title: '시즌 랭킹 | K-OSP',
  description: '현재 시즌 K-OSP 활동 점수 기반 전체 랭킹을 확인하세요.',
};

export default async function RankingPage() {
  const session = await auth();

  const [seasonRankingsResult, githubRankingsResult, myRankingResult, myGithubRankingResult] = await Promise.allSettled([
    getSeasonRankings({ page: 0, size: 10 }),
    getGithubRankings({ page: 0, size: 10 }),
    session
      ? getMySeasonRanking({ accessToken: session.accessToken })
      : Promise.resolve(null),
    session
      ? getMyGithubRanking({ accessToken: session.accessToken })
      : Promise.resolve(null),
  ]);

  const seasonRankings =
    seasonRankingsResult.status === 'fulfilled'
      ? seasonRankingsResult.value
      : { seasonName: '', endDate: '', rankings: [], totalCount: 0, page: 0, size: 10 };

  const githubRankings =
    githubRankingsResult.status === 'fulfilled'
      ? githubRankingsResult.value
      : { rankings: [], totalCount: 0, page: 0, size: 10 };

  const myRanking =
    myRankingResult.status === 'fulfilled' ? myRankingResult.value : null;

  // 내 GitHub 랭킹: API 응답 우선, 실패 시 전체 랭킹 목록에서 탐색
  const myGithubRankingFromApi: MyGithubRankingResponse | null =
    myGithubRankingResult.status === 'fulfilled' ? myGithubRankingResult.value : null;

  const myGithubRanking: MyGithubRankingResponse | null = (() => {
    if (myGithubRankingFromApi) return myGithubRankingFromApi;
    if (!session) return null;
    const entry = githubRankings.rankings.find(
      (e) => e.userId === parseInt(session.user.id)
    );
    if (!entry) return null;
    return {
      rank: entry.rank,
      totalScore: entry.totalScore,
      activityScore: entry.activityScore,
      diversityScore: entry.diversityScore,
      impactScore: entry.impactScore,
    };
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
          </div>
        }
      >
        <RankingPageClient
          initialSeasonRankings={seasonRankings}
          initialGithubRankings={githubRankings}
          myRanking={myRanking}
          myGithubRanking={myGithubRanking}
          isAuthenticated={!!session}
          myUserId={session ? parseInt(session.user.id) : null}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
