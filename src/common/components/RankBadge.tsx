import HexShieldBadge from '@/common/components/HexShieldBadge';

interface BadgeProps {
  rank: number;
  size?: number;
  color?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#F0A800',
  2: '#9CA3AF',
  3: '#B45309',
};

export default function RankBadge({ rank, size = 40, color }: BadgeProps) {
  return (
    <HexShieldBadge
      number={rank}
      size={size}
      color={color ?? (RANK_COLORS[rank] ?? '#9CA3AF')}
    />
  );
}
