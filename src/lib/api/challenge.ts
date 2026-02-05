import { clientApiClient } from './client';
import type { ChallengeListResponse } from './types';

interface AuthOptions {
  accessToken: string;
}

/**
 * 도전 과제 목록 및 진행도 조회 (클라이언트용)
 */
export async function getChallenges(
  auth: AuthOptions,
  tier?: number
): Promise<ChallengeListResponse> {
  const params = new URLSearchParams();
  if (tier !== undefined) {
    params.append('tier', String(tier));
  }
  const queryString = params.toString();
  const endpoint = `/v1/challenges${queryString ? `?${queryString}` : ''}`;

  return clientApiClient<ChallengeListResponse>(endpoint, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}
