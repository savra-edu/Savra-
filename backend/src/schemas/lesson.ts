import { z } from 'zod';

// Period entry schema
export const periodEntrySchema = z.object({
  periodNo: z.number().int().min(1),
  concept: z.string().optional(),
  learningOutcomes: z.string().optional(),
  teacherLearningProcess: z.string().optional(),
  assessment: z.string().optional(),
  resources: z.string().optional(),
  centurySkillsValueEducation: z.string().optional(),
  realLifeApplication: z.string().optional(),
  reflection: z.string().optional(),
});

// Create lesson schema
export const createLessonSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  chapterIds: z.array(z.string().min(1, 'Invalid chapter ID')).min(1, 'Select at least one chapter'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').optional(),
  objective: z.string().max(500, 'Objective must be at most 500 characters').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  topic: z.string().min(1).optional(),
  numberOfPeriods: z.number().int().min(1).optional(),
  periods: z.array(periodEntrySchema).optional(),
});

// Update lesson schema
export const updateLessonSchema = z.object({
  classId: z.string().uuid('Invalid class ID').optional(),
  subjectId: z.string().uuid('Invalid subject ID').optional(),
  chapterIds: z.array(z.string().min(1, 'Invalid chapter ID')).min(1, 'Select at least one chapter').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  duration: z.number().min(15).optional(),
  objective: z.string().max(500).optional(),
  content: z.string().optional(),
  referenceFileUrl: z.string().url('Invalid URL').optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  topic: z.string().min(1).optional().nullable(),
  numberOfPeriods: z.number().int().min(1).optional().nullable(),
  periods: z.array(periodEntrySchema).optional(),
});

// Lesson query schema for filtering
export const lessonQuerySchema = z.object({
  status: z.enum(['draft', 'saved', 'published']).optional(),
  subjectId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Update status schema
export const updateStatusSchema = z.object({
  status: z.enum(['draft', 'saved', 'published'], {
    errorMap: () => ({ message: 'Status must be draft, saved, or published' }),
  }),
});

// Generate content schema
export const generateContentSchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

export type PeriodEntryInput = z.infer<typeof periodEntrySchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type LessonQueryInput = z.infer<typeof lessonQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
