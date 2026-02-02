import { cookies } from 'next/headers';
import { COOKIE_NAMES, getTokenExpiry, getCanAccessAdmin } from './cookies';
import type { AuthSession, UserInfoResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

/**
 * 서버 사이드에서 현재 세션을 가져옵니다.
 * NextAuth의 auth() 함수를 대체합니다.
 */
export async function auth(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  try {
    // 사용자 정보 가져오기
    const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: { 'X-Access-Token': accessToken },
      cache: 'no-store',
    });

    if (!meRes.ok) {
      // 토큰이 만료된 경우 갱신 시도
      if (meRes.status === 401) {
        return await refreshAndGetSession(refreshToken);
      }
      return null;
    }

    const userInfo: UserInfoResponse = await meRes.json();
    const accessTokenExpires = getTokenExpiry(accessToken) || Date.now() + 30 * 60 * 1000;

    return {
      user: {
        id: String(userInfo.id),
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.profileImage,
      },
      accessToken,
      refreshToken,
      canAccessAdmin: getCanAccessAdmin(accessToken),
      accessTokenExpires,
    };
  } catch {
    return null;
  }
}

/**
 * 토큰 갱신 후 세션 반환
 */
async function refreshAndGetSession(refreshToken: string): Promise<AuthSession | null> {
  try {
    const refreshRes = await fetch(`${API_BASE_URL}/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        'X-Refresh-Token': refreshToken,
      },
    });

    if (!refreshRes.ok) {
      return null;
    }

    const newTokens = await refreshRes.json();
    const newAccessToken = newTokens.accessToken;
    const newRefreshToken = newTokens.refreshToken;

    // 사용자 정보 가져오기
    const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: { 'X-Access-Token': newAccessToken },
      cache: 'no-store',
    });

    if (!meRes.ok) {
      return null;
    }

    const userInfo: UserInfoResponse = await meRes.json();
    const accessTokenExpires = getTokenExpiry(newAccessToken) || Date.now() + 30 * 60 * 1000;

    // 쿠키 업데이트는 클라이언트 사이드에서 처리됨
    // SSR에서는 새 토큰으로 세션만 반환
    return {
      user: {
        id: String(userInfo.id),
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.profileImage,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      canAccessAdmin: getCanAccessAdmin(newAccessToken),
      accessTokenExpires,
    };
  } catch {
    return null;
  }
}
