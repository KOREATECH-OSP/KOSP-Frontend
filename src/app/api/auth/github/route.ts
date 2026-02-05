import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://dev.api.swkoreatech.io';

export async function GET() {
  // 백엔드의 GitHub OAuth 시작 URL로 리다이렉트
  const githubAuthUrl = `${API_BASE_URL}/v1/auth/github`;

  return NextResponse.redirect(githubAuthUrl);
}
