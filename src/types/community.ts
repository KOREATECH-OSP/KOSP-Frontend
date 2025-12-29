export type TabType = '전체' | '홍보' | '정보' | 'Q&A' | '자유';

export interface Post {
  id: number;
  title: string;
  category: TabType;
  author: string;
  authorProfile: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
}