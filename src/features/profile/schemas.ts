import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự.').max(50, 'Tên hiển thị không được quá 50 ký tự.'),
  avatarUrl: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
