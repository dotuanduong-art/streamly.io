import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Search,
  Shield,
  Unlock,
  UserRound,
  UsersRound,
} from 'lucide-react';

import type {
  AdminUser,
  UserRole,
} from '@/types';

import { Button } from '@/components/ui/Button';

import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from '@/features/admin/hooks';

const formatDate = (value: string) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState<'all' | UserRole>('all');

  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'locked'>(
      'all'
    );

  const [page, setPage] = useState(1);

  const usersQuery = useAdminUsers({
    q: search.trim() || undefined,
    role:
      roleFilter === 'all'
        ? undefined
        : roleFilter,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active',
    page,
    pageSize: 10,
  });

  const updateRole = useUpdateUserRole();
  const updateStatus =
    useUpdateUserStatus();

  const response = usersQuery.data;

  const users = response?.items ?? [];

  const summary = useMemo(() => {
    const total = response?.totalItems ?? 0;

    const admins = users.filter(
      (user) => user.role === 'Admin'
    ).length;

    const active = users.filter(
      (user) => user.isActive
    ).length;

    return {
      total,
      admins,
      active,
    };
  }, [response?.totalItems, users]);

  const handleRoleChange = async (
    user: AdminUser,
    role: UserRole
  ) => {
    if (user.role === role) {
      return;
    }

    try {
      await updateRole.mutateAsync({
        id: user.id,
        role,
      });
    } catch {
      // Hook đã hiển thị lỗi.
    }
  };

  const handleStatusChange = async (
    user: AdminUser
  ) => {
    try {
      await updateStatus.mutateAsync({
        id: user.id,
        isActive: !user.isActive,
      });
    } catch {
      // Hook đã hiển thị lỗi.
    }
  };

  const resetPage = () => {
    setPage(1);
  };

  const totalPages =
    response?.totalPages ?? 1;

  return (
    <div>
      {/* Tiêu đề */}
      <div>
        <h2 className="text-3xl font-bold leading-snug text-text-primary">
          Quản lý người dùng
        </h2>

        <p className="mt-2 text-text-secondary">
          Tìm kiếm, phân quyền và quản lý trạng
          thái tài khoản trong hệ thống.
        </p>
      </div>

      {/* Thống kê */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-text-primary/10 bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand/15 p-3 text-brand">
              <UsersRound size={22} />
            </div>

            <div>
              <p className="text-sm text-text-muted">
                Tổng người dùng
              </p>

              <p className="text-2xl font-bold text-text-primary">
                {summary.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-text-primary/10 bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-status-warning/15 p-3 text-status-warning">
              <Shield size={22} />
            </div>

            <div>
              <p className="text-sm text-text-muted">
                Admin trên trang
              </p>

              <p className="text-2xl font-bold text-text-primary">
                {summary.admins}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-text-primary/10 bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-status-success/15 p-3 text-status-success">
              <UserRound size={22} />
            </div>

            <div>
              <p className="text-sm text-text-muted">
                Đang hoạt động
              </p>

              <p className="text-2xl font-bold text-text-primary">
                {summary.active}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <section className="mt-6 rounded-card border border-text-primary/10 bg-surface p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              data-testid="admin-user-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder="Tìm theo email hoặc tên người dùng"
              className="w-full rounded-button border border-text-primary/15 bg-background py-2.5 pl-10 pr-4 text-text-primary outline-none transition focus:border-brand"
            />
          </div>

          <select
            data-testid="admin-user-role-filter"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(
                event.target.value as
                  | 'all'
                  | UserRole
              );
              resetPage();
            }}
            className="rounded-button border border-text-primary/15 bg-background px-4 py-2.5 text-text-primary outline-none transition focus:border-brand"
          >
            <option value="all">
              Tất cả quyền
            </option>
            <option value="User">User</option>
            <option value="Admin">
              Admin
            </option>
          </select>

          <select
            data-testid="admin-user-status-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as
                  | 'all'
                  | 'active'
                  | 'locked'
              );
              resetPage();
            }}
            className="rounded-button border border-text-primary/15 bg-background px-4 py-2.5 text-text-primary outline-none transition focus:border-brand"
          >
            <option value="all">
              Tất cả trạng thái
            </option>
            <option value="active">
              Hoạt động
            </option>
            <option value="locked">
              Đã khóa
            </option>
          </select>
        </div>
      </section>

      {/* Nội dung */}
      <div className="mt-6">
        {usersQuery.isLoading ? (
          <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center text-text-secondary">
            Đang tải danh sách người dùng...
          </div>
        ) : usersQuery.error ? (
          <div className="rounded-card border border-status-error/30 bg-surface p-10 text-center">
            <p className="text-status-error">
              Không thể tải danh sách người
              dùng.
            </p>

            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() =>
                void usersQuery.refetch()
              }
            >
              Thử lại
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center text-text-secondary">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto rounded-card border border-text-primary/10 md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-surface-elevated text-text-secondary">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Người dùng
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Quyền
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Trạng thái
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Ngày tạo
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      data-testid={`admin-user-row-${user.id}`}
                      className="border-t border-text-primary/10 bg-surface transition hover:bg-surface-hover"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-secondary">
                            <UserRound size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-text-primary">
                              {user.displayName}
                            </p>

                            <p className="mt-0.5 text-xs text-text-muted">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          data-testid={`admin-user-role-${user.id}`}
                          value={user.role}
                          disabled={
                            updateRole.isPending
                          }
                          onChange={(event) =>
                            void handleRoleChange(
                              user,
                              event.target
                                .value as UserRole
                            )
                          }
                          className="rounded-button border border-text-primary/15 bg-background px-3 py-2 text-text-primary outline-none focus:border-brand disabled:opacity-50"
                        >
                          <option value="User">
                            User
                          </option>
                          <option value="Admin">
                            Admin
                          </option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        {user.isActive ? (
                          <span className="inline-flex rounded-full border border-status-success/30 bg-status-success/10 px-3 py-1 text-xs font-semibold text-status-success">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-status-error/30 bg-status-error/10 px-3 py-1 text-xs font-semibold text-status-error">
                            Đã khóa
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-text-secondary">
                        {formatDate(
                          user.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Button
                            data-testid={`admin-user-status-${user.id}`}
                            type="button"
                            variant={
                              user.isActive
                                ? 'danger'
                                : 'secondary'
                            }
                            size="sm"
                            isLoading={
                              updateStatus.isPending
                            }
                            leftIcon={
                              user.isActive ? (
                                <Lock size={15} />
                              ) : (
                                <Unlock
                                  size={15}
                                />
                              )
                            }
                            onClick={() =>
                              void handleStatusChange(
                                user
                              )
                            }
                          >
                            {user.isActive
                              ? 'Khóa'
                              : 'Mở khóa'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-3 md:hidden">
              {users.map((user) => (
                <article
                  key={user.id}
                  className="rounded-card border border-text-primary/10 bg-surface p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-secondary">
                      <UserRound size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-text-primary">
                        {user.displayName}
                      </h3>

                      <p className="mt-1 break-all text-sm text-text-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-text-muted">
                        Quyền
                      </p>

                      <select
                        value={user.role}
                        disabled={
                          updateRole.isPending
                        }
                        onChange={(event) =>
                          void handleRoleChange(
                            user,
                            event.target
                              .value as UserRole
                          )
                        }
                        className="mt-1 w-full rounded-button border border-text-primary/15 bg-background px-3 py-2 text-text-primary"
                      >
                        <option value="User">
                          User
                        </option>
                        <option value="Admin">
                          Admin
                        </option>
                      </select>
                    </div>

                    <div>
                      <p className="text-text-muted">
                        Trạng thái
                      </p>

                      <p
                        className={`mt-2 font-semibold ${
                          user.isActive
                            ? 'text-status-success'
                            : 'text-status-error'
                        }`}
                      >
                        {user.isActive
                          ? 'Hoạt động'
                          : 'Đã khóa'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-text-primary/10 pt-3">
                    <span className="text-xs text-text-muted">
                      Tạo:{' '}
                      {formatDate(
                        user.createdAt
                      )}
                    </span>

                    <Button
                      type="button"
                      variant={
                        user.isActive
                          ? 'danger'
                          : 'secondary'
                      }
                      size="sm"
                      isLoading={
                        updateStatus.isPending
                      }
                      leftIcon={
                        user.isActive ? (
                          <Lock size={15} />
                        ) : (
                          <Unlock size={15} />
                        )
                      }
                      onClick={() =>
                        void handleStatusChange(
                          user
                        )
                      }
                    >
                      {user.isActive
                        ? 'Khóa'
                        : 'Mở khóa'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {/* Phân trang */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">
                Trang {response?.page ?? 1} /{' '}
                {totalPages} · Tổng{' '}
                {response?.totalItems ?? 0}{' '}
                người dùng
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={
                    <ChevronLeft size={16} />
                  }
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                    )
                  }
                >
                  Trước
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rightIcon={
                    <ChevronRight
                      size={16}
                    />
                  }
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;