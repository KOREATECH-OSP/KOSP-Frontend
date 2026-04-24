import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/auth/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.api.swkoreatech.io';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (!accessToken) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(`${API_BASE_URL}/v1/terms/agree`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Token': accessToken,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (errorData as { message?: string }).message || '약관 동의에 실패했습니다' },
      { status: res.status }
    );
  }

  return NextResponse.json({ success: true });
}
