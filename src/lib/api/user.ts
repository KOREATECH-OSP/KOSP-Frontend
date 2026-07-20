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
  GithubOverallHistoryResponse,
  GithubRecentActivityResponse,
  GithubContributionScoreResponse,
  GithubGlobalStatisticsResponse,
  GithubContributionComparisonResponse,
  AuthTokenResponse,
  MyPointHistoryResponse,
  MyApplicationListResponse,
  UserTitleListResponse,
  UserTitleResponse,
  TitleProgressResponse,
  MySeasonRankingResponse,
  MyGithubRankingResponse,
  SeasonRankingListResponse,
  GithubRankingListResponse,
  GithubResumeProjectResponse,
  ResumeResponse,
  ResumeListResponse,
  ResumeSaveRequest,
  ResumeAutoProjectResponse,
  AutoProjectUpdateRequest,
  TitleCatalogListResponse,
} from './types';

interface AuthOptions {
  accessToken: string;
}

export async function signup(data: UserSignupRequest, signupToken: string): Promise<AuthTokenResponse> {
  return clientApiClient<AuthTokenResponse>('/v1/users/signup', {
    method: 'POST',
    body: data,
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
export async function getUserPosts(userId: number, page: number = 1, size: number = 10): Promise<ArticleListResponse> {
  return apiClient<ArticleListResponse>(`/v1/users/${userId}/posts?page=${page - 1}&size=${size}`, {
    cache: 'no-store',
  });
}

/**
 * 사용자 작성 댓글 목록
 */
export async function getUserComments(userId: number, page: number = 1, size: number = 10): Promise<CommentListResponse> {
  return apiClient<CommentListResponse>(`/v1/users/${userId}/comments?page=${page - 1}&size=${size}`, {
    cache: 'no-store',
  });
}

/**
 * 사용자 즐겨찾기 목록
 */
export async function getUserBookmarks(userId: number, page: number = 1, size: number = 10): Promise<ArticleListResponse> {
  return apiClient<ArticleListResponse>(`/v1/users/${userId}/bookmarks?page=${page - 1}&size=${size}`, {
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

// ============================================
// New GitHub APIs (Backend v1)
// ============================================

/**
 * 전체 기여 내역 조회
 */
export async function getUserGithubOverallHistory(
  userId: number
): Promise<GithubOverallHistoryResponse> {
  return apiClient<GithubOverallHistoryResponse>(
    `/v1/users/${userId}/github/overall-history`,
    { cache: 'no-store' }
  );
}

/**
 * 최근 기여 활동 조회 (최대 6개 저장소)
 */
export async function getUserGithubRecentActivity(
  userId: number
): Promise<GithubRecentActivityResponse[]> {
  return apiClient<GithubRecentActivityResponse[]>(
    `/v1/users/${userId}/github/recent-activity`,
    { cache: 'no-store' }
  );
}

/**
 * 기여 점수 조회 (활동, 다양성, 영향력 점수)
 */
export async function getUserGithubContributionScore(
  userId: number
): Promise<GithubContributionScoreResponse> {
  return apiClient<GithubContributionScoreResponse>(
    `/v1/users/${userId}/github/contribution-score`,
    { cache: 'no-store' }
  );
}

/**
 * 전체 사용자 평균 통계 조회
 */
export async function getUserGithubGlobalStatistics(
  userId: number
): Promise<GithubGlobalStatisticsResponse> {
  return apiClient<GithubGlobalStatisticsResponse>(
    `/v1/users/${userId}/github/global-statistics`,
    { cache: 'no-store' }
  );
}

/**
 * 사용자 기여 비교 조회 (평균 대비)
 */
export async function getUserGithubContributionComparison(
  userId: number
): Promise<GithubContributionComparisonResponse> {
  return apiClient<GithubContributionComparisonResponse>(
    `/v1/users/${userId}/github/contribution-comparison`,
    { cache: 'no-store' }
  );
}

// ============================================
// My Page APIs (본인 정보)
// ============================================

/**
 * 본인 포인트 내역 조회
 */
export async function getMyPointHistory(
  auth: AuthOptions,
  page: number = 1,
  size: number = 10
): Promise<MyPointHistoryResponse> {
  return clientApiClient<MyPointHistoryResponse>(
    `/v1/users/me/points?page=${page - 1}&size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );
}

// ============================================
// Title (칭호) APIs
// ============================================

/**
 * 특정 유저의 칭호 목록 조회 (공개)
 */
export async function getUserTitles(userId: number): Promise<UserTitleListResponse> {
  return apiClient<UserTitleListResponse>(`/v1/users/${userId}/titles`, {
    cache: 'no-store',
  });
}

/**
 * 내 칭호 목록 조회 (인증 필요)
 */
export async function getMyTitles(auth: AuthOptions): Promise<UserTitleListResponse> {
  return clientApiClient<UserTitleListResponse>('/v1/users/me/titles', {
    accessToken: auth.accessToken,
  });
}

/**
 * 내 미취득 칭호 진행도 조회 (인증 필요)
 */
export async function getMyTitleProgress(auth: AuthOptions): Promise<TitleProgressResponse[]> {
  return clientApiClient<TitleProgressResponse[]>('/v1/users/me/titles/progress', {
    accessToken: auth.accessToken,
  });
}

/**
 * 대표 칭호 설정 (인증 필요)
 */
export async function setDisplayTitle(
  userTitleId: number,
  auth: AuthOptions
): Promise<UserTitleResponse> {
  return clientApiClient<UserTitleResponse>(`/v1/users/me/titles/${userTitleId}/display`, {
    method: 'PUT',
    accessToken: auth.accessToken,
  });
}

/**
 * 내 GitHub 기여 점수 기반 랭킹 조회 (인증 필요)
 */
export async function getMyGithubRanking(auth: AuthOptions): Promise<MyGithubRankingResponse> {
  return clientApiClient<MyGithubRankingResponse>('/v1/github/rankings/me', {
    accessToken: auth.accessToken,
  });
}

/**
 * 내 GitHub 저장소 목록 조회 (이력서 프로젝트 가져오기용, 인증 필요)
 */
export async function getMyGithubRepositories(
  auth: AuthOptions,
): Promise<GithubResumeProjectResponse[]> {
  return clientApiClient<GithubResumeProjectResponse[]>('/v1/users/me/github/repositories', {
    accessToken: auth.accessToken,
  });
}

/**
 * 내 시즌 랭킹 조회 (인증 필요)
 */
export async function getMySeasonRanking(auth: AuthOptions): Promise<MySeasonRankingResponse> {
  return clientApiClient<MySeasonRankingResponse>('/v1/seasons/current/rankings/me', {
    accessToken: auth.accessToken,
  });
}

/**
 * GitHub 기여 점수 기반 전체 랭킹 조회 (공개 API)
 */
export async function getGithubRankings(params?: {
  page?: number;
  size?: number;
}): Promise<GithubRankingListResponse> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 50;
  return apiClient<GithubRankingListResponse>(
    `/v1/github/rankings?page=${page}&size=${size}`,
    { cache: 'no-store' },
  );
}

/**
 * 시즌 전체 랭킹 조회 (공개 API)
 */
export async function getSeasonRankings(params?: {
  page?: number;
  size?: number;
}): Promise<SeasonRankingListResponse> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 50;
  return apiClient<SeasonRankingListResponse>(
    `/v1/seasons/current/rankings?page=${page}&size=${size}`,
    { cache: 'no-store' },
  );
}

// ============================================
// Resume APIs (이력서)
// ============================================

/**
 * 활성화된 전체 칭호 목록 조회 (인증 불필요)
 * 칭호명, 등급, 카테고리, 달성 조건 포함
 */
export async function getAllTitles(): Promise<TitleCatalogListResponse> {
  return apiClient<TitleCatalogListResponse>('/v1/titles', {
    cache: 'no-store',
  });
}

/**
 * 특정 사용자의 공개 이력서 조회 (인증 불필요)
 * 비공개이거나 없으면 404 ApiException 발생
 */
export async function getPublicResume(userId: number): Promise<ResumeResponse> {
  return apiClient<ResumeResponse>(`/v1/users/${userId}/resume`, {
    cache: 'no-store',
  });
}

/**
 * 내 이력서 조회
 * 저장된 이력서가 없으면 resumeData: null 반환
 */
export async function getMyResume(auth: AuthOptions): Promise<ResumeResponse> {
  return clientApiClient<ResumeResponse>('/v1/users/me/resume', {
    accessToken: auth.accessToken,
  });
}

/**
 * 내 이력서 저장 (upsert)
 * 이미 있으면 update, 없으면 create
 */
export async function saveMyResume(
  data: ResumeSaveRequest,
  auth: AuthOptions
): Promise<ResumeResponse> {
  return clientApiClient<ResumeResponse>('/v1/users/me/resume', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

// ============================================
// 다중 이력서 APIs
// ============================================

/** 내 전체 이력서 목록 조회 */
export async function getMyResumes(auth: AuthOptions): Promise<ResumeListResponse> {
  return clientApiClient<ResumeListResponse>('/v1/users/me/resumes', {
    accessToken: auth.accessToken,
  });
}

/** 새 이력서 생성 */
export async function createResume(
  data: ResumeSaveRequest,
  auth: AuthOptions
): Promise<ResumeResponse> {
  return clientApiClient<ResumeResponse>('/v1/users/me/resumes', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

/** 특정 이력서 단건 조회 */
export async function getMyResumeById(
  resumeId: number,
  auth: AuthOptions
): Promise<ResumeResponse> {
  return clientApiClient<ResumeResponse>(`/v1/users/me/resumes/${resumeId}`, {
    accessToken: auth.accessToken,
  });
}

/** 특정 이력서 수정 */
export async function updateResumeById(
  resumeId: number,
  data: ResumeSaveRequest,
  auth: AuthOptions
): Promise<ResumeResponse> {
  return clientApiClient<ResumeResponse>(`/v1/users/me/resumes/${resumeId}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

/** 특정 이력서 삭제 */
export async function deleteResumeById(
  resumeId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(`/v1/users/me/resumes/${resumeId}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

/** 기본 이력서 설정 */
export async function setDefaultResume(
  resumeId: number,
  auth: AuthOptions
): Promise<ResumeResponse> {
  return clientApiClient<ResumeResponse>(`/v1/users/me/resumes/${resumeId}/default`, {
    method: 'PATCH',
    accessToken: auth.accessToken,
  });
}

// ── 이력서 자동 프로젝트 (과제/EL 자료 → 이력서 프로젝트 자동 연결) ──────

/**
 * 이력서 자동 프로젝트 조회.
 * 과제/EL 자료를 실시간 투영한 목록. 원본 변경이 자동 반영되고, 삭제(tombstone)한 항목은 제외된다.
 */
export async function getResumeAutoProjects(
  resumeId: number,
  auth: AuthOptions
): Promise<ResumeAutoProjectResponse[]> {
  return clientApiClient<ResumeAutoProjectResponse[]>(
    `/v1/users/me/resumes/${resumeId}/auto-projects`,
    { accessToken: auth.accessToken }
  );
}

/** 자동 프로젝트 삭제(tombstone). 재동기화로 부활하지 않는다(복원 전까지). */
export async function deleteResumeAutoProject(
  resumeId: number,
  materialItemId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(
    `/v1/users/me/resumes/${resumeId}/auto-projects/${materialItemId}`,
    { method: 'DELETE', accessToken: auth.accessToken }
  );
}

/** 삭제된 자동 프로젝트 복원 */
export async function restoreResumeAutoProject(
  resumeId: number,
  materialItemId: number,
  auth: AuthOptions
): Promise<void> {
  await clientApiClient<void>(
    `/v1/users/me/resumes/${resumeId}/auto-projects/${materialItemId}/restore`,
    { method: 'POST', accessToken: auth.accessToken }
  );
}

/** 자동 프로젝트 수정 (overrides + 공개 여부). 이후 재동기화가 수정본을 덮어쓰지 않는다. */
export async function updateResumeAutoProject(
  resumeId: number,
  materialItemId: number,
  data: AutoProjectUpdateRequest,
  auth: AuthOptions
): Promise<ResumeAutoProjectResponse> {
  return clientApiClient<ResumeAutoProjectResponse>(
    `/v1/users/me/resumes/${resumeId}/auto-projects/${materialItemId}`,
    { method: 'PATCH', body: data, accessToken: auth.accessToken }
  );
}

/**
 * 본인 지원 내역 조회
 */
export async function getMyApplications(
  auth: AuthOptions,
  page: number = 1,
  size: number = 10
): Promise<MyApplicationListResponse> {
  return clientApiClient<MyApplicationListResponse>(
    `/v1/users/me/applications?page=${page - 1}&size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );
}
