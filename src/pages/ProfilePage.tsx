import { PageContainer } from '@/components/layout/PageContainer';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useAuthStore } from '@/store/useAuthStore';
import { features } from '@/lib/features';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function ProfilePage() {
  useDocumentTitle('Hồ sơ | Streamly');
  const user = useAuthStore((state) => state.user);
  return <PageContainer>{!features.profileAvailable ? <div><h1 className="text-heading font-bold leading-snug">Hồ sơ</h1><p className="mt-3 text-text-secondary">Tính năng chỉnh sửa hồ sơ sẽ sớm ra mắt.</p></div> : user && <ProfileForm user={user} />}</PageContainer>;
}

export default ProfilePage;
