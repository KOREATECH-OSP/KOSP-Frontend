// API 응답 타입은 @/lib/api/types에서 가져와 사용
// 이 파일은 UI 관련 타입만 정의

export type BoardTab = {
  id: number;
  name: string;
};

export type SortType = 'latest' | 'popular' | 'comments';

export const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'comments', label: '댓글순' },
];
