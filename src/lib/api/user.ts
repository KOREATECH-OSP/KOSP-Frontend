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
  GithubSummaryResponse,
  GithubRecentContributionsResponse,
  GithubMonthlyActivityResponse,
  AuthTokenResponse,
} from './types';

interface AuthOptions {
  accessToken: string;
}

export async function signup(data: UserSignupRequest, signupToken: string): Promise<AuthTokenResponse> {
  return clientApiClient<AuthTokenResponse>('/v1/users/signup', {
    method: 'POST',
    body: { ...data, signupToken },
    headers: {
      'X-Signup-Token': signupToken,
    },
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

export async function getUserGithubAnalysis(
  userId: number
): Promise<GithubAnalysisResponse> {
  return apiClient<GithubAnalysisResponse>(`/v1/users/${userId}/github/analysis`, {
    cache: 'no-store',
  });
}

export async function getUserGithubSummary(
  userId: number
): Promise<GithubSummaryResponse> {
  return apiClient<GithubSummaryResponse>(`/v1/users/${userId}/github/summary`, {
    cache: 'no-store',
  });
}

export async function getUserGithubRecentContributions(
  userId: number,
  limit: number = 10
): Promise<GithubRecentContributionsResponse> {
  return apiClient<GithubRecentContributionsResponse>(
    `/v1/users/${userId}/github/recent-contributions?limit=${limit}`,
    { cache: 'no-store' }
  );
}

export async function getUserGithubMonthlyActivity(
  userId: number,
  options?: {
    startYear?: number;
    startMonth?: number;
    endYear?: number;
    endMonth?: number;
  }
): Promise<GithubMonthlyActivityResponse> {
  const params = new URLSearchParams();
  if (options?.startYear) params.append('startYear', options.startYear.toString());
  if (options?.startMonth) params.append('startMonth', options.startMonth.toString());
  if (options?.endYear) params.append('endYear', options.endYear.toString());
  if (options?.endMonth) params.append('endMonth', options.endMonth.toString());
  
  const query = params.toString();
  return apiClient<GithubMonthlyActivityResponse>(
    `/v1/users/${userId}/github/monthly-activity${query ? `?${query}` : ''}`,
    { cache: 'no-store' }
  );
}
