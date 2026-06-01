interface BadgeProps {
  number: number | string;
  size?: number;
  color?: string;
  className?: string;
}

const SHIELD_PATH = [
  'M 50 10',
  'C 60 11.5, 93 22, 95 32',
  'C 95 44, 95 60, 93 78',
  'C 86 94, 69 107, 50 112',
  'C 31 107, 14 94,  7 78',
  'C  5 60,  5 44,  5 32',
  'C  7 22, 40 11.5, 50 10',
  'Z',
].join(' ');

function resolveFontSize(label: string): number {
  if (label.length === 1) return 54;
  if (label.length === 2) return 36;
  return 26;
}

function HexShieldBadge({ number, size = 80, color = '#F0A800', className = '' }: BadgeProps) {
  const label = String(number);
  const fontSize = resolveFontSize(label);
  const height = Math.round(size * 1.15);

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 115"
        width={size}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Badge: ${label}`}
        role="img"
      >
        <path d={SHIELD_PATH} fill={color} />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontWeight="bold"
          fontSize={fontSize}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

export default HexShieldBadge;
