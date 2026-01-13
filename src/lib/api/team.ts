import { apiClient } from './client';
import type {
  TeamCreateRequest,
  TeamListResponse,
  TeamDetailResponse,
} from './types';

/**
 * 팀 목록 조회
 */
export async function getTeams(search?: string): Promise<TeamListResponse> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient<TeamListResponse>(`/v1/teams${params}`, {
    cache: 'no-store',
  });
}

/**
 * 팀 상세 조회
 */
export async function getTeam(teamId: number): Promise<TeamDetailResponse> {
  return apiClient<TeamDetailResponse>(`/v1/teams/${teamId}`, {
    cache: 'no-store',
  });
}

/**
 * 팀 생성
 */
export async function createTeam(data: TeamCreateRequest): Promise<void> {
  await apiClient<void>('/v1/teams', {
    method: 'POST',
    body: data,
  });
}

/**
 * 나의 팀 조회
 */
export async function getMyTeam(accessToken: string): Promise<TeamDetailResponse> {
  return apiClient<TeamDetailResponse>('/v1/teams/me', {
    cache: 'no-store',
    accessToken,
  });
}
