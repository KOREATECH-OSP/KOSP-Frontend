'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Trophy,
  TrendingUp,
  Zap,
  CheckCircle2,
  Loader2,
  LogIn,
} from 'lucide-react';
import { getChallenges } from '@/lib/api/challenge';
import type { ChallengeResponse } from '@/lib/api/types';
import Link from 'next/link';
import Image from 'next/image';

type CategoryFilter = 'all' | string;

export default function ChallengePage() {
  const { data: session, status } = useSession();
  const [challenges, setChallenges] = useState<ChallengeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    async function fetchChallenges() {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getChallenges({ accessToken: session.accessToken });
        setChallenges(response.challenges || []);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        setError('챌린지를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      fetchChallenges();
    }
  }, [session?.accessToken, status]);

  // 카테고리 목록 추출
  const categories = Array.from(new Set(challenges.map((c) => c.category)));

  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter((c) => c.isCompleted).length;
  const totalPoints = challenges
    .filter((c) => c.isCompleted)
    .reduce((sum, c) => sum + c.point, 0);

  const filteredChallenges =
    activeFilter === 'all'
      ? challenges
      : challenges.filter((c) => c.category === activeFilter);

  const getCategoryStyle = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('beginner') || lowerCategory.includes('초급')) {
      return { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]' };
    }
    if (lowerCategory.includes('intermediate') || lowerCategory.includes('중급')) {
      return { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]' };
    }
    if (lowerCategory.includes('advanced') || lowerCategory.includes('고급')) {
      return { bg: 'bg-[#f3e5f5]', text: 'text-[#7b1fa2]' };
    }
    if (lowerCategory.includes('special') || lowerCategory.includes('특별')) {
      return { bg: 'bg-[#fff3e0]', text: 'text-[#e65100]' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return '초급';
      case 2:
        return '중급';
      case 3:
        return '고급';
      case 4:
        return '특별';
      default:
        return `Tier ${tier}`;
    }
  };

  // 로그인 안 된 경우
  if (status === 'unauthenticated') {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center justify-center text-center px-4">
          <LogIn className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-gray-500 mb-6">챌린지를 확인하려면 로그인해주세요</p>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-5 py-6 sm:py-10">
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-5 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#191f28] leading-snug tracking-tight">
            챌린지
          </h1>
          <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15px] text-[#8b95a1]">
            다양한 도전 과제를 완료하고 포인트를 획득하세요
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="bg-[#f2f4f6] rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-[#8b95a1] mb-1 sm:mb-2">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>완료</span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[20px] sm:text-[28px] font-bold text-[#191f28]">{completedChallenges}</span>
              <span className="text-[12px] sm:text-[15px] text-[#8b95a1]">/{totalChallenges}</span>
            </div>
          </div>

          <div className="bg-[#f2f4f6] rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-[#8b95a1] mb-1 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>달성률</span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[20px] sm:text-[28px] font-bold text-[#191f28]">
                {totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0}
              </span>
              <span className="text-[12px] sm:text-[15px] text-[#8b95a1]">%</span>
            </div>
          </div>

          <div className="bg-[#f2f4f6] rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-[#8b95a1] mb-1 sm:mb-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>포인트</span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-[20px] sm:text-[28px] font-bold text-[#191f28]">{totalPoints.toLocaleString()}</span>
              <span className="text-[12px] sm:text-[15px] text-[#8b95a1]">P</span>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#191f28] text-white'
                : 'bg-[#f2f4f6] text-[#6b7684] hover:bg-[#e5e8eb]'
            }`}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-colors ${
                activeFilter === category
                  ? 'bg-[#191f28] text-white'
                  : 'bg-[#f2f4f6] text-[#6b7684] hover:bg-[#e5e8eb]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 챌린지 목록 */}
        <div className="space-y-2 sm:space-y-3">
          {filteredChallenges.map((challenge) => {
            const isCompleted = challenge.isCompleted;
            const style = getCategoryStyle(challenge.category);
            const progress = challenge.total > 0 ? Math.round((challenge.current / challenge.total) * 100) : 0;

            return (
              <div
                key={challenge.id}
                className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border bg-white transition-colors ${
                  isCompleted
                    ? 'border-[#b2dfdb] hover:border-[#80cbc4]'
                    : 'border-[#e5e8eb] hover:border-[#d1d6db]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* 이미지 또는 아이콘 */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden ${
                      isCompleted ? 'bg-[#e0f2f1]' : 'bg-[#f2f4f6]'
                    }`}
                  >
                    {challenge.imageUrl ? (
                      <Image
                        src={challenge.imageUrl}
                        alt={challenge.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${isCompleted ? 'text-[#00897b]' : 'text-[#6b7684]'}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#191f28]">{challenge.title}</h3>
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${style.bg} ${style.text}`}>
                        {challenge.category || getTierLabel(challenge.tier)}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium bg-[#e0f2f1] text-[#00897b]">
                          <CheckCircle2 className="w-3 h-3" />
                          완료
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] sm:text-[14px] text-[#6b7684] mb-3 line-clamp-2">{challenge.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[12px] sm:text-[13px] mb-1.5">
                          <span className="text-[#8b95a1] truncate mr-2">진행률</span>
                          <span className="font-medium text-[#191f28] whitespace-nowrap">
                            {challenge.current.toLocaleString()} / {challenge.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-[#26a69a]' : 'bg-[#3182f6]'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#fff8e1] rounded-xl self-start sm:self-auto">
                        <Zap className="w-4 h-4 text-[#f9a825]" />
                        <span className="text-[13px] sm:text-[14px] font-semibold text-[#f57f17]">
                          +{challenge.point.toLocaleString()}P
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-[#e5e8eb] mb-3 sm:mb-4" />
            <p className="text-[14px] sm:text-base text-[#8b95a1]">
              {challenges.length === 0 ? '등록된 챌린지가 없습니다' : '해당 카테고리의 챌린지가 없습니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
