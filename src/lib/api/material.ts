import { apiClient, clientApiClient } from './client';
import type {
  MaterialFolderResponse,
  MaterialItemResponse,
  MaterialFolderCreateRequest,
  MaterialFolderUpdateRequest,
  MaterialItemCreateRequest,
  MaterialImportRequest,
  MaterialImportResponse,
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

/** 폴더 이동 (parentId=null 이면 최상위) */
export async function moveMaterialFolder(
  folderId: number,
  parentId: number | null,
  auth: AuthOptions,
): Promise<MaterialFolderResponse> {
  return clientApiClient<MaterialFolderResponse>(
    `/v1/users/me/material-folders/${folderId}/parent`,
    { method: 'PATCH', body: { parentId }, accessToken: auth.accessToken },
  );
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

/**
 * 아우누리 과제/EL 자료 수집(import).
 * 브라우저 확장이 스크랩한 정규화 데이터를 upsert 한다. (source, sourceExternalId) 기준 멱등.
 */
export async function importMaterials(
  data: MaterialImportRequest,
  auth: AuthOptions,
): Promise<MaterialImportResponse> {
  return clientApiClient<MaterialImportResponse>('/v1/users/me/materials/import', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
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

/** 자료 수정 (이름 바꾸기 등) */
export async function updateMaterialItem(
  itemId: number,
  data: { title?: string; subjectName?: string | null; materialYear?: number | null; semester?: string | null },
  auth: AuthOptions,
): Promise<MaterialItemResponse> {
  return clientApiClient<MaterialItemResponse>(`/v1/users/me/materials/${itemId}`, {
    method: 'PATCH',
    body: data,
    accessToken: auth.accessToken,
  });
}

/** 자료 이동 (다른 폴더로) */
export async function moveMaterialItem(
  itemId: number,
  folderId: number,
  auth: AuthOptions,
): Promise<MaterialItemResponse> {
  return clientApiClient<MaterialItemResponse>(`/v1/users/me/materials/${itemId}/folder`, {
    method: 'PATCH',
    body: { folderId },
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

/**
 * 자료 다운로드 URL 발급 (presigned GET, attachment 강제).
 * 브라우저에서 열지 않고 곧바로 내려받는다. S3 저장 파일만 지원.
 */
export async function getMaterialDownloadUrl(
  itemId: number,
  auth: AuthOptions,
): Promise<string> {
  const res = await clientApiClient<{ downloadUrl: string }>(
    `/v1/users/me/materials/${itemId}/download`,
    { accessToken: auth.accessToken },
  );
  return res.downloadUrl;
}

// ── 타인 공개 조회 ─────────────────────────────────────────────────

/** 특정 사용자의 공개 폴더 조회 */
export async function getPublicMaterialFolders(userId: number): Promise<MaterialFolderResponse[]> {
  return apiClient<MaterialFolderResponse[]>(`/v1/users/${userId}/material-folders`, {
    cache: 'no-store',
  });
}

/** 특정 사용자의 공개 폴더 내 공개 자료 조회 (최근 학기·최신순) */
export async function getPublicMaterialFolderItems(
  userId: number,
  folderId: number,
): Promise<MaterialItemResponse[]> {
  return apiClient<MaterialItemResponse[]>(
    `/v1/users/${userId}/material-folders/${folderId}/items`,
    { cache: 'no-store' },
  );
}

/**
 * 특정 사용자의 공개 자료 전체 조회 (포트폴리오 노출용, 최근 학기·최신순).
 * @param limit 0 이하이면 전체
 */
export async function getPublicMaterials(
  userId: number,
  limit: number = 0,
): Promise<MaterialItemResponse[]> {
  return apiClient<MaterialItemResponse[]>(
    `/v1/users/${userId}/materials/public?limit=${limit}`,
    { cache: 'no-store' },
  );
}

/**
 * 공개 자료 다운로드 URL 발급 (presigned GET, 만료 있음).
 * 비공개 자료의 ID로 호출하면 백엔드가 404를 반환한다.
 */
export async function getPublicMaterialDownloadUrl(
  userId: number,
  itemId: number,
): Promise<string> {
  const res = await apiClient<{ downloadUrl: string }>(
    `/v1/users/${userId}/materials/${itemId}/download`,
    { cache: 'no-store' },
  );
  return res.downloadUrl;
}
