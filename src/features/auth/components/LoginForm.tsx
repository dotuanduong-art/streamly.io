import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/Button';
import { PasswordField } from './PasswordField';
import { loginSchema, type LoginFormValues } from '../schemas';
import { normalizeApiError } from '@/lib/error';
import { useAuthStore } from '@/store/useAuthStore';

export interface LoginFormProps {
  returnTo?: string;
}

export function LoginForm({ returnTo = '/' }: LoginFormProps) {
  const navigate = useNavigate();
  const saveAuth = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    if (isSubmitting) return;
    setFormError('');
    try {
      const auth = await authApi.login(values);
      saveAuth(auth);
      toast.success(`Chào mừng trở lại, ${auth.user.displayName}.`);
      navigate(returnTo, { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.errors?.email?.[0]) setError('email', { message: apiError.errors.email[0] });
      if (apiError.errors?.password?.[0]) setError('password', { message: apiError.errors.password[0] });
      setFormError(apiError.message);
    }
  });

  return <form onSubmit={submit} noValidate className="space-y-5">
    {formError && <div data-testid="login-error" role="alert" className="rounded-button border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">{formError}</div>}
    <div>
      <label htmlFor="login-email" className="mb-2 block text-sm font-semibold">Email</label>
      <input id="login-email" data-testid="login-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} className={`w-full rounded-button border bg-background/70 px-4 py-3 ${errors.email ? 'border-status-error' : 'border-text-primary/15'}`} {...register('email')} />
      {errors.email && <p id="login-email-error" className="mt-2 text-sm text-status-error">{errors.email.message}</p>}
    </div>
    <PasswordField id="login-password" data-testid="login-password" label="Mật khẩu" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
    <Button data-testid="login-submit" type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={isSubmitting}>Đăng nhập</Button>
  </form>;
}
