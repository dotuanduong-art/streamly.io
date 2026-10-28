import {
  useMemo,
  useState,
} from 'react';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Search,
  Shield,
  Trash2,
  Unlock,
  UserRound,
  UsersRound,
} from 'lucide-react';

import type {
  AdminUser,
  UserRole,
} from '@/types';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';

import {
  useAdminUsers,
  useDeleteUser,
  useLockUser,
  useUnlockUser,
  useUpdateUserRole,
} from '@/features/admin/hooks';

const formatDate = (value: string) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ).format(date);
};

const parseApiUtcDate = (
  value: string
) => {
  const hasTimeZone =
    /Z$|[+-]\d{2}:\d{2}$/.test(
      value
    );

  return new Date(
    hasTimeZone
      ? value
      : `${value}Z`
  );
};

const formatDateTime = (
  value: string
) => {
  const date =
    parseApiUtcDate(value);

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(date);
};

const isTemporaryLocked = (
  user: AdminUser
) => {
  if (
    !user.isActive ||
    !user.lockedUntil
  ) {
    return false;
  }

  return (
    parseApiUtcDate(
    user.lockedUntil
  ).getTime() > Date.now()
  );
};

const isUserLocked = (
  user: AdminUser
) => {
  return (
    !user.isActive ||
    isTemporaryLocked(user)
  );
};

const getUserStatus = (
  user: AdminUser
) => {
  if (!user.isActive) {
    return {
      label: 'Khóa vĩnh viễn',
      className:
        'border-status-error/30 bg-status-error/10 text-status-error',
    };
  }

  if (isTemporaryLocked(user)) {
    return {
      label: user.lockedUntil
        ? `Khóa đến ${formatDateTime(
            user.lockedUntil
          )}`
        : 'Đang bị khóa',
      className:
        'border-status-warning/30 bg-status-warning/10 text-status-warning',
    };
  }

  return {
    label: 'Hoạt động',
    className:
      'border-status-success/30 bg-status-success/10 text-status-success',
  };
};

