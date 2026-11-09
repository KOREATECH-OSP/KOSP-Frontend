import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? '';

export async function GET(request: NextRequest) {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: 'GitHub client ID not configured' }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const scope = searchParams.get('scope') ?? 'read:user,user:email';
  // 클라이언트가 자신의 실제 origin을 전달 (서버에서 추측하지 않음)
  const redirectUri = searchParams.get('redirect_uri') ?? '';

  if (!redirectUri) {
    return NextResponse.json({ error: 'redirect_uri is required' }, { status: 400 });
  }

  const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(oauthUrl);
}
