import { Suspense } from 'react';

import Header from '@/common/components/Header';
import Footer from '@/common/components/Footer';
import { ApiException } from '@/lib/api/client';
import { getMySeasonRanking, getSeasonRankings } from '@/lib/api';
import { auth } from '@/lib/auth/server';

import RankingPageClient from './RankingPageClient';

export const metadata = {
  title: '시즌 랭킹 | K-OSP',
  description: '현재 시즌 K-OSP 활동 점수 기반 전체 랭킹을 확인하세요.',
};

export default async function RankingPage() {
  const session = await auth();

  const [rankingsResult, myRankingResult] = await Promise.allSettled([
    getSeasonRankings({ page: 0, size: 50 }),
    session
      ? getMySeasonRanking({ accessToken: session.accessToken })
      : Promise.resolve(null),
  ]);

  const rankings =
    rankingsResult.status === 'fulfilled'
      ? rankingsResult.value
      : { seasonName: '', endDate: '', rankings: [], totalCount: 0, page: 0, size: 50 };

  const myRanking =
    myRankingResult.status === 'fulfilled'
      ? myRankingResult.value
      : myRankingResult.status === 'rejected' &&
          myRankingResult.reason instanceof ApiException &&
          myRankingResult.reason.status === 404
        ? null
        : null;

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
          initialRankings={rankings}
          myRanking={myRanking}
          isAuthenticated={!!session}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
