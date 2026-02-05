import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES } from '@/lib/auth/cookies';

// 보호된 라우트 패턴
const PROTECTED_ROUTES = [
  '/admin',
  '/user/edit',
  '/team/create',
  '/community/write',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const isAuthenticated = !!accessToken;

  // 보호된 라우트에 미인증 사용자 접근 시 로그인으로 리다이렉트
  if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 보호된 라우트
    '/admin/:path*',
    '/user/edit/:path*',
    '/team/create/:path*',
    '/community/write/:path*',
  ],
};