export function AdminUsersPage() {
  const [search, setSearch] =
    useState('');

  const [
    roleFilter,
    setRoleFilter,
  ] =
    useState<
      'all' | UserRole
    >('all');

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      'all' | 'active' | 'locked'
    >('all');

  const [page, setPage] =
    useState(1);

  const [
    actionUserId,
    setActionUserId,
  ] =
    useState<number | null>(
      null
    );

  const [
    pendingDelete,
    setPendingDelete,
  ] =
    useState<AdminUser | null>(
      null
    );

  const [
    pendingPermanentLock,
    setPendingPermanentLock,
  ] =
    useState<AdminUser | null>(
      null
    );

  const usersQuery =
    useAdminUsers({
      q:
        search.trim() ||
        undefined,

      role:
        roleFilter === 'all'
          ? undefined
          : roleFilter,

      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter ===
              'active',

      page,
      pageSize: 10,
    });

  const updateRole =
    useUpdateUserRole();

  const lockUser =
    useLockUser();

  const unlockUser =
    useUnlockUser();

  const deleteUser =
    useDeleteUser();

  const response =
    usersQuery.data;

  const users =
    response?.items ?? [];

  const isActionPending =
    lockUser.isPending ||
    unlockUser.isPending ||
    deleteUser.isPending;

  const summary =
    useMemo(() => {
      const total =
        response?.totalItems ??
        0;

      const admins =
        users.filter(
          (user) =>
            user.role ===
            'Admin'
        ).length;

      const active =
        users.filter(
          (user) =>
            !isUserLocked(
              user
            )
        ).length;

      return {
        total,
        admins,
        active,
      };
    }, [
      response?.totalItems,
      users,
    ]);

  const handleRoleChange =
    async (
      user: AdminUser,
      role: UserRole
    ) => {
      if (
        user.role === role
      ) {
        return;
      }

      try {
        await updateRole.mutateAsync(
          {
            id: user.id,
            role,
          }
        );
      } catch {
        // Hook đã hiển thị lỗi.
      }
    };

  const handleLockDays =
    async (
      user: AdminUser,
      days: number
    ) => {
      setActionUserId(null);

      try {
        await lockUser.mutateAsync(
          {
            id: user.id,
            days,
            permanent: false,
          }
        );
      } catch {
        // Hook đã hiển thị lỗi.
      }
    };

  const handleUnlock =
    async (
      user: AdminUser
    ) => {
      setActionUserId(null);

      try {
        await unlockUser.mutateAsync(
          user.id
        );
      } catch {
        // Hook đã hiển thị lỗi.
      }
    };

  const confirmPermanentLock =
    async () => {
      if (
        !pendingPermanentLock
      ) {
        return;
      }

      try {
        await lockUser.mutateAsync(
          {
            id:
              pendingPermanentLock.id,

            days: null,

            permanent: true,
          }
        );

        setPendingPermanentLock(
          null
        );
      } catch {
        // Hook đã hiển thị lỗi.
      }
    };

  const confirmDelete =
    async () => {
      if (!pendingDelete) {
        return;
      }

      try {
        await deleteUser.mutateAsync(
          pendingDelete.id
        );

        if (
          users.length === 1 &&
          page > 1
        ) {
          setPage(
            (current) =>
              Math.max(
                1,
                current - 1
              )
          );
        }

        setPendingDelete(
          null
        );
      } catch {
        // Hook đã hiển thị lỗi.
      }
    };

  const resetPage = () => {
    setPage(1);
  };

  const totalPages =
    response?.totalPages ?? 1;

  const renderStatus = (
    user: AdminUser
  ) => {
    const status =
      getUserStatus(user);

    return (
      <span
        className={`
          inline-flex
          max-w-full
          rounded-full
          border
          px-3
          py-1
          text-xs
          font-semibold
          ${status.className}
        `}
      >
        {status.label}
      </span>
    );
  };

  const renderActions = (
    user: AdminUser
  ) => {
    const locked =
      isUserLocked(user);

    const menuOpen =
      actionUserId ===
      user.id;

    return (
      <div className="relative inline-block text-left">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          rightIcon={
            <ChevronDown
              size={15}
            />
          }
          disabled={
            isActionPending
          }
          onClick={() =>
            setActionUserId(
              menuOpen
                ? null
                : user.id
            )
          }
        >
          Thao tác
        </Button>

        {menuOpen && (
          <div
            className="
              absolute
              right-0
              top-full
              z-50
              mt-2
              w-52
              overflow-hidden
              rounded-card
              border
              border-text-primary/15
              bg-surface-elevated
              p-1.5
              shadow-xl
            "
          >
            {locked && (
              <>
                <button
                  type="button"
                  disabled={
                    isActionPending
                  }
                  onClick={() =>
                    void handleUnlock(
                      user
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-button
                    px-3
                    py-2
                    text-left
                    text-sm
                    text-status-success
                    transition
                    hover:bg-status-success/10
                    disabled:opacity-50
                  "
                >
                  <Unlock
                    size={16}
                  />

                  Mở khóa
                </button>

                <div className="my-1 border-t border-text-primary/10" />
              </>
            )}

            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Khóa tạm thời
            </p>

            <button
              type="button"
              disabled={
                isActionPending
              }
              onClick={() =>
                void handleLockDays(
                  user,
                  1
                )
              }
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-button
                px-3
                py-2
                text-left
                text-sm
                text-text-primary
                transition
                hover:bg-surface-hover
                disabled:opacity-50
              "
            >
              <Lock size={16} />

              Khóa 1 ngày
            </button>

            <button
              type="button"
              disabled={
                isActionPending
              }
              onClick={() =>
                void handleLockDays(
                  user,
                  3
                )
              }
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-button
                px-3
                py-2
                text-left
                text-sm
                text-text-primary
                transition
                hover:bg-surface-hover
                disabled:opacity-50
              "
            >
              <Lock size={16} />

              Khóa 3 ngày
            </button>

            <button
              type="button"
              disabled={
                isActionPending
              }
              onClick={() =>
                void handleLockDays(
                  user,
                  7
                )
              }
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-button
                px-3
                py-2
                text-left
                text-sm
                text-text-primary
                transition
                hover:bg-surface-hover
                disabled:opacity-50
              "
            >
              <Lock size={16} />

              Khóa 7 ngày
            </button>

            <button
              type="button"
              disabled={
                isActionPending
              }
              onClick={() =>
                void handleLockDays(
                  user,
                  30
                )
              }
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-button
                px-3
                py-2
                text-left
                text-sm
                text-text-primary
                transition
                hover:bg-surface-hover
                disabled:opacity-50
              "
            >
              <Lock size={16} />

              Khóa 30 ngày
            </button>

            <div className="my-1 border-t border-text-primary/10" />

            <button
              type="button"
              disabled={
                isActionPending
              }
              onClick={() => {
                setActionUserId(
                  null
                );

                setPendingPermanentLock(
                  user
                );
              }}
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-button
                px-3
                py-2
                text-left
                text-sm
                text-status-warning
                transition
                hover:bg-status-warning/10
                disabled:opacity-50
              "
            >
              <Lock size={16} />

              Khóa vĩnh viễn
            </button>

            <button
              type="button"
              disabled={
                isActionPending
              }
              onClick={() => {
                setActionUserId(
                  null
                );

                setPendingDelete(
                  user
                );
              }}
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-button
                px-3
                py-2
                text-left
                text-sm
                text-status-error
                transition
                hover:bg-status-error/10
                disabled:opacity-50
              "
            >
              <Trash2
                size={16}
              />

              Xóa người dùng
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Tiêu đề */}
      <div>
        <h2 className="text-3xl font-bold leading-snug text-text-primary">
          Quản lý người dùng
        </h2>

        <p className="mt-2 text-text-secondary">
          Tìm kiếm, phân quyền,
          khóa tài khoản theo thời
          hạn và quản lý người dùng
          trong hệ thống.
        </p>
      </div>

      {/* Thống kê */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-text-primary/10 bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand/15 p-3 text-brand">
              <UsersRound
                size={22}
              />
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
              <Shield
                size={22}
              />
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
              <UserRound
                size={22}
              />
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
              onChange={(
                event
              ) => {
                setSearch(
                  event.target
                    .value
                );

                resetPage();
              }}
              placeholder="Tìm theo email hoặc tên người dùng"
              className="w-full rounded-button border border-text-primary/15 bg-background py-2.5 pl-10 pr-4 text-text-primary outline-none transition focus:border-brand"
            />
          </div>

          <select
            data-testid="admin-user-role-filter"
            value={roleFilter}
            onChange={(
              event
            ) => {
              setRoleFilter(
                event.target
                  .value as
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

            <option value="User">
              User
            </option>

            <option value="Admin">
              Admin
            </option>
          </select>

          <select
            data-testid="admin-user-status-filter"
            value={
              statusFilter
            }
            onChange={(
              event
            ) => {
              setStatusFilter(
                event.target
                  .value as
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
            Đang tải danh sách
            người dùng...
          </div>
        ) : usersQuery.error ? (
          <div className="rounded-card border border-status-error/30 bg-surface p-10 text-center">
            <p className="text-status-error">
              Không thể tải danh
              sách người dùng.
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
        ) : users.length ===
          0 ? (
          <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center text-text-secondary">
            Không tìm thấy người
            dùng phù hợp.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-visible rounded-card border border-text-primary/10 md:block">
              <div className="overflow-x-auto">
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
                    {users.map(
                      (user) => (
                        <tr
                          key={
                            user.id
                          }
                          data-testid={`admin-user-row-${user.id}`}
                          className="border-t border-text-primary/10 bg-surface transition hover:bg-surface-hover"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-secondary">
                                <UserRound
                                  size={
                                    18
                                  }
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-text-primary">
                                  {
                                    user.displayName
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-text-muted">
                                  {
                                    user.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <select
                              data-testid={`admin-user-role-${user.id}`}
                              value={
                                user.role
                              }
                              disabled={
                                updateRole.isPending
                              }
                              onChange={(
                                event
                              ) =>
                                void handleRoleChange(
                                  user,
                                  event
                                    .target
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
                            {renderStatus(
                              user
                            )}
                          </td>

                          <td className="px-5 py-4 text-text-secondary">
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {renderActions(
                              user
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile */}
            <div className="grid gap-3 md:hidden">
              {users.map(
                (user) => (
                  <article
                    key={user.id}
                    className="rounded-card border border-text-primary/10 bg-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-text-secondary">
                        <UserRound
                          size={18}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-text-primary">
                          {
                            user.displayName
                          }
                        </h3>

                        <p className="mt-1 break-all text-sm text-text-muted">
                          {
                            user.email
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-text-muted">
                          Quyền
                        </p>

                        <select
                          value={
                            user.role
                          }
                          disabled={
                            updateRole.isPending
                          }
                          onChange={(
                            event
                          ) =>
                            void handleRoleChange(
                              user,
                              event
                                .target
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

                        <div className="mt-2">
                          {renderStatus(
                            user
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-text-primary/10 pt-3">
                      <span className="text-xs text-text-muted">
                        Tạo:{' '}
                        {formatDate(
                          user.createdAt
                        )}
                      </span>

                      {renderActions(
                        user
                      )}
                    </div>
                  </article>
                )
              )}
            </div>

            {/* Phân trang */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">
                Trang{' '}
                {response?.page ??
                  1}{' '}
                / {totalPages} ·
                Tổng{' '}
                {response?.totalItems ??
                  0}{' '}
                người dùng
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={
                    <ChevronLeft
                      size={16}
                    />
                  }
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current -
                            1
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
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.min(
                          totalPages,
                          current +
                            1
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

      {/* Xác nhận khóa vĩnh viễn */}
      <ConfirmDialog
        isOpen={Boolean(
          pendingPermanentLock
        )}
        onClose={() =>
          setPendingPermanentLock(
            null
          )
        }
        onConfirm={() =>
          void confirmPermanentLock()
        }
        title="Khóa vĩnh viễn tài khoản"
        message={
          pendingPermanentLock
            ? `Bạn có chắc muốn khóa vĩnh viễn tài khoản “${pendingPermanentLock.displayName}” (${pendingPermanentLock.email})? Người dùng sẽ không thể đăng nhập hoặc tiếp tục sử dụng phiên hiện tại.`
            : ''
        }
        confirmLabel="Khóa vĩnh viễn"
        destructive
        isLoading={
          lockUser.isPending
        }
      />

      {/* Xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(
          pendingDelete
        )}
        onClose={() =>
          setPendingDelete(null)
        }
        onConfirm={() =>
          void confirmDelete()
        }
        title="Xóa người dùng"
        message={
          pendingDelete
            ? `Bạn có chắc muốn xóa tài khoản “${pendingDelete.displayName}” (${pendingDelete.email})? Dữ liệu liên quan của tài khoản này cũng sẽ bị xóa và không thể khôi phục.`
            : ''
        }
        confirmLabel="Xóa người dùng"
        destructive
        isLoading={
          deleteUser.isPending
        }
      />
    </div>
  );
}

export default AdminUsersPage;