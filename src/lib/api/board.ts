import { apiClient } from './client';
import type { BoardListResponse } from './types';

/**
 * 게시판 목록 조회
 */
export async function getBoards(): Promise<BoardListResponse> {
  return apiClient<BoardListResponse>('/v1/community/boards', {
    revalidate: 3600, // 1시간 캐시
  });
}
