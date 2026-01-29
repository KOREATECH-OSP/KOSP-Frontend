import { apiClient, clientApiClient } from './client';
import type {
  RecruitRequest,
  RecruitApplyRequest,
  RecruitStatusRequest,
  RecruitResponse,
  RecruitListResponse,
  RecruitApplyListResponse,
  RecruitApplyDecisionRequest,
} from './types';

interface GetRecruitsOptions {
  page?: number;
  size?: number;
}

interface AuthOptions {
  accessToken: string;
}

/**
 * 모집 공고 목록 조회
 * RSQL 필터로 삭제되지 않은 공고만 조회
 */
export async function getRecruits(
  boardId: number,
  options: GetRecruitsOptions = {}
): Promise<RecruitListResponse> {
  const { page = 1, size = 10 } = options;
  const params = new URLSearchParams({
    boardId: String(boardId),
    page: String(page - 1),
    size: String(size),
    search: 'isDeleted==false',
  });
  return apiClient<RecruitListResponse>(`/v1/community/recruits?${params}`, {
    cache: 'no-store',
  });
}

/**
 * 모집 공고 상세 조회
 */
export async function getRecruit(id: number, accessToken?: string): Promise<RecruitResponse> {
  return apiClient<RecruitResponse>(`/v1/community/recruits/${id}`, {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 모집 공고 작성
 */
export async function createRecruit(data: RecruitRequest, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>('/v1/community/recruits', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 모집 공고 수정
 */
export async function updateRecruit(
  id: number,
  data: RecruitRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/community/recruits/${id}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 모집 공고 삭제
 */
export async function deleteRecruit(id: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/community/recruits/${id}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 모집 상태 변경
 */
export async function updateRecruitStatus(
  id: number,
  data: RecruitStatusRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/community/recruits/${id}/status`, {
    method: 'PATCH',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 모집 공고 지원 (클라이언트용)
 */
export async function applyRecruit(
  recruitId: number,
  data: RecruitApplyRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/community/recruits/${recruitId}/apply`, {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 모집 공고 지원자 목록 조회 (팀장 전용)
 */
export async function getRecruitApplications(
  recruitId: number,
  auth: AuthOptions
): Promise<RecruitApplyListResponse> {
  return clientApiClient<RecruitApplyListResponse>(
    `/v1/community/recruits/${recruitId}/applications`,
    {
      method: 'GET',
      accessToken: auth.accessToken,
    }
  );
}

/**
 * 지원 수락/거절 (팀장 전용)
 */
export async function decideApplication(
  applicationId: number,
  data: RecruitApplyDecisionRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(
    `/v1/community/recruits/applications/${applicationId}`,
    {
      method: 'PATCH',
      body: data,
      accessToken: auth.accessToken,
    }
  );
}
