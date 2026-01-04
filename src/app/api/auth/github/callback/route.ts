import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? '';
const AUTH_URL = process.env.AUTH_URL ?? '';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = AUTH_URL || request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/auth/callback?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/auth/callback?error=${encodeURIComponent('No code received')}`
    );
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${baseUrl}/auth/callback?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`
      );
    }

    const accessToken = tokenData.access_token;

    return NextResponse.redirect(
      `${baseUrl}/auth/callback?access_token=${encodeURIComponent(accessToken)}`
    );
  } catch {
    return NextResponse.redirect(
      `${baseUrl}/auth/callback?error=${encodeURIComponent('Failed to exchange code')}`
    );
  }
}
