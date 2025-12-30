import { apiClient } from './client';
import type {
  RecruitRequest,
  RecruitApplyRequest,
  RecruitStatusRequest,
  RecruitResponse,
  RecruitListResponse,
} from './types';

interface GetRecruitsOptions {
  page?: number;
  size?: number;
}

/**
 * 모집 공고 목록 조회
 */
export async function getRecruits(
  boardId: number,
  options: GetRecruitsOptions = {}
): Promise<RecruitListResponse> {
  const { page = 1, size = 10 } = options;
  const params = new URLSearchParams({
    boardId: String(boardId),
    page: String(page),
    size: String(size),
  });
  return apiClient<RecruitListResponse>(`/v1/community/recruits?${params}`, {
    cache: 'no-store',
  });
}

/**
 * 모집 공고 상세 조회
 */
export async function getRecruit(id: number): Promise<RecruitResponse> {
  return apiClient<RecruitResponse>(`/v1/community/recruits/${id}`, {
    cache: 'no-store',
  });
}

/**
 * 모집 공고 작성
 */
export async function createRecruit(data: RecruitRequest): Promise<void> {
  await apiClient<void>('/v1/community/recruits', {
    method: 'POST',
    body: data,
  });
}

/**
 * 모집 공고 수정
 */
export async function updateRecruit(
  id: number,
  data: RecruitRequest
): Promise<void> {
  await apiClient<void>(`/v1/community/recruits/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 모집 공고 삭제
 */
export async function deleteRecruit(id: number): Promise<void> {
  await apiClient<void>(`/v1/community/recruits/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 모집 상태 변경
 */
export async function updateRecruitStatus(
  id: number,
  data: RecruitStatusRequest
): Promise<void> {
  await apiClient<void>(`/v1/community/recruits/${id}/status`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * 모집 공고 지원
 */
export async function applyRecruit(
  recruitId: number,
  data: RecruitApplyRequest
): Promise<void> {
  await apiClient<void>(`/v1/community/recruits/${recruitId}/apply`, {
    method: 'POST',
    body: data,
  });
}
