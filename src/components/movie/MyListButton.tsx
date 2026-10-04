import { Check, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { MovieDetail } from '@/types';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useToggleMyList } from '@/features/my-list/hooks';
import { useAuthStore } from '@/store/useAuthStore';
import { features } from '@/lib/features';

export interface MyListButtonProps {
  movie: MovieDetail;
  variant?: 'icon' | 'full';
  className?: string;
}

export function MyListButton({ movie, variant = 'full', className = '' }: MyListButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const list = useToggleMyList(movie);
  const busy = isAuthenticated && features.myListAvailable && (list.isLoading || list.isPending);
  const unavailable = isAuthenticated && !features.myListAvailable;
  const label = unavailable ? 'Danh sách của tôi chưa khả dụng' : list.isInMyList ? `Xóa ${movie.title} khỏi danh sách` : `Thêm ${movie.title} vào danh sách`;
  const activate = () => {
    if (!isAuthenticated) {
      toast('Đăng nhập để dùng Danh sách của tôi');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (features.myListAvailable) list.toggle();
  };

  if (variant === 'icon') return <IconButton data-testid="my-list-button" type="button" ariaLabel={label} variant="outline" size="sm" disabled={busy || unavailable} aria-busy={busy} onClick={activate} className={className}>
    {list.isInMyList ? <Check size={18} /> : <Plus size={18} />}
  </IconButton>;

  return <Button data-testid="my-list-button" type="button" size="lg" variant="secondary" isLoading={busy} disabled={busy || unavailable} leftIcon={list.isInMyList ? <Check size={20} /> : <Plus size={20} />} onClick={activate} className={className}>
    {unavailable ? 'Danh sách chưa khả dụng' : list.isInMyList ? 'Xóa khỏi danh sách' : 'Thêm vào danh sách'}
  </Button>;
}
