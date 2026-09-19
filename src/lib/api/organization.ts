import { apiClient, clientApiClient } from './client';

export interface AvailableOrganizationResponse {
  githubOrgId: number;
  githubOrgName: string;
  avatarUrl: string | null;
  alreadyRegistered: boolean;
}

export interface OrganizationResponse {
  id: number;
  githubOrgId: number;
  githubOrgName: string;
  displayName: string;
  avatarUrl: string | null;
  description: string | null;
  tags: string | null;
  status: 'ACTIVE' | 'PENDING' | 'DISCONNECTED';
  createdAt: string;
}

export interface OrganizationDetailResponse {
  id: number;
  githubOrgName: string;
  displayName: string;
  avatarUrl: string | null;
  description: string | null;
  tags: string | null;
  status: 'ACTIVE' | 'PENDING' | 'DISCONNECTED';
  totalMemberCount: number;
  linkedMemberCount: number;
  repositoryCount: number;
  createdAt: string;
}

export interface OrganizationRegisterRequest {
  githubOrgId: number;
}

export interface OrganizationUpdateRequest {
  displayName: string;
  description: string;
  tags: string;
}

export interface OrganizationAddMemberRequest {
  githubUsername: string;
}

export interface OrganizationMemberResponse {
  id: number;
  userId: number | null;
  githubUsername: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  status: 'LINKED' | 'NOT_JOINED' | 'EMAIL_PENDING' | 'EMAIL_PRIVATE';
}

export interface AdminOrganizationMemberResponse {
  id: number;
  githubUserId: number;
  githubUsername: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  status: 'LINKED' | 'NOT_JOINED' | 'EMAIL_PENDING' | 'EMAIL_PRIVATE' | 'REMOVED';
  userId: number | null;
  joinedAt: string | null;
  syncedAt: string;
}

export interface OrganizationRepoResponse {
  id: number;
  githubRepoId: number;
  repositoryName: string;
  repositoryFullName: string;
  repositoryUrl: string;
  visibility: string;
  isActive: boolean;
}

export interface AdminOrganizationRepoResponse {
  id: number;
  githubRepoId: number;
  repositoryName: string;
  repositoryFullName: string;
  repositoryUrl: string;
  visibility: string;
  isActive: boolean;
  syncedAt: string;
}

/**
 * 전체 조직 목록 조회 (로그인 사용자 - 모든 활성 조직)
 * Server Component에서 호출 가능 (apiClient 사용)
 */
