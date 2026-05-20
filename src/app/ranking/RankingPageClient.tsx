'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, Trophy, Info, X } from 'lucide-react';

import {
  SeasonRankingEntry,
  SeasonRankingListResponse,
  MySeasonRankingResponse,
  MyGithubRankingResponse,
  GithubRankingEntry,
  GithubRankingListResponse,
} from '@/lib/api/types';
import { apiClient } from '@/lib/api';
import { getTierInfo, getTierStyle, getTierProgress, getNextTierRemaining } from './tierUtils';
import { getRankFromScore } from '@/common/components/GithubRankCard';

// ─── Tab ───────────────────────────────────────────────────────────────────────

type TabType = 'season' | 'github';

const TABS: { id: TabType; label: string; sub: string }[] = [
  { id: 'season', label: '시즌 랭킹', sub: '활동 점수 기반' },
  { id: 'github', label: '전체 랭킹', sub: '전체 기간 기여 기반' },
];

// ─── Tier Badge (시즌) ─────────────────────────────────────────────────────────

function SeasonTierBadge({ tier, size = 'sm' }: { tier: string; size?: 'sm' | 'md' }) {
  const { label } = getTierInfo(tier);
  const { badge } = getTierStyle(tier);
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs font-bold' : 'px-2 py-0.5 text-xs font-semibold';
  return (
    <span className={`inline-flex items-center rounded-full ${badge} ${sizeClass} tracking-wide`}>
      {label}
    </span>
  );
}

// ─── GitHub Tier Badge ─────────────────────────────────────────────────────────

