import { z } from 'zod';

// ============================================
// QUERY SCHEMAS
// ============================================

// Teacher list query schema
export const adminTeacherQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Student list query schema
export const adminStudentQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  grade: z.string().regex(/^\d+$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'name', 'rollNumber']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Class list query schema
export const adminClassQuerySchema = z.object({
  grade: z.string().regex(/^\d+$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ============================================
// TEACHER SCHEMAS
// ============================================

// Create teacher schema
export const createTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  location: z.string().max(200).optional().nullable(),
});

// Update teacher schema
export const updateTeacherSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().max(200).optional().nullable(),
});

// Assign subjects to teacher
export const assignSubjectsSchema = z.object({
  subjectIds: z.array(z.string().uuid('Invalid subject ID')).min(0),
});

// Assign classes to teacher
export const assignClassesSchema = z.object({
  classIds: z.array(z.string().uuid('Invalid class ID')).min(0),
});

// ============================================
// STUDENT SCHEMAS
// ============================================

// Create student schema
export const createStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  classId: z.string().uuid('Invalid class ID'),
  rollNumber: z.string().max(20).optional().nullable(),
});

// Update student schema
export const updateStudentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  rollNumber: z.string().max(20).optional().nullable(),
});

// Transfer student to different class
export const transferStudentSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
});

// ============================================
// CLASS SCHEMAS
// ============================================

// Create class schema
export const createClassSchema = z.object({
  grade: z.number().int().min(1, 'Grade must be at least 1').max(12, 'Grade cannot exceed 12'),
  section: z.string().min(1, 'Section is required').max(10, 'Section too long'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
});

// Update class schema
export const updateClassSchema = z.object({
  grade: z.number().int().min(1).max(12).optional(),
  section: z.string().min(1).max(10).optional(),
  name: z.string().min(2).max(100).optional(),
});

// ============================================
// SCHOOL SCHEMAS
// ============================================

// Update school schema
export const updateSchoolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name too long').optional(),
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code too long').optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type AdminTeacherQueryInput = z.infer<typeof adminTeacherQuerySchema>;
export type AdminStudentQueryInput = z.infer<typeof adminStudentQuerySchema>;
export type AdminClassQueryInput = z.infer<typeof adminClassQuerySchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type AssignSubjectsInput = z.infer<typeof assignSubjectsSchema>;
export type AssignClassesInput = z.infer<typeof assignClassesSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type TransferStudentInput = z.infer<typeof transferStudentSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
