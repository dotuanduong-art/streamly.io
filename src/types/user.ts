export type UserRole = 'User' | 'Admin';

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AdminUser extends User {
  isActive: boolean;
  lockedUntil?: string | null;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}