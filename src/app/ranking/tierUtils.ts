export type TierGroup =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'CHALLENGER';

export interface TierInfo {
  group: TierGroup;
  level: number | null;
  label: string;
  min: number;
  max: number;
}

// 6단계 티어 (백분위 기반).
// 기본 5티어(BRONZE~DIAMOND)는 시즌 순위 백분위(상위 20/40/60/80%)로 배정된다 → 점수 구간 없음.
// CHALLENGER는 다이아(상위 20%)이면서 총점 60 이상일 때만 → 점수 구간 존재.
const TIER_INFOS: TierInfo[] = [
  { group: 'BRONZE', level: null, label: 'BRONZE', min: 0, max: 0 },
  { group: 'SILVER', level: null, label: 'SILVER', min: 0, max: 0 },
  { group: 'GOLD', level: null, label: 'GOLD', min: 0, max: 0 },
  { group: 'PLATINUM', level: null, label: 'PLATINUM', min: 0, max: 0 },
  { group: 'DIAMOND', level: null, label: 'DIAMOND', min: 0, max: 60 },
  { group: 'CHALLENGER', level: null, label: 'CHALLENGER', min: 60, max: 100 },
];

const TIER_KEY_MAP: Record<string, TierInfo> = Object.fromEntries(
  TIER_INFOS.map((t) => [t.group, t]),
);

// 챌린저 승급 최소 총점 (다이아 = 상위 20% 조건과 함께 충족)
const CHALLENGER_MIN_SCORE = 60;

export function getTierInfo(tier: string): TierInfo {
  return TIER_KEY_MAP[tier] ?? TIER_INFOS[0];
}

/**
 * 다음 티어까지 남은 "총점". 백분위 기반 기본 티어는 점수로 오르는 게 아니라
 * 순위로 결정되므로 null. 다이아→챌린저(60)만 점수 기준.
 */
export function getNextTierRemaining(tier: string, score: number): number | null {
  const { group } = getTierInfo(tier);
  if (group === 'DIAMOND') return Math.max(0, CHALLENGER_MIN_SCORE - score);
  return null;
}

/**
 * 승급 안내 문구.
 * - 다이아: 총점 60 넘으면 챌린저 (상위 20% 유지 조건)
 * - 그 외 기본 티어: 상위 티어는 시즌 순위(백분위)로 결정
 */
export function getEliteUpgradeHint(tier: string): string | null {
  const { group } = getTierInfo(tier);
  if (group === 'CHALLENGER') return null;
  if (group === 'DIAMOND') {
    return '챌린저 승급: 총점 60점 이상 (상위 20% 유지)';
  }
  return '상위 티어는 시즌 순위(백분위)로 결정됩니다';
}

/**
 * 진행률(%). 다이아는 챌린저 승급 점수(60)까지의 진행률, 그 외는 총점(100 만점) 기준 대략치.
 */
export function getTierProgress(tier: string, score: number): number {
  const { group } = getTierInfo(tier);
  if (group === 'CHALLENGER') return 100;
  if (group === 'DIAMOND') {
    return clampPct((score / CHALLENGER_MIN_SCORE) * 100);
  }
  return clampPct(score); // 기본 티어: 총점(0~100) 대략 게이지
}

function clampPct(v: number): number {
  return Math.min(100, Math.max(0, v));
}

export interface TierStyle {
  badge: string;
  text: string;
  bar: string;
}

const TIER_STYLES: Record<TierGroup, TierStyle> = {
  BRONZE: {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    text: 'text-amber-700',
    bar: 'bg-amber-400',
  },
  SILVER: {
    badge: 'bg-slate-100 text-slate-700 border border-slate-200',
    text: 'text-slate-600',
    bar: 'bg-slate-400',
  },
  GOLD: {
    badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    text: 'text-yellow-700',
    bar: 'bg-yellow-400',
  },
  PLATINUM: {
    badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    text: 'text-cyan-700',
    bar: 'bg-cyan-400',
  },
  DIAMOND: {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    text: 'text-blue-700',
    bar: 'bg-blue-400',
  },
  CHALLENGER: {
    badge: 'bg-rose-100 text-rose-800 border border-rose-200',
    text: 'text-rose-700',
    bar: 'bg-gradient-to-r from-rose-400 to-pink-400',
  },
};

export function getTierStyle(tier: string): TierStyle {
  const { group } = getTierInfo(tier);
  return TIER_STYLES[group];
}
