import {
  useEffect,
  useState,
} from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { User } from '@/types';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { normalizeApiError } from '@/lib/error';

import {
  useUpdateProfile,
  useUploadAvatar,
} from '../hooks';

import {
  profileSchema,
  type ProfileFormValues,
} from '../schemas';

export interface ProfileFormProps {
  user: User;
}

const MAX_AVATAR_SIZE =
  5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function ProfileForm({
  user,
}: ProfileFormProps) {
  const [
    formError,
    setFormError,
  ] = useState('');

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null);

  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    formState: {
      errors,
      isDirty,
      isValid,
      isSubmitting,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',

    defaultValues: {
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? '',
    },
  });

  const displayName =
    watch('displayName');

  const avatarUrl =
    watch('avatarUrl');

  const pending =
    update.isPending ||
    isSubmitting;

  const avatarPending =
    uploadAvatar.isPending;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  const handleFileChange = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormError('');

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !ALLOWED_AVATAR_TYPES.includes(
        file.type
      )
    ) {
      setFormError(
        'Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.'
      );

      event.target.value = '';
      return;
    }

    if (
      file.size > MAX_AVATAR_SIZE
    ) {
      setFormError(
        'Ảnh không được lớn hơn 5 MB.'
      );

      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const url =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleUploadAvatar =
    async () => {
      if (
        !selectedFile ||
        avatarPending
      ) {
        return;
      }

      setFormError('');

      try {
        const saved =
          await uploadAvatar.mutateAsync(
            selectedFile
          );

        setValue(
          'avatarUrl',
          saved.avatarUrl ?? '',
          {
            shouldDirty: false,
          }
        );

        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl
          );
        }

        setPreviewUrl(null);
        setSelectedFile(null);
      } catch (error) {
        const apiError =
          normalizeApiError(error);

        setFormError(
          apiError.message
        );
      }
    };

  const submit =
    handleSubmit(
      async (values) => {
        if (pending) {
          return;
        }

        setFormError('');

        try {
          const saved =
            await update.mutateAsync({
              displayName:
                values.displayName,

              avatarUrl:
                values.avatarUrl ||
                null,
            });

          reset({
            displayName:
              saved.displayName,

            avatarUrl:
              saved.avatarUrl ??
              '',
          });
        } catch (error) {
          const apiError =
            normalizeApiError(error);

          if (
            apiError.errors
              ?.displayName?.[0]
          ) {
            setError(
              'displayName',
              {
                message:
                  apiError.errors
                    .displayName[0],
              }
            );
          }

          setFormError(
            apiError.message
          );
        }
      }
    );

  return (
    <form
      data-testid="profile-form"
      onSubmit={submit}
      noValidate
      className="mx-auto max-w-2xl space-y-8 rounded-card border border-text-primary/10 bg-surface p-5 sm:p-8"
    >
      <div className="flex items-center gap-5">
        <Avatar
          name={
            displayName ||
            user.displayName
          }
          avatarUrl={
            previewUrl ||
            avatarUrl ||
            null
          }
          className="h-20 w-20 text-2xl"
        />

        <div>
          <h1 className="text-2xl font-bold leading-snug">
            Hồ sơ
          </h1>

          <Badge className="mt-2">
            {user.role === 'Admin'
              ? 'Quản trị'
              : 'Người dùng'}
          </Badge>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-button border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error"
        >
          {formError}
        </div>
      )}

      <div>
        <label
          htmlFor="profile-display-name"
          className="mb-2 block text-sm font-semibold"
        >
          Tên hiển thị
        </label>

        <input
          id="profile-display-name"
          data-testid="profile-display-name"
          type="text"
          autoComplete="name"
          aria-invalid={
            Boolean(
              errors.displayName
            )
          }
          className={`w-full rounded-button border bg-background/70 px-4 py-3 ${
            errors.displayName
              ? 'border-status-error'
              : 'border-text-primary/15'
          }`}
          {...register(
            'displayName'
          )}
        />

        {errors.displayName && (
          <p
            role="alert"
            className="mt-2 text-sm text-status-error"
          >
            {
              errors.displayName
                .message
            }
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="profile-email"
          className="mb-2 block text-sm font-semibold"
        >
          Email
        </label>

        <input
          id="profile-email"
          type="email"
          value={user.email}
          readOnly
          aria-readonly="true"
          className="w-full rounded-button border border-text-primary/10 bg-background/40 px-4 py-3 text-text-secondary"
        />
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold">
            Ảnh đại diện
          </p>

          <p className="text-sm text-text-secondary">
            JPG, JPEG, PNG hoặc
            WEBP. Tối đa 5 MB.
          </p>
        </div>

        <input
          data-testid="profile-avatar-file"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={
            handleFileChange
          }
          disabled={avatarPending}
          className="block w-full rounded-button border border-text-primary/15 bg-background/70 px-4 py-3 text-sm"
        />

        {selectedFile && (
          <div className="rounded-button border border-text-primary/10 bg-background/50 p-4">
            <p className="text-sm">
              Đã chọn:{' '}
              <span className="font-semibold">
                {
                  selectedFile.name
                }
              </span>
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              {(
                selectedFile.size /
                1024 /
                1024
              ).toFixed(2)}{' '}
              MB
            </p>
          </div>
        )}

        <Button
          data-testid="profile-avatar-upload"
          type="button"
          isLoading={
            avatarPending
          }
          disabled={
            !selectedFile ||
            avatarPending
          }
          onClick={
            handleUploadAvatar
          }
        >
          Cập nhật ảnh đại diện
        </Button>
      </div>

      <Button
        data-testid="profile-save"
        type="submit"
        isLoading={pending}
        disabled={
          !isDirty ||
          !isValid ||
          pending
        }
      >
        Lưu thay đổi
      </Button>
    </form>
  );
}