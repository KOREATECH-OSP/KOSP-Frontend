import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://dev.api.swkoreatech.io';

export async function POST() {
  try {
    const session = await auth();

    if (session?.refreshToken) {
      // 백엔드 로그아웃 요청 (refreshToken 전달)
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'X-Refresh-Token': session.refreshToken,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/auth/logout] 에러:', error);
    return NextResponse.json({ success: true }); // 에러 시에도 성공 반환
  }
}
