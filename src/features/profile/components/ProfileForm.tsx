import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { normalizeApiError } from '@/lib/error';
import { useUpdateProfile } from '../hooks';
import { profileSchema, type ProfileFormValues } from '../schemas';

const avatarOptions = Array.from({ length: 8 }, (_, index) => `https://picsum.photos/seed/streamly-avatar-${index + 1}/160/160`);

export interface ProfileFormProps { user: User }

export function ProfileForm({ user }: ProfileFormProps) {
  const [formError, setFormError] = useState('');
  const update = useUpdateProfile();
  const { register, handleSubmit, watch, reset, setError, formState: { errors, isDirty, isValid, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema), mode: 'onChange',
    defaultValues: { displayName: user.displayName, avatarUrl: user.avatarUrl ?? '' },
  });
  const displayName = watch('displayName');
  const avatarUrl = watch('avatarUrl');
  const pending = update.isPending || isSubmitting;
  const submit = handleSubmit(async (values) => {
    if (pending) return;
    setFormError('');
    try {
      const saved = await update.mutateAsync({ displayName: values.displayName, avatarUrl: values.avatarUrl || null });
      reset({ displayName: saved.displayName, avatarUrl: saved.avatarUrl ?? '' });
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.errors?.displayName?.[0]) setError('displayName', { message: apiError.errors.displayName[0] });
      setFormError(apiError.message);
    }
  });

  return <form data-testid="profile-form" onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-8 rounded-card border border-text-primary/10 bg-surface p-5 sm:p-8">
    <div className="flex items-center gap-5">
      <Avatar name={displayName || user.displayName} avatarUrl={avatarUrl || null} className="h-20 w-20 text-2xl" />
      <div><h1 className="text-2xl font-bold leading-snug">Hồ sơ</h1><Badge className="mt-2">{user.role === 'Admin' ? 'Quản trị' : 'Người dùng'}</Badge></div>
    </div>
    {formError && <div role="alert" className="rounded-button border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">{formError}</div>}
    <div>
      <label htmlFor="profile-display-name" className="mb-2 block text-sm font-semibold">Tên hiển thị</label>
      <input id="profile-display-name" data-testid="profile-display-name" type="text" autoComplete="name" aria-invalid={Boolean(errors.displayName)} className={`w-full rounded-button border bg-background/70 px-4 py-3 ${errors.displayName ? 'border-status-error' : 'border-text-primary/15'}`} {...register('displayName')} />
      {errors.displayName && <p role="alert" className="mt-2 text-sm text-status-error">{errors.displayName.message}</p>}
    </div>
    <div>
      <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold">Email</label>
      <input id="profile-email" type="email" value={user.email} readOnly aria-readonly="true" className="w-full rounded-button border border-text-primary/10 bg-background/40 px-4 py-3 text-text-secondary" />
    </div>
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">Ảnh đại diện</legend>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-button border p-3 text-center text-xs ${avatarUrl === '' ? 'border-brand bg-brand/10' : 'border-text-primary/10'}`}>
          <input type="radio" value="" className="accent-brand" {...register('avatarUrl')} />
          <Avatar name={displayName || user.displayName} className="h-12 w-12" />
          <span>Chữ viết tắt</span>
        </label>
        {avatarOptions.map((url, index) => <label key={url} className={`flex cursor-pointer flex-col items-center gap-2 rounded-button border p-3 text-xs ${avatarUrl === url ? 'border-brand bg-brand/10' : 'border-text-primary/10'}`}>
          <input data-testid={`profile-avatar-option-${index + 1}`} type="radio" value={url} className="accent-brand" {...register('avatarUrl')} />
          <Avatar name={`Ảnh đại diện ${index + 1}`} avatarUrl={url} className="h-12 w-12" />
          <span>Mẫu {index + 1}</span>
        </label>)}
      </div>
    </fieldset>
    <Button data-testid="profile-save" type="submit" isLoading={pending} disabled={!isDirty || !isValid || pending}>Lưu thay đổi</Button>
  </form>;
}
