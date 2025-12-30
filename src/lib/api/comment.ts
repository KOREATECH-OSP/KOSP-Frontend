import { apiClient } from './client';
import type {
  CommentCreateRequest,
  CommentListResponse,
  CommentToggleLikeResponse,
} from './types';

/**
 * 댓글 목록 조회
 */
export async function getComments(articleId: number): Promise<CommentListResponse> {
  return apiClient<CommentListResponse>(
    `/v1/community/articles/${articleId}/comments`,
    {
      cache: 'no-store',
    }
  );
}

/**
 * 댓글 작성
 */
export async function createComment(
  articleId: number,
  data: CommentCreateRequest
): Promise<void> {
  await apiClient<void>(`/v1/community/articles/${articleId}/comments`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 댓글 삭제
 */
export async function deleteComment(
  articleId: number,
  commentId: number
): Promise<void> {
  await apiClient<void>(
    `/v1/community/articles/${articleId}/comments/${commentId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 댓글 좋아요 토글
 */
export async function toggleCommentLike(
  articleId: number,
  commentId: number
): Promise<CommentToggleLikeResponse> {
  return apiClient<CommentToggleLikeResponse>(
    `/v1/community/articles/${articleId}/comments/${commentId}/likes`,
    {
      method: 'POST',
    }
  );
}
