import { apiClient } from './client';
import type {
  TeamCreateRequest,
  TeamUpdateRequest,
  TeamListResponse,
  TeamDetailResponse,
} from './types';

/**
 * 팀 목록 조회
 * RSQL 필터로 삭제되지 않은 팀만 조회
 */
export async function getTeams(search?: string): Promise<TeamListResponse> {
  const rsqlFilter = 'isDeleted==false';
  const searchQuery = search
    ? `${rsqlFilter};name=like=${encodeURIComponent(search)}`
    : rsqlFilter;
  return apiClient<TeamListResponse>(`/v1/teams?search=${searchQuery}`, {
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
 * 나의 팀 조회 (배열로 반환)
 */
export async function getMyTeam(accessToken: string): Promise<TeamDetailResponse[]> {
  return apiClient<TeamDetailResponse[]>('/v1/teams/me', {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 팀 정보 수정
 */
export async function updateTeam(
  teamId: number,
  data: TeamUpdateRequest,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/${teamId}`, {
    method: 'PUT',
    body: data,
    accessToken,
  });
}

/**
 * 팀원 초대 (이메일 아이디로 초대)
 */
export async function inviteTeamMember(
  teamId: number,
  emailId: string,
  accessToken: string
): Promise<void> {
  const email = `${emailId}@koreatech.ac.kr`;
  await apiClient<void>(`/v1/teams/${teamId}/invites`, {
    method: 'POST',
    body: { email },
    accessToken,
  });
}

/**
 * 팀 삭제
 * 팀장만 삭제 가능, 모든 멤버와 초대도 함께 삭제됨
 */
export async function deleteTeam(
  teamId: number,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/${teamId}`, {
    method: 'DELETE',
    accessToken,
  });
}
