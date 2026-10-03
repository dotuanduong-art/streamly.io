export type UserRole = 'Guest' | 'User' | 'Admin';

export interface User {
  id: string | number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt?: string;
}
