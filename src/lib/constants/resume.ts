/**
 * 마지막 이력서 삭제를 막을 때 보여줄 안내.
 * 백엔드 ExceptionMessage.LAST_RESUME_CANNOT_BE_DELETED 와 문구를 동일하게 유지한다.
 */
export const LAST_RESUME_MESSAGE = '이력서는 최소 1개 이상 유지해야 합니다.';

/** 개발 직무 빠른 선택 칩 */
export const JOB_ROLE_PRESETS = [
  '프론트엔드 개발자',
  '백엔드 개발자',
  '풀스택 개발자',
  'DevOps / 인프라',
  'AI / ML 엔지니어',
  '모바일 개발자',
] as const;

/** 한 이력서에 등록할 수 있는 개발 직무 최대 개수 */
export const MAX_JOB_ROLES = 10;

/**
 * 개발 직무 값을 배열로 정규화한다.
 *
 * 과거 이력서는 jobRole 을 단일 문자열(때로는 콤마 구분)로 저장했으므로
 * 화면·PDF에서 읽을 때 반드시 이 함수를 거쳐야 기존 데이터가 깨지지 않는다.
 */
export function normalizeJobRole(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => v.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}
