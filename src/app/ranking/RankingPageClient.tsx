'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HelpCircle, Search, X, Info } from 'lucide-react';

import {
  SeasonRankingEntry,
  SeasonRankingListResponse,
  MySeasonRankingResponse,
  MyGithubRankingResponse,
  GithubRankingEntry,
  GithubRankingListResponse,
} from '@/lib/api/types';
import { apiClient } from '@/lib/api';
import { getTierInfo, getTierStyle, getTierProgress, getNextTierRemaining, getEliteUpgradeHint } from './tierUtils';
import { getRankFromScore } from '@/common/components/GithubRankCard';
import RankBadge from '@/common/components/RankBadge';

// ─── Tab ───────────────────────────────────────────────────────────────────────

type TabType = 'season' | 'github';

// ─── Tier Badge ────────────────────────────────────────────────────────────────

function SeasonTierBadge({ tier }: { tier: string }) {
  const { label } = getTierInfo(tier);
  const { badge } = getTierStyle(tier);
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badge}`}>
      {label}
    </span>
  );
}

const GITHUB_TIER_STYLE: Record<string, { badge: string; label: string }> = {
  challenger: { badge: 'bg-rose-100 text-rose-800 border border-rose-200', label: 'CHALLENGER' },
  diamond:    { badge: 'bg-blue-100 text-blue-800 border border-blue-200', label: 'DIAMOND' },
  platinum:   { badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200', label: 'PLATINUM' },
  gold:       { badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'GOLD' },
  silver:     { badge: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'SILVER' },
  bronze:     { badge: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'BRONZE' },
};

function GithubTierBadge({ score }: { score: number }) {
  const rank = getRankFromScore(score);
  const { badge, label } = GITHUB_TIER_STYLE[rank];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badge}`}>
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
    diamond: 'bg-blue-400', platinum: 'bg-cyan-400', gold: 'bg-yellow-400',
    silver: 'bg-slate-400', bronze: 'bg-amber-400',
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full transition-all duration-500 ${barColor[rank]}`} style={{ width: `${(score / 9) * 100}%` }} />
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
// 시즌 티어는 6단계 백분위 기반. 기본 5티어는 시즌 순위(백분위)로, CHALLENGER만 다이아+총점 조건.
const SEASON_TIER_CRITERIA = [
  { label: 'CHALLENGER', range: '상위 20% + 총점 60점 이상', color: 'bg-rose-100 text-rose-800' },
  { label: 'DIAMOND', range: '상위 20%', color: 'bg-blue-100 text-blue-800' },
  { label: 'PLATINUM', range: '상위 20 ~ 40%', color: 'bg-cyan-100 text-cyan-800' },
  { label: 'GOLD', range: '상위 40 ~ 60%', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'SILVER', range: '상위 60 ~ 80%', color: 'bg-slate-100 text-slate-700' },
  { label: 'BRONZE', range: '하위 20%', color: 'bg-amber-100 text-amber-800' },
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
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">{isGithub ? '깃허브 랭킹 기준 안내' : '시즌 랭킹 기준 안내'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {isGithub ? (
            <>
              <p className="mb-4 text-xs text-gray-500">총점 = 활동 수준(0~3pt) + 활동 다양성(0~1pt) + 활동 영향성(0~5pt) · <strong>최대 9pt</strong></p>
              <div className="mb-5 overflow-hidden rounded-xl border border-gray-100 text-sm">
                {[
                  { title: '활동 수준 (최대 3pt)', rows: [['3pt','커밋 100+ AND PR 20+'],['2pt','커밋 30+ AND PR 5+'],['1pt','커밋 5+ OR PR 1+']] },
                  { title: '다양성 점수 (최대 1pt)', rows: [['1.0pt','기여 저장소 10개 이상'],['0.7pt','5~9개'],['0.4pt','2~4개']] },
                  { title: '영향력 점수 (최대 5pt)', rows: [['+2.0pt','내 소유 저장소 100+ 스타'],['+1.5pt','1000+ 스타 저장소에 PR 머지'],['+1.0pt','머지된 PR로 이슈 10개+ 클로즈'],['+0.5pt','크로스 저장소 PR 머지']] },
                ].map(({ title, rows }) => (
                  <div key={title}>
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">{title}</div>
                    <div className="divide-y divide-gray-50">
                      {rows.map(([pt, desc]) => (
                        <div key={pt} className="flex justify-between px-3 py-2">
                          <span className="font-semibold text-gray-700">{pt}</span>
                          <span className="text-xs text-gray-500">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-xs text-gray-500">총점 = min(출석 + min(커밋+챌린지, 35) + 프로젝트 + 커뮤니티, <strong>100pt</strong>) · 매일 04:00 업데이트</p>
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

// ─── My Season Ranking Banner ──────────────────────────────────────────────────

function MySeasonBanner({ myRanking }: { myRanking: MySeasonRankingResponse }) {
  const { label, min, max } = getTierInfo(myRanking.tier);
  const { bar, text } = getTierStyle(myRanking.tier);
  const remaining = getNextTierRemaining(myRanking.tier, myRanking.totalScore);
  const progress = getTierProgress(myRanking.tier, myRanking.totalScore);
  const eliteHint = getEliteUpgradeHint(myRanking.tier);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500">내 순위</p>
            <p className="text-3xl font-black text-gray-900 leading-none">{myRanking.rank}위</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${getTierStyle(myRanking.tier).badge}`}>
              {label}
            </span>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {myRanking.totalScore.toFixed(1)}<span className="ml-1 text-sm font-normal text-gray-400">/ 100pt</span>
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          {remaining !== null
            ? <span>다음 티어까지 <strong className="text-gray-800">{remaining.toFixed(1)}pt</strong></span>
            : eliteHint !== null
              ? <span className="font-medium text-purple-600">{eliteHint}</span>
              : <span className="font-semibold text-rose-600">최고 티어 달성 🎉</span>
          }
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>{min}pt</span><span>{max}pt</span>
        </div>
      </div>
    </div>
  );
}

