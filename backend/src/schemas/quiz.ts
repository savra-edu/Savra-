import { z } from 'zod';

// Create quiz schema
export const createQuizSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  chapterIds: z.array(z.string().min(1, 'Invalid chapter ID')).min(1, 'Select at least one chapter'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  objective: z.string().max(500, 'Objective must be at most 500 characters').optional(),
  timeLimit: z.number().min(5, 'Time limit must be at least 5 minutes').max(180, 'Time limit must be at most 180 minutes').optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  totalQuestions: z.number().min(1, 'Must have at least 1 question').max(100, 'Cannot exceed 100 questions'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1').max(500, 'Total marks cannot exceed 500'),
  dueDate: z.string().datetime().optional(),
  isOptional: z.boolean().optional().default(false),
  referenceFileUrl: z.string().url('Invalid URL').optional().nullable(),
});

// Update quiz schema
export const updateQuizSchema = z.object({
  classId: z.string().uuid('Invalid class ID').optional(),
  subjectId: z.string().uuid('Invalid subject ID').optional(),
  chapterIds: z.array(z.string().min(1, 'Invalid chapter ID')).min(1, 'Select at least one chapter').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  objective: z.string().max(500).optional().nullable(),
  timeLimit: z.number().min(5).max(180).optional().nullable(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  totalQuestions: z.number().min(1).max(100).optional(),
  totalMarks: z.number().min(1).max(500).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  isOptional: z.boolean().optional(),
  referenceFileUrl: z.string().url('Invalid URL').optional().nullable(),
});

// Quiz query schema for filtering
export const quizQuerySchema = z.object({
  status: z.enum(['draft', 'saved', 'published']).optional(),
  subjectId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'dueDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Update status schema
export const updateQuizStatusSchema = z.object({
  status: z.enum(['draft', 'saved', 'published'], {
    errorMap: () => ({ message: 'Status must be draft, saved, or published' }),
  }),
  // Additional fields for publishing
  sections: z.array(z.string()).optional(), // e.g., ["10-A", "10-B"]
  dueDate: z.string().datetime().optional().nullable(),
  coins: z.number().min(0).optional(),
});

// Generate questions schema
export const generateQuestionsSchema = z.object({
  numberOfQuestions: z.number().min(1).max(50).optional(),
  regenerate: z.boolean().optional().default(false),
});

// Question option schema
const questionOptionSchema = z.object({
  label: z.string().length(1, 'Label must be a single character (A, B, C, or D)'),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

// Create question schema
export const createQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['mcq', 'short_answer', 'long_answer', 'case_study']).optional().default('mcq'),
  marks: z.number().min(1).optional().default(1),
  options: z.array(questionOptionSchema).optional(),
}).refine(
  (data) => {
    // MCQ questions must have options with exactly one correct answer
    if (data.questionType === 'mcq') {
      if (!data.options || data.options.length < 2) {
        return false;
      }
      const correctCount = data.options.filter((opt) => opt.isCorrect).length;
      return correctCount === 1;
    }
    return true;
  },
  {
    message: 'MCQ questions must have at least 2 options with exactly one correct answer',
  }
);

// Update question schema
export const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  questionType: z.enum(['mcq', 'short_answer', 'long_answer', 'case_study']).optional(),
  marks: z.number().min(1).optional(),
  options: z.array(questionOptionSchema).optional(),
}).refine(
  (data) => {
    // If options are provided and questionType is mcq (or not specified), validate
    if (data.options && data.options.length > 0) {
      const correctCount = data.options.filter((opt) => opt.isCorrect).length;
      return correctCount === 1;
    }
    return true;
  },
  {
    message: 'Options must have exactly one correct answer',
  }
);

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizQueryInput = z.infer<typeof quizQuerySchema>;
export type UpdateQuizStatusInput = z.infer<typeof updateQuizStatusSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
