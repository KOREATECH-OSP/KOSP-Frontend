import type { PageMeta } from '@/lib/api/types';

// ============================================
// Permission Types
// ============================================

export interface PermissionResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface PermissionListResponse {
  permissions: PermissionResponse[];
}

// ============================================
// Policy Types
// ============================================

export interface PolicyResponse {
  id: number;
  name: string;
  description: string;
}

export interface PolicyDetailResponse {
  id: number;
  name: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface PolicyListResponse {
  policies: PolicyResponse[];
}

export interface PolicyCreateRequest {
  name: string;
  description?: string;
}

export interface PolicyUpdateRequest {
  description: string;
}

// ============================================
// Role Types
// ============================================

export interface RoleResponse {
  name: string;
  description: string;
  canAccessAdmin: boolean;
  policies: string[]; // 정책 이름 배열
}

export interface RoleListResponse {
  roles: RoleResponse[];
}

export interface RoleCreateRequest {
  name: string;
  description?: string;
  canAccessAdmin?: boolean;
}

export interface RoleUpdateRequest {
  description: string;
  canAccessAdmin: boolean;
}

// ============================================
// Admin User Types
// ============================================

export interface AdminUserResponse {
  id: number;
  name: string;
  kutEmail: string;
  kutId: string;
  profileImageUrl: string | null;
  introduction: string | null;
  roles: string[];
  isDeleted: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUserResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface AdminUserUpdateRequest {
  name?: string;
  introduction?: string;
  profileImageUrl?: string;
}

export interface UserRoleUpdateRequest {
  roles: string[];
}

// ============================================
// Admin Challenge Types
// ============================================

export interface AdminChallengeResponse {
  id: number;
  name: string;
  description: string;
  condition: string;
  tier: number;
  imageUrl: string;
  point: number;
  maxProgress: number;
  progressField: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminChallengeListResponse {
  challenges: AdminChallengeResponse[];
}

export interface AdminChallengeCreateRequest {
  name: string;
  description: string;
  condition: string;
  tier: number;
  imageUrl: string;
  point: number;
  maxProgress: number;
  progressField: string;
}

export interface AdminChallengeUpdateRequest {
  name: string;
  description: string;
  condition: string;
  tier: number;
  imageUrl: string;
  point: number;
  maxProgress: number;
  progressField: string;
}

// ============================================
// Admin Notice Types
// ============================================

export interface AdminNoticeResponse {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id: number;
    name: string;
  };
  boardId?: number;
  viewCount?: number;
}

export interface AdminNoticeListResponse {
  posts: AdminNoticeResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface AdminNoticeCreateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  tags: string[];
}

export interface AdminNoticeUpdateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  tags: string[];
}

// ============================================
// Admin Article Types
// ============================================

export interface AdminArticleResponse {
  id: number;
  title: string;
  content: string;
  boardId: number;
  boardName?: string;
  author: {
    id: number;
    name: string;
    profileImage?: string;
  };
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminArticleListResponse {
  articles: AdminArticleResponse[];
  pagination: PageMeta;
}

// ============================================
// Admin Report Types
// ============================================

export interface AdminReportResponse {
  id: number;
  reporterId: number;
  reporterName: string;
  targetType: 'ARTICLE' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
  description?: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
  processedAt?: string;
}

export interface AdminReportListResponse {
  reports: AdminReportResponse[];
}

export interface ReportProcessRequest {
  action: 'DELETE_CONTENT' | 'REJECT';
}

// ============================================
// Admin Search Types
// ============================================

export interface AdminSearchResponse {
  users?: AdminUserResponse[];
  articles?: AdminArticleResponse[];
}

// ============================================
// Point Management Types
// ============================================

export interface PointTransactionRequest {
  point: number;
  reason: string;
}

export interface PointTransaction {
  id: number;
  amount: number;
  type: string;
  reason: string;
  balanceAfter: number;
  source: string;
  createdAt: string;
}

export interface PointHistoryResponse {
  userId: number;
  userName: string;
  currentBalance: number;
  transactions: PointTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ============================================
// Legacy Types (for backward compatibility)
// ============================================

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Policy {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface Role {
  name: string;
  description: string;
  policies: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  department: string;
  studentId: string;
  roles: string[];
  joinedAt: string;
  lastActive: string;
}
