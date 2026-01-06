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
