export interface TeamRecruitment {
  id: number;
  name: string;
  description: string;
  positions: string[];
  memberCount: number;
  createdBy: string;
  imageUrl?: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  imageUrl?: string;
}
