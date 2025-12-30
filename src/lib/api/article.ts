import { apiClient } from './client';
import type {
  ArticleRequest,
  ArticleResponse,
  ArticleListResponse,
  ToggleLikeResponse,
  ToggleBookmarkResponse,
  ReportRequest,
} from './types';

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

/**
 * 게시글 작성
 */
export async function createArticle(data: ArticleRequest): Promise<void> {
  await apiClient<void>('/v1/community/articles', {
    method: 'POST',
    body: data,
  });
}

/**
 * 게시글 수정
 */
export async function updateArticle(id: number, data: ArticleRequest): Promise<void> {
  await apiClient<void>(`/v1/community/articles/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 게시글 삭제
 */
export async function deleteArticle(id: number): Promise<void> {
  await apiClient<void>(`/v1/community/articles/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 게시글 좋아요 토글
 */
export async function toggleArticleLike(id: number): Promise<ToggleLikeResponse> {
  return apiClient<ToggleLikeResponse>(`/v1/community/articles/${id}/likes`, {
    method: 'POST',
  });
}

/**
 * 게시글 북마크 토글
 */
export async function toggleArticleBookmark(
  id: number
): Promise<ToggleBookmarkResponse> {
  return apiClient<ToggleBookmarkResponse>(`/v1/community/articles/${id}/bookmarks`, {
    method: 'POST',
  });
}

/**
 * 게시글 신고
 */
export async function reportArticle(
  articleId: number,
  data: ReportRequest
): Promise<void> {
  await apiClient<void>(`/v1/community/articles/${articleId}/reports`, {
    method: 'POST',
    body: data,
  });
}
