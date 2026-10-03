import { z } from 'zod';

const email = z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.');
const password = z.string().min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Za-z]/, 'Password must include a letter.')
  .regex(/\d/, 'Password must include a number.');

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required.') });

export const registerSchema = z.object({
  displayName: z.string().trim().max(50, 'Display name must be 50 characters or fewer.').optional(),
  email,
  password,
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
