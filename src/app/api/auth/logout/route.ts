import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://dev.api.swkoreatech.io';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // 백엔드 로그아웃 요청 (쿠키 전달)
    await fetch(`${API_BASE_URL}/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    // 모든 인증 관련 쿠키 삭제
    const response = NextResponse.json({ success: true });

    // 쿠키 삭제 (일반적인 세션 쿠키 이름들)
    response.cookies.delete('session');
    response.cookies.delete('token');
    response.cookies.delete('auth');

    return response;
  } catch (error) {
    console.error('[api/auth/logout] 에러:', error);
    return NextResponse.json(
      { error: '로그아웃에 실패했습니다.' },
      { status: 500 }
    );
  }
}
