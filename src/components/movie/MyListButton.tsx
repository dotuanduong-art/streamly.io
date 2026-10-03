import { Check, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { MovieDetail } from '@/types';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useToggleMyList } from '@/features/my-list/hooks';
import { useAuthStore } from '@/store/useAuthStore';

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
  const busy = isAuthenticated && (list.isLoading || list.isPending);
  const label = list.isInMyList ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`;
  const activate = () => {
    if (!isAuthenticated) {
      toast('Sign in to use My List');
      navigate('/login', { state: { from: location } });
      return;
    }
    list.toggle();
  };

  if (variant === 'icon') return <IconButton data-testid="my-list-button" type="button" ariaLabel={label} variant="outline" size="sm" disabled={busy} aria-busy={busy} onClick={activate} className={className}>
    {list.isInMyList ? <Check size={18} /> : <Plus size={18} />}
  </IconButton>;

  return <Button data-testid="my-list-button" type="button" size="lg" variant="secondary" isLoading={busy} disabled={busy} leftIcon={list.isInMyList ? <Check size={20} /> : <Plus size={20} />} onClick={activate} className={className}>
    {list.isInMyList ? 'Remove from My List' : 'Add to My List'}
  </Button>;
}
