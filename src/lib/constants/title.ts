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

// ── 칭호 등급별 색상 ──────────────────────────────────────────
export const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-100 text-gray-600',
  RARE: 'bg-blue-100 text-blue-700',
  EPIC: 'bg-purple-100 text-purple-700',
  LEGENDARY: 'bg-amber-100 text-amber-700',
};

// ── 칭호 이미지 경로 매핑 ─────────────────────────────────────────
// 이미지 파일 위치: public/images/titles/{code}.png
// 권장 크기: 128×128 PNG 또는 SVG
// 키는 Title.code 기준 (영문 슬러그, V11 migration 이후)
//
// 이미지 파일이 준비되면 주석을 해제하고 실제 경로를 지정하세요.
export const TITLE_IMAGE_MAP: Record<string, string> = {
  // 'first-commit':        '/images/titles/first-commit.png',
  // 'commit-habit':        '/images/titles/commit-habit.png',
  // 'commit-architect':    '/images/titles/commit-architect.png',
  // 'streak-keeper':       '/images/titles/streak-keeper.png',
  // 'routine-guardian':    '/images/titles/routine-guardian.png',
  // 'challenge-vanguard':  '/images/titles/challenge-vanguard.png',
  // 'completion-tracker':  '/images/titles/completion-tracker.png',
  // 'knowledge-messenger': '/images/titles/knowledge-messenger.png',
  // 'consensus-architect': '/images/titles/consensus-architect.png',
};

/**
 * 칭호 이미지 경로 반환.
 *
 * 우선순위:
 *   1. API에서 내려오는 iconUrl (DB에 직접 저장된 URL — 관리자가 설정)
 *   2. TITLE_IMAGE_MAP[titleCode] (정적 매핑)
 *   3. null → 호출측에서 카테고리 이모지로 fallback
 *
 * @param titleCode 칭호 코드 (Title.code, 영문 슬러그)
 * @param iconUrl   API 응답의 iconUrl (nullable)
 */
export function getTitleImage(titleCode: string, iconUrl?: string | null): string | null {
  if (iconUrl) return iconUrl;
  return TITLE_IMAGE_MAP[titleCode] ?? null;
}
