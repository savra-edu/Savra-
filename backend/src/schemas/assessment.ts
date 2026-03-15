import { z } from 'zod';

// Question type schema for assessment
const questionTypeSchema = z.object({
  questionType: z.enum(['mcq', 'short_answer', 'long_answer', 'case_study', 'assertion_reasoning', 'fill_in_blanks', 'diagram_based', 'problem_solving']),
  numberOfQuestions: z.number().min(1, 'At least 1 question required').max(50, 'Cannot exceed 50 questions'),
  marksPerQuestion: z.number().min(1, 'Marks must be at least 1').max(20, 'Marks cannot exceed 20'),
});

// Create assessment schema
export const createAssessmentSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  chapterIds: z.array(z.string().min(1, 'Invalid chapter ID')).min(1, 'Select at least one chapter'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  objective: z.string().max(500, 'Objective must be at most 500 characters').optional(),
  totalMarks: z.number().min(10, 'Total marks must be at least 10').max(500, 'Total marks cannot exceed 500'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  questionTypes: z.array(questionTypeSchema).min(1, 'At least one question type is required'),
  referenceBooks: z.array(z.string()).optional().default([]),
  referenceFileUrl: z.string().url('Invalid URL').optional().nullable(),
});

// Update assessment schema
export const updateAssessmentSchema = z.object({
  classId: z.string().uuid('Invalid class ID').optional(),
  subjectId: z.string().uuid('Invalid subject ID').optional(),
  chapterIds: z.array(z.string().min(1, 'Invalid chapter ID')).min(1, 'Select at least one chapter').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  objective: z.string().max(500).optional().nullable(),
  totalMarks: z.number().min(10).max(500).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  questionTypes: z.array(questionTypeSchema).min(1).optional(),
  referenceBooks: z.array(z.string()).optional(),
  referenceFileUrl: z.string().url('Invalid URL').optional().nullable(),
  questionPaper: z.any().optional(),
});

// Assessment query schema for filtering
export const assessmentQuerySchema = z.object({
  status: z.enum(['draft', 'saved', 'published']).optional(),
  subjectId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'totalMarks']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Update status schema
export const updateAssessmentStatusSchema = z.object({
  status: z.enum(['draft', 'saved', 'published'], {
    errorMap: () => ({ message: 'Status must be draft, saved, or published' }),
  }),
});

// Generate paper schema
export const generatePaperSchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type AssessmentQueryInput = z.infer<typeof assessmentQuerySchema>;
export type UpdateAssessmentStatusInput = z.infer<typeof updateAssessmentStatusSchema>;
export type GeneratePaperInput = z.infer<typeof generatePaperSchema>;
