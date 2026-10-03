import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/Button';
import { PasswordField } from './PasswordField';
import { registerSchema, type RegisterFormValues } from '../schemas';
import { normalizeApiError } from '@/lib/error';
import { useAuthStore } from '@/store/useAuthStore';

export interface RegisterFormProps {
  returnTo?: string;
}

export function RegisterForm({ returnTo = '/' }: RegisterFormProps) {
  const navigate = useNavigate();
  const saveAuth = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    if (isSubmitting) return;
    setFormError('');
    try {
      const auth = await authApi.register(values);
      saveAuth(auth);
      toast.success(`Welcome to Streamly, ${auth.user.displayName}.`);
      navigate(returnTo, { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.errors?.email?.[0]) setError('email', { message: apiError.errors.email[0] });
      if (apiError.errors?.password?.[0]) setError('password', { message: apiError.errors.password[0] });
      if (apiError.errors?.displayName?.[0]) setError('displayName', { message: apiError.errors.displayName[0] });
      setFormError(apiError.message);
    }
  });

  return <form onSubmit={submit} noValidate className="space-y-5">
    {formError && <div data-testid="register-error" role="alert" className="rounded-button border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">{formError}</div>}
    <div>
      <label htmlFor="register-display-name" className="mb-2 block text-sm font-semibold">Display name <span className="font-normal text-text-secondary">(optional)</span></label>
      <input id="register-display-name" data-testid="register-display-name" type="text" autoComplete="name" aria-invalid={Boolean(errors.displayName)} className={`w-full rounded-button border bg-background/70 px-4 py-3 ${errors.displayName ? 'border-status-error' : 'border-text-primary/15'}`} {...register('displayName')} />
      {errors.displayName && <p className="mt-2 text-sm text-status-error">{errors.displayName.message}</p>}
    </div>
    <div>
      <label htmlFor="register-email" className="mb-2 block text-sm font-semibold">Email</label>
      <input id="register-email" data-testid="register-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} className={`w-full rounded-button border bg-background/70 px-4 py-3 ${errors.email ? 'border-status-error' : 'border-text-primary/15'}`} {...register('email')} />
      {errors.email && <p className="mt-2 text-sm text-status-error">{errors.email.message}</p>}
    </div>
    <PasswordField id="register-password" data-testid="register-password" label="Password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
    <PasswordField id="register-confirm" data-testid="register-confirm" label="Confirm password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
    <Button data-testid="register-submit" type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={isSubmitting}>Create Account</Button>
  </form>;
}
