import { apiClient, clientApiClient } from './client';
import type {
  MaterialFolderResponse,
  MaterialItemResponse,
  MaterialFolderCreateRequest,
  MaterialFolderUpdateRequest,
  MaterialItemCreateRequest,
  MaterialVisibility,
} from './types';

interface AuthOptions {
  accessToken: string;
}

// ── 폴더 ──────────────────────────────────────────────────────────

/** 내 폴더 트리 조회 */
export async function getMyMaterialFolders(auth: AuthOptions): Promise<MaterialFolderResponse[]> {
  return clientApiClient<MaterialFolderResponse[]>('/v1/users/me/material-folders', {
    accessToken: auth.accessToken,
  });
}

/** 시작 폴더 조회 (없으면 null) */
export async function getStartMaterialFolder(
  auth: AuthOptions,
): Promise<MaterialFolderResponse | null> {
  const res = await clientApiClient<MaterialFolderResponse | undefined>(
    '/v1/users/me/material-folders/start',
    { accessToken: auth.accessToken },
  );
  return res ?? null;
}

/** 폴더 생성 */
export async function createMaterialFolder(
  data: MaterialFolderCreateRequest,
  auth: AuthOptions,
): Promise<MaterialFolderResponse> {
  return clientApiClient<MaterialFolderResponse>('/v1/users/me/material-folders', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/** 폴더 수정 */
export async function updateMaterialFolder(
  folderId: number,
  data: MaterialFolderUpdateRequest,
  auth: AuthOptions,
): Promise<MaterialFolderResponse> {
  return clientApiClient<MaterialFolderResponse>(`/v1/users/me/material-folders/${folderId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/** 폴더 공개/비공개 변경 */
export async function changeMaterialFolderVisibility(
  folderId: number,
  visibility: MaterialVisibility,
  auth: AuthOptions,
): Promise<MaterialFolderResponse> {
  return clientApiClient<MaterialFolderResponse>(
    `/v1/users/me/material-folders/${folderId}/visibility`,
    { method: 'PATCH', body: { visibility }, accessToken: auth.accessToken },
  );
}

/** 시작 폴더 지정 */
export async function setStartMaterialFolder(
  folderId: number,
  auth: AuthOptions,
): Promise<MaterialFolderResponse> {
  return clientApiClient<MaterialFolderResponse>(
    `/v1/users/me/material-folders/${folderId}/start`,
    { method: 'PATCH', accessToken: auth.accessToken },
  );
}

/** 폴더 삭제 (빈 폴더만) */
export async function deleteMaterialFolder(folderId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/me/material-folders/${folderId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ── 자료 아이템 ────────────────────────────────────────────────────

/** 폴더 내 자료 조회 (최신순) */
export async function getMaterialFolderItems(
  folderId: number,
  auth: AuthOptions,
): Promise<MaterialItemResponse[]> {
  return clientApiClient<MaterialItemResponse[]>(
    `/v1/users/me/material-folders/${folderId}/items`,
    { accessToken: auth.accessToken },
  );
}

/** 최신 자료 조회 (마이페이지 노출용) */
export async function getRecentMaterials(
  auth: AuthOptions,
  limit: number = 5,
): Promise<MaterialItemResponse[]> {
  return clientApiClient<MaterialItemResponse[]>(
    `/v1/users/me/materials/recent?limit=${limit}`,
    { accessToken: auth.accessToken },
  );
}

/** 자료 등록 */
export async function createMaterialItem(
  data: MaterialItemCreateRequest,
  auth: AuthOptions,
): Promise<MaterialItemResponse> {
  return clientApiClient<MaterialItemResponse>('/v1/users/me/materials', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/** 자료 공개/비공개 변경 */
export async function changeMaterialItemVisibility(
  itemId: number,
  visibility: MaterialVisibility,
  auth: AuthOptions,
): Promise<MaterialItemResponse> {
  return clientApiClient<MaterialItemResponse>(`/v1/users/me/materials/${itemId}/visibility`, {
    method: 'PATCH',
    body: { visibility },
    accessToken: auth.accessToken,
  });
}

/** 자료 삭제 */
export async function deleteMaterialItem(itemId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/me/materials/${itemId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ── 타인 공개 조회 ─────────────────────────────────────────────────

/** 특정 사용자의 공개 폴더 조회 */
export async function getPublicMaterialFolders(userId: number): Promise<MaterialFolderResponse[]> {
  return apiClient<MaterialFolderResponse[]>(`/v1/users/${userId}/material-folders`, {
    cache: 'no-store',
  });
}

/** 특정 사용자의 공개 폴더 내 공개 자료 조회 */
export async function getPublicMaterialFolderItems(
  userId: number,
  folderId: number,
): Promise<MaterialItemResponse[]> {
  return apiClient<MaterialItemResponse[]>(
    `/v1/users/${userId}/material-folders/${folderId}/items`,
    { cache: 'no-store' },
  );
}
