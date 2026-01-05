import { apiClient, clientApiClient } from './client';
import type {
  ArticleRequest,
  ArticleResponse,
  ArticleListResponse,
  ToggleLikeResponse,
  ToggleBookmarkResponse,
  ReportRequest,
} from './types';

interface AuthOptions {
  accessToken: string;
}

interface GetArticlesOptions {
  page?: number;
  size?: number;
}

/**
 * 게시글 목록 조회
 */
export async function getArticles(
  boardId: number,
  options: GetArticlesOptions = {}
): Promise<ArticleListResponse> {
  const { page = 1, size = 10 } = options;
  const params = new URLSearchParams({
    boardId: String(boardId),
    page: String(page),
    size: String(size),
  });
  return apiClient<ArticleListResponse>(`/v1/community/articles?${params}`, {
    cache: 'no-store',
  });
}

/**
 * 게시글 상세 조회
 */
export async function getArticle(id: number): Promise<ArticleResponse> {
  return apiClient<ArticleResponse>(`/v1/community/articles/${id}`, {
    cache: 'no-store',
  });
}

export async function createArticle(data: ArticleRequest, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>('/v1/community/articles', {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}

export async function updateArticle(id: number, data: ArticleRequest, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/community/articles/${id}`, {
    method: 'PUT',
    body: data,
    accessToken: auth.accessToken,
  });
}

export async function deleteArticle(id: number, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/community/articles/${id}`, {
    method: 'DELETE',
    accessToken: auth.accessToken,
  });
}

export async function toggleArticleLike(id: number, auth: AuthOptions): Promise<ToggleLikeResponse> {
  return clientApiClient<ToggleLikeResponse>(`/v1/community/articles/${id}/likes`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

export async function toggleArticleBookmark(id: number, auth: AuthOptions): Promise<ToggleBookmarkResponse> {
  return clientApiClient<ToggleBookmarkResponse>(`/v1/community/articles/${id}/bookmarks`, {
    method: 'POST',
    accessToken: auth.accessToken,
  });
}

export async function reportArticle(articleId: number, data: ReportRequest, auth: AuthOptions): Promise<void> {
  await clientApiClient<void>(`/v1/community/articles/${articleId}/reports`, {
    method: 'POST',
    body: data,
    accessToken: auth.accessToken,
  });
}
