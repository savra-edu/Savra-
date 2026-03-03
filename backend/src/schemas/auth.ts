import { z } from 'zod';

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  role: z.enum(['teacher', 'student', 'admin'], {
    errorMap: () => ({ message: 'Role must be teacher, student, or admin' }),
  }),
  schoolCode: z.string().min(1, 'School code is required'),
  classId: z.string().uuid('Invalid class ID').optional(),
  location: z.string().max(255).optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  location: z.string().max(255).optional(),
  subjectIds: z.array(z.string().uuid()).optional(),
});

// Delete account schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for verification'),
  confirmText: z
    .string()
    .refine((val) => val === 'DELETE MY ACCOUNT', {
      message: 'Please type "DELETE MY ACCOUNT" to confirm',
    }),
});

// Infer TypeScript types from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
