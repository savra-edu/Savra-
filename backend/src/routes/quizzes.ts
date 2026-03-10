import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { generateQuizQuestions } from '../lib/gemini';
import {
  createQuizSchema,
  updateQuizSchema,
  quizQuerySchema,
  updateQuizStatusSchema,
  generateQuestionsSchema,
  createQuestionSchema,
  updateQuestionSchema,
} from '../schemas/quiz';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';
import { QuizStatus, DifficultyLevel } from '@prisma/client';

const router = Router();

// Helper to get teacher ID from user
const getTeacherId = async (userId: string): Promise<string | null> => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true },
  });
  return teacher?.id || null;
};

// Helper to verify quiz ownership
const verifyQuizOwnership = async (quizId: string, teacherId: string) => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, teacherId },
  });
  return quiz;
};

// POST /api/quizzes - Create a new quiz
router.post(
  '/',
  authMiddleware,
  authorize('teacher'),
  validate(createQuizSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const {
        classId,
        subjectId,
        chapterIds,
        title,
        objective,
        timeLimit,
        difficultyLevel,
        totalQuestions,
        totalMarks,
        dueDate,
        isOptional,
        referenceFileUrl,
      } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify class exists
      const classExists = await prisma.class.findUnique({ where: { id: classId } });
      if (!classExists) {
        return errorResponse(res, 'Class not found', 400, 'INVALID_CLASS');
      }

      // Verify subject exists
      const subjectExists = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subjectExists) {
        return errorResponse(res, 'Subject not found', 400, 'INVALID_SUBJECT');
      }

      // Verify all chapters exist and belong to the subject
      const validChapters = await prisma.chapter.findMany({
        where: { id: { in: chapterIds }, subjectId },
      });

      if (validChapters.length !== chapterIds.length) {
        return errorResponse(res, 'One or more chapters are invalid or do not belong to the selected subject', 400, 'INVALID_CHAPTERS');
      }

      // Create quiz with chapter associations (status: generated until user saves draft)
      const quiz = await prisma.quiz.create({
        data: {
          teacherId,
          classId,
          subjectId,
          title,
          status: 'generated' as QuizStatus,
          objective: objective || null,
          timeLimit: timeLimit || null,
          difficultyLevel: (difficultyLevel as DifficultyLevel) || 'medium',
          totalQuestions,
          totalMarks,
          dueDate: dueDate ? new Date(dueDate) : null,
          isOptional: isOptional || false,
          referenceFileUrl: referenceFileUrl || null,
          chapters: {
            create: chapterIds.map((chapterId: string) => ({
              chapterId,
            })),
          },
        },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true, code: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true, orderIndex: true } },
            },
          },
          _count: { select: { questions: true } },
        },
      });

      return successResponse(
        res,
        {
          id: quiz.id,
          title: quiz.title,
          class: quiz.class,
          subject: quiz.subject,
          chapters: quiz.chapters.map((c) => c.chapter),
          objective: quiz.objective,
          timeLimit: quiz.timeLimit,
          difficultyLevel: quiz.difficultyLevel,
          totalQuestions: quiz.totalQuestions,
          totalMarks: quiz.totalMarks,
          status: quiz.status,
          dueDate: quiz.dueDate,
          isOptional: quiz.isOptional,
          referenceFileUrl: quiz.referenceFileUrl,
          questionsCount: quiz._count.questions,
          createdAt: quiz.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/quizzes - Get all quizzes for the teacher
router.get(
  '/',
  authMiddleware,
  authorize('teacher'),
  validateQuery(quizQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Parse query params
      const { status, subjectId, classId, difficultyLevel, sortBy, sortOrder } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: {
        teacherId: string;
        status?: QuizStatus;
        subjectId?: string;
        classId?: string;
        difficultyLevel?: DifficultyLevel;
      } = { teacherId };

      if (status) {
        whereClause.status = status as QuizStatus;
      }
      if (subjectId) {
        whereClause.subjectId = subjectId as string;
      }
      if (classId) {
        whereClause.classId = classId as string;
      }
      if (difficultyLevel) {
        whereClause.difficultyLevel = difficultyLevel as DifficultyLevel;
      }

      // Build order by
      const orderBy: { [key: string]: 'asc' | 'desc' } = {};
      orderBy[(sortBy as string) || 'createdAt'] = (sortOrder as 'asc' | 'desc') || 'desc';

      // Get quizzes with pagination
      const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            status: true,
            difficultyLevel: true,
            totalQuestions: true,
            totalMarks: true,
            timeLimit: true,
            dueDate: true,
            isOptional: true,
            createdAt: true,
            updatedAt: true,
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
            _count: { select: { questions: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.quiz.count({ where: whereClause }),
      ]);

      return successResponse(res, {
        quizzes: quizzes.map((q) => ({
          ...q,
          questionsCount: q._count.questions,
          _count: undefined,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/quizzes/:id/share - Get or create share link for quiz
router.post(
  '/:id/share',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId },
        select: {
          id: true,
          shareToken: true,
          _count: { select: { questions: true } },
        },
      });

      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      if (quiz._count.questions === 0) {
        return errorResponse(res, 'Generate questions before sharing', 400, 'NO_QUESTIONS');
      }

      let shareToken = quiz.shareToken;
      if (!shareToken) {
        shareToken = crypto.randomBytes(16).toString('base64url');
        await prisma.quiz.update({
          where: { id: quizId },
          data: { shareToken },
        });
      }

      return successResponse(res, { shareToken });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/quizzes/:id - Get single quiz
router.get(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get quiz and verify ownership
      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true, code: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true, orderIndex: true } },
            },
            orderBy: { chapter: { orderIndex: 'asc' } },
          },
          _count: { select: { questions: true } },
        },
      });

      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      return successResponse(res, {
        id: quiz.id,
        title: quiz.title,
        class: quiz.class,
        subject: quiz.subject,
        chapters: quiz.chapters.map((c) => c.chapter),
        objective: quiz.objective,
        timeLimit: quiz.timeLimit,
        difficultyLevel: quiz.difficultyLevel,
        totalQuestions: quiz.totalQuestions,
        totalMarks: quiz.totalMarks,
        status: quiz.status,
        dueDate: quiz.dueDate,
        isOptional: quiz.isOptional,
        referenceFileUrl: quiz.referenceFileUrl,
        questionsCount: quiz._count.questions,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/quizzes/:id - Update quiz
router.put(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  validate(updateQuizSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const {
        classId,
        subjectId,
        chapterIds,
        title,
        objective,
        timeLimit,
        difficultyLevel,
        totalQuestions,
        totalMarks,
        dueDate,
        isOptional,
        referenceFileUrl,
      } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Build update data
      const updateData: {
        classId?: string;
        subjectId?: string;
        title?: string;
        objective?: string | null;
        timeLimit?: number | null;
        difficultyLevel?: DifficultyLevel;
        totalQuestions?: number;
        totalMarks?: number;
        dueDate?: Date | null;
        isOptional?: boolean;
        referenceFileUrl?: string | null;
      } = {};

      if (classId !== undefined) updateData.classId = classId;
      if (subjectId !== undefined) updateData.subjectId = subjectId;
      if (title !== undefined) updateData.title = title;
      if (objective !== undefined) updateData.objective = objective;
      if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
      if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel as DifficultyLevel;
      if (totalQuestions !== undefined) updateData.totalQuestions = totalQuestions;
      if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (isOptional !== undefined) updateData.isOptional = isOptional;
      if (referenceFileUrl !== undefined) updateData.referenceFileUrl = referenceFileUrl;

      // Update quiz in transaction (handle chapter reassignment)
      const updatedQuiz = await prisma.$transaction(async (tx) => {
        // Update quiz fields
        await tx.quiz.update({
          where: { id: quizId },
          data: updateData,
        });

        // If chapterIds provided, reassign chapters
        if (chapterIds !== undefined) {
          // Verify chapters belong to the subject
          const targetSubjectId = subjectId || existingQuiz.subjectId;
          const validChapters = await tx.chapter.findMany({
            where: { id: { in: chapterIds }, subjectId: targetSubjectId },
          });

          if (validChapters.length !== chapterIds.length) {
            throw new Error('Invalid chapters');
          }

          // Remove existing chapter associations
          await tx.quizChapter.deleteMany({ where: { quizId } });

          // Add new chapter associations
          await tx.quizChapter.createMany({
            data: chapterIds.map((chapterId: string) => ({
              quizId,
              chapterId,
            })),
          });
        }

        // Return updated quiz
        return tx.quiz.findUnique({
          where: { id: quizId },
          include: {
            class: { select: { id: true, name: true, grade: true, section: true } },
            subject: { select: { id: true, name: true, code: true } },
            chapters: {
              select: {
                chapter: { select: { id: true, name: true, orderIndex: true } },
              },
            },
            _count: { select: { questions: true } },
          },
        });
      });

      if (!updatedQuiz) {
        return notFoundResponse(res, 'Quiz not found after update');
      }

      return successResponse(res, {
        id: updatedQuiz.id,
        title: updatedQuiz.title,
        class: updatedQuiz.class,
        subject: updatedQuiz.subject,
        chapters: updatedQuiz.chapters.map((c) => c.chapter),
        objective: updatedQuiz.objective,
        timeLimit: updatedQuiz.timeLimit,
        difficultyLevel: updatedQuiz.difficultyLevel,
        totalQuestions: updatedQuiz.totalQuestions,
        totalMarks: updatedQuiz.totalMarks,
        status: updatedQuiz.status,
        dueDate: updatedQuiz.dueDate,
        isOptional: updatedQuiz.isOptional,
        referenceFileUrl: updatedQuiz.referenceFileUrl,
        questionsCount: updatedQuiz._count.questions,
        updatedAt: updatedQuiz.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid chapters') {
        return errorResponse(res, 'One or more chapters are invalid', 400, 'INVALID_CHAPTERS');
      }
      next(error);
    }
  }
);

// DELETE /api/quizzes/:id - Delete quiz
router.delete(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Delete quiz (cascade will delete QuizChapter, Questions, Options)
      await prisma.quiz.delete({ where: { id: quizId } });

      return successResponse(res, { message: 'Quiz deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/quizzes/:id/generate - Generate AI questions for quiz
router.post(
  '/:id/generate',
  authMiddleware,
  authorize('teacher'),
  validate(generateQuestionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const { numberOfQuestions, regenerate } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get quiz with subject, chapters, and objective
      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, teacherId },
        select: {
          id: true,
          objective: true,
          totalQuestions: true,
          totalMarks: true,
          difficultyLevel: true,
          referenceFileUrl: true,
          subject: { select: { name: true } },
          chapters: {
            select: {
              chapter: { select: { name: true } },
            },
          },
          _count: { select: { questions: true } },
        },
      });

      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Check if questions already exist and regenerate is false
      const existingQuestionsCount = quiz._count.questions;
      if (existingQuestionsCount > 0 && !regenerate) {
        return errorResponse(res, 'Questions already exist. Set regenerate to true to regenerate.', 400, 'QUESTIONS_EXIST');
      }

      // Extract all needed data BEFORE AI call to avoid holding DB connections
      const subjectName = quiz.subject.name;
      const chapterNames = quiz.chapters.map((c) => c.chapter.name);
      const questionsToGenerate = numberOfQuestions || quiz.totalQuestions;
      const difficultyLevel = quiz.difficultyLevel as 'easy' | 'medium' | 'hard';
      const totalMarks = quiz.totalMarks;
      const totalQuestions = quiz.totalQuestions;
      const quizObjective = quiz.objective || undefined;

      // Generate questions using Gemini AI (this is the long operation)
      let generatedQuestions;
      try {
        generatedQuestions = await generateQuizQuestions(
          subjectName,
          chapterNames,
          questionsToGenerate,
          difficultyLevel,
          quizObjective,
          quiz.referenceFileUrl ?? undefined
        );
      } catch (aiError) {
        console.error('Gemini AI generation error:', aiError);
        return errorResponse(
          res,
          'Failed to generate questions. Please check Gemini API configuration.',
          500,
          'AI_GENERATION_FAILED'
        );
      }

      // Now save to database with fresh connections
      // If regenerating, delete existing questions first
      if (regenerate && existingQuestionsCount > 0) {
        await prisma.question.deleteMany({ where: { quizId } });
      }

      // Create questions with options
      const marksPerQuestion = Math.ceil(totalMarks / totalQuestions);

      // Use Promise.all for parallel creation (faster and more reliable)
      await Promise.all(
        generatedQuestions.map((q: { questionText: string; options: Array<{ label: string; text: string; isCorrect: boolean }> }, i: number) =>
          prisma.question.create({
            data: {
              quizId,
              questionText: q.questionText,
              questionType: 'mcq',
              marks: marksPerQuestion,
              orderIndex: i + 1,
              options: {
                create: q.options.map((opt) => ({
                  optionLabel: opt.label,
                  optionText: opt.text,
                  isCorrect: opt.isCorrect,
                })),
              },
            },
          })
        )
      );

      // Fetch updated quiz with questions
      const updatedQuiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            select: {
              id: true,
              questionText: true,
              questionType: true,
              marks: true,
              orderIndex: true,
              options: {
                select: {
                  id: true,
                  optionLabel: true,
                  optionText: true,
                  isCorrect: true,
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      return successResponse(res, {
        quizId: updatedQuiz?.id,
        questionsGenerated: generatedQuestions.length,
        questions: updatedQuiz?.questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/quizzes/:id/status - Update quiz status
router.patch(
  '/:id/status',
  authMiddleware,
  authorize('teacher'),
  validate(updateQuizStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const { status, sections, dueDate } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Validate status transition (generated -> draft when user saves)
      const validTransitions: { [key: string]: string[] } = {
        generated: ['draft', 'saved', 'published'],
        draft: ['saved', 'published'],
        saved: ['draft', 'published'],
        published: ['draft', 'saved'],
      };

      if (!validTransitions[existingQuiz.status].includes(status)) {
        return errorResponse(
          res,
          `Cannot change status from ${existingQuiz.status} to ${status}`,
          400,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // Build update data
      const updateData: {
        status: QuizStatus;
        classId?: string;
        dueDate?: Date | null;
      } = { status };

      // If publishing and sections are provided, find the class ID
      if (status === 'published' && sections && sections.length > 0) {
        // sections are in format ["10-A", "10-B"] (grade-section)
        // Parse the first section to get grade and section
        const firstSection = sections[0] as string;
        const [gradeStr, sectionStr] = firstSection.split('-');
        const grade = parseInt(gradeStr);

        if (!isNaN(grade) && sectionStr) {
          // Get teacher's school
          const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { schoolId: true },
          });

          if (teacher) {
            // Find the class matching grade, section, and school
            const targetClass = await prisma.class.findFirst({
              where: {
                schoolId: teacher.schoolId,
                grade,
                section: sectionStr,
              },
            });

            if (targetClass) {
              updateData.classId = targetClass.id;
            }
          }
        }
      }

      // Update due date if provided
      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      }

      // Update quiz
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: updateData,
        select: {
          id: true,
          title: true,
          status: true,
          classId: true,
          dueDate: true,
          class: { select: { id: true, name: true, grade: true, section: true } },
          updatedAt: true,
        },
      });

      return successResponse(res, updatedQuiz);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/quizzes/:id/questions - Get all questions for a quiz
router.get(
  '/:id/questions',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Get questions with options
      const questions = await prisma.question.findMany({
        where: { quizId },
        select: {
          id: true,
          questionText: true,
          questionType: true,
          marks: true,
          orderIndex: true,
          createdAt: true,
          options: {
            select: {
              id: true,
              optionLabel: true,
              optionText: true,
              isCorrect: true,
            },
            orderBy: { optionLabel: 'asc' },
          },
        },
        orderBy: { orderIndex: 'asc' },
      });

      return successResponse(res, {
        quizId,
        totalQuestions: questions.length,
        questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/quizzes/:id/questions - Add a question to quiz
router.post(
  '/:id/questions',
  authMiddleware,
  authorize('teacher'),
  validate(createQuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const { questionText, questionType, marks, options } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Get the next order index
      const lastQuestion = await prisma.question.findFirst({
        where: { quizId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      const orderIndex = (lastQuestion?.orderIndex || 0) + 1;

      // Create question with options
      const question = await prisma.question.create({
        data: {
          quizId,
          questionText,
          questionType: questionType || 'mcq',
          marks: marks || 1,
          orderIndex,
          options: options
            ? {
                create: options.map((opt: { label: string; text: string; isCorrect: boolean }) => ({
                  optionLabel: opt.label,
                  optionText: opt.text,
                  isCorrect: opt.isCorrect,
                })),
              }
            : undefined,
        },
        include: {
          options: {
            select: {
              id: true,
              optionLabel: true,
              optionText: true,
              isCorrect: true,
            },
            orderBy: { optionLabel: 'asc' },
          },
        },
      });

      return successResponse(
        res,
        {
          id: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          marks: question.marks,
          orderIndex: question.orderIndex,
          options: question.options,
          createdAt: question.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/quizzes/:id/questions/:questionId - Update a question
router.put(
  '/:id/questions/:questionId',
  authMiddleware,
  authorize('teacher'),
  validate(updateQuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const questionId = req.params.questionId as string;
      const { questionText, questionType, marks, options } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Verify question belongs to quiz
      const existingQuestion = await prisma.question.findFirst({
        where: { id: questionId, quizId },
      });
      if (!existingQuestion) {
        return notFoundResponse(res, 'Question not found');
      }

      // Update question in transaction
      const updatedQuestion = await prisma.$transaction(async (tx) => {
        // Update question fields
        const updateData: { questionText?: string; questionType?: 'mcq' | 'short_answer' | 'long_answer' | 'case_study'; marks?: number } = {};
        if (questionText !== undefined) updateData.questionText = questionText;
        if (questionType !== undefined) updateData.questionType = questionType;
        if (marks !== undefined) updateData.marks = marks;

        await tx.question.update({
          where: { id: questionId },
          data: updateData,
        });

        // If options are provided, replace them
        if (options !== undefined) {
          // Delete existing options
          await tx.questionOption.deleteMany({ where: { questionId } });

          // Create new options
          if (options.length > 0) {
            await tx.questionOption.createMany({
              data: options.map((opt: { label: string; text: string; isCorrect: boolean }) => ({
                questionId,
                optionLabel: opt.label,
                optionText: opt.text,
                isCorrect: opt.isCorrect,
              })),
            });
          }
        }

        // Return updated question
        return tx.question.findUnique({
          where: { id: questionId },
          include: {
            options: {
              select: {
                id: true,
                optionLabel: true,
                optionText: true,
                isCorrect: true,
              },
              orderBy: { optionLabel: 'asc' },
            },
          },
        });
      });

      if (!updatedQuestion) {
        return notFoundResponse(res, 'Question not found after update');
      }

      return successResponse(res, {
        id: updatedQuestion.id,
        questionText: updatedQuestion.questionText,
        questionType: updatedQuestion.questionType,
        marks: updatedQuestion.marks,
        orderIndex: updatedQuestion.orderIndex,
        options: updatedQuestion.options,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/quizzes/:id/questions/:questionId - Delete a question
router.delete(
  '/:id/questions/:questionId',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const questionId = req.params.questionId as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const existingQuiz = await verifyQuizOwnership(quizId, teacherId);
      if (!existingQuiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Verify question belongs to quiz
      const existingQuestion = await prisma.question.findFirst({
        where: { id: questionId, quizId },
      });
      if (!existingQuestion) {
        return notFoundResponse(res, 'Question not found');
      }

      // Delete question (cascade will delete options)
      await prisma.question.delete({ where: { id: questionId } });

      return successResponse(res, { message: 'Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
