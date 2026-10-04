import { PageContainer } from '@/components/layout/PageContainer';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useAuthStore } from '@/store/useAuthStore';
import { USE_MOCK_AUTH } from '@/lib/constants';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  return <PageContainer>{!USE_MOCK_AUTH ? <div><h1 className="text-heading font-bold">Your Profile</h1><p className="mt-3 text-text-secondary">Profile editing is coming soon.</p></div> : user && <ProfileForm user={user} />}</PageContainer>;
}

export default ProfilePage;
