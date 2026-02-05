'use server';

import 'server-only';
import { API_BASE_URL } from '@/lib/api/config';
import type { UserInfoResponse } from './types';

// TODO: 새로운 인증 플로우에 맞게 세션 조회 로직 구현 필요
export async function fetchSessionUser(): Promise<UserInfoResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as UserInfoResponse;
    return payload;
  } catch (error) {
    console.error('[auth] 세션 사용자 조회 실패', error);
    return null;
  }
}
