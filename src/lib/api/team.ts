import { apiClient } from './client';
import type {
  TeamCreateRequest,
  TeamUpdateRequest,
  TeamListResponse,
  TeamDetailResponse,
  TeamInviteResponse,
  TeamRole,
  InviteAvailabilityResponse,
} from './types';

/**
 * 팀 목록 조회
 * RSQL 필터로 삭제되지 않은 팀만 조회
 */
export async function getTeams(search?: string): Promise<TeamListResponse> {
  const rsqlFilter = 'isDeleted==false';
  const params = new URLSearchParams();
  params.set('rsql', rsqlFilter);
  if (search) {
    params.set('search', search);
  }
  return apiClient<TeamListResponse>(`/v1/teams?${params.toString()}`, {
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
 * 팀 초대 상세 조회
 */
export async function getTeamInvite(inviteId: string): Promise<TeamInviteResponse> {
  return apiClient<TeamInviteResponse>(`/v1/teams/invites/${inviteId}`, {
    cache: 'no-store',
  });
}

/**
 * 초대 가능 여부 조회
 *
 * 반복 거절로 제한된 상대인지 초대 전에 확인한다.
 * 제한된 경우 누적 거절 횟수와 제한 종료 시각을 함께 받는다.
 */
export async function getInviteAvailability(
  teamId: number,
  emailId: string,
  accessToken: string
): Promise<InviteAvailabilityResponse> {
  const email = `${emailId}@koreatech.ac.kr`;
  return apiClient<InviteAvailabilityResponse>(
    `/v1/teams/${teamId}/invites/availability?email=${encodeURIComponent(email)}`,
    { cache: 'no-store', accessToken }
  );
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

/**
 * 팀 초대 수락
 */
export async function acceptTeamInvite(
  inviteId: string,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/invites/${inviteId}/accept`, {
    method: 'POST',
    accessToken,
  });
}

/**
 * 팀 초대 거절
 */
export async function rejectTeamInvite(
  inviteId: string,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/invites/${inviteId}/reject`, {
    method: 'POST',
    accessToken,
  });
}

/**
 * 팀원 제명 (팀장/관리자가 특정 팀원을 내보냄)
 */
export async function removeTeamMember(
  teamId: number,
  userId: number,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    accessToken,
  });
}

/**
 * 팀 탈퇴 (본인이 자발적으로 팀에서 나감)
 */
export async function leaveTeam(
  teamId: number,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/${teamId}/members/me`, {
    method: 'DELETE',
    accessToken,
  });
}

/**
 * 초대 취소 (팀장/관리자가 발송한 초대를 취소)
 */
export async function cancelTeamInvite(
  inviteId: number,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/invites/${inviteId}`, {
    method: 'DELETE',
    accessToken,
  });
}

/**
 * 팀원 권한 변경 (팀장이 관리자 권한을 위임/회수)
 */
export async function changeTeamMemberRole(
  teamId: number,
  userId: number,
  role: TeamRole,
  accessToken: string
): Promise<void> {
  await apiClient<void>(`/v1/teams/${teamId}/members/${userId}/role`, {
    method: 'PATCH',
    body: { role },
    accessToken,
  });
}
