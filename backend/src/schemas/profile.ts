import { z } from 'zod';

// Teacher profile update schema
export const updateTeacherProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  location: z.string().max(200, 'Location must be at most 200 characters').optional(),
  subjectIds: z.array(z.string().uuid('Invalid subject ID')).optional(),
  classIds: z.array(z.string().uuid('Invalid class ID')).optional(),
});

// Student profile update schema
export const updateStudentProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// Admin profile update schema
export const updateAdminProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// Generic profile update schema (used for validation)
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  location: z.string().max(200, 'Location must be at most 200 characters').optional(),
  subjectIds: z.array(z.string().uuid('Invalid subject ID')).optional(),
  classIds: z.array(z.string().uuid('Invalid class ID')).optional(),
});

// Query params schema for classes
export const classQuerySchema = z.object({
  grade: z.string().regex(/^\d+$/, 'Grade must be a number').optional(),
  section: z.string().length(1, 'Section must be a single character').optional(),
});

export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
