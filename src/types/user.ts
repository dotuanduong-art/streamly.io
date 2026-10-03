export type UserRole = 'User' | 'Admin';

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
}