const GITHUB_TIER_STYLE: Record<string, { badge: string; label: string }> = {
  challenger: { badge: 'bg-rose-100 text-rose-800 border border-rose-200', label: 'CHALLENGER' },
  diamond:    { badge: 'bg-blue-100 text-blue-800 border border-blue-200', label: 'DIAMOND' },
  platinum:   { badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200', label: 'PLATINUM' },
  gold:       { badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'GOLD' },
  silver:     { badge: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'SILVER' },
  bronze:     { badge: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'BRONZE' },
};

function GithubTierBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  const rank = getRankFromScore(score);
  const { badge, label } = GITHUB_TIER_STYLE[rank];
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs font-bold' : 'px-2 py-0.5 text-xs font-semibold';
  return (
    <span className={`inline-flex items-center rounded-full ${badge} ${sizeClass} tracking-wide`}>
      {label}
    </span>
  );
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────

function SeasonScoreBar({ score, tier }: { score: number; tier: string }) {
  const { bar } = getTierStyle(tier);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function GithubScoreBar({ score }: { score: number }) {
  const rank = getRankFromScore(score);
  const barColor: Record<string, string> = {
    challenger: 'bg-gradient-to-r from-rose-400 to-pink-400',
    diamond: 'bg-blue-400',
    platinum: 'bg-cyan-400',
    gold: 'bg-yellow-400',
    silver: 'bg-slate-400',
    bronze: 'bg-amber-400',
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor[rank]}`}
        style={{ width: `${(score / 9) * 100}%` }}
      />
    </div>
  );
}

// ─── Ranking Criteria Modal ────────────────────────────────────────────────────

const SEASON_CRITERIA_ROWS = [
  { category: '출석', criteria: '로그인 시 0.01pt/일 + 스트릭 보너스', cap: '-' },
  { category: '스트릭 보너스', criteria: '7일:1pt / 30일:3pt / 50일:5pt / 100일:10pt', cap: '-' },
  { category: '커밋', criteria: '일 최대 3건 × 0.05pt (매일 04:00 재계산)', cap: '챌린지 합산 35pt' },
  { category: '챌린지', criteria: 'Tier 1~10 단가별 달성 건수 합산', cap: '커밋 합산 35pt' },
  { category: '프로젝트', criteria: '레벨별 2~10pt + 역할 보너스', cap: '30pt' },
  { category: '커뮤니티', criteria: '게시글 0.5pt/개', cap: '10pt' },
];

const SEASON_TIER_CRITERIA = [
  { label: 'BRONZE 4~1', range: '0 ~ 10pt', color: 'bg-amber-100 text-amber-800' },
  { label: 'SILVER 4~1', range: '10 ~ 20pt', color: 'bg-slate-100 text-slate-700' },
  { label: 'GOLD 4~1', range: '20 ~ 35pt', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'PLATINUM 4~1', range: '35 ~ 55pt', color: 'bg-cyan-100 text-cyan-800' },
  { label: 'DIAMOND 4~1', range: '55 ~ 75pt', color: 'bg-blue-100 text-blue-800' },
  { label: 'MASTER 4~1', range: '75 ~ 90pt', color: 'bg-purple-100 text-purple-800' },
  { label: 'CHALLENGER', range: '90pt 이상', color: 'bg-rose-100 text-rose-800' },
];

const GITHUB_TIER_CRITERIA = [
  { label: 'CHALLENGER', range: '7.5 ~ 9pt', color: 'bg-rose-100 text-rose-800' },
  { label: 'DIAMOND', range: '6 ~ 7.5pt', color: 'bg-blue-100 text-blue-800' },
  { label: 'PLATINUM', range: '4.5 ~ 6pt', color: 'bg-cyan-100 text-cyan-800' },
  { label: 'GOLD', range: '3 ~ 4.5pt', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'SILVER', range: '1.5 ~ 3pt', color: 'bg-slate-100 text-slate-700' },
  { label: 'BRONZE', range: '0 ~ 1.5pt', color: 'bg-amber-100 text-amber-800' },
];

function RankingCriteriaModal({ tab, onClose }: { tab: TabType; onClose: () => void }) {
  const isGithub = tab === 'github';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">
            {isGithub ? '전체 랭킹 기준 안내' : '시즌 랭킹 기준 안내'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {isGithub ? (
            <>
              <p className="mb-4 text-xs text-gray-500">
                총점 = 활동 수준(0~3pt) + 활동 다양성(0~1pt) + 활동 영향성(0~5pt) · <strong>최대 9pt</strong>
              </p>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">점수 기준</h3>
              <div className="mb-5 overflow-hidden rounded-xl border border-gray-100 text-sm">
                <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">활동 수준 (최대 3pt)</div>
                <div className="divide-y divide-gray-50">
                  {[
                    ['3pt', '커밋 100+ AND PR 20+ (단일 저장소 기준)'],
                    ['2pt', '커밋 30+ AND PR 5+'],
                    ['1pt', '커밋 5+ OR PR 1+'],
                  ].map(([pt, desc]) => (
                    <div key={pt} className="flex justify-between px-3 py-2">
                      <span className="font-semibold text-gray-700">{pt}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">다양성 점수 (최대 1pt)</div>
                <div className="divide-y divide-gray-50">
                  {[
                    ['1.0pt', '기여 저장소 10개 이상'],
                    ['0.7pt', '5~9개'],
                    ['0.4pt', '2~4개'],
                  ].map(([pt, desc]) => (
                    <div key={pt} className="flex justify-between px-3 py-2">
                      <span className="font-semibold text-gray-700">{pt}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">영향력 점수 (최대 5pt)</div>
                <div className="divide-y divide-gray-50">
                  {[
                    ['+2.0pt', '내 소유 저장소 100+ 스타'],
                    ['+1.5pt', '1000+ 스타 저장소에 PR 머지'],
                    ['+1.0pt', '머지된 PR로 이슈 10개+ 클로즈'],
                    ['+0.5pt', '크로스 저장소 PR 머지'],
                  ].map(([pt, desc]) => (
                    <div key={pt} className="flex justify-between px-3 py-2">
                      <span className="font-semibold text-gray-700">{pt}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-xs text-gray-500">
                총점 = min(출석 + min(커밋+챌린지, 35) + 프로젝트 + 커뮤니티, <strong>100pt</strong>) · 매일 04:00 업데이트
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
                    {SEASON_CRITERIA_ROWS.map((row) => (
                      <tr key={row.category} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">{row.category}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{row.criteria}</td>
                        <td className="px-3 py-2 text-right text-xs text-gray-500">{row.cap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">티어 구간</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(isGithub ? GITHUB_TIER_CRITERIA : SEASON_TIER_CRITERIA).map((t) => (
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

// ─── My Season Ranking Card ────────────────────────────────────────────────────

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
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">내 시즌 랭킹</p>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-xl font-black text-gray-800">
              {myRanking.rank}위
            </div>
            <div>
              <SeasonTierBadge tier={myRanking.tier} size="md" />
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myRanking.totalScore.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-gray-400">/ 100pt</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
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
            <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${progressInTier}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{min}pt</span><span>{max}pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My GitHub Ranking Card ────────────────────────────────────────────────────

function MyGithubRankingCard({ myRanking }: { myRanking: MyGithubRankingResponse }) {
  const rank = getRankFromScore(myRanking.totalScore);
  const { badge, label } = GITHUB_TIER_STYLE[rank];
  const barColor: Record<string, string> = {
    challenger: 'bg-gradient-to-r from-rose-400 to-pink-400',
    diamond: 'bg-blue-400',
    platinum: 'bg-cyan-400',
    gold: 'bg-yellow-400',
    silver: 'bg-slate-400',
    bronze: 'bg-amber-400',
  };

  const scoreItems = [
    { label: '활동', value: myRanking.activityScore, max: 3 },
    { label: '다양성', value: myRanking.diversityScore, max: 1 },
    { label: '영향력', value: myRanking.impactScore, max: 5 },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">내 전체 랭킹</p>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-xl font-black text-gray-800">
              {myRanking.rank}위
            </div>
            <div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${badge}`}>
                {label}
              </span>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myRanking.totalScore.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-gray-400">/ 9pt</span>
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
            <span className="font-medium">{label}</span>
            <span>최대 <strong className="text-gray-700">9pt</strong></span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor[rank]}`}
              style={{ width: `${(myRanking.totalScore / 9) * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>0pt</span><span>9pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Medal Badge ───────────────────────────────────────────────────────────────

// ─── Shield Badge ──────────────────────────────────────────────────────────────

function ShieldBadge({ rank }: { rank: number }) {
  const base  = rank === 1 ? '#F5B731' : rank === 2 ? '#9CA3AF' : '#B45309';
  const light = rank === 1 ? '#FCCF50' : rank === 2 ? '#C9CDD4' : '#D4824A';
  const gid = `sg${rank}`;

  return (
    <svg width="40" height="46" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={light} />
          <stop offset="100%" stopColor={base}  />
        </linearGradient>
      </defs>
      {/* 방패 외형: 상단 둥근 모서리 + 하단 뾰족 */}
      <path
        d="M6 0 L34 0 Q40 0 40 6 L40 30 L20 46 L0 30 L0 6 Q0 0 6 0 Z"
        fill={`url(#${gid})`}
      />
      {/* 상단 하이라이트 */}
      <path
        d="M6 0 L34 0 Q40 0 40 6 L40 16 Q20 22 0 16 L0 6 Q0 0 6 0 Z"
        fill="white"
        fillOpacity="0.15"
      />
      {/* 숫자 */}
      <text
        x="20"
        y="23"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="16"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {rank}
      </text>
    </svg>
  );
}

// ─── Top 3 상위권 카드 ──────────────────────────────────────────────────────────

function Top3Cards({ entries, type }: { entries: SeasonRankingEntry[] | GithubRankingEntry[]; type: TabType }) {
  if (entries.length === 0) return null;
  const top3 = entries.slice(0, 3);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* 카드 헤더 */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-semibold text-gray-700">전체 랭킹 상위권</span>
      </div>
      {/* 3분할 */}
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {top3.map((entry, idx) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 px-6 py-5 ${
              idx < top3.length - 1 ? 'border-b border-gray-100 sm:border-b-0 sm:border-r' : ''
            }`}
          >
            {/* 프로필 이미지 */}
            <div className="h-14 w-14 shrink-0 rounded-full bg-gray-100" />
            {/* 티어 + 이름 */}
            <div className="min-w-0 flex-1">
              {type === 'season'
                ? <SeasonTierBadge tier={(entry as SeasonRankingEntry).tier} />
                : <GithubTierBadge score={(entry as GithubRankingEntry).totalScore} />
              }
              <Link
                href={`/user/${entry.userId}`}
                className="mt-1 block truncate text-sm font-bold text-gray-800 hover:text-blue-600"
              >
                {entry.userName || '이름 없음'}
              </Link>
            </div>
            {/* 순위 방패 */}
            <ShieldBadge rank={entry.rank} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Season Ranking Table ──────────────────────────────────────────────────────

function SeasonRankingTable({ entries, myRankPosition }: { entries: SeasonRankingEntry[]; myRankPosition?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="hidden sm:grid sm:grid-cols-[56px_1fr_140px_100px_1fr] sm:items-center sm:gap-4 sm:border-b sm:border-gray-100 sm:bg-gray-50 sm:px-4 sm:py-2.5">
        <span className="text-xs font-medium text-gray-400">순위</span>
        <span className="text-xs font-medium text-gray-400">사용자</span>
        <span className="text-xs font-medium text-gray-400">티어</span>
        <span className="text-xs font-medium text-gray-400">점수</span>
        <span className="text-xs font-medium text-gray-400">진행도</span>
      </div>
      <ul className="divide-y divide-gray-50">
        {entries.map((entry) => {
          const isMe = myRankPosition !== undefined && entry.rank === myRankPosition;
          return (
            <li key={`${entry.rank}-${entry.userId}`}
              className={`grid grid-cols-[40px_1fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:grid-cols-[56px_1fr_140px_100px_1fr] sm:gap-4 ${isMe ? 'bg-blue-50/50 hover:bg-blue-50' : ''}`}
            >
              <span className={`text-sm font-bold ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-slate-500' : entry.rank === 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                {entry.rank}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/user/${entry.userId}`} className="truncate text-sm font-semibold text-gray-800 hover:text-blue-600">{entry.userName}</Link>
                  {isMe && <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">나</span>}
                </div>
                <div className="mt-1 flex items-center gap-2 sm:hidden">
                  <SeasonTierBadge tier={entry.tier} />
                  <span className="text-xs font-semibold text-gray-600">{entry.totalScore.toFixed(1)}pt</span>
                </div>
                <div className="mt-1 sm:hidden"><SeasonScoreBar score={entry.totalScore} tier={entry.tier} /></div>
              </div>
              <div className="hidden sm:block"><SeasonTierBadge tier={entry.tier} /></div>
              <span className="hidden text-sm font-bold text-gray-800 sm:block">
                {entry.totalScore.toFixed(1)}<span className="text-xs font-normal text-gray-400">pt</span>
              </span>
              <div className="hidden sm:block"><SeasonScoreBar score={entry.totalScore} tier={entry.tier} /></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── GitHub Ranking Table ──────────────────────────────────────────────────────

function GithubRankingTable({ entries, myRankPosition }: { entries: GithubRankingEntry[]; myRankPosition?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="hidden sm:grid sm:grid-cols-[56px_1fr_120px_80px_1fr] sm:items-center sm:gap-4 sm:border-b sm:border-gray-100 sm:bg-gray-50 sm:px-4 sm:py-2.5">
        <span className="text-xs font-medium text-gray-400">순위</span>
        <span className="text-xs font-medium text-gray-400">사용자</span>
        <span className="text-xs font-medium text-gray-400">티어</span>
        <span className="text-xs font-medium text-gray-400">총점</span>
        <span className="text-xs font-medium text-gray-400">진행도</span>
      </div>
      <ul className="divide-y divide-gray-50">
        {entries.map((entry) => {
          const isMe = myRankPosition !== undefined && entry.rank === myRankPosition;
          return (
          <li key={`${entry.rank}-${entry.userId}`}
            className={`grid grid-cols-[40px_1fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:grid-cols-[56px_1fr_120px_80px_1fr] sm:gap-4 ${isMe ? 'bg-blue-50/50 hover:bg-blue-50' : ''}`}
          >
            <span className={`text-sm font-bold ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-slate-500' : entry.rank === 3 ? 'text-amber-600' : 'text-gray-400'}`}>
              {entry.rank}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/user/${entry.userId}`} className="truncate text-sm font-semibold text-gray-800 hover:text-blue-600">{entry.userName}</Link>
                {isMe && <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">나</span>}
              </div>
              <div className="mt-1 flex items-center gap-2 sm:hidden">
                <GithubTierBadge score={entry.totalScore} />
                <span className="text-xs font-semibold text-gray-600">{entry.totalScore.toFixed(1)}pt</span>
              </div>
              <div className="mt-1 sm:hidden"><GithubScoreBar score={entry.totalScore} /></div>
            </div>
            <div className="hidden sm:block"><GithubTierBadge score={entry.totalScore} /></div>
            <span className="hidden text-sm font-bold text-gray-800 sm:block">
              {entry.totalScore.toFixed(1)}<span className="text-xs font-normal text-gray-400">pt</span>
            </span>
            <div className="hidden sm:block"><GithubScoreBar score={entry.totalScore} /></div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

interface RankingPageClientProps {
  initialSeasonRankings: SeasonRankingListResponse;
  initialGithubRankings: GithubRankingListResponse;
  myRanking: MySeasonRankingResponse | null;
  myGithubRanking: MyGithubRankingResponse | null;
  isAuthenticated: boolean;
}

export default function RankingPageClient({
  initialSeasonRankings,
  initialGithubRankings,
  myRanking,
  myGithubRanking,
  isAuthenticated,
}: RankingPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('season');
  const [seasonRankings, setSeasonRankings] = useState(initialSeasonRankings);
  const [githubRankings, setGithubRankings] = useState(initialGithubRankings);
  const [seasonPage, setSeasonPage] = useState(1);
  const [githubPage, setGithubPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const TOTAL_PAGES = 5;

  const filteredSeasonEntries = useMemo(() => {
    if (!search.trim()) return seasonRankings.rankings;
    return seasonRankings.rankings.filter((e) => e.userName.toLowerCase().includes(search.toLowerCase()));
  }, [seasonRankings.rankings, search]);

  const filteredGithubEntries = useMemo(() => {
    if (!search.trim()) return githubRankings.rankings;
    return githubRankings.rankings.filter((e) => e.userName.toLowerCase().includes(search.toLowerCase()));
  }, [githubRankings.rankings, search]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearch('');
  };

  const handleSeasonPageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient<SeasonRankingListResponse>(
        `/v1/seasons/current/rankings?page=${page - 1}&size=10`,
        { cache: 'no-store' },
      );
      setSeasonRankings(data);
      setSeasonPage(page);
      setSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { /* 실패 시 현재 페이지 유지 */ }
    finally { setIsLoading(false); }
  };

  const handleGithubPageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient<GithubRankingListResponse>(
        `/v1/github/rankings?page=${page - 1}&size=10`,
        { cache: 'no-store' },
      );
      setGithubRankings(data);
      setGithubPage(page);
      setSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { /* 실패 시 현재 페이지 유지 */ }
    finally { setIsLoading(false); }
  };

  const top3 = activeTab === 'season'
    ? initialSeasonRankings.rankings.slice(0, 3)
    : initialGithubRankings.rankings.slice(0, 3);

  const totalCount = activeTab === 'season' ? seasonRankings.totalCount : githubRankings.totalCount;
  const filteredEntries = activeTab === 'season' ? filteredSeasonEntries : filteredGithubEntries;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 헤더 */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">랭킹</h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'season'
              ? '출석 · 커밋 · 챌린지 · 프로젝트 · 커뮤니티 활동 점수 기준'
              : '전체 기간 GitHub 활동 · 다양성 · 영향력 점수 기준'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'season' && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3.5 w-3.5" />
              매일 04:00 업데이트
            </span>
          )}
          <button
            onClick={() => setShowCriteria(true)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            랭킹 기준
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-6 inline-flex rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 내 랭킹 카드 */}
      {(activeTab === 'season' && myRanking) && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">내 랭킹</h2>
          <MyRankingCard myRanking={myRanking} />
        </div>
      )}
      {(activeTab === 'github' && myGithubRanking) && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">내 랭킹</h2>
          <MyGithubRankingCard myRanking={myGithubRanking} />
        </div>
      )}
      {!isAuthenticated && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            <Link href="/login" className="font-medium text-blue-600 hover:underline">로그인</Link>
            하면 내 랭킹을 확인할 수 있어요.
          </span>
        </div>
      )}

      {/* Top 3 상위권 */}
      {top3.length > 0 && (
        <div className="mb-6">
          <Top3Cards entries={top3} type={activeTab} />
        </div>
      )}

      {/* 전체 랭킹 */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">전체 랭킹</h2>

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
        {totalCount > 0 && (
          <span className="shrink-0 text-xs text-gray-400">총 {totalCount.toLocaleString()}명</span>
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
      ) : activeTab === 'season' ? (
        <SeasonRankingTable entries={filteredSeasonEntries} myRankPosition={myRanking?.rank} />
      ) : (
        <GithubRankingTable entries={filteredGithubEntries} myRankPosition={myGithubRanking?.rank} />
      )}

      {/* 페이지네이션 */}
      {!search && (
        <div className="mt-6 flex justify-center gap-1">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => {
            const currentPage = activeTab === 'season' ? seasonPage : githubPage;
            const handlePageChange = activeTab === 'season' ? handleSeasonPageChange : handleGithubPageChange;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {showCriteria && <RankingCriteriaModal tab={activeTab} onClose={() => setShowCriteria(false)} />}
    </main>
  );
}
