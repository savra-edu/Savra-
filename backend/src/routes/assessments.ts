import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { generateAssessment } from '../lib/gemini';
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentQuerySchema,
  updateAssessmentStatusSchema,
  generatePaperSchema,
} from '../schemas/assessment';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';
import { QuizStatus, DifficultyLevel, QuestionType } from '@prisma/client';

const router = Router();

// Helper to get teacher ID from user
const getTeacherId = async (userId: string): Promise<string | null> => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true },
  });
  return teacher?.id || null;
};

// Helper to verify assessment ownership
const verifyAssessmentOwnership = async (assessmentId: string, teacherId: string) => {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, teacherId },
  });
  return assessment;
};

// POST /api/assessments - Create a new assessment
router.post(
  '/',
  authMiddleware,
  authorize('teacher'),
  validate(createAssessmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const {
        classId,
        subjectId,
        chapterIds,
        title,
        objective,
        totalMarks,
        difficultyLevel,
        questionTypes,
        referenceBooks,
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

      // Create assessment with chapter associations and question types
      const assessment = await prisma.assessment.create({
        data: {
          teacherId,
          classId,
          subjectId,
          title,
          objective: objective || null,
          totalMarks,
          difficultyLevel: (difficultyLevel as DifficultyLevel) || 'medium',
          referenceBooks: referenceBooks || [],
          referenceFileUrl: referenceFileUrl || null,
          chapters: {
            create: chapterIds.map((chapterId: string) => ({
              chapterId,
            })),
          },
          questionTypes: {
            create: questionTypes.map((qt: { questionType: string; numberOfQuestions: number; marksPerQuestion: number }) => ({
              questionType: qt.questionType as QuestionType,
              numberOfQuestions: qt.numberOfQuestions,
              marksPerQuestion: qt.marksPerQuestion,
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
          questionTypes: {
            select: {
              id: true,
              questionType: true,
              numberOfQuestions: true,
              marksPerQuestion: true,
            },
          },
        },
      });

      return successResponse(
        res,
        {
          id: assessment.id,
          title: assessment.title,
          class: assessment.class,
          subject: assessment.subject,
          chapters: assessment.chapters.map((c) => c.chapter),
          objective: assessment.objective,
          totalMarks: assessment.totalMarks,
          difficultyLevel: assessment.difficultyLevel,
          status: assessment.status,
          questionTypes: assessment.questionTypes,
          referenceBooks: assessment.referenceBooks,
          referenceFileUrl: assessment.referenceFileUrl,
          questionPaper: assessment.questionPaper,
          createdAt: assessment.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/assessments - Get all assessments for the teacher
router.get(
  '/',
  authMiddleware,
  authorize('teacher'),
  validateQuery(assessmentQuerySchema),
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

      // Get assessments with pagination
      const [assessments, total] = await Promise.all([
        prisma.assessment.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            status: true,
            difficultyLevel: true,
            totalMarks: true,
            createdAt: true,
            updatedAt: true,
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
            questionTypes: {
              select: {
                questionType: true,
                numberOfQuestions: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.assessment.count({ where: whereClause }),
      ]);

      return successResponse(res, {
        assessments: assessments.map((a) => ({
          ...a,
          totalQuestions: a.questionTypes.reduce((sum, qt) => sum + qt.numberOfQuestions, 0),
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

// GET /api/assessments/:id - Get single assessment
router.get(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const assessmentId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get assessment and verify ownership
      const assessment = await prisma.assessment.findFirst({
        where: { id: assessmentId, teacherId },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true, code: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true, orderIndex: true } },
            },
            orderBy: { chapter: { orderIndex: 'asc' } },
          },
          questionTypes: {
            select: {
              id: true,
              questionType: true,
              numberOfQuestions: true,
              marksPerQuestion: true,
            },
          },
        },
      });

      if (!assessment) {
        return notFoundResponse(res, 'Assessment not found');
      }

      return successResponse(res, {
        id: assessment.id,
        title: assessment.title,
        class: assessment.class,
        subject: assessment.subject,
        chapters: assessment.chapters.map((c) => c.chapter),
        objective: assessment.objective,
        totalMarks: assessment.totalMarks,
        difficultyLevel: assessment.difficultyLevel,
        status: assessment.status,
        questionTypes: assessment.questionTypes,
        referenceBooks: assessment.referenceBooks,
        referenceFileUrl: assessment.referenceFileUrl,
        questionPaper: assessment.questionPaper,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/assessments/:id - Update assessment
router.put(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  validate(updateAssessmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const assessmentId = req.params.id as string;
      const {
        classId,
        subjectId,
        chapterIds,
        title,
        objective,
        totalMarks,
        difficultyLevel,
        questionTypes,
        referenceBooks,
        referenceFileUrl,
      } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify assessment ownership
      const existingAssessment = await verifyAssessmentOwnership(assessmentId, teacherId);
      if (!existingAssessment) {
        return notFoundResponse(res, 'Assessment not found');
      }

      // Build update data
      const updateData: {
        classId?: string;
        subjectId?: string;
        title?: string;
        objective?: string | null;
        totalMarks?: number;
        difficultyLevel?: DifficultyLevel;
        referenceBooks?: string[];
        referenceFileUrl?: string | null;
      } = {};

      if (classId !== undefined) updateData.classId = classId;
      if (subjectId !== undefined) updateData.subjectId = subjectId;
      if (title !== undefined) updateData.title = title;
      if (objective !== undefined) updateData.objective = objective;
      if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
      if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel as DifficultyLevel;
      if (referenceBooks !== undefined) updateData.referenceBooks = referenceBooks;
      if (referenceFileUrl !== undefined) updateData.referenceFileUrl = referenceFileUrl;

      // Update assessment in transaction
      const updatedAssessment = await prisma.$transaction(async (tx) => {
        // Update assessment fields
        await tx.assessment.update({
          where: { id: assessmentId },
          data: updateData,
        });

        // If chapterIds provided, reassign chapters
        if (chapterIds !== undefined) {
          const targetSubjectId = subjectId || existingAssessment.subjectId;
          const validChapters = await tx.chapter.findMany({
            where: { id: { in: chapterIds }, subjectId: targetSubjectId },
          });

          if (validChapters.length !== chapterIds.length) {
            throw new Error('Invalid chapters');
          }

          await tx.assessmentChapter.deleteMany({ where: { assessmentId } });
          await tx.assessmentChapter.createMany({
            data: chapterIds.map((chapterId: string) => ({
              assessmentId,
              chapterId,
            })),
          });
        }

        // If questionTypes provided, reassign
        if (questionTypes !== undefined) {
          await tx.assessmentQuestionType.deleteMany({ where: { assessmentId } });
          await tx.assessmentQuestionType.createMany({
            data: questionTypes.map((qt: { questionType: string; numberOfQuestions: number; marksPerQuestion: number }) => ({
              assessmentId,
              questionType: qt.questionType as QuestionType,
              numberOfQuestions: qt.numberOfQuestions,
              marksPerQuestion: qt.marksPerQuestion,
            })),
          });
        }

        // Return updated assessment
        return tx.assessment.findUnique({
          where: { id: assessmentId },
          include: {
            class: { select: { id: true, name: true, grade: true, section: true } },
            subject: { select: { id: true, name: true, code: true } },
            chapters: {
              select: {
                chapter: { select: { id: true, name: true, orderIndex: true } },
              },
            },
            questionTypes: {
              select: {
                id: true,
                questionType: true,
                numberOfQuestions: true,
                marksPerQuestion: true,
              },
            },
          },
        });
      });

      if (!updatedAssessment) {
        return notFoundResponse(res, 'Assessment not found after update');
      }

      return successResponse(res, {
        id: updatedAssessment.id,
        title: updatedAssessment.title,
        class: updatedAssessment.class,
        subject: updatedAssessment.subject,
        chapters: updatedAssessment.chapters.map((c) => c.chapter),
        objective: updatedAssessment.objective,
        totalMarks: updatedAssessment.totalMarks,
        difficultyLevel: updatedAssessment.difficultyLevel,
        status: updatedAssessment.status,
        questionTypes: updatedAssessment.questionTypes,
        referenceBooks: updatedAssessment.referenceBooks,
        referenceFileUrl: updatedAssessment.referenceFileUrl,
        questionPaper: updatedAssessment.questionPaper,
        updatedAt: updatedAssessment.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid chapters') {
        return errorResponse(res, 'One or more chapters are invalid', 400, 'INVALID_CHAPTERS');
      }
      next(error);
    }
  }
);

// DELETE /api/assessments/:id - Delete assessment
router.delete(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const assessmentId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify assessment ownership
      const existingAssessment = await verifyAssessmentOwnership(assessmentId, teacherId);
      if (!existingAssessment) {
        return notFoundResponse(res, 'Assessment not found');
      }

      // Delete assessment (cascade will delete chapters and questionTypes)
      await prisma.assessment.delete({ where: { id: assessmentId } });

      return successResponse(res, { message: 'Assessment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/assessments/:id/generate - Generate AI question paper
router.post(
  '/:id/generate',
  authMiddleware,
  authorize('teacher'),
  validate(generatePaperSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const assessmentId = req.params.id as string;
      const { regenerate } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get assessment with subject, chapters, class, and questionTypes
      const assessment = await prisma.assessment.findFirst({
        where: { id: assessmentId, teacherId },
        include: {
          subject: { select: { name: true } },
          class: { select: { grade: true } },
          chapters: {
            select: {
              chapter: { select: { name: true } },
            },
          },
          questionTypes: {
            select: {
              questionType: true,
              numberOfQuestions: true,
              marksPerQuestion: true,
            },
          },
        },
      });

      if (!assessment) {
        return notFoundResponse(res, 'Assessment not found');
      }

      // Check if paper already exists and regenerate is false
      if (assessment.questionPaper && !regenerate) {
        return errorResponse(res, 'Question paper already exists. Set regenerate to true to regenerate.', 400, 'PAPER_EXISTS');
      }

      // Extract all needed data BEFORE AI call to avoid holding DB connections
      const subjectName = assessment.subject.name;
      const grade = assessment.class.grade;
      const chapterNames = assessment.chapters.map((c) => c.chapter.name);
      const questionTypesForAI = assessment.questionTypes.map((qt) => ({
        type: qt.questionType,
        count: qt.numberOfQuestions,
        marks: qt.marksPerQuestion,
      }));
      const totalMarks = assessment.totalMarks;
      const difficultyLevel = assessment.difficultyLevel;
      const assessmentObjective = assessment.objective || undefined;

      // Generate question paper using Gemini AI (this is the long operation)
      let generatedPaper;
      try {
        generatedPaper = await generateAssessment(
          subjectName,
          chapterNames,
          questionTypesForAI,
          totalMarks,
          difficultyLevel,
          grade,
          assessmentObjective
        );
      } catch (aiError) {
        console.error('Gemini AI generation error:', aiError);
        return errorResponse(
          res,
          'Failed to generate question paper. Please check Gemini API configuration.',
          500,
          'AI_GENERATION_FAILED'
        );
      }

      // Update assessment with generated paper (fresh DB connection)
      const updatedAssessment = await prisma.assessment.update({
        where: { id: assessmentId },
        data: { questionPaper: generatedPaper },
        select: {
          id: true,
          title: true,
          questionPaper: true,
          updatedAt: true,
        },
      });

      return successResponse(res, {
        id: updatedAssessment.id,
        title: updatedAssessment.title,
        questionPaper: updatedAssessment.questionPaper,
        generatedAt: updatedAssessment.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/assessments/:id/status - Update assessment status
router.patch(
  '/:id/status',
  authMiddleware,
  authorize('teacher'),
  validate(updateAssessmentStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const assessmentId = req.params.id as string;
      const { status } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify assessment ownership
      const existingAssessment = await verifyAssessmentOwnership(assessmentId, teacherId);
      if (!existingAssessment) {
        return notFoundResponse(res, 'Assessment not found');
      }

      // Validate status transition
      const validTransitions: { [key: string]: string[] } = {
        draft: ['saved', 'published'],
        saved: ['draft', 'published'],
        published: ['draft', 'saved'],
      };

      if (!validTransitions[existingAssessment.status].includes(status)) {
        return errorResponse(
          res,
          `Cannot change status from ${existingAssessment.status} to ${status}`,
          400,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // Update status
      const updatedAssessment = await prisma.assessment.update({
        where: { id: assessmentId },
        data: { status },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      });

      return successResponse(res, updatedAssessment);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
