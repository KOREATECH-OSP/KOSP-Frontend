// 쿠키 이름 상수
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'kosp_access_token',
  REFRESH_TOKEN: 'kosp_refresh_token',
} as const;

// 쿠키 옵션
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// JWT 디코딩 (서버/클라이언트 공용)
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payload = parts[1];
  try {
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    // 서버와 클라이언트 모두에서 동작
    const decoded = typeof Buffer !== 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf8')
      : atob(base64);

    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

// JWT 만료 시간 정규화 (초 -> ms)
export function normalizeJwtExp(exp: number): number {
  return exp > 10_000_000_000 ? exp : exp * 1000;
}

// JWT에서 만료 시간 추출
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload<{ exp?: number | string }>(token);
  if (!payload?.exp) return null;

  const exp = typeof payload.exp === 'string' ? Number(payload.exp) : payload.exp;
  if (!Number.isFinite(exp)) return null;

  return normalizeJwtExp(exp);
}

// JWT에서 관리자 권한 확인
export function getCanAccessAdmin(token: string): boolean {
  const payload = decodeJwtPayload<{ canAccessAdmin?: boolean }>(token);
  return payload?.canAccessAdmin === true;
}
