import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? '';
const AUTH_URL = process.env.AUTH_URL ?? '';

export async function GET(request: NextRequest) {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: 'GitHub client ID not configured' }, { status: 500 });
  }

  const { searchParams, origin } = request.nextUrl;
  const scope = searchParams.get('scope') ?? 'read:user,user:email';
  const baseUrl = AUTH_URL || origin;
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(oauthUrl);
}
