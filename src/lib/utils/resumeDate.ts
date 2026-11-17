/**
 * 이력서 날짜 입력 유틸.
 *
 * 저장 포맷은 `YYYY.MM.DD` 하나로 통일한다 (예: `2026.02.02`).
 * - 연도만 / 연-월만 입력은 허용하지 않는다.
 * - `2026.2.2` 처럼 0 을 생략한 입력은 받아들이되 저장 시 `2026.02.02` 로 정규화한다.
 * - 실제 존재하지 않는 날짜(2026.13.01, 2026.02.30)는 거부한다.
 */

/** 화면·저장 공통 표시 포맷 */
export const DATE_FORMAT_HINT = 'YYYY.MM.DD';

/** 허용 최소/최대 연도 (오타 방지용 상식 범위) */
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;

/** `.`, `-`, `/` 를 구분자로 허용하고 월/일은 1~2자리까지 허용한다. */
const DATE_PATTERN = /^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/;

export interface DateValidationResult {
  /** 유효한 날짜인지 */
  valid: boolean;
  /** 정규화된 `YYYY.MM.DD` 문자열 (유효할 때만) */
  normalized?: string;
  /** 사용자에게 보여줄 오류 메시지 (유효하지 않을 때만) */
  error?: string;
}

/**
 * 날짜 문자열을 검증하고 `YYYY.MM.DD` 로 정규화한다.
 *
 * @param raw   사용자 입력 (빈 값이면 유효로 간주 — 선택 입력 필드를 위해)
 * @param label 오류 메시지에 사용할 필드 이름 (예: '취득일')
 */
export function validateResumeDate(raw: string | null | undefined, label = '날짜'): DateValidationResult {
  const value = (raw ?? '').trim();

  // 미입력은 통과시킨다. 필수 여부는 호출하는 쪽에서 판단한다.
  if (value === '') {
    return { valid: true, normalized: '' };
  }

  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return {
      valid: false,
      error: `${label}은(는) ${DATE_FORMAT_HINT} 형식으로 연·월·일을 모두 입력해주세요. (예: 2026.02.02)`,
    };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { valid: false, error: `${label}의 연도가 올바르지 않습니다. (${MIN_YEAR}~${MAX_YEAR})` };
  }
  if (month < 1 || month > 12) {
    return { valid: false, error: `${label}의 월이 올바르지 않습니다. (01~12)` };
  }
  if (day < 1 || day > daysInMonth(year, month)) {
    return {
      valid: false,
      error: `${label}에 존재하지 않는 날짜입니다. ${year}년 ${month}월은 ${daysInMonth(year, month)}일까지 있습니다.`,
    };
  }

  return { valid: true, normalized: format(year, month, day) };
}

/**
 * 시작일 ~ 종료일 쌍을 검증한다.
 * 둘 다 유효해야 하며, 시작일이 종료일보다 늦으면 거부한다.
 *
 * @param label 오류 메시지에 사용할 항목 이름 (예: '학력')
 */
export function validateDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  label = '기간',
): DateValidationResult & { normalizedStart?: string; normalizedEnd?: string } {
  const startResult = validateResumeDate(start, `${label} 시작일`);
  if (!startResult.valid) return startResult;

  const endResult = validateResumeDate(end, `${label} 종료일`);
  if (!endResult.valid) return endResult;

  const s = startResult.normalized ?? '';
  const e = endResult.normalized ?? '';

  // 둘 다 입력된 경우에만 순서를 따진다 (종료일 미입력 = 진행 중).
  // YYYY.MM.DD 는 zero-padding 되어 있어 문자열 비교로 시간 순서가 보존된다.
  if (s !== '' && e !== '' && s > e) {
    return { valid: false, error: `${label}의 시작일(${s})이 종료일(${e})보다 늦습니다.` };
  }

  return { valid: true, normalizedStart: s, normalizedEnd: e };
}

/** 해당 연·월의 마지막 일자 (윤년 반영) */
function daysInMonth(year: number, month: number): number {
  // Date 의 day=0 은 이전 달의 마지막 날을 의미한다.
  return new Date(year, month, 0).getDate();
}

function format(year: number, month: number, day: number): string {
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

/**
 * 시작일/종료일을 화면 표시용 기간 문자열로 합친다.
 * 종료일이 없으면 진행 중으로 표시한다.
 */
export function formatPeriod(start?: string | null, end?: string | null): string {
  const s = (start ?? '').trim();
  const e = (end ?? '').trim();
  if (!s && !e) return '';
  if (s && !e) return `${s} ~ 현재`;
  if (!s && e) return `~ ${e}`;
  return `${s} ~ ${e}`;
}
