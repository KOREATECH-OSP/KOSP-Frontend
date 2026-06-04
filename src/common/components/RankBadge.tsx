import HexShieldBadge from '@/common/components/HexShieldBadge';

interface BadgeProps {
  rank: number;
  size?: number;
  color?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD11A',
  2: '#D0D0D0',
  3: '#AC7636',
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
