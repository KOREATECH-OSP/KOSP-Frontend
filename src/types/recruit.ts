export interface TeamRecruitment {
  id: number;
  teamName: string;
  title: string;
  positions: string[];
  tags: string[];
  postedAt: string;
  postedBy: string;
  status: '모집중' | '마감';
  likes: number;
  comments: number;
  bookmarks: number;
  views: number;
  teamImageUrl?: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  imageUrl?: string;
}
