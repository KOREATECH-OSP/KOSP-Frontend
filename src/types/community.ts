export type TabType = '전체' | '홍보' | 'Q&A' | '자유';

export interface Post {
  id: number;
  category: '홍보' | 'Q&A' | '자유';
  title: string;
  content: string;
  author: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  tags?: string[];
}