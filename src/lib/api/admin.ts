import { clientApiClient } from './client';
import type {
  PermissionResponse,
  PermissionListResponse,
  PolicyResponse,
  PolicyDetailResponse,
  PolicyListResponse,
  PolicyCreateRequest,
  PolicyUpdateRequest,
  RoleResponse,
  RoleListResponse,
  RoleCreateRequest,
  RoleUpdateRequest,
  AdminUserListResponse,
  AdminChallengeResponse,
  AdminChallengeListResponse,
  AdminChallengeCreateRequest,
  AdminChallengeUpdateRequest,
  AdminNoticeResponse,
  AdminNoticeListResponse,
  AdminNoticeCreateRequest,
  AdminNoticeUpdateRequest,
  AdminReportResponse,
  AdminReportListResponse,
  AdminArticleResponse,
  AdminArticleListResponse,
  AdminSearchResponse,
  PointTransactionRequest,
  PointHistoryResponse,
} from '@/types/admin';

interface AuthOptions {
  accessToken: string;
}

// ============================================
// Permission APIs (Read-only)
// ============================================

/**
 * 권한 목록 조회
 */
export async function getPermissions(auth: AuthOptions): Promise<PermissionListResponse> {
  const permissions = await clientApiClient<PermissionResponse[]>('/v1/admin/permissions', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
  return { permissions };
}

/**
 * 단일 권한 조회 (by name)
 */
export async function getPermission(
  permissionName: string,
  auth: AuthOptions
): Promise<PermissionResponse> {
  return clientApiClient<PermissionResponse>(`/v1/admin/permissions/${encodeURIComponent(permissionName)}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

// ============================================
// Policy APIs
// ============================================

/**
 * 정책 목록 조회
 */
export async function getPolicies(auth: AuthOptions): Promise<PolicyListResponse> {
  const policies = await clientApiClient<PolicyResponse[]>('/v1/admin/policies', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
  return { policies };
}

/**
 * 단일 정책 조회 (by name) - 권한 정보 포함
 */
export async function getPolicy(
  policyName: string,
  auth: AuthOptions
): Promise<PolicyDetailResponse> {
  return clientApiClient<PolicyDetailResponse>(`/v1/admin/policies/${encodeURIComponent(policyName)}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 정책 생성
 */
export async function createPolicy(
  data: PolicyCreateRequest,
  auth: AuthOptions
): Promise<PolicyResponse> {
  return clientApiClient<PolicyResponse>('/v1/admin/policies', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 정책 수정 (by name)
 */
export async function updatePolicy(
  policyName: string,
  data: PolicyUpdateRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${encodeURIComponent(policyName)}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 정책 삭제 (by name)
 */
export async function deletePolicy(
  policyName: string,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${encodeURIComponent(policyName)}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 정책에 권한 추가 (by name)
 */
export async function attachPermissionToPolicy(
  policyName: string,
  permissionName: string,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${encodeURIComponent(policyName)}/permissions`, {
    method: 'POST',
    body: { permissionName },
    accessToken: auth.accessToken,
  });
}

/**
 * 정책에서 권한 제거 (by name)
 */
export async function detachPermissionFromPolicy(
  policyName: string,
  permissionName: string,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${encodeURIComponent(policyName)}/permissions/${encodeURIComponent(permissionName)}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ============================================
// Role APIs
// ============================================

/**
 * 역할 목록 조회
 */
export async function getRoles(auth: AuthOptions): Promise<RoleListResponse> {
  const roles = await clientApiClient<RoleResponse[]>('/v1/admin/roles', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
  return { roles };
}

/**
 * 단일 역할 조회 (by name)
 */
export async function getRole(
  roleName: string,
  auth: AuthOptions
): Promise<RoleResponse> {
  return clientApiClient<RoleResponse>(`/v1/admin/roles/${encodeURIComponent(roleName)}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 역할 생성
 */
export async function createRole(
  data: RoleCreateRequest,
  auth: AuthOptions
): Promise<RoleResponse> {
  return clientApiClient<RoleResponse>('/v1/admin/roles', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 역할 수정 (by name)
 */
export async function updateRole(
  roleName: string,
  data: RoleUpdateRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${encodeURIComponent(roleName)}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 역할 삭제 (by name)
 */
export async function deleteRole(
  roleName: string,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${encodeURIComponent(roleName)}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 역할에 정책 추가 (by name)
 */
export async function attachPolicyToRole(
  roleName: string,
  policyName: string,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${encodeURIComponent(roleName)}/policies`, {
    method: 'POST',
    body: { policyName },
    accessToken: auth.accessToken,
  });
}

/**
 * 역할에서 정책 제거 (by name)
 */
export async function detachPolicyFromRole(
  roleName: string,
  policyName: string,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${encodeURIComponent(roleName)}/policies/${encodeURIComponent(policyName)}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ============================================
// User Management APIs
// ============================================

interface GetUsersParams {
  page?: number;
  size?: number;
}

/**
 * 회원 목록 조회 (관리자용)
 */
export async function getAdminUsers(
  params: GetUsersParams,
  auth: AuthOptions
): Promise<AdminUserListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', String(params.page - 1));
  if (params.size !== undefined) queryParams.append('size', String(params.size));

  const queryString = queryParams.toString();
  const endpoint = `/v1/admin/users${queryString ? `?${queryString}` : ''}`;

  return clientApiClient<AdminUserListResponse>(endpoint, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 회원 정보 수정 (관리자용)
 */
export async function updateAdminUser(
  userId: number,
  data: { name?: string; introduction?: string; profileImageUrl?: string },
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 회원 강제 탈퇴 (관리자용)
 */
export async function deleteAdminUser(
  userId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 회원 역할 변경 (역할 배열 전체 교체)
 */
export async function updateUserRoles(
  userId: number,
  roles: string[],
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}/roles`, {
    method: 'PUT',
    body: { roles },
    accessToken: auth.accessToken,
  });
}

// ============================================
// Challenge Management APIs
// ============================================

/**
 * 챌린지 목록 조회
 */
export async function getAdminChallenges(
  auth: AuthOptions
): Promise<AdminChallengeResponse[]> {
  const response = await clientApiClient<AdminChallengeListResponse>('/v1/admin/challenges', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
  return response.challenges || [];
}

/**
 * 챌린지 상세 조회
 */
export async function getAdminChallenge(
  challengeId: number,
  auth: AuthOptions
): Promise<AdminChallengeResponse> {
  return clientApiClient<AdminChallengeResponse>(`/v1/admin/challenges/${challengeId}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 챌린지 생성
 */
export async function createAdminChallenge(
  data: AdminChallengeCreateRequest,
  auth: AuthOptions
): Promise<AdminChallengeResponse> {
  return clientApiClient<AdminChallengeResponse>('/v1/admin/challenges', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 챌린지 수정
 */
export async function updateAdminChallenge(
  challengeId: number,
  data: AdminChallengeUpdateRequest,
  auth: AuthOptions
): Promise<AdminChallengeResponse> {
  return clientApiClient<AdminChallengeResponse>(`/v1/admin/challenges/${challengeId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 챌린지 삭제
 */
export async function deleteAdminChallenge(
  challengeId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/challenges/${challengeId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ============================================
// Notice Management APIs
// ============================================

/**
 * 공지사항 작성
 */
export async function createAdminNotice(
  data: AdminNoticeCreateRequest,
  auth: AuthOptions
): Promise<AdminNoticeResponse> {
  return clientApiClient<AdminNoticeResponse>('/v1/admin/notices', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 공지사항 수정
 */
export async function updateAdminNotice(
  noticeId: number,
  data: AdminNoticeUpdateRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/notices/${noticeId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 공지사항 삭제
 */
export async function deleteAdminNotice(
  noticeId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/notices/${noticeId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 공지사항 목록 조회 (커뮤니티 API 사용 - boardId=3이 공지사항)
 */
export async function getAdminNotices(
  auth: AuthOptions,
  page: number = 0,
  size: number = 20
): Promise<AdminNoticeListResponse> {
  try {
    const response = await clientApiClient<AdminNoticeListResponse>(
      `/v1/community/articles?boardId=3&page=${page}&size=${size}`,
      {
        accessToken: auth.accessToken,
        cache: 'no-store',
      }
    );
    return {
      posts: response.posts || [],
      pagination: response.pagination || { currentPage: 0, totalPages: 1, totalItems: 0 },
    };
  } catch {
    return {
      posts: [],
      pagination: { currentPage: 0, totalPages: 1, totalItems: 0 },
    };
  }
}

// ============================================
// Article Management APIs
// ============================================

/**
 * 게시글 목록 조회 (관리자용)
 */
export async function getAdminArticles(
  auth: AuthOptions,
  boardId?: number,
  page: number = 0,
  size: number = 20
): Promise<AdminArticleListResponse> {
  const queryParams = new URLSearchParams();
  if (boardId !== undefined) queryParams.append('boardId', String(boardId));
  queryParams.append('page', String(page));
  queryParams.append('size', String(size));

  return clientApiClient<AdminArticleListResponse>(`/v1/admin/articles?${queryParams.toString()}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 게시글 상세 조회 (관리자용)
 */
export async function getAdminArticle(
  articleId: number,
  auth: AuthOptions
): Promise<AdminArticleResponse> {
  return clientApiClient<AdminArticleResponse>(`/v1/admin/articles/${articleId}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 게시글 삭제 (관리자용)
 */
export async function deleteAdminArticle(
  articleId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/articles/${articleId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ============================================
// Report Management APIs
// ============================================

/**
 * 신고 목록 조회
 */
export async function getAdminReports(
  auth: AuthOptions
): Promise<AdminReportListResponse> {
  const reports = await clientApiClient<AdminReportResponse[]>('/v1/admin/reports', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
  return { reports };
}

/**
 * 신고 처리
 */
export async function processAdminReport(
  reportId: number,
  action: 'DELETE_CONTENT' | 'REJECT',
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/reports/${reportId}`, {
    method: 'POST',
    body: { action },
    accessToken: auth.accessToken,
  });
}

// ============================================
// Banner API
// ============================================

export interface BannerSettingResponse {
  isActive: boolean;
}

/**
 * 배너 표시 여부 조회
 */
export async function getBannerStatus(auth: AuthOptions): Promise<BannerSettingResponse> {
  return clientApiClient<BannerSettingResponse>('/v1/banner', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 배너 표시 여부 토글
 */
export async function toggleBanner(auth: AuthOptions): Promise<BannerSettingResponse> {
  return clientApiClient<BannerSettingResponse>('/v1/admin/banner/toggle', {
    method: 'PATCH',
    accessToken: auth.accessToken,
  });
}

// ============================================
// Search API
// ============================================

/**
 * 통합 검색 (관리자용)
 */
export async function adminSearch(
  keyword: string,
  type: 'USER' | 'ARTICLE' | 'ALL',
  auth: AuthOptions
): Promise<AdminSearchResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('keyword', keyword);
  queryParams.append('type', type);

  return clientApiClient<AdminSearchResponse>(`/v1/admin/search?${queryParams.toString()}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

// ============================================
// Point Management APIs
// ============================================

/**
 * 사용자 포인트 변경 (적립/회수)
 * @param userId 사용자 ID
 * @param data point: 양수면 적립, 음수면 회수 / reason: 변경 사유
 */
export async function updateUserPoints(
  userId: number,
  data: PointTransactionRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/points/users/${userId}`, {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 사용자 포인트 내역 조회
 */
export async function getUserPointHistory(
  userId: number,
  params: { page?: number; size?: number },
  auth: AuthOptions
): Promise<PointHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', String(params.page));
  if (params.size !== undefined) queryParams.append('size', String(params.size));

  const queryString = queryParams.toString();
  const endpoint = `/v1/admin/points/users/${userId}/history${queryString ? `?${queryString}` : ''}`;

  return clientApiClient<PointHistoryResponse>(endpoint, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}
