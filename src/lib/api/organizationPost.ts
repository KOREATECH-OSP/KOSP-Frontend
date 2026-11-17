import { clientApiClient, apiClient } from './client';

export type OrganizationPostCategory = 'GENERAL' | 'NOTICE';
export type OrganizationPostVisibility = 'PUBLIC' | 'MEMBERS_ONLY';

export interface AuthorInfo {
  id: number;
  name: string;
  profileImage: string | null;
}

export interface OrganizationPostFile {
  fileName: string;
  fileUrl: string;
}

export interface OrganizationPostSummary {
  id: number;
  category: OrganizationPostCategory;
  visibility: OrganizationPostVisibility;
  title: string;
  description: string | null;
  author: AuthorInfo;
  commentsCount: number;
  createdAt: string;
}

export interface OrganizationPostDetail {
  id: number;
  category: OrganizationPostCategory;
  visibility: OrganizationPostVisibility;
  title: string;
  description: string | null;
  content: string;
  author: AuthorInfo;
  commentsCount: number;
  files: OrganizationPostFile[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationPostComment {
  id: number;
  content: string;
  author: AuthorInfo;
  createdAt: string;
}

export interface CreatePostRequest {
  category: OrganizationPostCategory;
  visibility: OrganizationPostVisibility;
  title: string;
  description?: string;
  content: string;
  files?: { fileName: string; fileUrl: string }[];
}

export interface CreateCommentRequest {
  content: string;
}

export async function getOrganizationPosts(
  orgId: number,
  accessToken: string,
  category?: OrganizationPostCategory
): Promise<OrganizationPostSummary[]> {
  const params = category ? `?category=${category}` : '';
  return apiClient<OrganizationPostSummary[]>(`/v1/organizations/${orgId}/posts${params}`, {
    cache: 'no-store',
    accessToken,
  });
}

export async function getOrganizationPost(
  orgId: number,
  postId: number,
  accessToken: string
): Promise<OrganizationPostDetail> {
  return apiClient<OrganizationPostDetail>(`/v1/organizations/${orgId}/posts/${postId}`, {
    cache: 'no-store',
    accessToken,
  });
}

export async function createOrganizationPost(
  orgId: number,
  data: CreatePostRequest,
  accessToken: string
): Promise<OrganizationPostSummary> {
  return clientApiClient<OrganizationPostSummary>(`/v1/organizations/${orgId}/posts`, {
    method: 'POST',
    body: data,
    accessToken,
  });
}

export async function deleteOrganizationPost(
  orgId: number,
  postId: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(`/v1/organizations/${orgId}/posts/${postId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function getOrganizationPostComments(
  orgId: number,
  postId: number,
  accessToken: string
): Promise<OrganizationPostComment[]> {
  return apiClient<OrganizationPostComment[]>(
    `/v1/organizations/${orgId}/posts/${postId}/comments`,
    { cache: 'no-store', accessToken }
  );
}

export async function createOrganizationPostComment(
  orgId: number,
  postId: number,
  data: CreateCommentRequest,
  accessToken: string
): Promise<OrganizationPostComment> {
  return clientApiClient<OrganizationPostComment>(
    `/v1/organizations/${orgId}/posts/${postId}/comments`,
    { method: 'POST', body: data, accessToken }
  );
}

export async function deleteOrganizationPostComment(
  orgId: number,
  postId: number,
  commentId: number,
  accessToken: string
): Promise<void> {
  await clientApiClient<void>(
    `/v1/organizations/${orgId}/posts/${postId}/comments/${commentId}`,
    { method: 'DELETE', accessToken }
  );
}
