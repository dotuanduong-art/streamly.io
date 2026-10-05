import {
  ArrowLeft,
  Database,
  Film,
  ShieldCheck,
  Tags,
  Users,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export interface AdminSidebarProps {
  onNavigate?: () => void;
  testId?: string;
}

export function AdminSidebar({
  onNavigate,
  testId = 'admin-sidebar',
}: AdminSidebarProps) {
  const links = [
    {
      to: '/admin/movies',
      label: 'Phim',
      description: 'Quản lý kho phim',
      icon: Film,
    },
    {
      to: '/admin/genres',
      label: 'Thể loại',
      description: 'Danh mục nội dung',
      icon: Tags,
    },
    {
      to: '/admin/users',
      label: 'Người dùng',
      description: 'Tài khoản & phân quyền',
      icon: Users,
    },
    {
      to: '/admin/tmdb',
      label: 'Import TMDB',
      description: 'Nhập phim tự động',
      icon: Database,
    },
  ];

  return (
    <nav
      data-testid={testId}
      aria-label="Điều hướng quản trị"
      className="flex h-full flex-col border-r border-text-primary/10 bg-gradient-to-b from-surface via-surface to-background p-4"
    >
      {/* Logo */}
      <Link
        to="/admin/movies"
        onClick={onNavigate}
        className="mb-7 block rounded-card border border-brand/20 bg-brand/10 p-4 transition hover:border-brand/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20">
            <ShieldCheck size={23} />
          </div>

          <div>
            <p className="text-lg font-extrabold leading-tight text-brand">
              Streamly
            </p>

            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Admin Panel
            </p>
          </div>
        </div>
      </Link>

      {/* Menu */}
      <div>
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Quản lý hệ thống
        </p>

        <div className="space-y-2">
          {links.map(
            ({
              to,
              label,
              description,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-200 ${
                    isActive
                      ? 'border-brand/40 bg-brand text-white shadow-lg shadow-brand/20'
                      : 'border-transparent text-text-secondary hover:border-text-primary/10 hover:bg-surface-hover hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-surface-elevated text-text-secondary group-hover:bg-brand/10 group-hover:text-brand'
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold">
                        {label}
                      </p>

                      <p
                        className={`mt-0.5 truncate text-xs ${
                          isActive
                            ? 'text-white/70'
                            : 'text-text-muted'
                        }`}
                      >
                        {description}
                      </p>
                    </div>
                  </>
                )}
              </NavLink>
            )
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-5">
        <div className="mb-3 rounded-xl border border-text-primary/10 bg-surface-elevated/60 p-3">
          <p className="text-xs font-semibold text-text-secondary">
            Streamly Administration
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
            Quản lý nội dung và tài khoản
            của hệ thống.
          </p>
        </div>

        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-text-secondary transition hover:bg-surface-hover hover:text-brand"
        >
          <ArrowLeft size={19} />
          Về trang chính
        </Link>
      </div>
    </nav>
  );
}