import { apiClient } from './client';
import type { LoginRequest, AuthMeResponse } from './types';

/**
 * 일반 로그인
 * 이메일과 비밀번호(SHA-256 해시)를 전달받아 로그인 처리
 */
export async function login(data: LoginRequest): Promise<void> {
  await apiClient<void>('/v1/auth/login', {
    method: 'POST',
    body: data,
  });
}

/**
 * 로그아웃
 * 현재 로그인한 사용자의 세션/토큰을 무효화
 */
export async function logout(): Promise<void> {
  await apiClient<void>('/v1/auth/logout', {
    method: 'POST',
  });
}

/**
 * 내 정보 조회
 * 현재 로그인된 사용자의 기본 정보를 조회
 */
export async function getMyInfo(): Promise<AuthMeResponse> {
  return apiClient<AuthMeResponse>('/v1/auth/me', {
    cache: 'no-store',
  });
}
