import { apiClient } from './client';
import type { GlobalSearchResponse } from './types';

/**
 * 통합 검색
 */
export async function searchGlobal(keyword: string): Promise<GlobalSearchResponse> {
  const params = new URLSearchParams({ keyword });
  return apiClient<GlobalSearchResponse>(`/v1/search?${params}`, {
    cache: 'no-store',
  });
}
