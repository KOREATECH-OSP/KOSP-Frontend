import { apiClient, clientApiClient } from './client';
import type {
  UserSignupRequest,
  UserUpdateRequest,
  UserPasswordChangeRequest,
  UserProfileResponse,
  ArticleListResponse,
  CommentListResponse,
  GithubActivityResponse,
  GithubAnalysisResponse,
  AuthTokenResponse,
} from './types';

interface AuthOptions {
  accessToken: string;
}

export async function signup(data: UserSignupRequest): Promise<AuthTokenResponse> {
  return clientApiClient<AuthTokenResponse>('/v1/users/signup', {
    method: 'POST',
    body: data,
  });
}

/**
 * 사용자 상세 조회 (타인)
 */
export async function getUserProfile(userId: number): Promise<UserProfileResponse> {
  return apiClient<UserProfileResponse>(`/v1/users/${userId}`, {
    cache: 'no-store',
  });
}

export async function updateUser(
  userId: number,
  data: UserUpdateRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/users/${userId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

export async function changePassword(
  data: UserPasswordChangeRequest,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>('/v1/users/me/password', {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

export async function deleteUser(userId: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/users/${userId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

// ============================================
// User Activity APIs
// ============================================

/**
 * 사용자 작성 글 목록
 */
export async function getUserPosts(userId: number): Promise<ArticleListResponse> {
  return apiClient<ArticleListResponse>(`/v1/users/${userId}/posts`, {
    cache: 'no-store',
  });
}

/**
 * 사용자 작성 댓글 목록
 */
export async function getUserComments(userId: number): Promise<CommentListResponse> {
  return apiClient<CommentListResponse>(`/v1/users/${userId}/comments`, {
    cache: 'no-store',
  });
}

/**
 * 사용자 즐겨찾기 목록
 */
export async function getUserBookmarks(userId: number): Promise<ArticleListResponse> {
  return apiClient<ArticleListResponse>(`/v1/users/${userId}/bookmarks`, {
    cache: 'no-store',
  });
}

/**
 * 사용자 GitHub 활동 조회
 */
export async function getUserGithubActivities(
  userId: number
): Promise<GithubActivityResponse> {
  return apiClient<GithubActivityResponse>(`/v1/users/${userId}/activities/github`, {
    cache: 'no-store',
  });
}

/**
 * 사용자 GitHub 활동 분석 (통계)
 */
export async function getUserGithubAnalysis(
  username: string
): Promise<GithubAnalysisResponse> {
  return apiClient<GithubAnalysisResponse>(`/v1/github/users/${username}/analysis`, {
    cache: 'no-store',
  });
}
