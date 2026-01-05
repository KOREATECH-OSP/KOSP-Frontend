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
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthMeResponse {
  id: number;
  email: string;
  name: string;
  profileImage: string | null;
  introduction: string | null;
}

export interface GithubTokenRequest {
  githubAccessToken: string;
}

export interface GithubVerificationResponse {
  verificationToken: string;
}

export interface EmailRequest {
  email: string;
  signupToken?: string;
}

export interface EmailVerificationRequest {
  email: string;
  code: string;
}

export interface EmailVerificationResponse {
  signupToken: string;
}

export interface CheckMemberIdRequest {
  id: string;
}

export interface CheckMemberIdResponse {
  success: boolean;
  available: boolean;
  message: string;
}

export interface ReissueRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
}

// ============================================
// User Types
// ============================================

export interface UserSignupRequest {
  name: string;
  kutId: string;
  kutEmail: string;
  password: string;
  signupToken: string;
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
// GitHub Statistics Types
// ============================================

/**
 * 저장소별 기여 통계
 */
export interface GithubRepoStats {
  repoName: string;
  projectName: string;
  description: string | null;
  stars: number;
  commits: number;
  prs: number;
  lastCommitDate: string;
  url: string;
}

/**
 * 전체 기여 내역 요약
 */
export interface GithubContributionSummary {
  contributedRepos: number;
  totalCommits: number;
  totalLines: number;
  totalIssues: number;
  totalPRs: number;
}

/**
 * 기여 내역 비교 (평균 vs 나)
 */
export interface GithubContributionComparison {
  average: {
    commits: number;
    stars: number;
    prs: number;
    issues: number;
  };
  mine: {
    commits: number;
    stars: number;
    prs: number;
    issues: number;
  };
}

/**
 * GitHub 기여 점수
 */
export interface GithubContributionScore {
  activityLevel: number; // 최대 3점 - 기여한 저장소 중 최고점수
  diversity: number; // 최대 1점 - 여러 저장소에 기여했는지
  impact: number; // 최대 5점 보너스 - 오픈소스 생태계 영향
  total: number; // 합계
}

/**
 * GitHub 통계 전체 응답
 */
export interface GithubStatsResponse {
  recentRepos: GithubRepoStats[];
  summary: GithubContributionSummary;
  comparison: GithubContributionComparison;
  score: GithubContributionScore;
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
