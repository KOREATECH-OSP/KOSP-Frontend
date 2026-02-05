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

export type ReissueRequest = Record<string, never>;

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
}

export interface UserUpdateRequest {
  name?: string;
  introduction?: string;
}

export interface UserPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  profileImage: string | null;
  introduction: string | null;
  githubUrl: string | null;
}

// ============================================
// User Point Types
// ============================================

export interface PointTransaction {
  id: number;
  amount: number;
  type: string;
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface MyPointHistoryResponse {
  currentBalance: number;
  transactions: PointTransaction[];
  meta: PageMeta;
}

// ============================================
// User Application Types
// ============================================

export interface RecruitSummary {
  id: number;
  title: string;
  teamName: string;
  status: string;
  endDate: string;
}

export interface MyApplicationResponse {
  applicationId: number;
  status: string;
  reason: string;
  portfolioUrl: string;
  appliedAt: string;
  decisionReason?: string;
  recruit: RecruitSummary;
}

export interface MyApplicationListResponse {
  applications: MyApplicationResponse[];
  meta: PageMeta;
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
// GitHub Statistics Types (Backend API)
// ============================================

/**
 * 전체 기여 내역 - /v1/users/{userId}/github/overall-history
 */
export interface GithubOverallHistoryResponse {
  contributedRepoCount: number;
  totalCommitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  totalIssueCount: number;
  totalPrCount: number;
}

/**
 * 최근 기여 활동 - /v1/users/{userId}/github/recent-activity
 */
export interface GithubRecentActivityResponse {
  repoOwner: string;
  repositoryName: string;
  description: string | null;
  stargazersCount: number;
  userCommitCount: number;
  userPrCount: number;
  lastCommitDate: string;
}

/**
 * 기여 점수 - /v1/users/{userId}/github/contribution-score
 */
export interface GithubContributionScoreResponse {
  activityScore: number;
  diversityScore: number;
  impactScore: number;
  totalScore: number;
}

/**
 * 전체 사용자 평균 통계 - /v1/users/{userId}/github/global-statistics
 */
export interface GithubGlobalStatisticsResponse {
  avgCommitCount: number;
  avgStarCount: number;
  avgPrCount: number;
  avgIssueCount: number;
  totalUsers: number;
  calculatedAt: string;
}

/**
 * 사용자 기여 비교 - /v1/users/{userId}/github/contribution-comparison
 */
export interface GithubContributionComparisonResponse {
  avgCommitCount: number;
  avgStarCount: number;
  avgPrCount: number;
  avgIssueCount: number;
  userCommitCount: number;
  userStarCount: number;
  userPrCount: number;
  userIssueCount: number;
}

// ============================================
// Legacy GitHub Types (for backward compatibility)
// ============================================

export interface GithubStats {
  totalCommits: number;
  totalIssues: number;
  totalPrs: number;
  totalStars: number;
  totalRepos: number;
}

export interface BestRepoSummary {
  name: string;
  totalCommits: number;
  totalLines: number;
  totalPrs: number;
  totalIssues: number;
}

export interface GithubAnalysisData {
  monthlyContributions: Record<string, number>;
  timeOfDayStats: Record<string, number>;
  dayOfWeekStats: Record<string, number>;
  collaborators: Record<string, number>;
  workingStyle: string;
  collaborationStyle: string;
  bestRepository: BestRepoSummary;
}

export interface GithubAnalysisResponse {
  githubId: number;
  bio: string;
  tier: number;
  followers: number;
  following: number;
  stats: GithubStats;
  analysis: GithubAnalysisData;
  languageStats: Record<string, number>;
}

export interface GithubSummaryResponse {
  githubId: string;
  totalCommits: number;
  totalLines: number;
  totalAdditions: number;
  totalDeletions: number;
  totalPrs: number;
  totalIssues: number;
  ownedReposCount: number;
  contributedReposCount: number;
  totalStarsReceived: number;
  totalScore: number;
  calculatedAt: string;
  dataPeriodStart: string;
  dataPeriodEnd: string;
}

export interface RecentRepository {
  repoOwner: string;
  repoName: string;
  stargazersCount: number;
  userCommitsCount: number;
  userPrsCount: number;
  userIssuesCount: number;
  lastCommitDate: string;
  primaryLanguage: string;
}

export interface GithubRecentContributionsResponse {
  repositories: RecentRepository[];
}

export interface MonthlyActivity {
  year: number;
  month: number;
  commitsCount: number;
  linesCount: number;
  prsCount: number;
  issuesCount: number;
}

export interface GithubMonthlyActivityResponse {
  activities: MonthlyActivity[];
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
  attachmentIds?: number[];
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
  isPinned?: boolean;
  createdAt: string;
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

export interface TeamUpdateRequest {
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
  createdBy: AuthorResponse;
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

export type RecruitApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface RecruitApplyResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userProfileImage?: string | null;
  reason: string;
  portfolioUrl: string | null;
  status: RecruitApplicationStatus;
  appliedAt: string;
}

export interface RecruitApplyListResponse {
  applications: RecruitApplyResponse[];
  meta: PageMeta;
}

export interface RecruitApplyDecisionRequest {
  status: RecruitApplicationStatus;
}

// ============================================
// Challenge Types
// ============================================

export interface ChallengeResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number;
  isCompleted: boolean;
  icon: string | null;
  tier: number;
  point: number;
}

export interface ChallengeSummary {
  totalChallenges?: number; // Optional in API docs? Check later. Usually summary structure.
  // API docs say "ChallengeSummary" has id, name, description, tier for search.
  // But ChallengeListResponse has "summary": ChallengeSummary. 
  // Let's assume the previous definition or update based on usage.
  // Wait, API docs for ChallengeListResponse say summary is a Schema ref #/components/schemas/ChallengeSummary
  // BUT the Schema for ChallengeSummary in GlobalSearchResponse has id, name... 
  // There might be a name collision in my head or the docs. 
  // Let's use a loose type or fix it later if it breaks.
}

// Search specific summaries
export interface ArticleSummary {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
}

// RecruitSummary는 이미 위에서 정의되어 있음 (line 129-135)
// 검색 API도 동일한 RecruitSummary 구조를 사용함: id, title, teamName, status, endDate

export interface TeamSummary {
  id: number;
  name: string;
  description: string;
  memberCount: number;
}

export interface ChallengeSearchSummary {
  id: number;
  name: string;
  description: string;
  tier: number;
}

export interface UserSearchSummary {
  id: number;
  name: string;
  githubLogin: string;
  githubName: string | null;
  profileImageUrl: string | null;
}

export interface GlobalSearchResponse {
  articles: ArticleSummary[];
  recruits: RecruitSummary[];
  teams: TeamSummary[];
  challenges: ChallengeSearchSummary[];
  users: UserSearchSummary[];
}

// ============================================
// Report Types
// ============================================

export type ReportReason = 'SPAM' | 'ABUSE' | 'ADVERTISEMENT' | 'OBSCENE' | 'OTHER';

export interface ReportRequest {
  reason: ReportReason;
  description?: string;
}

// ============================================
// File Upload Types
// ============================================

export interface UploadUrlRequest {
  file_name: string;
  content_length: number;
  content_type: string;
}

export interface UploadUrlResponse {
  pre_signed_url: string;
  file_url: string;
  expiration_date: string;
}

export interface FileResponse {
  id: number;
  originalFileName: string;
  url: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface ChallengeListResponse {
  challenges: ChallengeResponse[];
  summary: ChallengeSummary;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'ARTICLE_REPORTED'
  | 'COMMENT_REPORTED'
  | 'CHALLENGE_ACHIEVED'
  | 'POINT_EARNED'
  | 'SYSTEM';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface UnreadCountResponse {
  count: number;
}
