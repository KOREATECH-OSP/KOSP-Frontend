// ============================================
// Common Types
// ============================================

export interface PageMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AuthorResponse {
  id: number;
  name: string;
  profileImage: string | null;
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string; // SHA-256 해시
}

export interface AuthMeResponse {
  name: string;
}

// ============================================
// User Types
// ============================================

export interface UserSignupRequest {
  name: string;
  kutId: string;
  kutEmail: string;
  password: string; // SHA-256 해시 (64자)
  githubId: number;
}

export interface UserUpdateRequest {
  name?: string;
  introduction?: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  profileImage: string | null;
  introduction: string | null;
  githubUrl: string | null;
}

// ============================================
// User Activity Types
// ============================================

export interface GithubActivity {
  id: string;
  type: string;
  repoName: string;
  title: string;
  date: string;
  url: string;
}

export interface GithubActivityResponse {
  activities: GithubActivity[];
}

// ============================================
// Board Types
// ============================================

export interface BoardResponse {
  id: number;
  name: string;
  description: string;
  isRecruitAllowed: boolean;
}

export interface BoardListResponse {
  boards: BoardResponse[];
}

// ============================================
// Article Types
// ============================================

export interface ArticleRequest {
  boardId: number;
  title: string;
  content: string;
  tags?: string[];
}

export interface ArticleResponse {
  id: number;
  boardId: number;
  title: string;
  content: string;
  author: AuthorResponse;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface ArticleListResponse {
  posts: ArticleResponse[];
  pagination: PageMeta;
}

export interface ToggleLikeResponse {
  isLiked: boolean;
}

export interface ToggleBookmarkResponse {
  isBookmarked: boolean;
}

// ============================================
// Comment Types
// ============================================

export interface CommentCreateRequest {
  content: string;
}

export interface CommentResponse {
  id: number;
  author: AuthorResponse;
  articleId: number;
  articleTitle: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isMine: boolean;
}

export interface CommentListResponse {
  comments: CommentResponse[];
  meta: PageMeta;
}

export interface CommentToggleLikeResponse {
  isLiked: boolean;
}

// ============================================
// Team Types
// ============================================

export interface TeamCreateRequest {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface TeamResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  memberCount: number;
  createdBy: string;
}

export interface TeamListResponse {
  teams: TeamResponse[];
  meta: PageMeta;
}

export interface TeamMemberResponse {
  id: number;
  name: string;
  profileImage: string | null;
  role: 'LEADER' | 'MEMBER';
}

export interface TeamDetailResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  members: TeamMemberResponse[];
}

// ============================================
// Recruit Types
// ============================================

export type RecruitStatus = 'OPEN' | 'CLOSED';

export interface RecruitRequest {
  boardId: number;
  title: string;
  content: string;
  tags?: string[];
  teamId: number;
  startDate: string; // ISO date-time
  endDate?: string;
}

export interface RecruitApplyRequest {
  reason: string;
  portfolioUrl?: string;
}

export interface RecruitStatusRequest {
  status: RecruitStatus;
}

export interface RecruitResponse {
  id: number;
  boardId: number;
  title: string;
  content: string;
  author: AuthorResponse;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  teamId: number;
  status: RecruitStatus;
  startDate: string;
  endDate: string | null;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface RecruitListResponse {
  recruits: RecruitResponse[];
  pagination: PageMeta;
}

// ============================================
// Challenge Types
// ============================================

export interface ChallengeResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  current: number;
  total: number;
  isCompleted: boolean;
  imageUrl: string | null;
  tier: number;
}

export interface ChallengeSummary {
  totalChallenges: number;
  completedCount: number;
  overallProgress: number;
}

export interface ChallengeListResponse {
  challenges: ChallengeResponse[];
  summary: ChallengeSummary;
}

// ============================================
// Report Types
// ============================================

export type ReportReason = 'SPAM' | 'ABUSE' | 'ADVERTISEMENT' | 'OBSCENE' | 'OTHER';

export interface ReportRequest {
  reason: ReportReason;
  description?: string;
}
