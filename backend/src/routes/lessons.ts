import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma, { withRetry } from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { generateTopic } from '../lib/gemini';
import {
  createLessonSchema,
  updateLessonSchema,
  lessonQuerySchema,
  updateStatusSchema,
  generateContentSchema,
} from '../schemas/lesson';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';
import { LessonStatus } from '@prisma/client';
import { createGenerationJob, serializeGenerationJob } from '../lib/generation-jobs';

const router = Router();

// Helper function to convert arrays to strings if needed (for period data)
const convertToString = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : String(item))).join('\n');
  }
  return String(value);
};

// Helper to get teacher ID from user
const getTeacherId = async (userId: string): Promise<string | null> => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true },
  });
  return teacher?.id || null;
};

// Helper to verify lesson ownership
const verifyLessonOwnership = async (lessonId: string, teacherId: string) => {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, teacherId },
  });
  return lesson;
};

// POST /api/lessons - Create a new lesson
router.post(
  '/',
  authMiddleware,
  authorize('teacher'),
  validate(createLessonSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { classId, subjectId, chapterIds, title, duration, objective, startDate, endDate, topic, numberOfPeriods, periods } = req.body;

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

      // Create lesson with chapter associations and periods
      // Use interactive transaction with timeout for Neon DB (30 seconds)
      // Wrap in retry logic to handle connection issues
      const lesson = await withRetry(async () => {
        return await prisma.$transaction(async (tx) => {
        const newLesson = await tx.lesson.create({
          data: {
            teacherId,
            classId,
            subjectId,
            title,
            status: 'generated',
            duration: duration || null,
            objective: objective || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            topic: topic || null,
            numberOfPeriods: numberOfPeriods || null,
            chapters: {
              create: chapterIds.map((chapterId: string) => ({
                chapterId,
              })),
            },
          },
        });

        // Create periods if provided
        if (periods && periods.length > 0) {
          await tx.lessonPeriod.createMany({
            data: periods.map((period: any) => ({
              lessonId: newLesson.id,
              periodNo: period.periodNo,
              concept: convertToString(period.concept),
              learningOutcomes: convertToString(period.learningOutcomes),
              teacherLearningProcess: convertToString(period.teacherLearningProcess),
              assessment: convertToString(period.assessment),
              resources: convertToString(period.resources),
              centurySkillsValueEducation: convertToString(period.centurySkillsValueEducation),
              realLifeApplication: convertToString(period.realLifeApplication),
              reflection: convertToString(period.reflection),
            })),
          });
        }

        // Return lesson with all relations
        return tx.lesson.findUnique({
          where: { id: newLesson.id },
          include: {
            class: { select: { id: true, name: true, grade: true, section: true } },
            subject: { select: { id: true, name: true, code: true } },
            chapters: {
              select: {
                chapter: { select: { id: true, name: true, orderIndex: true } },
              },
            },
            periods: {
              orderBy: { periodNo: 'asc' },
            },
          },
        });
        }, {
          maxWait: 10000, // Maximum time to wait for a transaction slot (10 seconds)
          timeout: 30000, // Maximum time the transaction can run (30 seconds)
        });
      }, 2, 1000); // Retry up to 2 times with 1 second delay

      if (!lesson) {
        return errorResponse(res, 'Failed to create lesson', 500, 'CREATION_FAILED');
      }

      return successResponse(
        res,
        {
          id: lesson.id,
          title: lesson.title,
          class: lesson.class,
          subject: lesson.subject,
          chapters: lesson.chapters.map((c) => c.chapter),
          duration: lesson.duration,
          objective: lesson.objective,
          status: lesson.status,
          content: lesson.content,
          referenceFileUrl: lesson.referenceFileUrl,
          startDate: lesson.startDate,
          endDate: lesson.endDate,
          topic: lesson.topic,
          numberOfPeriods: lesson.numberOfPeriods,
          periods: lesson.periods,
          createdAt: lesson.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/lessons - Get all lessons for the teacher
router.get(
  '/',
  authMiddleware,
  authorize('teacher'),
  validateQuery(lessonQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Parse query params
      const { status, subjectId, classId, sortBy, sortOrder } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: {
        teacherId: string;
        status?: LessonStatus;
        subjectId?: string;
        classId?: string;
      } = { teacherId };

      if (status) {
        whereClause.status = status as LessonStatus;
      }
      if (subjectId) {
        whereClause.subjectId = subjectId as string;
      }
      if (classId) {
        whereClause.classId = classId as string;
      }

      // Build order by
      const orderBy: { [key: string]: 'asc' | 'desc' } = {};
      orderBy[(sortBy as string) || 'createdAt'] = (sortOrder as 'asc' | 'desc') || 'desc';

      // Get lessons with pagination
      const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            status: true,
            duration: true,
            createdAt: true,
            updatedAt: true,
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.lesson.count({ where: whereClause }),
      ]);

      return successResponse(res, {
        lessons,
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

// POST /api/lessons/:id/share - Get or create share link for lesson plan
router.post(
  '/:id/share',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;

      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, teacherId },
        select: { id: true, shareToken: true },
      });

      if (!lesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      let shareToken = lesson.shareToken;
      if (!shareToken) {
        shareToken = crypto.randomBytes(16).toString('base64url');
        await prisma.lesson.update({
          where: { id: lessonId },
          data: { shareToken },
        });
      }

      return successResponse(res, { shareToken });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/lessons/:id - Get single lesson
router.get(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get lesson and verify ownership
      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, teacherId },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true, code: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true, orderIndex: true } },
            },
            orderBy: { chapter: { orderIndex: 'asc' } },
          },
          periods: {
            orderBy: { periodNo: 'asc' },
          },
        },
      });

      if (!lesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      return successResponse(res, {
        id: lesson.id,
        title: lesson.title,
        class: lesson.class,
        subject: lesson.subject,
        chapters: lesson.chapters.map((c) => c.chapter),
        duration: lesson.duration,
        objective: lesson.objective,
        status: lesson.status,
        content: lesson.content,
        referenceFileUrl: lesson.referenceFileUrl,
        startDate: lesson.startDate,
        endDate: lesson.endDate,
        topic: lesson.topic,
        numberOfPeriods: lesson.numberOfPeriods,
        periods: lesson.periods,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/lessons/:id - Update lesson
router.put(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  validate(updateLessonSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;
      const { classId, subjectId, chapterIds, title, duration, objective, content, referenceFileUrl, startDate, endDate, topic, numberOfPeriods, periods } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify lesson ownership
      const existingLesson = await verifyLessonOwnership(lessonId, teacherId);
      if (!existingLesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      // Build update data
      const updateData: {
        classId?: string;
        subjectId?: string;
        title?: string;
        duration?: number | null;
        objective?: string | null;
        content?: string | null;
        referenceFileUrl?: string | null;
        startDate?: Date | null;
        endDate?: Date | null;
        topic?: string | null;
        numberOfPeriods?: number | null;
      } = {};

      if (classId !== undefined) updateData.classId = classId;
      if (subjectId !== undefined) updateData.subjectId = subjectId;
      if (title !== undefined) updateData.title = title;
      if (duration !== undefined) updateData.duration = duration;
      if (objective !== undefined) updateData.objective = objective;
      if (content !== undefined) updateData.content = content;
      if (referenceFileUrl !== undefined) updateData.referenceFileUrl = referenceFileUrl;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (topic !== undefined) updateData.topic = topic;
      if (numberOfPeriods !== undefined) updateData.numberOfPeriods = numberOfPeriods;

      // Update lesson in transaction (handle chapter reassignment and periods)
      const updatedLesson = await prisma.$transaction(async (tx) => {
        // Update lesson fields
        await tx.lesson.update({
          where: { id: lessonId },
          data: updateData,
        });

        // If chapterIds provided, reassign chapters
        if (chapterIds !== undefined) {
          // Verify chapters belong to the subject
          const targetSubjectId = subjectId || existingLesson.subjectId;
          const validChapters = await tx.chapter.findMany({
            where: { id: { in: chapterIds }, subjectId: targetSubjectId },
          });

          if (validChapters.length !== chapterIds.length) {
            throw new Error('Invalid chapters');
          }

          // Remove existing chapter associations
          await tx.lessonChapter.deleteMany({ where: { lessonId } });

          // Add new chapter associations
          await tx.lessonChapter.createMany({
            data: chapterIds.map((chapterId: string) => ({
              lessonId,
              chapterId,
            })),
          });
        }

        // If periods provided, update periods
        if (periods !== undefined) {
          // Delete existing periods
          await tx.lessonPeriod.deleteMany({ where: { lessonId } });

          // Create new periods
          if (periods.length > 0) {
            await tx.lessonPeriod.createMany({
              data: periods.map((period: any) => ({
                lessonId,
                periodNo: period.periodNo,
                concept: convertToString(period.concept),
                learningOutcomes: convertToString(period.learningOutcomes),
                teacherLearningProcess: convertToString(period.teacherLearningProcess),
                assessment: convertToString(period.assessment),
                resources: convertToString(period.resources),
                centurySkillsValueEducation: convertToString(period.centurySkillsValueEducation),
                realLifeApplication: convertToString(period.realLifeApplication),
                reflection: convertToString(period.reflection),
              })),
            });
          }
        }

        // Return updated lesson
        return tx.lesson.findUnique({
          where: { id: lessonId },
          include: {
            class: { select: { id: true, name: true, grade: true, section: true } },
            subject: { select: { id: true, name: true, code: true } },
            chapters: {
              select: {
                chapter: { select: { id: true, name: true, orderIndex: true } },
              },
            },
            periods: {
              orderBy: { periodNo: 'asc' },
            },
          },
        });
      });

      if (!updatedLesson) {
        return notFoundResponse(res, 'Lesson not found after update');
      }

      return successResponse(res, {
        id: updatedLesson.id,
        title: updatedLesson.title,
        class: updatedLesson.class,
        subject: updatedLesson.subject,
        chapters: updatedLesson.chapters.map((c) => c.chapter),
        duration: updatedLesson.duration,
        objective: updatedLesson.objective,
        status: updatedLesson.status,
        content: updatedLesson.content,
        referenceFileUrl: updatedLesson.referenceFileUrl,
        startDate: updatedLesson.startDate,
        endDate: updatedLesson.endDate,
        topic: updatedLesson.topic,
        numberOfPeriods: updatedLesson.numberOfPeriods,
        periods: updatedLesson.periods,
        updatedAt: updatedLesson.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid chapters') {
        return errorResponse(res, 'One or more chapters are invalid', 400, 'INVALID_CHAPTERS');
      }
      next(error);
    }
  }
);

// DELETE /api/lessons/:id - Delete lesson
router.delete(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify lesson ownership
      const existingLesson = await verifyLessonOwnership(lessonId, teacherId);
      if (!existingLesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      // Delete lesson (cascade will delete LessonChapter entries)
      await prisma.lesson.delete({ where: { id: lessonId } });

      return successResponse(res, { message: 'Lesson deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/lessons/:id/generate - Generate AI content for lesson
router.post(
  '/:id/generate',
  authMiddleware,
  authorize('teacher'),
  validate(generateContentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;
      const { regenerate } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get lesson with subject, chapters, class, and periods
      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, teacherId },
        include: {
          subject: { select: { name: true } },
          class: { select: { grade: true } },
          chapters: {
            select: {
              chapter: { select: { name: true } },
            },
          },
          periods: {
            orderBy: { periodNo: 'asc' },
          },
        },
      });

      if (!lesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      // Check if periods already have content and regenerate is false
      // Only check if periods exist and have content (non-empty strings)
      let hasPeriodContent = false;
      if (lesson.periods.length > 0) {
        hasPeriodContent = lesson.periods.some(
          (p) => 
            (p.concept && p.concept.trim().length > 0) || 
            (p.learningOutcomes && p.learningOutcomes.trim().length > 0) || 
            (p.teacherLearningProcess && p.teacherLearningProcess.trim().length > 0)
        );
        if (hasPeriodContent && !regenerate) {
          return errorResponse(
            res,
            'Content already exists. Set regenerate to true to regenerate.',
            400,
            'CONTENT_EXISTS'
          );
        }
      }

      const topic = lesson.topic || lesson.title;
      const numberOfPeriods = lesson.numberOfPeriods || lesson.periods.length || 1;
      if (!topic || numberOfPeriods < 1) {
        return errorResponse(
          res,
          'Topic and number of periods are required to generate lesson plan content.',
          400,
          'MISSING_REQUIRED_FIELDS'
        );
      }

      try {
        const job = await createGenerationJob({
          teacherId,
          artifactType: 'lesson',
          artifactId: lessonId,
          payload: { regenerate: !!regenerate },
        });

        return successResponse(
          res,
          {
            lessonId,
            job: serializeGenerationJob(job as any),
          },
          202
        );
      } catch (aiError) {
        if (aiError instanceof Error && aiError.message.includes('already in progress')) {
          return errorResponse(res, aiError.message, 409, 'GENERATION_ALREADY_IN_PROGRESS');
        }
        throw aiError;
      }
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/lessons/:id/status - Update lesson status
router.patch(
  '/:id/status',
  authMiddleware,
  authorize('teacher'),
  validate(updateStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;
      const { status } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify lesson ownership
      const existingLesson = await verifyLessonOwnership(lessonId, teacherId);
      if (!existingLesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      // Validate status transition (generated -> draft/saved when user saves)
      const validTransitions: { [key: string]: string[] } = {
        generated: ['draft', 'saved', 'published'],
        draft: ['saved', 'published'],
        saved: ['draft', 'published'],
        published: ['draft', 'saved'],
      };

      if (!validTransitions[existingLesson.status].includes(status)) {
        return errorResponse(
          res,
          `Cannot change status from ${existingLesson.status} to ${status}`,
          400,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // Update status
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: { status },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      });

      return successResponse(res, updatedLesson);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/lessons/generate-topic - Generate topic using LLM
router.post(
  '/generate-topic',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subject, chapters, grade } = req.body;

      if (!subject || !chapters || !Array.isArray(chapters) || chapters.length === 0 || !grade) {
        return errorResponse(res, 'Subject, chapters array, and grade are required', 400, 'MISSING_FIELDS');
      }

      const topic = await generateTopic(subject, chapters, grade);

      return successResponse(res, { topic });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
