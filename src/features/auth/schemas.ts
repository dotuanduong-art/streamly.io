import { z } from 'zod';

const email = z.string().trim().min(1, 'Vui lòng nhập email.').email('Vui lòng nhập địa chỉ email hợp lệ.');
const password = z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
  .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất một chữ cái.')
  .regex(/\d/, 'Mật khẩu phải có ít nhất một chữ số.');

export const loginSchema = z.object({ email, password });

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự.').max(50, 'Tên hiển thị không được quá 50 ký tự.'),
  email,
  password,
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp.',
  path: ['confirmPassword'],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
