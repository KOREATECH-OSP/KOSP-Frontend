import { apiClient } from './client';
import type { ChallengeListResponse } from './types';

/**
 * 도전 과제 목록 및 진행도 조회
 */
export async function getChallenges(): Promise<ChallengeListResponse> {
  return apiClient<ChallengeListResponse>('/v1/challenges', {
    cache: 'no-store',
  });
}
