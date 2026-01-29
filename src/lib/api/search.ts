import { apiClient } from './client';
import type { GlobalSearchResponse } from './types';

export interface SearchParams {
  keyword: string;
  filter?: ('articles' | 'recruits' | 'teams' | 'challenges' | 'users')[];
  page?: number;
  size?: number;
}

/**
 * 통합 검색
 */
export async function searchGlobal(params: SearchParams | string): Promise<GlobalSearchResponse> {
  // 이전 버전 호환성 유지 (string만 전달된 경우)
  if (typeof params === 'string') {
    const urlParams = new URLSearchParams({ keyword: params });
    return apiClient<GlobalSearchResponse>(`/v1/search?${urlParams}`, {
      cache: 'no-store',
    });
  }

  const urlParams = new URLSearchParams({ keyword: params.keyword });

  if (params.filter && params.filter.length > 0) {
    params.filter.forEach(f => urlParams.append('filter', f));
  }

  if (params.page !== undefined) {
    urlParams.set('page', params.page.toString());
  }

  if (params.size !== undefined) {
    urlParams.set('size', params.size.toString());
  }

  return apiClient<GlobalSearchResponse>(`/v1/search?${urlParams}`, {
    cache: 'no-store',
  });
}
