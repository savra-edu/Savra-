import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  studentLessonQuerySchema,
  studentQuizQuerySchema,
  studentAnnouncementQuerySchema,
  studentAssessmentQuerySchema,
  submitAnswerSchema,
} from '../schemas/student';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

const router = Router();

// Helper to get student from user
const getStudent = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true, classId: true },
  });
  return student;
};

// ============================================
// SUBJECT ENDPOINTS
// ============================================

// GET /api/student/subjects - Get student's selected subjects (for header dropdowns)
router.get(
  '/subjects',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const student = await prisma.student.findUnique({
        where: { userId },
        select: {
          id: true,
          classId: true,
          subjects: {
            select: {
              subject: { select: { id: true, name: true, code: true } },
            },
          },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Return student's selected subjects, or fallback to subjects from published quizzes
      if (student.subjects.length > 0) {
        return successResponse(res, {
          subjects: student.subjects.map((s) => s.subject),
        });
      }

      // Fallback: Get distinct subjects from published quizzes for student's class
      const subjects = await prisma.subject.findMany({
        where: {
          quizzes: {
            some: {
              classId: student.classId,
              status: 'published',
            },
          },
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
      });

      return successResponse(res, { subjects });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/student/all-subjects - Get all subjects for profile selection
router.get(
  '/all-subjects',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subjects = await prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: 'asc' },
      });

      return successResponse(res, { subjects });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/student/school-classes - Get all classes in student's school for profile selection
router.get(
  '/school-classes',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student's school via their current class
      const student = await prisma.student.findUnique({
        where: { userId },
        select: {
          class: {
            select: {
              schoolId: true,
            },
          },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get all classes in the student's school
      const classes = await prisma.class.findMany({
        where: {
          schoolId: student.class.schoolId,
        },
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
        },
        orderBy: [{ grade: 'asc' }, { section: 'asc' }],
      });

      return successResponse(res, { classes });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// LESSON ENDPOINTS
// ============================================

// GET /api/student/lessons - List published lessons for student's class
router.get(
  '/lessons',
  authMiddleware,
  authorize('student'),
  validateQuery(studentLessonQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student's class
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Parse query params
      const subjectId = req.query.subjectId as string | undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: {
        classId: string;
        status: 'published';
        subjectId?: string;
      } = {
        classId: student.classId,
        status: 'published',
      };

      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Get lessons with pagination
      const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
          where: whereClause,
          include: {
            subject: { select: { id: true, name: true } },
            chapters: {
              select: {
                chapter: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.lesson.count({ where: whereClause }),
      ]);

      // Format response
      const formattedLessons = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        objective: lesson.objective,
        duration: lesson.duration,
        subject: lesson.subject,
        chapters: lesson.chapters.map((lc) => lc.chapter),
        createdAt: lesson.createdAt,
      }));

      return successResponse(res, {
        lessons: formattedLessons,
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

// GET /api/student/lessons/:id - Get single lesson
router.get(
  '/lessons/:id',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const lessonId = req.params.id as string;

      // Get student's class
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get lesson and verify access
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          classId: student.classId,
          status: 'published',
        },
        include: {
          subject: { select: { id: true, name: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!lesson) {
        return notFoundResponse(res, 'Lesson not found');
      }

      return successResponse(res, {
        id: lesson.id,
        title: lesson.title,
        objective: lesson.objective,
        duration: lesson.duration,
        content: lesson.content,
        referenceFileUrl: lesson.referenceFileUrl,
        subject: lesson.subject,
        chapters: lesson.chapters.map((lc) => lc.chapter),
        createdAt: lesson.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// QUIZ ENDPOINTS
// ============================================

// GET /api/student/quizzes - List published quizzes for student's class
router.get(
  '/quizzes',
  authMiddleware,
  authorize('student'),
  validateQuery(studentQuizQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Parse query params
      const subjectId = req.query.subjectId as string | undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: {
        classId: string;
        status: 'published';
        subjectId?: string;
      } = {
        classId: student.classId,
        status: 'published',
      };

      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Get quizzes with attempt info
      const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
          where: whereClause,
          include: {
            subject: { select: { id: true, name: true } },
            attempts: {
              where: { studentId: student.id },
              select: {
                id: true,
                status: true,
                score: true,
                percentage: true,
                submittedAt: true,
              },
              orderBy: { startedAt: 'desc' },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.quiz.count({ where: whereClause }),
      ]);

      // Format response with attempt status
      const formattedQuizzes = quizzes.map((quiz) => {
        const latestAttempt = quiz.attempts[0];
        let attemptStatus = 'not_attempted';
        if (latestAttempt) {
          attemptStatus = latestAttempt.status;
        }

        return {
          id: quiz.id,
          title: quiz.title,
          objective: quiz.objective,
          totalQuestions: quiz.totalQuestions,
          totalMarks: quiz.totalMarks,
          timeLimit: quiz.timeLimit,
          difficultyLevel: quiz.difficultyLevel,
          dueDate: quiz.dueDate,
          isOptional: quiz.isOptional,
          subject: quiz.subject,
          attemptStatus,
          latestScore: latestAttempt?.score || null,
          latestPercentage: latestAttempt?.percentage || null,
          attemptCount: quiz.attempts.length,
          createdAt: quiz.createdAt,
        };
      });

      return successResponse(res, {
        quizzes: formattedQuizzes,
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

// GET /api/student/quizzes/:id - Get quiz metadata
router.get(
  '/quizzes/:id',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get quiz
      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          classId: student.classId,
          status: 'published',
        },
        include: {
          subject: { select: { id: true, name: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true } },
            },
          },
          attempts: {
            where: { studentId: student.id },
            select: {
              id: true,
              status: true,
              score: true,
              percentage: true,
              startedAt: true,
              submittedAt: true,
            },
            orderBy: { startedAt: 'desc' },
          },
        },
      });

      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Check for in-progress attempt
      const inProgressAttempt = quiz.attempts.find((a) => a.status === 'in_progress');

      // Check for latest completed attempt (submitted or graded)
      const latestCompletedAttempt = quiz.attempts.find(
        (a) => a.status === 'submitted' || a.status === 'graded'
      );

      return successResponse(res, {
        id: quiz.id,
        title: quiz.title,
        objective: quiz.objective,
        totalQuestions: quiz.totalQuestions,
        totalMarks: quiz.totalMarks,
        timeLimit: quiz.timeLimit,
        difficultyLevel: quiz.difficultyLevel,
        dueDate: quiz.dueDate,
        isOptional: quiz.isOptional,
        subject: quiz.subject,
        chapters: quiz.chapters.map((qc) => qc.chapter),
        attemptCount: quiz.attempts.length,
        inProgressAttempt: inProgressAttempt
          ? {
              id: inProgressAttempt.id,
              startedAt: inProgressAttempt.startedAt,
            }
          : null,
        latestCompletedAttempt: latestCompletedAttempt
          ? {
              id: latestCompletedAttempt.id,
              score: latestCompletedAttempt.score,
              percentage: latestCompletedAttempt.percentage,
              submittedAt: latestCompletedAttempt.submittedAt,
            }
          : null,
        createdAt: quiz.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/student/quizzes/:id/start - Start a quiz attempt
router.post(
  '/quizzes/:id/start',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get quiz and verify access
      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          classId: student.classId,
          status: 'published',
        },
      });

      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Check for existing in-progress attempt
      const existingAttempt = await prisma.quizAttempt.findFirst({
        where: {
          quizId: quizId,
          studentId: student.id,
          status: 'in_progress',
        },
      });

      if (existingAttempt) {
        return errorResponse(
          res,
          'You already have an in-progress attempt for this quiz',
          400,
          'ATTEMPT_IN_PROGRESS'
        );
      }

      // Create new attempt
      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId: quizId,
          studentId: student.id,
          totalMarks: quiz.totalMarks,
          status: 'in_progress',
          startedAt: new Date(),
        },
      });

      return successResponse(
        res,
        {
          attemptId: attempt.id,
          quizId: quiz.id,
          timeLimit: quiz.timeLimit,
          totalQuestions: quiz.totalQuestions,
          totalMarks: quiz.totalMarks,
          startedAt: attempt.startedAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/student/quizzes/:id/attempt/:attemptId - Get questions for attempt
router.get(
  '/quizzes/:id/attempt/:attemptId',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const attemptId = req.params.attemptId as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Verify attempt belongs to student
      const attempt = await prisma.quizAttempt.findFirst({
        where: {
          id: attemptId,
          quizId: quizId,
          studentId: student.id,
        },
        include: {
          answers: {
            select: {
              questionId: true,
              selectedOptionId: true,
              answerText: true,
            },
          },
        },
      });

      if (!attempt) {
        return notFoundResponse(res, 'Attempt not found');
      }

      // Get questions (without correct answer info)
      const questions = await prisma.question.findMany({
        where: { quizId: quizId },
        include: {
          options: {
            select: {
              id: true,
              optionLabel: true,
              optionText: true,
              // Note: NOT selecting isCorrect
            },
            orderBy: { optionLabel: 'asc' },
          },
        },
        orderBy: { orderIndex: 'asc' },
      });

      // Map existing answers to questions
      const answersMap = new Map(
        attempt.answers.map((a) => [a.questionId, a])
      );

      const questionsWithAnswers = questions.map((q) => {
        const existingAnswer = answersMap.get(q.id);
        return {
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          marks: q.marks,
          orderIndex: q.orderIndex,
          options: q.options,
          submittedAnswer: existingAnswer
            ? {
                selectedOptionId: existingAnswer.selectedOptionId,
                answerText: existingAnswer.answerText,
              }
            : null,
        };
      });

      return successResponse(res, {
        attemptId: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        questions: questionsWithAnswers,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/student/quizzes/:id/attempt/:attemptId/answer - Submit answer
router.post(
  '/quizzes/:id/attempt/:attemptId/answer',
  authMiddleware,
  authorize('student'),
  validate(submitAnswerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const attemptId = req.params.attemptId as string;
      const { questionId, selectedOptionId, answerText } = req.body;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Verify attempt is in-progress and belongs to student
      const attempt = await prisma.quizAttempt.findFirst({
        where: {
          id: attemptId,
          quizId: quizId,
          studentId: student.id,
          status: 'in_progress',
        },
      });

      if (!attempt) {
        return errorResponse(res, 'Attempt not found or already submitted', 400, 'INVALID_ATTEMPT');
      }

      // Verify question belongs to quiz
      const question = await prisma.question.findFirst({
        where: { id: questionId, quizId: quizId },
      });

      if (!question) {
        return errorResponse(res, 'Question not found in this quiz', 400, 'INVALID_QUESTION');
      }

      // Find existing answer or create new one
      const existingAnswer = await prisma.studentAnswer.findFirst({
        where: {
          attemptId: attemptId,
          questionId: questionId,
        },
      });

      let answer;
      if (existingAnswer) {
        answer = await prisma.studentAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            selectedOptionId: selectedOptionId || null,
            answerText: answerText || null,
          },
        });
      } else {
        answer = await prisma.studentAnswer.create({
          data: {
            attemptId: attemptId,
            questionId: questionId,
            selectedOptionId: selectedOptionId || null,
            answerText: answerText || null,
          },
        });
      }

      return successResponse(res, {
        message: 'Answer saved',
        answerId: answer.id,
        questionId: answer.questionId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/student/quizzes/:id/attempt/:attemptId/submit - Submit quiz
router.patch(
  '/quizzes/:id/attempt/:attemptId/submit',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const attemptId = req.params.attemptId as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Verify attempt is in-progress and belongs to student
      const attempt = await prisma.quizAttempt.findFirst({
        where: {
          id: attemptId,
          quizId: quizId,
          studentId: student.id,
          status: 'in_progress',
        },
        include: {
          answers: {
            include: {
              question: true,
              selectedOption: true,
            },
          },
        },
      });

      if (!attempt) {
        return errorResponse(res, 'Attempt not found or already submitted', 400, 'INVALID_ATTEMPT');
      }

      // Calculate score for MCQ questions
      let totalScore = 0;
      let gradedQuestions = 0;

      for (const answer of attempt.answers) {
        if (answer.question.questionType === 'mcq' && answer.selectedOptionId) {
          const isCorrect = answer.selectedOption?.isCorrect || false;
          const marksObtained = isCorrect ? answer.question.marks : 0;

          await prisma.studentAnswer.update({
            where: { id: answer.id },
            data: {
              isCorrect,
              marksObtained,
            },
          });

          totalScore += marksObtained;
          gradedQuestions++;
        }
        // Short/long answer questions need manual grading
      }

      // Calculate time taken
      const timeTaken = Math.floor(
        (new Date().getTime() - attempt.startedAt.getTime()) / 1000
      );

      // Update attempt
      const totalMarks = attempt.totalMarks || 0;
      const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
          score: totalScore,
          percentage,
          timeTaken,
        },
      });

      return successResponse(res, {
        attemptId: updatedAttempt.id,
        status: updatedAttempt.status,
        score: updatedAttempt.score,
        totalMarks: updatedAttempt.totalMarks,
        percentage: updatedAttempt.percentage,
        timeTaken: updatedAttempt.timeTaken,
        submittedAt: updatedAttempt.submittedAt,
        gradedQuestions,
        message: 'Quiz submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/student/quizzes/:id/attempts - List all attempts for a quiz
router.get(
  '/quizzes/:id/attempts',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get all attempts for this quiz by this student
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          quizId: quizId,
          studentId: student.id,
        },
        select: {
          id: true,
          status: true,
          score: true,
          totalMarks: true,
          percentage: true,
          timeTaken: true,
          startedAt: true,
          submittedAt: true,
        },
        orderBy: { startedAt: 'desc' },
      });

      return successResponse(res, { attempts });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/student/quizzes/:id/attempt/:attemptId/results - Get attempt results
router.get(
  '/quizzes/:id/attempt/:attemptId/results',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const attemptId = req.params.attemptId as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get attempt with answers
      const attempt = await prisma.quizAttempt.findFirst({
        where: {
          id: attemptId,
          quizId: quizId,
          studentId: student.id,
          status: { in: ['submitted', 'graded'] },
        },
        include: {
          quiz: {
            select: {
              title: true,
              totalQuestions: true,
              totalMarks: true,
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: {
                    orderBy: { optionLabel: 'asc' },
                  },
                },
              },
              selectedOption: true,
            },
          },
        },
      });

      if (!attempt) {
        return errorResponse(
          res,
          'Results not available. Attempt not found or not yet submitted.',
          400,
          'RESULTS_NOT_AVAILABLE'
        );
      }

      // Format results with correct answers
      const questions = await prisma.question.findMany({
        where: { quizId: quizId },
        include: {
          options: { orderBy: { optionLabel: 'asc' } },
        },
        orderBy: { orderIndex: 'asc' },
      });

      const answersMap = new Map(
        attempt.answers.map((a) => [a.questionId, a])
      );

      const resultsWithAnswers = questions.map((q) => {
        const studentAnswer = answersMap.get(q.id);
        const correctOption = q.options.find((o) => o.isCorrect);

        return {
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          marks: q.marks,
          options: q.options.map((o) => ({
            id: o.id,
            optionLabel: o.optionLabel,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          })),
          correctOptionId: correctOption?.id || null,
          studentAnswer: studentAnswer
            ? {
                selectedOptionId: studentAnswer.selectedOptionId,
                answerText: studentAnswer.answerText,
                isCorrect: studentAnswer.isCorrect,
                marksObtained: studentAnswer.marksObtained,
              }
            : null,
        };
      });

      return successResponse(res, {
        attemptId: attempt.id,
        quiz: attempt.quiz,
        status: attempt.status,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        questions: resultsWithAnswers,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ANNOUNCEMENT ENDPOINTS
// ============================================

// GET /api/student/announcements - List announcements for student's class
router.get(
  '/announcements',
  authMiddleware,
  authorize('student'),
  validateQuery(studentAnnouncementQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student's class
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Parse query params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get announcements
      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where: { classId: student.classId },
          include: {
            teacher: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.announcement.count({ where: { classId: student.classId } }),
      ]);

      // Format response
      const formattedAnnouncements = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        attachmentUrl: a.attachmentUrl,
        teacherName: a.teacher.user.name,
        createdAt: a.createdAt,
      }));

      return successResponse(res, {
        announcements: formattedAnnouncements,
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

// GET /api/student/announcements/:id - Get single announcement
router.get(
  '/announcements/:id',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const announcementId = req.params.id as string;

      // Get student's class
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get announcement
      const announcement = await prisma.announcement.findFirst({
        where: {
          id: announcementId,
          classId: student.classId,
        },
        include: {
          teacher: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
      });

      if (!announcement) {
        return notFoundResponse(res, 'Announcement not found');
      }

      return successResponse(res, {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        attachmentUrl: announcement.attachmentUrl,
        teacherName: announcement.teacher.user.name,
        createdAt: announcement.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ASSESSMENT ENDPOINTS
// ============================================

// GET /api/student/assessments - List published assessments
router.get(
  '/assessments',
  authMiddleware,
  authorize('student'),
  validateQuery(studentAssessmentQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student's class
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Parse query params
      const subjectId = req.query.subjectId as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: {
        classId: string;
        status: 'published';
        subjectId?: string;
      } = {
        classId: student.classId,
        status: 'published',
      };

      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Get assessments
      const [assessments, total] = await Promise.all([
        prisma.assessment.findMany({
          where: whereClause,
          include: {
            subject: { select: { id: true, name: true } },
            questionTypes: {
              select: {
                questionType: true,
                numberOfQuestions: true,
                marksPerQuestion: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.assessment.count({ where: whereClause }),
      ]);

      // Format response
      const formattedAssessments = assessments.map((a) => ({
        id: a.id,
        title: a.title,
        objective: a.objective,
        totalMarks: a.totalMarks,
        difficultyLevel: a.difficultyLevel,
        subject: a.subject,
        questionTypes: a.questionTypes,
        createdAt: a.createdAt,
      }));

      return successResponse(res, {
        assessments: formattedAssessments,
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

// GET /api/student/assessments/:id - Get assessment details
router.get(
  '/assessments/:id',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const assessmentId = req.params.id as string;

      // Get student's class
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get assessment
      const assessment = await prisma.assessment.findFirst({
        where: {
          id: assessmentId,
          classId: student.classId,
          status: 'published',
        },
        include: {
          subject: { select: { id: true, name: true } },
          chapters: {
            select: {
              chapter: { select: { id: true, name: true } },
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

      return successResponse(res, {
        id: assessment.id,
        title: assessment.title,
        objective: assessment.objective,
        totalMarks: assessment.totalMarks,
        difficultyLevel: assessment.difficultyLevel,
        referenceBooks: assessment.referenceBooks,
        referenceFileUrl: assessment.referenceFileUrl,
        questionPaper: assessment.questionPaper,
        subject: assessment.subject,
        chapters: assessment.chapters.map((ac) => ac.chapter),
        questionTypes: assessment.questionTypes,
        createdAt: assessment.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// LEADERBOARD & PERFORMANCE ENDPOINTS
// ============================================

// GET /api/student/leaderboard - Get class leaderboard
router.get(
  '/leaderboard',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student
      const student = await prisma.student.findUnique({
        where: { userId },
        select: {
          id: true,
          classId: true,
          class: { select: { id: true, name: true, grade: true, section: true } },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get all students in the class ordered by points
      const classStudents = await prisma.student.findMany({
        where: { classId: student.classId },
        select: {
          id: true,
          totalPoints: true,
          user: { select: { name: true } },
        },
        orderBy: { totalPoints: 'desc' },
      });

      // Build rankings
      let currentRank = 0;
      let lastPoints = -1;
      let currentUserRank = 0;

      const rankings = classStudents.map((s, index) => {
        // Handle ties - same points = same rank
        if (s.totalPoints !== lastPoints) {
          currentRank = index + 1;
          lastPoints = s.totalPoints;
        }

        const isCurrentUser = s.id === student.id;
        if (isCurrentUser) {
          currentUserRank = currentRank;
        }

        return {
          rank: currentRank,
          studentId: s.id,
          name: s.user.name,
          points: s.totalPoints,
          isCurrentUser,
        };
      });

      return successResponse(res, {
        class: student.class,
        currentUserRank,
        totalStudents: classStudents.length,
        rankings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/student/performance - Get student's overall performance
router.get(
  '/performance',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get student with class info
      const student = await prisma.student.findUnique({
        where: { userId },
        select: {
          id: true,
          totalPoints: true,
          rollNumber: true,
          class: { select: { id: true, name: true, grade: true, section: true } },
          user: { select: { name: true } },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Get quiz statistics
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          studentId: student.id,
          status: { in: ['submitted', 'graded'] },
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              subject: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      // Calculate overall stats
      const totalAttempts = attempts.length;
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
      const averageScore = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

      // Get recent attempts (last 5)
      const recentAttempts = attempts.slice(0, 5).map((a) => ({
        id: a.id,
        quizId: a.quiz.id,
        quizTitle: a.quiz.title,
        subject: a.quiz.subject,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        submittedAt: a.submittedAt,
      }));

      // Calculate subject breakdown
      const subjectMap = new Map<string, { name: string; attempts: number; totalScore: number; totalMarks: number }>();
      for (const attempt of attempts) {
        const subjectId = attempt.quiz.subject.id;
        const existing = subjectMap.get(subjectId) || {
          name: attempt.quiz.subject.name,
          attempts: 0,
          totalScore: 0,
          totalMarks: 0,
        };
        existing.attempts++;
        existing.totalScore += attempt.score || 0;
        existing.totalMarks += attempt.totalMarks || 0;
        subjectMap.set(subjectId, existing);
      }

      const subjectBreakdown = Array.from(subjectMap.entries()).map(([id, data]) => ({
        subjectId: id,
        subjectName: data.name,
        attempts: data.attempts,
        averageScore: data.totalMarks > 0 ? (data.totalScore / data.totalMarks) * 100 : 0,
      }));

      return successResponse(res, {
        student: {
          name: student.user.name,
          rollNumber: student.rollNumber,
          totalPoints: student.totalPoints,
          class: student.class,
        },
        quizStats: {
          totalAttempts,
          averageScore: Math.round(averageScore * 100) / 100,
        },
        recentAttempts,
        subjectBreakdown,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/student/announcements/:id/read - Mark announcement as read
router.post(
  '/announcements/:id/read',
  authMiddleware,
  authorize('student'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const announcementId = req.params.id as string;

      // Get student
      const student = await getStudent(userId);
      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      // Verify announcement exists and belongs to student's class
      const announcement = await prisma.announcement.findFirst({
        where: {
          id: announcementId,
          classId: student.classId,
        },
      });

      if (!announcement) {
        return notFoundResponse(res, 'Announcement not found');
      }

      // Upsert read status
      const readRecord = await prisma.announcementRead.upsert({
        where: {
          announcementId_studentId: {
            announcementId,
            studentId: student.id,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          announcementId,
          studentId: student.id,
        },
      });

      return successResponse(res, {
        marked: true,
        readAt: readRecord.readAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
