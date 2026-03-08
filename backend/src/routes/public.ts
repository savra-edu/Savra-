import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { successResponse, notFoundResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/public/assessments/:shareToken
 * Public, unauthenticated endpoint to fetch a shared question paper by its share token.
 */
router.get(
  '/assessments/:shareToken',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shareToken = req.params.shareToken as string;

      if (!shareToken || shareToken.trim() === '') {
        return notFoundResponse(res, 'Share link is invalid');
      }

      const assessment = await prisma.assessment.findFirst({
        where: { shareToken: shareToken.trim() },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!assessment || !assessment.questionPaper) {
        return notFoundResponse(res, 'Question paper not found or no longer available');
      }

      return successResponse(res, {
        id: assessment.id,
        title: assessment.title,
        subject: assessment.subject,
        class: assessment.class,
        chapters: assessment.chapters.map((c) => c.chapter),
        totalMarks: assessment.totalMarks,
        questionPaper: assessment.questionPaper,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/public/quizzes/:shareToken
 * Public, unauthenticated endpoint to fetch a shared quiz by its share token.
 * Returns questions and options WITHOUT correct answers (isCorrect) for security.
 */
router.get(
  '/quizzes/:shareToken',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shareToken = req.params.shareToken as string;

      if (!shareToken || shareToken.trim() === '') {
        return notFoundResponse(res, 'Share link is invalid');
      }

      const quiz = await prisma.quiz.findFirst({
        where: { shareToken: shareToken.trim() },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true } },
            },
          },
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
                },
                orderBy: { optionLabel: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!quiz || !quiz.questions?.length) {
        return notFoundResponse(res, 'Quiz not found or no longer available');
      }

      return successResponse(res, {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        class: quiz.class,
        chapters: quiz.chapters.map((c) => c.chapter),
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.totalQuestions,
        totalMarks: quiz.totalMarks,
        difficultyLevel: quiz.difficultyLevel,
        questions: quiz.questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/public/lessons/:shareToken
 * Public, unauthenticated endpoint to fetch a shared lesson plan by its share token.
 */
router.get(
  '/lessons/:shareToken',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shareToken = req.params.shareToken as string;

      if (!shareToken || shareToken.trim() === '') {
        return notFoundResponse(res, 'Share link is invalid');
      }

      const lesson = await prisma.lesson.findFirst({
        where: { shareToken: shareToken.trim() },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
          subject: { select: { id: true, name: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true } },
            },
          },
          periods: {
            orderBy: { periodNo: 'asc' },
          },
        },
      });

      if (!lesson || !lesson.periods?.length) {
        return notFoundResponse(res, 'Lesson plan not found or no longer available');
      }

      return successResponse(res, {
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        class: lesson.class,
        chapters: lesson.chapters.map((c) => c.chapter),
        duration: lesson.duration,
        objective: lesson.objective,
        topic: lesson.topic,
        numberOfPeriods: lesson.numberOfPeriods,
        periods: lesson.periods,
        startDate: lesson.startDate,
        endDate: lesson.endDate,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