export async function getAllOrganizations(
  accessToken: string,
  search?: string
): Promise<OrganizationResponse[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient<OrganizationResponse[]>(`/v1/organizations${params}`, {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 등록 가능한 조직 목록 조회 (GitHub Owner 권한 보유 조직)
 * Server Component에서 호출 가능 (apiClient 사용)
 */
export async function getAvailableOrganizations(
  accessToken: string
): Promise<AvailableOrganizationResponse[]> {
  return apiClient<AvailableOrganizationResponse[]>('/v1/organizations/available', {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 조직 등록
 * Client Component 전용 (clientApiClient 사용)
 */
export async function registerOrganization(
  data: OrganizationRegisterRequest,
  accessToken: string
): Promise<OrganizationResponse> {
  return clientApiClient<OrganizationResponse>('/v1/organizations', {
    method: 'POST',
    body: data,
    accessToken,
  });
}

/**
 * 내가 속한 조직 목록 조회
 * Server Component에서 호출 가능 (apiClient 사용)
 */
export async function getMyOrganizations(
  accessToken: string
): Promise<OrganizationResponse[]> {
  return apiClient<OrganizationResponse[]>('/v1/organizations/my', {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 조직 상세 조회
 * Server Component에서 호출 가능 (apiClient 사용)
 */
export async function getOrganizationDetail(
  id: number,
  accessToken: string
): Promise<OrganizationDetailResponse> {
  return apiClient<OrganizationDetailResponse>(`/v1/organizations/${id}`, {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 조직 정보 수정 (Owner만 가능)
 * Client Component 전용 (clientApiClient 사용)
 */
export async function updateOrganization(
  id: number,
  data: OrganizationUpdateRequest,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/organizations/${id}`, {
    method: 'PATCH',
    body: data,
    accessToken,
  });
}

/**
 * 조직 멤버 목록 조회 (조직 Owner/Admin 전용)
 */
export async function getOrganizationMembers(
  id: number,
  accessToken: string
): Promise<OrganizationMemberResponse[]> {
  return apiClient<OrganizationMemberResponse[]>(`/v1/organizations/${id}/members`, {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 조직 멤버 추가 (Owner/Admin만 가능)
 * Client Component 전용 (clientApiClient 사용)
 */
export async function addOrganizationMember(
  orgId: number,
  data: OrganizationAddMemberRequest,
  accessToken: string
): Promise<OrganizationMemberResponse> {
  return clientApiClient<OrganizationMemberResponse>(`/v1/organizations/${orgId}/members`, {
    method: 'POST',
    body: data,
    accessToken,
  });
}

/**
 * 조직 저장소 목록 조회 (조직 멤버 전용)
 */
export async function getOrganizationRepositories(
  orgId: number,
  accessToken: string
): Promise<OrganizationRepoResponse[]> {
  return apiClient<OrganizationRepoResponse[]>(`/v1/organizations/${orgId}/repositories`, {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * 조직 저장소 활성화 (Owner/Admin)
 */
export async function activateOrganizationRepo(
  orgId: number,
  repoId: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/organizations/${orgId}/repositories/${repoId}/activate`, {
    method: 'POST',
    accessToken,
  });
}

/**
 * 조직 저장소 비활성화 (Owner/Admin)
 */
export async function deactivateOrganizationRepo(
  orgId: number,
  repoId: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/organizations/${orgId}/repositories/${repoId}/activate`, {
    method: 'DELETE',
    accessToken,
  });
}

/**
 * [관리자] 전체 조직 목록 조회
 */
export async function getAdminOrganizations(
  accessToken: string
): Promise<OrganizationResponse[]> {
  return clientApiClient<OrganizationResponse[]>('/v1/admin/organizations', {
    cache: 'no-store',
    accessToken,
  });
}

/**
 * [관리자] 조직 멤버 목록 조회
 */
export async function getAdminOrganizationMembers(
  id: number,
  accessToken: string
): Promise<AdminOrganizationMemberResponse[]> {
  return clientApiClient<AdminOrganizationMemberResponse[]>(
    `/v1/admin/organizations/${id}/members`,
    { cache: 'no-store', accessToken }
  );
}

/**
 * [관리자] 조직 저장소 목록 조회
 */
export async function getAdminOrganizationRepositories(
  id: number,
  accessToken: string
): Promise<AdminOrganizationRepoResponse[]> {
  return clientApiClient<AdminOrganizationRepoResponse[]>(
    `/v1/admin/organizations/${id}/repositories`,
    { cache: 'no-store', accessToken }
  );
}

/**
 * [관리자] 조직 수동 동기화
 */
export async function syncOrganization(
  id: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/organizations/${id}/sync`, {
    method: 'POST',
    accessToken,
  });
}

/**
 * [관리자] 조직 비활성화
 */
export async function deactivateOrganization(
  id: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/admin/organizations/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}

/**
 * 조직 멤버 관리자 임명 (Owner 또는 Admin이 가능)
 */
export async function appointOrganizationAdmin(
  orgId: number,
  memberId: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/organizations/${orgId}/members/${memberId}/admin`, {
    method: 'POST',
    accessToken,
  });
}

/**
 * 조직 멤버 관리자 해임 (Owner만 가능)
 */
export async function dismissOrganizationAdmin(
  orgId: number,
  memberId: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/organizations/${orgId}/members/${memberId}/admin`, {
    method: 'DELETE',
    accessToken,
  });
}
