import { useState } from 'react';
import {
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { AdminSidebar } from './AdminSidebar';
import { Modal } from '@/components/modal/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const titles: Record<string, string> = {
  '/admin/movies': 'Quản lý phim',
  '/admin/genres': 'Quản lý thể loại',
  '/admin/users': 'Quản lý người dùng',
  '/admin/tmdb': 'Import phim từ TMDB',
};

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore(
    (state) => state.user
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const title = pathname.startsWith(
    '/admin/movies/'
  )
    ? 'Chỉnh sửa phim'
    : titles[pathname] ?? 'Quản trị';

  useDocumentTitle(
    `${title} | Streamly Quản trị`
  );

  const signOut = () => {
    logout();

    queryClient.removeQueries({
      predicate: ({ queryKey }) =>
        [
          'my-list',
          'history',
          'profile',
        ].includes(String(queryKey[0])),
    });

    navigate('/', {
      replace: true,
    });
  };

  return (
    <div
      data-testid="admin-layout"
      className="min-h-screen bg-background text-text-primary"
    >
      <a
        href="#admin-main"
        className="sr-only fixed left-4 top-4 z-[120] rounded-button bg-text-primary p-3 text-background focus:not-sr-only"
      >
        Chuyển đến nội dung quản trị
      </a>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 md:block">
        <AdminSidebar />
      </aside>

      <div className="min-w-0 md:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-text-primary/10 bg-background/80 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <IconButton
              data-testid="admin-sidebar-toggle"
              ariaLabel="Mở điều hướng quản trị"
              className="md:hidden"
              onClick={() =>
                setDrawerOpen(true)
              }
            >
              <Menu size={22} />
            </IconButton>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                <ShieldCheck
                  size={14}
                  className="text-brand"
                />

                <span>Quản trị</span>

                <ChevronRight size={13} />

                <span className="truncate text-brand">
                  {title}
                </span>
              </div>

              <h1 className="mt-1 truncate text-xl font-extrabold leading-snug text-text-primary sm:text-2xl">
                {title}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-3 rounded-xl border border-text-primary/10 bg-surface/80 px-3 py-2 sm:flex">
                <Avatar
                  name={
                    user?.displayName ??
                    'Quản trị'
                  }
                  avatarUrl={
                    user?.avatarUrl
                  }
                  className="h-9 w-9"
                />

                <div className="hidden lg:block">
                  <p className="max-w-[160px] truncate text-sm font-bold text-text-primary">
                    {user?.displayName ??
                      'Quản trị viên'}
                  </p>

                  <p className="text-xs text-brand">
                    Administrator
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                leftIcon={
                  <LogOut size={16} />
                }
                onClick={signOut}
                className="hover:text-brand"
              >
                <span className="hidden sm:inline">
                  Đăng xuất
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main background */}
        <main
          id="admin-main"
          className="relative min-h-[calc(100vh-76px)] overflow-hidden p-4 sm:p-6 lg:p-8"
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar mobile */}
      <Modal
        isOpen={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
        title="Điều hướng quản trị"
      >
        <div className="h-[70svh]">
          <AdminSidebar
            testId="admin-sidebar-drawer"
            onNavigate={() =>
              setDrawerOpen(false)
            }
          />
        </div>
      </Modal>
    </div>
  );
}