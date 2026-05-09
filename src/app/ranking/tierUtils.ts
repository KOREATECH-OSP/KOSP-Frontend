export type TierGroup =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'MASTER'
  | 'CHALLENGER';

export interface TierInfo {
  group: TierGroup;
  level: number | null;
  label: string;
  min: number;
  max: number;
}

const TIER_THRESHOLDS: TierInfo[] = [
  { group: 'BRONZE', level: 4, label: 'BRONZE 4', min: 0, max: 2.5 },
  { group: 'BRONZE', level: 3, label: 'BRONZE 3', min: 2.5, max: 5.0 },
  { group: 'BRONZE', level: 2, label: 'BRONZE 2', min: 5.0, max: 7.5 },
  { group: 'BRONZE', level: 1, label: 'BRONZE 1', min: 7.5, max: 10.0 },
  { group: 'SILVER', level: 4, label: 'SILVER 4', min: 10.0, max: 12.5 },
  { group: 'SILVER', level: 3, label: 'SILVER 3', min: 12.5, max: 15.0 },
  { group: 'SILVER', level: 2, label: 'SILVER 2', min: 15.0, max: 17.5 },
  { group: 'SILVER', level: 1, label: 'SILVER 1', min: 17.5, max: 20.0 },
  { group: 'GOLD', level: 4, label: 'GOLD 4', min: 20.0, max: 23.75 },
  { group: 'GOLD', level: 3, label: 'GOLD 3', min: 23.75, max: 27.5 },
  { group: 'GOLD', level: 2, label: 'GOLD 2', min: 27.5, max: 31.25 },
  { group: 'GOLD', level: 1, label: 'GOLD 1', min: 31.25, max: 35.0 },
  { group: 'PLATINUM', level: 4, label: 'PLATINUM 4', min: 35.0, max: 40.0 },
  { group: 'PLATINUM', level: 3, label: 'PLATINUM 3', min: 40.0, max: 45.0 },
  { group: 'PLATINUM', level: 2, label: 'PLATINUM 2', min: 45.0, max: 50.0 },
  { group: 'PLATINUM', level: 1, label: 'PLATINUM 1', min: 50.0, max: 55.0 },
  { group: 'DIAMOND', level: 4, label: 'DIAMOND 4', min: 55.0, max: 60.0 },
  { group: 'DIAMOND', level: 3, label: 'DIAMOND 3', min: 60.0, max: 65.0 },
  { group: 'DIAMOND', level: 2, label: 'DIAMOND 2', min: 65.0, max: 70.0 },
  { group: 'DIAMOND', level: 1, label: 'DIAMOND 1', min: 70.0, max: 75.0 },
  { group: 'MASTER', level: 4, label: 'MASTER 4', min: 75.0, max: 78.75 },
  { group: 'MASTER', level: 3, label: 'MASTER 3', min: 78.75, max: 82.5 },
  { group: 'MASTER', level: 2, label: 'MASTER 2', min: 82.5, max: 86.25 },
  { group: 'MASTER', level: 1, label: 'MASTER 1', min: 86.25, max: 90.0 },
  { group: 'CHALLENGER', level: null, label: 'CHALLENGER', min: 90.0, max: 100 },
];

const TIER_KEY_MAP: Record<string, TierInfo> = Object.fromEntries(
  TIER_THRESHOLDS.map((t) => [
    t.level !== null ? `${t.group}_${t.level}` : t.group,
    t,
  ]),
);

export function getTierInfo(tier: string): TierInfo {
  return TIER_KEY_MAP[tier] ?? TIER_THRESHOLDS[0];
}

export function getNextTierRemaining(tier: string, score: number): number | null {
  const info = getTierInfo(tier);
  if (info.group === 'CHALLENGER') return null;
  return Math.max(0, info.max - score);
}

export function getTierProgress(tier: string, score: number): number {
  const info = getTierInfo(tier);
  const range = info.max - info.min;
  if (range === 0) return 100;
  return Math.min(100, Math.max(0, ((score - info.min) / range) * 100));
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
  MASTER: {
    badge: 'bg-purple-100 text-purple-800 border border-purple-200',
    text: 'text-purple-700',
    bar: 'bg-purple-400',
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
