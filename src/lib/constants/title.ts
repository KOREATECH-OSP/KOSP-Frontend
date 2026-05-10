// ── 칭호 카테고리 이모지 ───────────────────────────────────────
export const TITLE_CATEGORY_EMOJI: Record<string, string> = {
  COMMIT: '✏️',
  STREAK: '🔥',
  CHALLENGE: '🏆',
  COLLABORATION: '🤝',
  COMMUNITY: '💬',
  INFLUENCE: '⭐',
  PROJECT: '📁',
  OPEN_SOURCE: '🐙',
  SEASON: '🌟',
  HONOR: '👑',
};

// ── 칭호 등급 한글 라벨 ─────────────────────────────────────────
export const RARITY_LABELS: Record<string, string> = {
  COMMON: '일반',
  RARE: '희귀',
  EPIC: '영웅',
  LEGENDARY: '전설',
};

// ── 칭호 등급별 색상 (쉬움=빨강 → 어려움=초록 방향) ─────────────
export const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-red-100 text-red-600',
  RARE: 'bg-amber-100 text-amber-700',
  EPIC: 'bg-blue-100 text-blue-700',
  LEGENDARY: 'bg-emerald-100 text-emerald-700',
};

// ── 칭호 이미지 경로 매핑 ─────────────────────────────────────────
// 이미지 파일 위치: public/images/titles/{파일명}
// 이미지가 없는 칭호는 null → 카테고리 이모지 또는 기본 아이콘 fallback
//
// 추가 방법:
//   1. public/images/titles/ 에 이미지 파일 배치 (권장: 64×64 PNG/SVG)
//   2. 아래 TITLE_IMAGE_MAP에 titleName → '/images/titles/파일명' 형태로 추가
//
// TODO: 코룡이 캐릭터 기반 칭호 이미지 파일이 준비되면 아래에 경로 추가
export const TITLE_IMAGE_MAP: Record<string, string | null> = {
  '첫 줄의 개척자': null,   // TODO: '/images/titles/pioneer.png'
  '저장의 습관가': null,    // TODO: '/images/titles/habit.png'
  '기록의 설계자': null,    // TODO: '/images/titles/architect.png'
  '리듬을 지키는 자': null, // TODO: '/images/titles/rhythm.png'
  '루틴의 수호자': null,    // TODO: '/images/titles/routine.png'
  '도전의 선봉장': null,    // TODO: '/images/titles/challenger.png'
  '완주의 추적자': null,    // TODO: '/images/titles/finisher.png'
  '지식의 전달자': null,    // TODO: '/images/titles/mentor.png'
  '합의의 설계자': null,    // TODO: '/images/titles/collaborator.png'
};

/**
 * 칭호 이미지 경로 반환.
 * - DB의 iconUrl이 있으면 우선 사용
 * - 없으면 TITLE_IMAGE_MAP에서 정적 경로 반환
 * - 정적 경로도 없으면 null 반환 → 호출측에서 이모지 또는 기본 아이콘으로 fallback
 */
export function getTitleImage(titleName: string, iconUrl?: string | null): string | null {
  if (iconUrl) return iconUrl;
  return TITLE_IMAGE_MAP[titleName] ?? null;
}
