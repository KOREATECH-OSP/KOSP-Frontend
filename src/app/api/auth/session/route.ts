import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_NAMES,
  COOKIE_OPTIONS,
  getTokenExpiry,
  getCanAccessAdmin,
} from '@/lib/auth/cookies';
import type { AuthSession, UserInfoResponse, LoginResponse } from '@/lib/auth/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

// 쿠키 만료 시간 (7일)
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * GET /api/auth/session
 * 현재 세션 조회
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ session: null });
  }

  try {
    const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!meRes.ok) {
      if (meRes.status === 401) {
        // 토큰 만료 - 갱신 시도
        const refreshedSession = await refreshAndCreateSession(refreshToken);
        if (refreshedSession) {
          const response = NextResponse.json({ session: refreshedSession.session });
          response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, refreshedSession.accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: COOKIE_MAX_AGE,
          });
          response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshedSession.refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: COOKIE_MAX_AGE,
          });
          return response;
        }
      }
      return NextResponse.json({ session: null });
    }

    const userInfo: UserInfoResponse = await meRes.json();
    const accessTokenExpires = getTokenExpiry(accessToken) || Date.now() + 30 * 60 * 1000;

    const session: AuthSession = {
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

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ session: null });
  }
}

/**
 * POST /api/auth/session
 * 로그인 (세션 생성)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    let tokens: LoginResponse;
    let userInfo: UserInfoResponse;

    if (type === 'credentials') {
      // 이메일/비밀번호 로그인
      const { email, password } = body;

      const loginRes = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        return NextResponse.json(
          { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
          { status: 401 }
        );
      }

      tokens = await loginRes.json();

      const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (!meRes.ok) {
        return NextResponse.json({ error: '사용자 정보를 가져올 수 없습니다' }, { status: 500 });
      }

      userInfo = await meRes.json();
    } else if (type === 'github') {
      // GitHub 로그인
      const { githubAccessToken } = body;

      const loginRes = await fetch(`${API_BASE_URL}/v1/auth/login/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubAccessToken }),
      });

      if (!loginRes.ok) {
        const status = loginRes.status;
        if (status === 404) {
          return NextResponse.json(
            { error: '가입되지 않은 GitHub 계정입니다' },
            { status: 404 }
          );
        }
        return NextResponse.json({ error: 'GitHub 로그인에 실패했습니다' }, { status: 401 });
      }

      tokens = await loginRes.json();

      const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      if (!meRes.ok) {
        return NextResponse.json({ error: '사용자 정보를 가져올 수 없습니다' }, { status: 500 });
      }

      userInfo = await meRes.json();
    } else if (type === 'tokens') {
      // 토큰으로 직접 로그인 (회원가입 후)
      const { accessToken, refreshToken } = body;

      const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!meRes.ok) {
        return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
      }

      tokens = { accessToken, refreshToken };
      userInfo = await meRes.json();
    } else {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
    }

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

    // httpOnly 쿠키 설정
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
    return NextResponse.json({ error: '로그인에 실패했습니다' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 * 로그아웃 (세션 삭제)
 */
export async function DELETE() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  // 백엔드 로그아웃 API 호출
  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'X-Refresh-Token': refreshToken,
        },
      });
    } catch {
      // 실패해도 쿠키는 삭제
    }
  }

  const response = NextResponse.json({ success: true });

  // 쿠키 삭제
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);

  return response;
}

/**
 * 토큰 갱신 후 세션 생성
 */
async function refreshAndCreateSession(refreshToken: string): Promise<{
  session: AuthSession;
  accessToken: string;
  refreshToken: string;
} | null> {
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

    const tokens: LoginResponse = await refreshRes.json();

    const meRes = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      cache: 'no-store',
    });

    if (!meRes.ok) {
      return null;
    }

    const userInfo: UserInfoResponse = await meRes.json();
    const accessTokenExpires = getTokenExpiry(tokens.accessToken) || Date.now() + 30 * 60 * 1000;

    return {
      session: {
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
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  } catch {
    return null;
  }
}
