import { apiClient, clientApiClient } from './client';
import type { FollowUserResponse, FollowSummaryResponse } from './types';

interface AuthOptions {
  accessToken: string;
}

/** 대상 사용자 팔로우 */
export async function followUser(userId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/${userId}/follow`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/** 대상 사용자 언팔로우 */
export async function unfollowUser(userId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/${userId}/follow`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/** 팔로워 목록 (공개) */
export async function getFollowers(userId: number): Promise<FollowUserResponse[]> {
  return apiClient<FollowUserResponse[]>(`/v1/users/${userId}/followers`, { cache: 'no-store' });
}

/** 팔로잉 목록 (공개, 서버) */
export async function getFollowing(userId: number): Promise<FollowUserResponse[]> {
  return apiClient<FollowUserResponse[]>(`/v1/users/${userId}/following`, { cache: 'no-store' });
}

/** 팔로잉 목록 (클라이언트 컴포넌트용) */
export async function getFollowingClient(userId: number): Promise<FollowUserResponse[]> {
  return clientApiClient<FollowUserResponse[]>(`/v1/users/${userId}/following`);
}

/** 팔로우 요약 (팔로워/팔로잉 수 + 내 팔로우 여부, 인증 필요) */
export async function getFollowSummary(
  userId: number,
  auth: AuthOptions,
): Promise<FollowSummaryResponse> {
  return clientApiClient<FollowSummaryResponse>(`/v1/users/${userId}/follow-summary`, {
    accessToken: auth.accessToken,
  });
}
