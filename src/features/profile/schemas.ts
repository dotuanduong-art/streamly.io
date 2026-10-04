import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must have at least 2 characters.').max(50, 'Display name must have at most 50 characters.'),
  avatarUrl: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