// ─── My GitHub Ranking Banner ──────────────────────────────────────────────────

function MyGithubBanner({ myRanking }: { myRanking: MyGithubRankingResponse }) {
  const rank = getRankFromScore(myRanking.totalScore);
  const { badge, label } = GITHUB_TIER_STYLE[rank];
  const barColor: Record<string, string> = {
    challenger: 'bg-gradient-to-r from-rose-400 to-pink-400',
    diamond: 'bg-blue-400', platinum: 'bg-cyan-400', gold: 'bg-yellow-400',
    silver: 'bg-slate-400', bronze: 'bg-amber-400',
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500">내 순위</p>
            <p className="text-3xl font-black text-gray-900 leading-none">{myRanking.rank}위</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${badge}`}>{label}</span>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {myRanking.totalScore.toFixed(1)}<span className="ml-1 text-sm font-normal text-gray-400">/ 9pt</span>
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          최대 <strong className="text-gray-800">9pt</strong>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor[rank]}`} style={{ width: `${(myRanking.totalScore / 9) * 100}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>0pt</span><span>9pt</span>
        </div>
      </div>
    </div>
  );
}

// ─── Podium ────────────────────────────────────────────────────────────────────

const PODIUM_BAR: Record<number, string> = {
  1: 'h-20 bg-gradient-to-b from-[#FFD11A] to-[#e6b800]',
  2: 'h-14 bg-gradient-to-b from-[#D0D0D0] to-[#b0b0b0]',
  3: 'h-10 bg-gradient-to-b from-[#AC7636] to-[#8a5a1e]',
};
const PODIUM_ORDER = [2, 1, 3]; // 시상대 순서: 2위 왼쪽, 1위 가운데, 3위 오른쪽

type AnyEntry = SeasonRankingEntry | GithubRankingEntry;

function PodiumItem({ entry, type }: { entry: AnyEntry; type: TabType }) {
  const rank = entry.rank;
  const isFirst = rank === 1;
  const size = isFirst ? 'h-14 w-14' : 'h-11 w-11';
  return (
    <div className="flex flex-col items-center">
      {/* 뱃지 + 아바타 + 이름 */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <RankBadge rank={rank} size={isFirst ? 44 : 36} />
        <Link href={`/user/${entry.userId}`}>
          {entry.profileImageUrl ? (
            <img src={entry.profileImageUrl} alt={entry.userName} className={`${size} rounded-full object-cover`} />
          ) : (
            <div className={`${size} rounded-full bg-gray-200`} />
          )}
        </Link>
        <Link
          href={`/user/${entry.userId}`}
          className={`font-bold text-gray-800 hover:text-blue-600 truncate max-w-[100px] text-center ${isFirst ? 'text-base' : 'text-sm'}`}
        >
          {entry.userName || '이름 없음'}
        </Link>
        <p className={`text-gray-400 ${isFirst ? 'text-xs font-semibold text-[#f0a800]' : 'text-[11px]'}`}>
          {type === 'season'
            ? `${(entry as SeasonRankingEntry).totalScore.toFixed(1)}pt`
            : `${(entry as GithubRankingEntry).totalScore.toFixed(1)}pt`
          }
        </p>
      </div>
      {/* 포디움 블록 */}
      <div className={`w-28 rounded-t-xl flex items-center justify-center font-black text-white text-lg ${PODIUM_BAR[rank]}`}>
        {rank}
      </div>
    </div>
  );
}

function Podium({ entries, type }: { entries: AnyEntry[]; type: TabType }) {
  if (entries.length === 0) return null;
  const byRank = Object.fromEntries(entries.slice(0, 3).map((e) => [e.rank, e]));
  return (
    <div className="px-6 pt-5 pb-0">
<div className="flex items-end justify-center gap-3">
        {PODIUM_ORDER.map((rank) =>
          byRank[rank] ? <PodiumItem key={rank} entry={byRank[rank]} type={type} /> : null
        )}
      </div>
    </div>
  );
}

// ─── Ranking Table Row ─────────────────────────────────────────────────────────

const RANK_COLOR: Record<number, string> = {
  1: 'text-[#FFD11A]',
  2: 'text-[#D0D0D0]',
  3: 'text-[#AC7636]',
};

function SeasonRankRow({ entry, isMe }: { entry: SeasonRankingEntry; isMe: boolean }) {
  return (
    <li>
      <Link
        href={`/user/${entry.userId}`}
        className={`grid grid-cols-[48px_1fr_130px_90px] items-center gap-3 px-5 py-3 transition-colors
          ${isMe ? 'bg-[#EFF7FF] hover:bg-[#EFF7FF]/80' : 'hover:bg-gray-50'}`}
      >
        <span className={`text-sm font-black text-center ${RANK_COLOR[entry.rank] ?? 'text-slate-300'}`}>{entry.rank}</span>
        <div className="flex min-w-0 items-center gap-2.5 pl-4">
          {entry.profileImageUrl ? (
            <img src={entry.profileImageUrl} alt={entry.userName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className={`h-8 w-8 shrink-0 rounded-full ${isMe ? 'bg-blue-200' : 'bg-gray-100'}`} />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-gray-800">
                {entry.userName}
              </span>
              {isMe && <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">나</span>}
            </div>
          </div>
        </div>
        <div><SeasonTierBadge tier={entry.tier} /></div>
        <span className="text-sm font-bold text-gray-800">
          {entry.totalScore.toFixed(1)}<span className="text-xs font-normal text-gray-400">pt</span>
        </span>
      </Link>
    </li>
  );
}

function GithubRankRow({ entry, isMe }: { entry: GithubRankingEntry; isMe: boolean }) {
  return (
    <li>
      <Link
        href={`/user/${entry.userId}`}
        className={`grid grid-cols-[48px_1fr_130px_90px] items-center gap-3 px-5 py-3 transition-colors
          ${isMe ? 'bg-[#EFF7FF] hover:bg-[#EFF7FF]/80' : 'hover:bg-gray-50'}`}
      >
        <span className={`text-sm font-black text-center ${RANK_COLOR[entry.rank] ?? 'text-slate-300'}`}>{entry.rank}</span>
        <div className="flex min-w-0 items-center gap-2.5 pl-4">
          {entry.profileImageUrl ? (
            <img src={entry.profileImageUrl} alt={entry.userName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className={`h-8 w-8 shrink-0 rounded-full ${isMe ? 'bg-blue-200' : 'bg-gray-100'}`} />
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate text-sm font-semibold text-gray-800">
              {entry.userName}
            </span>
            {isMe && <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">나</span>}
          </div>
        </div>
        <div><GithubTierBadge score={entry.totalScore} /></div>
        <span className="text-sm font-bold text-gray-800">
          {entry.totalScore.toFixed(1)}<span className="text-xs font-normal text-gray-400">pt</span>
        </span>
      </Link>
    </li>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

interface RankingPageClientProps {
  initialSeasonRankings: SeasonRankingListResponse;
  initialGithubRankings: GithubRankingListResponse;
  myRanking: MySeasonRankingResponse | null;
  myGithubRanking: MyGithubRankingResponse | null;
  isAuthenticated: boolean;
  myUserId: number | null;
}

export default function RankingPageClient({
  initialSeasonRankings,
  initialGithubRankings,
  myRanking,
  myGithubRanking,
  isAuthenticated,
  myUserId,
}: RankingPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('season');
  const [seasonRankings, setSeasonRankings] = useState(initialSeasonRankings);
  const [githubRankings, setGithubRankings] = useState(initialGithubRankings);
  const [seasonPage, setSeasonPage] = useState(1);
  const [githubPage, setGithubPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const filteredSeasonEntries = useMemo(() => {
    if (!search.trim()) return seasonRankings.rankings;
    return seasonRankings.rankings.filter((e) => e.userName.toLowerCase().includes(search.toLowerCase()));
  }, [seasonRankings.rankings, search]);

  const filteredGithubEntries = useMemo(() => {
    if (!search.trim()) return githubRankings.rankings;
    return githubRankings.rankings.filter((e) => e.userName.toLowerCase().includes(search.toLowerCase()));
  }, [githubRankings.rankings, search]);

  const handleTabChange = (tab: TabType) => { setActiveTab(tab); setSearch(''); };

  const handleSeasonPageChange = async (page: number) => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await apiClient<SeasonRankingListResponse>(`/v1/seasons/current/rankings?page=${page - 1}&size=10`, { cache: 'no-store' });
      setSeasonRankings(data); setSeasonPage(page); setSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setPageError('랭킹 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally { setIsLoading(false); }
  };

  const handleGithubPageChange = async (page: number) => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await apiClient<GithubRankingListResponse>(`/v1/github/rankings?page=${page - 1}&size=10`, { cache: 'no-store' });
      setGithubRankings(data); setGithubPage(page); setSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setPageError('랭킹 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally { setIsLoading(false); }
  };

  const top3: AnyEntry[] = activeTab === 'season'
    ? initialSeasonRankings.rankings.slice(0, 3)
    : initialGithubRankings.rankings.slice(0, 3);

  const totalCount = activeTab === 'season' ? seasonRankings.totalCount : githubRankings.totalCount;
  const filteredEntries = activeTab === 'season' ? filteredSeasonEntries : filteredGithubEntries;
  const currentPage = activeTab === 'season' ? seasonPage : githubPage;
  const handlePageChange = activeTab === 'season' ? handleSeasonPageChange : handleGithubPageChange;
  const TOTAL_PAGES = 5;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  return (
    <div className="min-h-screen bg-gray-50">
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

      {/* 사이드바 + 메인 콘텐츠 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">

        {/* 사이드바 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4 px-2">랭킹</h2>
            <div className="flex lg:flex-col gap-1">
              {([
                { key: 'season', label: '시즌 랭킹' },
                { key: 'github', label: '깃허브 랭킹' },
              ] as { key: TabType; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key as TabType)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div>

      {/* 제목 + 우측 버튼 */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === 'season' ? '시즌 랭킹' : '깃허브 랭킹'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {activeTab === 'season'
              ? '출석 · 커밋 · 챌린지 · 프로젝트 · 커뮤니티 활동 점수 기준'
              : 'GitHub 활동 점수 기준'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Info className="h-3.5 w-3.5" />
            매일 04:00 업데이트
          </span>
          <button
            onClick={() => setShowCriteria(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            랭킹 기준
          </button>
        </div>
      </div>

      {/* 내 랭킹 배너 */}
      {!isAuthenticated && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          <Info className="h-4 w-4 shrink-0" />
          <span><Link href="/login" className="font-medium text-blue-600 hover:underline">로그인</Link>하면 내 랭킹을 확인할 수 있어요.</span>
        </div>
      )}
      {activeTab === 'season' && myRanking && (
        <div className="mb-5"><MySeasonBanner myRanking={myRanking} /></div>
      )}
      {activeTab === 'github' && myGithubRanking && (
        <div className="mb-5"><MyGithubBanner myRanking={myGithubRanking} /></div>
      )}

      {/* 메인 카드: 포디움 + 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

        {/* 카드 헤더: 탭 이름 + 총 인원 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {activeTab === 'season' ? '시즌 랭킹' : '깃허브 랭킹'}
          </h2>
          {totalCount > 0 && (
            <span className="text-xs text-gray-400">총 {totalCount.toLocaleString()}명</span>
          )}
        </div>

        {/* 포디움 */}
        <Podium entries={top3} type={activeTab} />

        {/* 검색 */}
        <div className="px-5 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="사용자 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* 페이지 에러 메시지 */}
        {pageError && (
          <div className="mx-5 mb-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <Info className="h-4 w-4 shrink-0" />
            {pageError}
          </div>
        )}

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[48px_1fr_130px_90px] gap-3 border-t border-gray-100 bg-gray-50 px-5 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center">순위</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 pl-4">사용자</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">티어</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">점수</span>
        </div>

        {/* 테이블 바디 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {search ? `'${search}' 검색 결과가 없습니다.` : '랭킹 데이터가 없습니다.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {activeTab === 'season'
              ? (filteredSeasonEntries as SeasonRankingEntry[]).map((entry) => (
                  <SeasonRankRow key={`${entry.rank}-${entry.userId}`} entry={entry} isMe={myUserId === entry.userId} />
                ))
              : (filteredGithubEntries as GithubRankingEntry[]).map((entry) => (
                  <GithubRankRow key={`${entry.rank}-${entry.userId}`} entry={entry} isMe={myUserId === entry.userId} />
                ))
            }
          </ul>
        )}
      </div>

      {/* 페이지네이션 */}
      {!search && (
        <div className="mt-6 flex justify-center items-center gap-1">
          {/* 첫 페이지 */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="h-9 px-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {'<<'}
          </button>
          {/* 이전 페이지 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 px-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {'<'}
          </button>

          {/* 실제 페이지 수 기반 번호 (최대 TOTAL_PAGES개) */}
          {Array.from({ length: Math.min(TOTAL_PAGES, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}

          {/* 다음 페이지 */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 px-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {'>'}
          </button>
          {/* 마지막 페이지 */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-9 px-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {'>>'}
          </button>
        </div>
      )}

        </div> {/* /메인 콘텐츠 끝 */}
      </div> {/* /grid 끝 */}

      {showCriteria && <RankingCriteriaModal tab={activeTab} onClose={() => setShowCriteria(false)} />}
    </main>
    </div>
  );
}
