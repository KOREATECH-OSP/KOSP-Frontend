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
  termsVersion?: string;
}

// ============================================
// Terms Types
// ============================================

export interface TermsResponse {
  id: number;
  version: string;
  content: string;
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

/* ============================================
 * 팔로잉/팔로워 — Follow
 * ============================================ */

export interface FollowUserResponse {
  userId: number;
  name: string;
  profileImage: string | null;
  introduction: string | null;
}

export interface FollowSummaryResponse {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

/* ============================================
 * 학습자료(과제/EL) — Material
 * ============================================ */

export type MaterialFolderType = 'YEAR' | 'SEMESTER' | 'SUBJECT' | 'CUSTOM';
export type MaterialSource = 'AUNURI_ASSIGNMENT' | 'AUNURI_EL' | 'GITHUB' | 'MANUAL';
export type MaterialVisibility = 'PUBLIC' | 'PRIVATE';

export interface MaterialFolderResponse {
  id: number;
  parentId: number | null;
  name: string;
  folderType: MaterialFolderType;
  source: MaterialSource;
  visibility: MaterialVisibility;
  isStartFolder: boolean;
  sortOrder: number;
  itemCount: number;
}

export interface MaterialItemResponse {
  id: number;
  folderId: number;
  title: string;
  subjectName: string | null;
  materialYear: number | null;
  semester: string | null;
  source: MaterialSource;
  sourceUrl: string | null;
  fileUrl: string | null;
  originalFileName: string | null;
  fileSize: number | null;
  contentType: string | null;
  isPublic: boolean;
  semesterOrder: number | null;
  autoImported: boolean;
  duplicatedWithGithub: boolean;
  duplicateRepoKey: string | null;
  materialDate: string | null;
  lastSyncedAt: string | null;
  updatedAt: string;
}

/** 아우누리 과제/EL 자료 수집(import) 개별 항목 */
export interface MaterialImportItem {
  sourceExternalId: string;
  source: Extract<MaterialSource, 'AUNURI_ASSIGNMENT' | 'AUNURI_EL'>;
  title: string;
  subjectName?: string | null;
  materialYear?: number | null;
  semester?: string | null;
  sourceUrl?: string | null;
  fileUrl?: string | null;
  originalFileName?: string | null;
  fileSize?: number | null;
  contentType?: string | null;
  materialDate?: string | null;
}

/** 아우누리 자료 수집 요청 */
export interface MaterialImportRequest {
  items: MaterialImportItem[];
}

/** 아우누리 자료 수집 결과 요약 */
export interface MaterialImportResponse {
  created: number;
  updated: number;
  unchanged: number;
  items: MaterialItemResponse[];
}

/** 이력서 자동 프로젝트 (과제/EL 자료 → 이력서 프로젝트 실시간 투영) */
export interface ResumeAutoProjectResponse {
  materialItemId: number;
  sourceType: Extract<MaterialSource, 'AUNURI_ASSIGNMENT' | 'AUNURI_EL'>;
  name: string;
  period: string | null;
  summary: string | null;
  docLink: string | null;
  duplicatedWithGithub: boolean;
  duplicateRepoKey: string | null;
  autoImported: boolean;
  userEdited: boolean;
  deletedByUser: boolean;
  isPublic: boolean;
}

/** 자동 프로젝트 수정 요청 (overrides + 공개 여부) */
export interface AutoProjectUpdateRequest {
  name?: string | null;
  period?: string | null;
  summary?: string | null;
  docLink?: string | null;
  visibility?: MaterialVisibility | null;
}

export interface MaterialFolderCreateRequest {
  name: string;
  parentId?: number | null;
  folderType?: MaterialFolderType;
  source?: MaterialSource;
  visibility?: MaterialVisibility;
  sortOrder?: number;
}

export interface MaterialFolderUpdateRequest {
  name?: string;
  folderType?: MaterialFolderType;
  sortOrder?: number;
}

export interface MaterialItemCreateRequest {
  folderId: number;
  title: string;
  subjectName?: string | null;
  materialYear?: number | null;
  semester?: string | null;
  source?: MaterialSource;
  sourceUrl?: string | null;
  fileUrl?: string | null;
  originalFileName?: string | null;
  fileSize?: number | null;
  contentType?: string | null;
  visibility?: MaterialVisibility | null;
  materialDate?: string | null;
}

/**
 * GitHub 저장소 → 이력서 프로젝트 가져오기 항목
 * GET /v1/users/me/github/repositories
 */
export interface GithubResumeProjectResponse {
  repoKey: string;
  name: string;
  githubLink: string;
  summary: string | null;
  techStack: string | null;
  period: string | null;
  myContributions: string | null;
  result: string | null;
  isOwned: boolean | null;
  stargazersCount: number | null;
  userCommitsCount: number | null;
  userPrsCount: number | null;
  userIssuesCount: number | null;
  primaryLanguage: string | null;
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

export type TeamRole = 'LEADER' | 'ADMIN' | 'MEMBER';

export interface TeamMemberResponse {
  id: number;
  name: string;
  profileImage: string | null;
  role: TeamRole;
}

export interface PendingInviteResponse {
  inviteId: number;
  userId: number;
  name: string;
  profileImage: string | null;
  expiresAt: string;
}

export interface TeamBasicInfo {
  id: number;
  name: string;
  imageUrl: string | null;
  memberCount: number;
}

export interface TeamInviteResponse {
  id: number;
  team: TeamBasicInfo;
  inviter: AuthorResponse;
  invitee: AuthorResponse;
  expiresAt: string;
  createdAt: string;
}

export interface TeamDetailResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  members: TeamMemberResponse[];
  pendingInvites?: PendingInviteResponse[];
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
  canApply: boolean;
  isDeleted: boolean;
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
  decisionReason?: string;
}

// ============================================
// Challenge Types
// ============================================

export type ChallengeIconType = 'ICON' | 'IMAGE_URL';

export interface ChallengeResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number;
  isCompleted: boolean;
  icon: ChallengeIconType;
  imageResource: string | null;
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

export interface RepositorySearchSummary {
  repoOwner: string;
  repoName: string;
  description: string | null;
  primaryLanguage: string | null;
  stargazersCount: number;
  forksCount: number;
  lastCommitDate: string | null;
}

export interface OrganizationSearchSummary {
  id: number;
  githubOrgName: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface GlobalSearchResponse {
  articles: ArticleSummary[];
  recruits: RecruitSummary[];
  teams: TeamSummary[];
  challenges: ChallengeSearchSummary[];
  users: UserSearchSummary[];
  repositories: RepositorySearchSummary[];
  organizations: OrganizationSearchSummary[];
  meta?: PageMeta;
}

// ============================================
// Title (칭호) Types
// ============================================

export interface UserTitleResponse {
  userTitleId: number;
  titleId: number;
  titleName: string;
  description: string;
  category: string;
  rarity: string;
  iconUrl: string | null;
  isDisplay: boolean;
  grantSource: string;
  grantedAt: string;
}

export interface UserTitleListResponse {
  titles: UserTitleResponse[];
  subTitles: UserTitleResponse[];
  totalCount: number;
}

export interface TitleConditionProgress {
  conditionType: string;
  current: number;
  target: number;
  rate: number;        // 0~100
  measurable: boolean;
}

export interface TitleProgressResponse {
  titleId: number;
  titleName: string;
  description: string;
  category: string;
  rarity: string;
  iconUrl: string | null;
  overallRate: number; // 0~100
  measurable: boolean;
  conditions: TitleConditionProgress[];
}

// ============================================
// Title Catalog Types (전체 칭호 목록)
// ============================================

export interface TitleConditionInfo {
  conditionType: string;
  thresholdValue: number;
  description: string | null;
}

export interface TitleDetailResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  iconUrl: string | null;
  conditions: TitleConditionInfo[];
}

export interface TitleCatalogListResponse {
  titles: TitleDetailResponse[];
  totalCount: number;
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
// Season Ranking Types
// ============================================

/**
 * 내 시즌 랭킹 응답 - /v1/seasons/current/rankings/me
 */
export interface MySeasonRankingResponse {
  seasonName: string;
  endDate: string; // "YYYY-MM-DD"
  rank: number;
  totalScore: number;
  tier: string; // e.g. "BRONZE_4", "SILVER_2", "CHALLENGER"
  attendanceScore: number;
  commitScore: number;
  challengeScore: number;
  projectScore: number;
  communityScore: number;
}

/**
 * 내 GitHub 기여 점수 기반 랭킹 응답 - /v1/github/rankings/me
 */
export interface MyGithubRankingResponse {
  rank: number;
  totalScore: number;
  activityScore: number;
  diversityScore: number;
  impactScore: number;
}

/**
 * GitHub 기여 점수 기반 랭킹 엔트리 - /v1/github/rankings
 */
export interface GithubRankingEntry {
  rank: number;
  userId: number;
  userName: string;
  profileImageUrl: string | null;
  totalScore: number;
  activityScore: number;
  diversityScore: number;
  impactScore: number;
}

/**
 * GitHub 기여 점수 기반 전체 랭킹 목록 응답
 */
export interface GithubRankingListResponse {
  rankings: GithubRankingEntry[];
  totalCount: number;
  page: number;
  size: number;
}

/**
 * 전체 시즌 랭킹 엔트리 - /v1/seasons/current/rankings
 */
export interface SeasonRankingEntry {
  rank: number;
  userId: number;
  userName: string;
  profileImageUrl: string | null;
  totalScore: number;
  tier: string; // e.g. "BRONZE_4", "GOLD_2", "CHALLENGER"
}

/**
 * 전체 시즌 랭킹 목록 응답
 */
export interface SeasonRankingListResponse {
  seasonName: string;
  endDate: string;
  rankings: SeasonRankingEntry[];
  totalCount: number;
  page: number;
  size: number;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'ARTICLE_REPORTED'
  | 'COMMENT_REPORTED'
  | 'CHALLENGE_ACHIEVED'
  | 'POINT_EARNED'
  | 'TEAM_INVITED'
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

// ============================================
// Resume Types
// ============================================

export interface ResumeLinkItem {
  id: string;
  label: string;
  url: string;
}

export interface ResumeEducationItem {
  id: string;
  school: string;
  major: string;
  period: string;
}

export interface ResumeCareerItem {
  id: string;
  company: string;
  role: string;
  period: string;
}

export interface ResumeExperienceItem {
  id: string;
  title: string;
  description: string;
  period: string;
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  period: string;
  summary: string;
  role: string;
  techStack: string[];
  mainFeatures: string;
  myContributions: string;
  problemSolving: string;
  result: string;
  githubLink: string;
  deployLink: string;
  docLink: string;
  featured: string;
}

export interface ResumeAwardItem {
  id: string;
  name: string;
  organization: string;
  date: string;
  relatedProject: string;
  description: string;
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  organization: string;
  date: string;
  /** 'ACQUIRED' | 'EXPIRED' */
  status: string;
}

export interface ResumeCoverLetterItem {
  id: string;
  title: string;
  content: string;
}

/** 커스텀 섹션 내 개별 필드 */
export interface ResumeCustomField {
  id: string;
  label: string;
  value: string;
}

/** 사용자 정의 이력서 섹션 */
export interface ResumeCustomSection {
  id: string;
  title: string;
  fields: ResumeCustomField[];
}

/** 서버에 저장/조회되는 이력서 데이터 구조 */
export interface ResumeData {
  resumeTitle: string;
  headline: string;
  bio: string;
  jobRole: string;
  techStack: string[];
  links: ResumeLinkItem[];
  education: ResumeEducationItem[];
  career: ResumeCareerItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  awards: ResumeAwardItem[];
  certifications: ResumeCertificationItem[];
  coverLetters: ResumeCoverLetterItem[];
  /** 사용자 정의 커스텀 섹션 */
  customSections?: ResumeCustomSection[];
  isPublic: boolean;
  /** 이력서에 표시할 섹션 목록. 키: SECTION_ANCHORS의 id 값. undefined이면 전체 표시. */
  visibleSections?: Record<string, boolean>;
}

/** GET /v1/users/me/resume, GET /v1/users/me/resumes/:id 응답 */
export interface ResumeResponse {
  resumeId: number | null;
  userId: number;
  isDefault: boolean;
  /** 저장된 이력서가 없으면 null */
  resumeData: ResumeData | null;
  updatedAt: string | null;
}

/** GET /v1/users/me/resumes 목록 항목 */
export interface ResumeSummaryResponse {
  resumeId: number;
  resumeTitle: string | null;
  isDefault: boolean;
  isPublic: boolean;
  updatedAt: string;
}

/** GET /v1/users/me/resumes 응답 */
export interface ResumeListResponse {
  resumes: ResumeSummaryResponse[];
  totalCount: number;
}

/** POST /v1/users/me/resume 요청 */
export type ResumeSaveRequest = ResumeData;

// ============================================
// CoffeeChat Types
// ============================================

export interface CoffeeChatRoomResponse {
  roomId: number;
  partnerId: number;
  partnerName: string;
  partnerGithubLogin: string | null;
  partnerProfileImage: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isPinned: boolean;
}

export interface CoffeeChatMessageResponse {
  id: string;
  senderId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface CoffeeChatUnreadCountResponse {
  count: number;
}

// ============================================
// CodeReview Types
// ============================================

export interface CodeReviewResponse {
  id: number;
  authorId: number;
  authorName: string;
  authorProfileImage: string | null;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  parentId: number | null;
  isPrivate: boolean;
  replies: CodeReviewResponse[];
}

export interface CodeReviewListResponse {
  total: number;
  reviews: CodeReviewResponse[];
}
