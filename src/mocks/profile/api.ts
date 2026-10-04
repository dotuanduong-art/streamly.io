import type { UpdateProfileRequest, User } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

const STORAGE_KEY = 'streamly_mock_profile_overrides';
type Override = Pick<User, 'displayName' | 'avatarUrl'>;

function readOverrides(): Record<string, Override> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result: Record<string, Override> = {};
    for (const [key, item] of Object.entries(value)) {
      if (item && typeof item === 'object' && 'displayName' in item && typeof item.displayName === 'string') {
        const avatarUrl = 'avatarUrl' in item && (typeof item.avatarUrl === 'string' || item.avatarUrl === null) ? item.avatarUrl : null;
        result[key] = { displayName: item.displayName, avatarUrl };
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function applyMockProfileOverride(user: User): User {
  return { ...user, ...(readOverrides()[String(user.id)] ?? {}) };
}

export const mockProfileApi = {
  updateProfile: async (request: UpdateProfileRequest): Promise<User> => {
    const user = useAuthStore.getState().user;
    if (!user) throw { status: 401, message: 'Vui lòng đăng nhập để chỉnh sửa hồ sơ.' };
    await new Promise((resolve) => window.setTimeout(resolve, 300 + Math.floor(Math.random() * 301)));
    const displayName = request.displayName.trim();
    if (displayName.length < 2 || displayName.length > 50) {
      throw { status: 400, message: 'Vui lòng kiểm tra thông tin hồ sơ.', errors: { displayName: ['Tên hiển thị phải có từ 2 đến 50 ký tự.'] } };
    }
    const avatarUrl = request.avatarUrl?.trim() || null;
    const next: User = { ...user, displayName, avatarUrl };
    const overrides = readOverrides();
    overrides[String(user.id)] = { displayName, avatarUrl };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    return next;
  },
};
