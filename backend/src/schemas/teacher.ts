import { z } from 'zod';

// ============================================
// QUERY SCHEMAS
// ============================================

// Class list query schema
export const teacherClassQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Student list query schema
export const teacherStudentQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['name', 'rollNumber', 'totalPoints']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Quiz attempts query schema
export const quizAttemptsQuerySchema = z.object({
  status: z.enum(['in_progress', 'submitted', 'graded']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['submittedAt', 'score', 'studentName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Performance query schema
export const performanceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ============================================
// BODY SCHEMAS
// ============================================

// Single answer grading schema
const gradeAnswerItemSchema = z.object({
  answerId: z.string().uuid('Invalid answer ID'),
  marksObtained: z.number().int().min(0, 'Marks cannot be negative'),
  feedback: z.string().max(1000, 'Feedback too long').optional().nullable(),
});

// Grade quiz attempt schema
export const gradeAttemptSchema = z.object({
  answers: z.array(gradeAnswerItemSchema).min(1, 'At least one answer must be graded'),
});

// Onboarding schema
export const onboardingSchema = z.object({
  role: z.string().max(100).optional(),
  school: z.string().max(200).optional(),
  subjects: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type TeacherClassQueryInput = z.infer<typeof teacherClassQuerySchema>;
export type TeacherStudentQueryInput = z.infer<typeof teacherStudentQuerySchema>;
export type QuizAttemptsQueryInput = z.infer<typeof quizAttemptsQuerySchema>;
export type PerformanceQueryInput = z.infer<typeof performanceQuerySchema>;
export type GradeAttemptInput = z.infer<typeof gradeAttemptSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
