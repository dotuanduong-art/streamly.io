import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { applyMockProfileOverride } from '@/api/profile.api';

interface MockAccount extends User {
  password: string;
}

const REGISTERED_USERS_KEY = 'streamly_mock_registered_users';

// Fake development-only accounts. Never reuse these credentials outside the mock layer.
export const mockAuthDemoCredentials = {
  user: { email: 'user@streamly.test', password: 'Streamly123!' },
  admin: { email: 'admin@streamly.test', password: 'Admin123!' },
} as const;

const seededAccounts: MockAccount[] = [
  { id: 1, email: mockAuthDemoCredentials.user.email, password: mockAuthDemoCredentials.user.password, displayName: 'Demo User', avatarUrl: null, role: 'User', createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, email: mockAuthDemoCredentials.admin.email, password: mockAuthDemoCredentials.admin.password, displayName: 'Demo Admin', avatarUrl: null, role: 'Admin', createdAt: '2026-01-01T00:00:00Z' },
];

function delay(): Promise<void> {
  const duration = 300 + Math.floor(Math.random() * 301);
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function readRegisteredAccounts(): MockAccount[] {
  const stored = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isMockAccount) : [];
  } catch {
    return [];
  }
}

function isMockAccount(value: unknown): value is MockAccount {
  if (typeof value !== 'object' || value === null) return false;
  const account = value as Record<string, unknown>;
  return typeof account.id === 'number' && typeof account.email === 'string' && typeof account.password === 'string'
    && typeof account.displayName === 'string' && typeof account.createdAt === 'string' && (account.role === 'User' || account.role === 'Admin');
}

function publicUser(account: MockAccount): User {
  const { password: _password, ...user } = account;
  return user;
}

function authResponse(account: MockAccount): AuthResponse {
  const randomPart = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return { accessToken: `mock-access-token.${randomPart}`, user: applyMockProfileOverride(publicUser(account)) };
}

export async function mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay();
  const email = credentials.email.trim().toLowerCase();
  const account = [...seededAccounts, ...readRegisteredAccounts()].find((item) => item.email.toLowerCase() === email);
  if (!account || account.password !== credentials.password) {
    throw { status: 401, message: 'Incorrect email or password.' };
  }
  return authResponse(account);
}

export async function mockRegister(credentials: RegisterCredentials): Promise<AuthResponse> {
  await delay();
  if (credentials.password.length < 8) {
    throw { status: 400, message: 'Please check the form.', errors: { password: ['Password must be at least 8 characters.'] } };
  }
  const email = credentials.email.trim().toLowerCase();
  const displayName = credentials.displayName.trim();
  if (displayName.length < 2 || displayName.length > 50) {
    throw { status: 400, message: 'Please check the form.', errors: { displayName: ['Display name must be 2 to 50 characters.'] } };
  }
  const registered = readRegisteredAccounts();
  if ([...seededAccounts, ...registered].some((item) => item.email.toLowerCase() === email)) {
    throw { status: 409, message: 'An account with this email already exists.' };
  }
  const nextId = Math.max(2, ...registered.map((item) => item.id)) + 1;
  const account: MockAccount = {
    id: nextId,
    email,
    password: credentials.password,
    displayName,
    avatarUrl: null,
    role: 'User',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...registered, account]));
  return authResponse(account);
}
