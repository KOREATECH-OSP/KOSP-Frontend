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
  permissionIds?: number[];
}

export interface PolicyUpdateRequest {
  name?: string;
  description?: string;
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
  policyIds?: number[];
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
}

// ============================================
// Admin User Types
// ============================================

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  kutId: string;
  profileImage: string | null;
  roles: RoleResponse[];
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUserResponse[];
  pagination: PageMeta;
}

// ============================================
// Dashboard Types
// ============================================

export interface AdminStatsResponse {
  totalUsers: number;
  totalRoles: number;
  totalPolicies: number;
  totalPermissions: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface AdminActivityItem {
  id: number;
  type: 'USER_JOINED' | 'ROLE_ASSIGNED' | 'ARTICLE_CREATED' | 'TEAM_CREATED' | 'CHALLENGE_COMPLETED';
  userId: number;
  userName: string;
  description: string;
  createdAt: string;
}

export interface AdminActivityResponse {
  activities: AdminActivityItem[];
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
