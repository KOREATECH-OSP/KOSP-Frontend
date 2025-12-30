'use server';

import 'server-only';
import { auth } from '@/auth';
import { API_BASE_URL } from '@/lib/api/config';
import type { SessionUser } from './types';

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SessionUser;
    return payload;
  } catch (error) {
    console.error('[auth] 세션 사용자 조회 실패', error);
    return null;
  }
}
