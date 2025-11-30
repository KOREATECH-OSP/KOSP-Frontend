export interface TeamRecruit {
  id: number;
  title: string;
  description: string;
  tags: string[];
  positions: string[];
  currentMembers: number;
  maxMembers: number;
  deadline: string;
  status: '모집중' | '마감임박' | '마감';
  author: string;
  createdAt: string;
  views: number;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  tags: string[];
  memberCount: number;
  projectCount: number;
  createdAt: string;
  isRecruiting: boolean;
}