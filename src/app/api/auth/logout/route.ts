import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/auth/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://dev.api.swkoreatech.io';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (refreshToken) {
      // 백엔드 로그아웃 요청 (refreshToken 전달)
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'X-Refresh-Token': refreshToken,
        },
      });
    }

    const response = NextResponse.json({ success: true });

    // 쿠키 삭제
    response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
    response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);

    return response;
  } catch (error) {
    console.error('[api/auth/logout] 에러:', error);

    const response = NextResponse.json({ success: true }); // 에러 시에도 성공 반환
    response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
    response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);

    return response;
  }
}
