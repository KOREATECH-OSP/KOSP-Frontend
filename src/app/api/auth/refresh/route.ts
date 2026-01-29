import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_NAMES,
  COOKIE_OPTIONS,
  getTokenExpiry,
  getCanAccessAdmin,
} from '@/lib/auth/cookies';
import type { AuthSession, UserInfoResponse, LoginResponse } from '@/lib/auth/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * POST /api/auth/refresh
 * 토큰 갱신
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: '리프레시 토큰이 없습니다' }, { status: 401 });
  }

  try {
    const headers: Record<string, string> = {
      'X-Refresh-Token': refreshToken,
    };
    if (accessToken) {
      headers['X-Access-Token'] = accessToken;
    }

    const refreshRes = await fetch(`${API_BASE_URL}/v1/auth/reissue`, {
      method: 'POST',
      headers,
    });

    if (!refreshRes.ok) {
      // 쿠키 삭제
      const errorResponse = NextResponse.json(
        { error: '토큰 갱신에 실패했습니다' },
        { status: 401 }
      );
      errorResponse.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
      errorResponse.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
      return errorResponse;
    }

    const tokens: LoginResponse = await refreshRes.json();

    // 사용자 정보 가져오기
    const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      cache: 'no-store',
    });

    if (!meRes.ok) {
      return NextResponse.json(
        { error: '사용자 정보를 가져올 수 없습니다' },
        { status: 500 }
      );
    }

    const userInfo: UserInfoResponse = await meRes.json();
    const accessTokenExpires = getTokenExpiry(tokens.accessToken) || Date.now() + 30 * 60 * 1000;

    const session: AuthSession = {
      user: {
        id: String(userInfo.id),
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.profileImage,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      canAccessAdmin: getCanAccessAdmin(tokens.accessToken),
      accessTokenExpires,
    };

    const response = NextResponse.json({ session });

    // 새 토큰으로 쿠키 업데이트
    response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE,
    });
    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ error: '토큰 갱신에 실패했습니다' }, { status: 500 });
  }
}
