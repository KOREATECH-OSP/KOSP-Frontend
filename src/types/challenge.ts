export interface Challenge {
  id: number;
  title: string;
  description: string;
  current: number;
  total: number;
  category: 'contribution' | 'learning' | 'community';
}

export type ChallengeCategory = Challenge['category'];