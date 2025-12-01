'use server';

import 'server-only';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/api/config';
import type { SessionUser } from './types';

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const serializedCookies = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  if (!serializedCookies) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: serializedCookies,
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
