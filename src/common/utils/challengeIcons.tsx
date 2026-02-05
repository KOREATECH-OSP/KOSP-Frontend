import { createElement } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Zap,
  Flame,
  Target,
  Crown,
  Gem,
  Heart,
  ThumbsUp,
  Rocket,
  Gift,
  BookOpen,
  Code,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Users,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  Flag,
  Mountain,
  Sparkles,
  Sun,
  Moon,
  Lightbulb,
  Pencil,
  FileCode,
  Terminal,
  Bug,
  Shield,
  Lock,
  Key,
  Coins,
  TrendingUp,
  BarChart,
  PieChart,
  type LucideIcon,
} from 'lucide-react';

export interface ChallengeIconInfo {
  icon: LucideIcon;
  label: string;
  category: string;
}

export const CHALLENGE_ICONS: Record<string, ChallengeIconInfo> = {
  // 업적/보상
  trophy: { icon: Trophy, label: '트로피', category: '업적' },
  medal: { icon: Medal, label: '메달', category: '업적' },
  award: { icon: Award, label: '상장', category: '업적' },
  crown: { icon: Crown, label: '왕관', category: '업적' },
  gem: { icon: Gem, label: '보석', category: '업적' },
  gift: { icon: Gift, label: '선물', category: '업적' },
  coins: { icon: Coins, label: '코인', category: '업적' },

  // 활동
  star: { icon: Star, label: '별', category: '활동' },
  zap: { icon: Zap, label: '번개', category: '활동' },
  flame: { icon: Flame, label: '불꽃', category: '활동' },
  rocket: { icon: Rocket, label: '로켓', category: '활동' },
  sparkles: { icon: Sparkles, label: '반짝임', category: '활동' },
  'trending-up': { icon: TrendingUp, label: '상승', category: '활동' },

  // 목표
  target: { icon: Target, label: '타겟', category: '목표' },
  flag: { icon: Flag, label: '깃발', category: '목표' },
  mountain: { icon: Mountain, label: '산', category: '목표' },
  'check-circle': { icon: CheckCircle, label: '체크', category: '목표' },

  // 개발
  code: { icon: Code, label: '코드', category: '개발' },
  'git-commit': { icon: GitCommit, label: '커밋', category: '개발' },
  'git-pull-request': { icon: GitPullRequest, label: 'PR', category: '개발' },
  'git-merge': { icon: GitMerge, label: '머지', category: '개발' },
  'file-code': { icon: FileCode, label: '파일', category: '개발' },
  terminal: { icon: Terminal, label: '터미널', category: '개발' },
  bug: { icon: Bug, label: '버그', category: '개발' },

  // 학습
  'book-open': { icon: BookOpen, label: '책', category: '학습' },
  lightbulb: { icon: Lightbulb, label: '아이디어', category: '학습' },
  pencil: { icon: Pencil, label: '연필', category: '학습' },

  // 소셜
  users: { icon: Users, label: '팀', category: '소셜' },
  'message-square': { icon: MessageSquare, label: '메시지', category: '소셜' },
  heart: { icon: Heart, label: '하트', category: '소셜' },
  'thumbs-up': { icon: ThumbsUp, label: '좋아요', category: '소셜' },

  // 시간
  calendar: { icon: Calendar, label: '캘린더', category: '시간' },
  clock: { icon: Clock, label: '시계', category: '시간' },
  sun: { icon: Sun, label: '해', category: '시간' },
  moon: { icon: Moon, label: '달', category: '시간' },

  // 보안/기타
  shield: { icon: Shield, label: '방패', category: '기타' },
  lock: { icon: Lock, label: '자물쇠', category: '기타' },
  key: { icon: Key, label: '열쇠', category: '기타' },
  'bar-chart': { icon: BarChart, label: '막대차트', category: '기타' },
  'pie-chart': { icon: PieChart, label: '원형차트', category: '기타' },
};

export const ICON_CATEGORIES = [
  '업적',
  '활동',
  '목표',
  '개발',
  '학습',
  '소셜',
  '시간',
  '기타',
] as const;

export type IconCategory = (typeof ICON_CATEGORIES)[number];

export function getIconsByCategory(category: IconCategory): [string, ChallengeIconInfo][] {
  return Object.entries(CHALLENGE_ICONS).filter(([, info]) => info.category === category);
}

export function getChallengeIconComponent(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Trophy;
  return CHALLENGE_ICONS[iconName]?.icon ?? Trophy;
}

import { ensureEncodedUrl } from '@/lib/utils';

interface ChallengeIconProps {
  name: string | null | undefined;
  className?: string;
  /** 아이콘 타입: ICON이면 Lucide 아이콘, IMAGE_URL이면 이미지 */
  iconType?: 'ICON' | 'IMAGE_URL';
}

export function ChallengeIcon({ name, className, iconType = 'ICON' }: ChallengeIconProps) {
  // IMAGE_URL 타입이고 name이 URL인 경우 이미지로 렌더링
  if (iconType === 'IMAGE_URL' && name) {
    return createElement('img', {
      src: ensureEncodedUrl(name),
      alt: 'challenge icon',
      className: `${className} object-cover rounded`,
    });
  }

  // ICON 타입이거나 기본값인 경우 Lucide 아이콘으로 렌더링
  const iconComponent = CHALLENGE_ICONS[name ?? '']?.icon ?? Trophy;
  return createElement(iconComponent, { className });
}

export function getChallengeIconInfo(iconName: string | null | undefined): ChallengeIconInfo | null {
  if (!iconName) return null;
  return CHALLENGE_ICONS[iconName] ?? null;
}

export function isValidIconName(iconName: string): boolean {
  return iconName in CHALLENGE_ICONS;
}
