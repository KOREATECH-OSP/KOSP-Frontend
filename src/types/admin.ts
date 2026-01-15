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
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyListResponse {
  policies: PolicyResponse[];
}

export interface PolicyCreateRequest {
  name: string;
  description: string;
}

export interface PolicyUpdateRequest {
  description: string;
}

// ============================================
// Role Types
// ============================================

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  policies: PolicyResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleListResponse {
  roles: RoleResponse[];
}

export interface RoleCreateRequest {
  name: string;
  description: string;
}

export interface RoleUpdateRequest {
  description: string;
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
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
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
