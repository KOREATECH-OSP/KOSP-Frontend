import { clientApiClient } from './client';
import type {
  PermissionResponse,
  PermissionListResponse,
  PolicyResponse,
  PolicyListResponse,
  PolicyCreateRequest,
  PolicyUpdateRequest,
  RoleResponse,
  RoleListResponse,
  RoleCreateRequest,
  RoleUpdateRequest,
  AdminUserResponse,
  AdminUserListResponse,
  AdminStatsResponse,
  AdminActivityResponse,
  AdminChallengeResponse,
  AdminChallengeListResponse,
  AdminChallengeCreateRequest,
  AdminChallengeUpdateRequest,
  AdminNoticeResponse,
  AdminNoticeListResponse,
  AdminNoticeCreateRequest,
} from '@/types/admin';

interface AuthOptions {
  accessToken: string;
}

// ============================================
// Dashboard Stats
// ============================================

/**
 * 관리자 대시보드 통계 조회
 */
export async function getAdminStats(auth: AuthOptions): Promise<AdminStatsResponse> {
  return clientApiClient<AdminStatsResponse>('/v1/admin/stats', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 최근 활동 조회
 */
export async function getAdminActivities(
  auth: AuthOptions,
  limit: number = 10
): Promise<AdminActivityResponse> {
  return clientApiClient<AdminActivityResponse>(`/v1/admin/activities?limit=${limit}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

// ============================================
// Permission APIs (Read-only)
// ============================================

/**
 * 권한 목록 조회
 */
export async function getPermissions(auth: AuthOptions): Promise<PermissionListResponse> {
  return clientApiClient<PermissionListResponse>('/v1/admin/permissions', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 단일 권한 조회
 */
export async function getPermission(
  permissionId: number,
  auth: AuthOptions
): Promise<PermissionResponse> {
  return clientApiClient<PermissionResponse>(`/v1/admin/permissions/${permissionId}`, {
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
  return clientApiClient<PolicyListResponse>('/v1/admin/policies', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 단일 정책 조회
 */
export async function getPolicy(
  policyId: number,
  auth: AuthOptions
): Promise<PolicyResponse> {
  return clientApiClient<PolicyResponse>(`/v1/admin/policies/${policyId}`, {
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
 * 정책 수정
 */
export async function updatePolicy(
  policyId: number,
  data: PolicyUpdateRequest,
  auth: AuthOptions
): Promise<PolicyResponse> {
  return clientApiClient<PolicyResponse>(`/v1/admin/policies/${policyId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 정책 삭제
 */
export async function deletePolicy(
  policyId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${policyId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 정책에 권한 추가
 */
export async function attachPermissionToPolicy(
  policyId: number,
  permissionId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${policyId}/permissions/${permissionId}`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/**
 * 정책에서 권한 제거
 */
export async function detachPermissionFromPolicy(
  policyId: number,
  permissionId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/policies/${policyId}/permissions/${permissionId}`, {
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
  return clientApiClient<RoleListResponse>('/v1/admin/roles', {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 단일 역할 조회
 */
export async function getRole(
  roleId: number,
  auth: AuthOptions
): Promise<RoleResponse> {
  return clientApiClient<RoleResponse>(`/v1/admin/roles/${roleId}`, {
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
 * 역할 수정
 */
export async function updateRole(
  roleId: number,
  data: RoleUpdateRequest,
  auth: AuthOptions
): Promise<RoleResponse> {
  return clientApiClient<RoleResponse>(`/v1/admin/roles/${roleId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/**
 * 역할 삭제
 */
export async function deleteRole(
  roleId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${roleId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 역할에 정책 추가
 */
export async function attachPolicyToRole(
  roleId: number,
  policyId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${roleId}/policies/${policyId}`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/**
 * 역할에서 정책 제거
 */
export async function detachPolicyFromRole(
  roleId: number,
  policyId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/roles/${roleId}/policies/${policyId}`, {
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
  search?: string;
  role?: string;
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
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);

  const queryString = queryParams.toString();
  const endpoint = `/v1/admin/users${queryString ? `?${queryString}` : ''}`;

  return clientApiClient<AdminUserListResponse>(endpoint, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 회원 상세 조회 (관리자용)
 */
export async function getAdminUser(
  userId: number,
  auth: AuthOptions
): Promise<AdminUserResponse> {
  return clientApiClient<AdminUserResponse>(`/v1/admin/users/${userId}`, {
    accessToken: auth.accessToken,
    cache: 'no-store',
  });
}

/**
 * 회원에게 역할 부여
 */
export async function assignRoleToUser(
  userId: number,
  roleId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}/roles/${roleId}`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/**
 * 회원에서 역할 제거
 */
export async function removeRoleFromUser(
  userId: number,
  roleId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}/roles/${roleId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/**
 * 회원 비활성화 (정지)
 */
export async function suspendUser(
  userId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}/suspend`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

/**
 * 회원 활성화 (정지 해제)
 */
export async function activateUser(
  userId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/users/${userId}/activate`, {
    method: 'POST',
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
 * 공지사항 목록 조회 (boardId=3이 공지사항 게시판)
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

/**
 * 공지사항 생성
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
 * 공지사항 삭제
 */
export async function deleteAdminNotice(
  noticeId: number,
  auth: AuthOptions
): Promise<void> {
  try {
    await clientApiClient<void>(`/v1/admin/articles/${noticeId}`, {
      method: 'DELETE',
      accessToken: auth.accessToken,
    });
  } catch {
    await clientApiClient<void>(`/v1/admin/notices/${noticeId}`, {
      method: 'DELETE',
      accessToken: auth.accessToken,
    });
  }
}
