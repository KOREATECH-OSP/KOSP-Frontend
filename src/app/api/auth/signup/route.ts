import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://api.kosp.kro.kr/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 백엔드 회원가입 요청 (회원가입 시 자동 로그인 처리됨)
    const signupResponse = await fetch(`${API_BASE_URL}/v1/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        kut_id: body.kut_id,
        kut_email: body.kut_email,
        password: body.password,
      }),
    });

    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      return NextResponse.json(
        { error: errorText || '회원가입에 실패했습니다.' },
        { status: signupResponse.status }
      );
    }

    // 백엔드에서 받은 Set-Cookie 헤더 추출 (자동 로그인)
    const setCookieHeader = signupResponse.headers.get('set-cookie');

    // 백엔드 쿠키를 사용해서 /v1/auth/me 호출
    const meResponse = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: 'GET',
      headers: setCookieHeader ? { Cookie: setCookieHeader.split(';')[0] } : {},
    });

    let user = null;
    if (meResponse.ok) {
      user = await meResponse.json();
    }

    // 클라이언트에 응답 + 쿠키 전달
    const response = NextResponse.json({ success: true, user });

    if (setCookieHeader) {
      // 백엔드 쿠키를 클라이언트로 전달
      const cookieStore = await cookies();
      const cookieParts = setCookieHeader.split(';');
      const [nameValue] = cookieParts[0].split('=');
      const cookieValue = cookieParts[0].substring(nameValue.length + 1);

      cookieStore.set(nameValue, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[api/auth/signup] 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
