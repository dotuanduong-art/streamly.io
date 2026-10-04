import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AdminSidebar } from './AdminSidebar';
import { Modal } from '@/components/modal/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const titles: Record<string, string> = { '/admin/movies': 'Phim', '/admin/genres': 'Thể loại', '/admin/users': 'Người dùng' };

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const title = pathname.startsWith('/admin/movies/') ? 'Chỉnh sửa phim' : titles[pathname] ?? 'Quản trị';
  useDocumentTitle(`${title} | Streamly Quản trị`);
  const signOut = () => {
    logout();
    queryClient.removeQueries({ predicate: ({ queryKey }) => ['my-list', 'history', 'profile'].includes(String(queryKey[0])) });
    navigate('/', { replace: true });
  };

  return <div data-testid="admin-layout" className="min-h-screen bg-background text-text-primary">
    <a href="#admin-main" className="sr-only fixed left-4 top-4 z-[120] rounded-button bg-text-primary p-3 text-background focus:not-sr-only">Chuyển đến nội dung quản trị</a>
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-text-primary/10 md:block"><AdminSidebar /></aside>
    <div className="min-w-0 md:pl-64">
      <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-text-primary/10 bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <IconButton data-testid="admin-sidebar-toggle" ariaLabel="Mở điều hướng quản trị" className="md:hidden" onClick={() => setDrawerOpen(true)}><Menu size={22} /></IconButton>
        <h1 className="text-xl font-bold leading-snug">{title}</h1>
        <div className="ml-auto flex items-center gap-3"><Avatar name={user?.displayName ?? 'Quản trị'} avatarUrl={user?.avatarUrl} className="h-9 w-9" /><span className="hidden text-sm font-semibold sm:block">{user?.displayName}</span><Button type="button" size="sm" variant="ghost" leftIcon={<LogOut size={16} />} onClick={signOut}>Đăng xuất</Button></div>
      </header>
      <main id="admin-main" className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
    <Modal isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Điều hướng quản trị"><div className="h-[70svh]"><AdminSidebar testId="admin-sidebar-drawer" onNavigate={() => setDrawerOpen(false)} /></div></Modal>
  </div>;
}
