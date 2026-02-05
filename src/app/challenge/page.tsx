'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import {
  Trophy,
  Zap,
  CheckCircle2,
  Loader2,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { getChallenges } from '@/lib/api/challenge';
import type { ChallengeResponse } from '@/lib/api/types';
import Link from 'next/link';
import Image from 'next/image';
import KoriDistImage from '@/assets/images/kori/11-09 F 멀리보기 .png';
import { ChallengeIcon } from '@/common/utils/challengeIcons';

type TierFilter = 'all' | number;

const TIERS = [0, 1, 2, 3, 4, 5] as const;

export default function ChallengePage() {
  const { data: session, status } = useSession();
  const [challenges, setChallenges] = useState<ChallengeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TierFilter>('all');

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

  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter((c) => c.isCompleted).length;
  const totalPoints = challenges
    .filter((c) => c.isCompleted)
    .reduce((sum, c) => sum + c.point, 0);

  const filteredChallenges =
    activeFilter === 'all'
      ? challenges
      : challenges.filter((c) => c.tier === activeFilter);

  const getTierStyle = (tier: number) => {
    switch (tier) {
      case 0:
        return { bg: 'bg-amber-100', text: 'text-amber-800' }; // 브론즈
      case 1:
        return { bg: 'bg-gray-200', text: 'text-gray-700' }; // 실버
      case 2:
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' }; // 골드
      case 3:
        return { bg: 'bg-cyan-100', text: 'text-cyan-700' }; // 플래티넘
      case 4:
        return { bg: 'bg-sky-100', text: 'text-sky-700' }; // 다이아몬드
      case 5:
        return { bg: 'bg-rose-100', text: 'text-rose-700' }; // 루비
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 0:
        return '브론즈';
      case 1:
        return '실버';
      case 2:
        return '골드';
      case 3:
        return '플래티넘';
      case 4:
        return '다이아몬드';
      case 5:
        return '루비';
      default:
        return `Tier ${tier}`;
    }
  };

  // 로그인 안 된 경우
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50">
        <div className="relative mb-6">
          <Image
            src={KoriDistImage}
            alt="챌린지 로그인 안내"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">코리는 당신을 기다리고 있어요</h2>
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          시작하기 버튼을 눌러 로그인하세요
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          시작하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // 로딩 중
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
              <Trophy className="h-10 w-10 text-red-300" />
            </div>
            <p className="text-gray-900 font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="lg:hidden mb-8">
        <h1 className="text-2xl font-bold text-gray-900">챌린지</h1>
        <p className="mt-1 text-sm text-gray-500">
          다양한 도전 과제를 완료하고 포인트를 획득하세요
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Header (Desktop) */}
          <div className="hidden lg:block sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4 px-2">챌린지</h2>

            <div className="space-y-8">
              {/* Tiers */}
              <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeFilter === 'all'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  전체 보기
                </button>
                {TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setActiveFilter(tier)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeFilter === tier
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {getTierLabel(tier)}
                  </button>
                ))}
              </div>

              {/* Statistics Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  내 현황
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>완료</span>
                      <span className="font-medium text-gray-900">{completedChallenges}/{totalChallenges}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">달성률</span>
                    <span className="text-xl font-bold text-gray-900">
                      {totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">포인트</span>
                      <div className="relative group/tooltip">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10">
                          챌린지로 획득한 포인트만 표시됩니다
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-lg font-bold text-gray-900">{totalPoints.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0">
          {/* Header Info */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {activeFilter === 'all' ? '전체 챌린지' : getTierLabel(activeFilter)}
            </h2>
            <span className="text-sm text-gray-500">총 {filteredChallenges.length}개</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredChallenges.map((challenge) => {
              const isCompleted = challenge.isCompleted;
              const style = getTierStyle(challenge.tier);
              const progress = challenge.progress;

              return (
                <div
                  key={challenge.id}
                  className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      <ChallengeIcon
                        name={challenge.imageResource}
                        iconType={challenge.icon}
                        className={challenge.icon === 'IMAGE_URL' ? 'h-12 w-12' : 'h-6 w-6'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {challenge.title}
                        </h3>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}>
                          {getTierLabel(challenge.tier)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Zap className="h-3 w-3" />
                          +{challenge.point.toLocaleString()}P
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <p className="line-clamp-2 text-sm text-gray-500 mb-4 h-10">
                      {challenge.description}
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">진행률</span>
                        <span className="font-bold text-gray-900">{Math.min(progress, 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {challenges.length === 0 ? '등록된 챌린지가 없습니다' : '해당 티어의 챌린지가 없습니다'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">다른 티어를 선택하거나 나중에 다시 확인해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
