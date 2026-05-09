'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, Trophy, Info, X } from 'lucide-react';

import Pagination from '@/common/components/Pagination';
import { SeasonRankingEntry, SeasonRankingListResponse, MySeasonRankingResponse } from '@/lib/api/types';
import { apiClient } from '@/lib/api';
import { getTierInfo, getTierStyle, getTierProgress, getNextTierRemaining } from './tierUtils';

// ─── Tier Badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier, size = 'sm' }: { tier: string; size?: 'sm' | 'md' }) {
  const { label } = getTierInfo(tier);
  const { badge } = getTierStyle(tier);
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs font-bold' : 'px-2 py-0.5 text-xs font-semibold';
  return (
    <span className={`inline-flex items-center rounded-full ${badge} ${sizeClass} tracking-wide`}>
      {label}
    </span>
  );
}

// ─── Score Progress Bar ────────────────────────────────────────────────────────

function ScoreBar({ score, tier, showLabel = false }: { score: number; tier: string; showLabel?: boolean }) {
  const { bar } = getTierStyle(tier);
  const progress = (score / 100) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-12 text-right text-xs text-gray-500">{score.toFixed(1)}pt</span>
      )}
    </div>
  );
}

// ─── Ranking Criteria Modal ────────────────────────────────────────────────────

const CRITERIA_ROWS = [
  { category: '출석', criteria: '로그인 시 0.01pt/일 + 스트릭 보너스', cap: '-' },
  { category: '스트릭 보너스', criteria: '7일:1pt / 30일:3pt / 50일:5pt / 100일:10pt', cap: '-' },
  { category: '커밋', criteria: '일 최대 3건 × 0.05pt (매일 04:00 재계산)', cap: '챌린지 합산 35pt' },
  { category: '챌린지', criteria: 'Tier 1~10 단가별 달성 건수 합산', cap: '커밋 합산 35pt' },
  { category: '프로젝트', criteria: '레벨별 2~10pt + 역할 보너스', cap: '30pt' },
  { category: '커뮤니티', criteria: '게시글 0.5pt/개', cap: '10pt' },
];

const TIER_CRITERIA = [
  { label: 'BRONZE 4~1', range: '0 ~ 10pt', color: 'bg-amber-100 text-amber-800' },
  { label: 'SILVER 4~1', range: '10 ~ 20pt', color: 'bg-slate-100 text-slate-700' },
  { label: 'GOLD 4~1', range: '20 ~ 35pt', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'PLATINUM 4~1', range: '35 ~ 55pt', color: 'bg-cyan-100 text-cyan-800' },
  { label: 'DIAMOND 4~1', range: '55 ~ 75pt', color: 'bg-blue-100 text-blue-800' },
  { label: 'MASTER 4~1', range: '75 ~ 90pt', color: 'bg-purple-100 text-purple-800' },
  { label: 'CHALLENGER', range: '90pt 이상', color: 'bg-rose-100 text-rose-800' },
];

function RankingCriteriaModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">랭킹 기준 안내</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <p className="mb-4 text-xs text-gray-500">
            총점 = min(출석 + min(커밋+챌린지, 35) + 프로젝트 + 커뮤니티, <strong>100pt</strong>)
            &nbsp;·&nbsp;매일 04:00 업데이트
          </p>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">점수 기준</h3>
          <div className="mb-5 overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">카테고리</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">기준</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">상한</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CRITERIA_ROWS.map((row) => (
                  <tr key={row.category} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-700">{row.category}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{row.criteria}</td>
                    <td className="px-3 py-2 text-right text-xs text-gray-500">{row.cap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">티어 구간</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TIER_CRITERIA.map((t) => (
              <div key={t.label} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${t.color}`}>{t.label}</span>
                <span className="ml-2 text-xs text-gray-500">{t.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My Ranking Card ───────────────────────────────────────────────────────────

function MyRankingCard({ myRanking }: { myRanking: MySeasonRankingResponse }) {
  const { label, min, max } = getTierInfo(myRanking.tier);
  const { bar, text } = getTierStyle(myRanking.tier);
  const remaining = getNextTierRemaining(myRanking.tier, myRanking.totalScore);
  const progressInTier = getTierProgress(myRanking.tier, myRanking.totalScore);

  const scoreItems = [
    { label: '출석', value: myRanking.attendanceScore },
    { label: '커밋', value: myRanking.commitScore },
    { label: '챌린지', value: myRanking.challengeScore },
    { label: '프로젝트', value: myRanking.projectScore },
    { label: '커뮤니티', value: myRanking.communityScore },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">내 랭킹</p>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-2xl font-black text-gray-800">
              #{myRanking.rank}
            </div>
            <div>
              <TierBadge tier={myRanking.tier} size="md" />
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myRanking.totalScore.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-gray-400">/ 100pt</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {scoreItems.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-[10px] text-gray-400">{item.label}</p>
                <p className="text-sm font-semibold text-gray-700">{item.value.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-gray-500">
            <span className={`font-medium ${text}`}>{label}</span>
            {remaining !== null ? (
              <span>다음 티어까지 <strong className="text-gray-700">{remaining.toFixed(1)}pt</strong></span>
            ) : (
              <span className="font-medium text-rose-600">최고 티어 달성</span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${bar}`}
              style={{ width: `${progressInTier}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{min}pt</span>
            <span>{max}pt</span>
          </div>
        </div>

        {myRanking.seasonName && (
          <p className="mt-3 text-xs text-gray-400">
            시즌: {myRanking.seasonName}
            {myRanking.endDate && ` · 종료일: ${myRanking.endDate}`}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Top 3 Cards ──────────────────────────────────────────────────────────────

const PODIUM_ORDER = [1, 0, 2] as const; // 2위, 1위, 3위 순서 (중앙 강조)
const MEDAL_CONFIG = [
  { icon: '🥇', bg: 'bg-yellow-50 border-yellow-200', rankText: 'text-yellow-600', heightClass: 'sm:pt-0' },
  { icon: '🥈', bg: 'bg-slate-50 border-slate-200', rankText: 'text-slate-500', heightClass: 'sm:pt-4' },
  { icon: '🥉', bg: 'bg-amber-50 border-amber-200', rankText: 'text-amber-600', heightClass: 'sm:pt-4' },
];

function Top3Cards({ entries }: { entries: SeasonRankingEntry[] }) {
  if (entries.length === 0) return null;
  const top3 = entries.slice(0, 3);

  return (
    <div className="grid grid-cols-3 gap-3">
      {PODIUM_ORDER.map((dataIdx) => {
        const entry = top3[dataIdx];
        const rankIdx = dataIdx; // 0=1위, 1=2위, 2=3위
        const config = MEDAL_CONFIG[rankIdx];
        if (!entry) return <div key={dataIdx} />;

        return (
          <div
            key={entry.userId}
            className={`${config.heightClass} flex flex-col items-center`}
          >
            <div
              className={`w-full rounded-2xl border ${config.bg} p-4 text-center transition-shadow hover:shadow-md`}
            >
              <div className="text-2xl">{config.icon}</div>
              <div className={`mt-1 text-xs font-bold ${config.rankText}`}>
                {entry.rank}위
              </div>
              <Link
                href={`/user/${entry.userId}`}
                className="mt-2 block truncate text-sm font-bold text-gray-800 hover:text-blue-600"
              >
                {entry.userName}
              </Link>
              <div className="mt-1.5 flex justify-center">
                <TierBadge tier={entry.tier} />
              </div>
              <p className="mt-2 text-base font-black text-gray-900">
                {entry.totalScore.toFixed(1)}
                <span className="text-xs font-normal text-gray-400">pt</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Ranking Table ─────────────────────────────────────────────────────────────

function RankingTable({
  entries,
  myRankPosition,
}: {
  entries: SeasonRankingEntry[];
  myRankPosition?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="hidden sm:grid sm:grid-cols-[56px_1fr_140px_100px_1fr] sm:items-center sm:gap-4 sm:border-b sm:border-gray-100 sm:bg-gray-50 sm:px-4 sm:py-2.5">
        <span className="text-xs font-medium text-gray-400">순위</span>
        <span className="text-xs font-medium text-gray-400">사용자</span>
        <span className="text-xs font-medium text-gray-400">티어</span>
        <span className="text-right text-xs font-medium text-gray-400">점수</span>
        <span className="text-xs font-medium text-gray-400">진행도</span>
      </div>

      <ul className="divide-y divide-gray-50">
        {entries.map((entry) => {
          const isMe = myRankPosition !== undefined && entry.rank === myRankPosition;
          return (
            <li
              key={`${entry.rank}-${entry.userId}`}
              className={`grid grid-cols-[40px_1fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:grid-cols-[56px_1fr_140px_100px_1fr] sm:gap-4 ${
                isMe ? 'bg-blue-50/50 hover:bg-blue-50' : ''
              }`}
            >
              {/* 순위 */}
              <span
                className={`text-sm font-bold ${
                  entry.rank === 1
                    ? 'text-yellow-500'
                    : entry.rank === 2
                      ? 'text-slate-500'
                      : entry.rank === 3
                        ? 'text-amber-600'
                        : 'text-gray-400'
                }`}
              >
                {entry.rank}
              </span>

              {/* 사용자 + 모바일 서브정보 */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/user/${entry.userId}`}
                    className="truncate text-sm font-semibold text-gray-800 hover:text-blue-600"
                  >
                    {entry.userName}
                  </Link>
                  {isMe && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                      나
                    </span>
                  )}
                </div>
                {/* 모바일에만 보이는 서브정보 */}
                <div className="mt-1 flex items-center gap-2 sm:hidden">
                  <TierBadge tier={entry.tier} />
                  <span className="text-xs font-semibold text-gray-600">{entry.totalScore.toFixed(1)}pt</span>
                </div>
                <div className="mt-1 sm:hidden">
                  <ScoreBar score={entry.totalScore} tier={entry.tier} />
                </div>
              </div>

              {/* 티어 (데스크탑) */}
              <div className="hidden sm:block">
                <TierBadge tier={entry.tier} />
              </div>

              {/* 점수 (데스크탑) */}
              <span className="hidden text-right text-sm font-bold text-gray-800 sm:block">
                {entry.totalScore.toFixed(1)}
                <span className="text-xs font-normal text-gray-400">pt</span>
              </span>

              {/* 진행도 (데스크탑) */}
              <div className="hidden sm:block">
                <ScoreBar score={entry.totalScore} tier={entry.tier} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Main Page Client ──────────────────────────────────────────────────────────

interface RankingPageClientProps {
  initialRankings: SeasonRankingListResponse;
  myRanking: MySeasonRankingResponse | null;
  isAuthenticated: boolean;
}

export default function RankingPageClient({
  initialRankings,
  myRanking,
  isAuthenticated,
}: RankingPageClientProps) {
  const [rankings, setRankings] = useState(initialRankings);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return rankings.entries;
    return rankings.entries.filter((e) =>
      e.userName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [rankings.entries, search]);

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient<SeasonRankingListResponse>(
        `/v1/seasons/current/rankings?page=${page - 1}&size=50`,
        { cache: 'no-store' },
      );
      setRankings(data);
      setCurrentPage(page);
      setSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // 실패 시 현재 페이지 유지
    } finally {
      setIsLoading(false);
    }
  };

  const top3 = initialRankings.entries.slice(0, 3);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">시즌 랭킹</h1>
            <p className="mt-1 text-sm text-gray-500">
              출석 · 커밋 · 챌린지 · 프로젝트 · 커뮤니티 활동 점수 기준
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3.5 w-3.5" />
              매일 04:00 업데이트
            </span>
            <button
              onClick={() => setShowCriteria(true)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              랭킹 기준
            </button>
          </div>
        </div>
      </div>

      {/* 내 랭킹 카드 */}
      {myRanking && (
        <div className="mb-6">
          <MyRankingCard myRanking={myRanking} />
        </div>
      )}
      {!isAuthenticated && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              로그인
            </Link>
            하면 내 랭킹을 확인할 수 있어요.
          </span>
        </div>
      )}

      {/* Top 3 */}
      {top3.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-gray-700">TOP 3</h2>
          </div>
          <Top3Cards entries={top3} />
        </div>
      )}

      {/* 검색 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="사용자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
        </div>
        {rankings.totalElements > 0 && (
          <span className="shrink-0 text-xs text-gray-400">
            총 {rankings.totalElements.toLocaleString()}명
          </span>
        )}
      </div>

      {/* 랭킹 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400">
          {search ? `'${search}' 검색 결과가 없습니다.` : '랭킹 데이터가 없습니다.'}
        </div>
      ) : (
        <RankingTable entries={filteredEntries} myRankPosition={myRanking?.rank} />
      )}

      {/* 페이지네이션 */}
      {!search && rankings.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={rankings.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 랭킹 기준 모달 */}
      {showCriteria && <RankingCriteriaModal onClose={() => setShowCriteria(false)} />}
    </main>
  );
}
