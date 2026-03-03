import { z } from 'zod';

// Query schema for student lessons
export const studentLessonQuerySchema = z.object({
  subjectId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Query schema for student quizzes
export const studentQuizQuerySchema = z.object({
  subjectId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'title', 'dueDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Query schema for student announcements
export const studentAnnouncementQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Query schema for student assessments
export const studentAssessmentQuerySchema = z.object({
  subjectId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Submit answer schema
export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  selectedOptionId: z.string().uuid('Invalid option ID').optional().nullable(),
  answerText: z.string().max(5000, 'Answer too long').optional().nullable(),
}).refine(
  (data) => data.selectedOptionId || data.answerText,
  { message: 'Either selectedOptionId or answerText must be provided' }
);

export type StudentLessonQueryInput = z.infer<typeof studentLessonQuerySchema>;
export type StudentQuizQueryInput = z.infer<typeof studentQuizQuerySchema>;
export type StudentAnnouncementQueryInput = z.infer<typeof studentAnnouncementQuerySchema>;
export type StudentAssessmentQueryInput = z.infer<typeof studentAssessmentQuerySchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
