import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  teacherClassQuerySchema,
  teacherStudentQuerySchema,
  quizAttemptsQuerySchema,
  performanceQuerySchema,
  gradeAttemptSchema,
  onboardingSchema,
} from '../schemas/teacher';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

const router = Router();

// ============================================
// PROFILE ENDPOINT
// ============================================

// GET /api/teacher/profile - Get teacher profile
router.get(
  '/profile',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        return notFoundResponse(res, 'User not found');
      }

      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: {
          id: true,
          location: true,
          teacherRole: true,
          onboardingCompleted: true,
          school: {
            select: {
              id: true,
              name: true,
            },
          },
          subjects: {
            select: {
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          classes: {
            select: {
              class: {
                select: {
                  id: true,
                  name: true,
                  grade: true,
                  section: true,
                },
              },
            },
          },
        },
      });

      return successResponse(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.avatarUrl,
        school: teacher?.school || null,
        subjects: teacher?.subjects.map(s => s.subject.name) || [],
        classes: teacher?.classes.map(c => c.class) || [],
        location: teacher?.location || null,
        teacherRole: teacher?.teacherRole || null,
        onboardingCompleted: teacher?.onboardingCompleted || false,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/teacher/profile - Update teacher profile
router.put(
  '/profile',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, email, subjects, classIds } = req.body;

      // Update user name if provided
      if (name) {
        await prisma.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      // Get teacher record
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Update subjects if provided (by name)
      if (subjects && Array.isArray(subjects)) {
        // Get subject IDs from names
        const subjectRecords = await prisma.subject.findMany({
          where: { name: { in: subjects } },
        });

        // Clear existing assignments and add new ones
        await prisma.$transaction([
          prisma.teacherSubject.deleteMany({
            where: { teacherId: teacher.id },
          }),
          ...subjectRecords.map(subject =>
            prisma.teacherSubject.create({
              data: {
                teacherId: teacher.id,
                subjectId: subject.id,
              },
            })
          ),
        ]);
      }

      // Update classes if provided (by ID)
      if (classIds && Array.isArray(classIds)) {
        // Verify all classes belong to teacher's school
        const validClasses = await prisma.class.findMany({
          where: {
            id: { in: classIds },
            schoolId: teacher.schoolId,
          },
        });

        // Clear existing assignments and add new ones
        await prisma.$transaction([
          prisma.teacherClass.deleteMany({
            where: { teacherId: teacher.id },
          }),
          ...validClasses.map(cls =>
            prisma.teacherClass.create({
              data: {
                teacherId: teacher.id,
                classId: cls.id,
              },
            })
          ),
        ]);
      }

      return successResponse(res, { message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/school-classes - Get all classes from teacher's school (for selection)
router.get(
  '/school-classes',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { schoolId: true },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get all classes from the school
      const classes = await prisma.class.findMany({
        where: { schoolId: teacher.schoolId },
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
// ONBOARDING ENDPOINT
// ============================================

// POST /api/teacher/onboarding - Complete teacher onboarding
router.post(
  '/onboarding',
  authMiddleware,
  authorize('teacher'),
  validate(onboardingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { role, subjects, classes, name } = req.body;

      // Get teacher record
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Start transaction to update all data
      await prisma.$transaction(async (tx) => {
        // 1. Update user name if provided
        if (name) {
          await tx.user.update({
            where: { id: userId },
            data: { name },
          });
        }

        // 2. Update teacher role
        await tx.teacher.update({
          where: { id: teacher.id },
          data: {
            teacherRole: role || null,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
          },
        });

        // 3. Update subjects if provided
        if (subjects && Array.isArray(subjects) && subjects.length > 0) {
          // Get subject IDs from names
          const subjectRecords = await tx.subject.findMany({
            where: { name: { in: subjects } },
          });

          // Clear existing assignments and add new ones
          await tx.teacherSubject.deleteMany({
            where: { teacherId: teacher.id },
          });

          for (const subject of subjectRecords) {
            await tx.teacherSubject.create({
              data: {
                teacherId: teacher.id,
                subjectId: subject.id,
              },
            });
          }
        }

        // 4. Update classes if provided
        if (classes && Array.isArray(classes) && classes.length > 0) {
          // Parse class strings - handle both "Class 6" (grade only) and "Class 6 A" (grade + section)
          const gradesToAssign: number[] = [];
          const specificClasses: Array<{ grade: number; section: string }> = [];

          for (const classStr of classes) {
            // Try to parse "Class X Y" or "Grade X Y" format (with section)
            const matchWithSection = classStr.match(/(?:Class|Grade)\s*(\d+)\s+([A-Za-z])/i);
            if (matchWithSection) {
              specificClasses.push({
                grade: parseInt(matchWithSection[1]),
                section: matchWithSection[2].toUpperCase(),
              });
            } else {
              // Try to parse "Class X" or "Grade X" format (grade only - assign ALL sections)
              const matchGradeOnly = classStr.match(/(?:Class|Grade)\s*(\d+)/i);
              if (matchGradeOnly) {
                gradesToAssign.push(parseInt(matchGradeOnly[1]));
              }
            }
          }

          // Build query conditions
          const queryConditions = [];

          // Add specific class conditions (grade + section)
          if (specificClasses.length > 0) {
            queryConditions.push(...specificClasses.map((c) => ({
              grade: c.grade,
              section: c.section,
            })));
          }

          // Add grade-only conditions (all sections for those grades)
          if (gradesToAssign.length > 0) {
            queryConditions.push(...gradesToAssign.map((grade) => ({
              grade: grade,
            })));
          }

          if (queryConditions.length > 0) {
            // Get class IDs from the school
            const classRecords = await tx.class.findMany({
              where: {
                schoolId: teacher.schoolId,
                OR: queryConditions,
              },
            });

            // Clear existing assignments and add new ones
            await tx.teacherClass.deleteMany({
              where: { teacherId: teacher.id },
            });

            for (const classRecord of classRecords) {
              await tx.teacherClass.create({
                data: {
                  teacherId: teacher.id,
                  classId: classRecord.id,
                },
              });
            }
          }
        }
      });

      return successResponse(res, {
        message: 'Onboarding completed successfully',
        onboardingCompleted: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper to get teacher info
const getTeacher = async (userId: string) => {
  return prisma.teacher.findUnique({
    where: { userId },
    select: { id: true, schoolId: true },
  });
};

// Helper to verify teacher is assigned to a class
const verifyTeacherClass = async (teacherId: string, classId: string) => {
  const assignment = await prisma.teacherClass.findUnique({
    where: {
      teacherId_classId: { teacherId, classId },
    },
  });
  return !!assignment;
};

// Helper to verify teacher owns a quiz
const verifyQuizOwnership = async (teacherId: string, quizId: string) => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, teacherId },
  });
  return quiz;
};

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

// GET /api/teacher/dashboard/stats - Teacher's overview statistics
router.get(
  '/dashboard/stats',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get all assigned class IDs
      const assignedClasses = await prisma.teacherClass.findMany({
        where: { teacherId: teacher.id },
        select: { classId: true },
      });
      const classIds = assignedClasses.map((c) => c.classId);

      // Get counts in parallel
      const [
        totalClasses,
        totalSubjects,
        totalStudents,
        lessonCounts,
        quizCounts,
        assessmentCount,
        announcementCount,
        pendingGradingCount,
      ] = await Promise.all([
        // Total classes assigned
        prisma.teacherClass.count({ where: { teacherId: teacher.id } }),
        // Total subjects assigned
        prisma.teacherSubject.count({ where: { teacherId: teacher.id } }),
        // Total students in assigned classes
        prisma.student.count({ where: { classId: { in: classIds } } }),
        // Lesson counts by status
        prisma.lesson.groupBy({
          by: ['status'],
          where: { teacherId: teacher.id },
          _count: true,
        }),
        // Quiz counts by status
        prisma.quiz.groupBy({
          by: ['status'],
          where: { teacherId: teacher.id },
          _count: true,
        }),
        // Total assessments
        prisma.assessment.count({ where: { teacherId: teacher.id } }),
        // Total announcements
        prisma.announcement.count({ where: { teacherId: teacher.id } }),
        // Quiz attempts pending grading (submitted but not fully graded)
        prisma.quizAttempt.count({
          where: {
            quiz: { teacherId: teacher.id },
            status: 'submitted',
          },
        }),
      ]);

      // Format lesson counts
      const lessons = {
        draft: lessonCounts.find((l) => l.status === 'draft')?._count || 0,
        saved: lessonCounts.find((l) => l.status === 'saved')?._count || 0,
        published: lessonCounts.find((l) => l.status === 'published')?._count || 0,
        total: lessonCounts.reduce((sum, l) => sum + l._count, 0),
      };

      // Format quiz counts
      const quizzes = {
        draft: quizCounts.find((q) => q.status === 'draft')?._count || 0,
        saved: quizCounts.find((q) => q.status === 'saved')?._count || 0,
        published: quizCounts.find((q) => q.status === 'published')?._count || 0,
        total: quizCounts.reduce((sum, q) => sum + q._count, 0),
      };

      return successResponse(res, {
        totalClasses,
        totalSubjects,
        totalStudents,
        lessons,
        quizzes,
        totalAssessments: assessmentCount,
        totalAnnouncements: announcementCount,
        pendingGrading: pendingGradingCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/dashboard/recent - Recent activity
router.get(
  '/dashboard/recent',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get recent items in parallel
      const [recentLessons, recentQuizzes, recentAttempts] = await Promise.all([
        // Recent lessons
        prisma.lesson.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true, grade: true, section: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent quizzes
        prisma.quiz.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true, grade: true, section: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent quiz attempts (submitted, for grading)
        prisma.quizAttempt.findMany({
          where: {
            quiz: { teacherId: teacher.id },
            submittedAt: { not: null },
          },
          select: {
            id: true,
            score: true,
            totalMarks: true,
            status: true,
            submittedAt: true,
            student: {
              select: {
                id: true,
                user: { select: { name: true } },
              },
            },
            quiz: { select: { id: true, title: true } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
      ]);

      return successResponse(res, {
        recentLessons,
        recentQuizzes,
        recentAttempts: recentAttempts.map((a) => ({
          id: a.id,
          score: a.score,
          totalMarks: a.totalMarks,
          status: a.status,
          submittedAt: a.submittedAt,
          studentId: a.student.id,
          studentName: a.student.user.name,
          quizId: a.quiz.id,
          quizTitle: a.quiz.title,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// CLASS ENDPOINTS
// ============================================

// GET /api/teacher/classes - List teacher's assigned classes
router.get(
  '/classes',
  authMiddleware,
  authorize('teacher'),
  validateQuery(teacherClassQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query as any;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const skip = (page - 1) * limit;

      const [assignments, total] = await Promise.all([
        prisma.teacherClass.findMany({
          where: { teacherId: teacher.id },
          include: {
            class: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true,
                _count: { select: { students: true } },
              },
            },
          },
          skip,
          take: limit,
        }),
        prisma.teacherClass.count({ where: { teacherId: teacher.id } }),
      ]);

      // Get subjects taught in each class (based on lessons/quizzes)
      const classIds = assignments.map((a) => a.classId);
      const subjectsPerClass = await prisma.lesson.findMany({
        where: {
          teacherId: teacher.id,
          classId: { in: classIds },
        },
        select: {
          classId: true,
          subject: { select: { id: true, name: true } },
        },
        distinct: ['classId', 'subjectId'],
      });

      // Group subjects by class
      const subjectsByClass: Record<string, Array<{ id: string; name: string }>> = {};
      subjectsPerClass.forEach((item) => {
        if (!subjectsByClass[item.classId]) {
          subjectsByClass[item.classId] = [];
        }
        if (!subjectsByClass[item.classId].find((s) => s.id === item.subject.id)) {
          subjectsByClass[item.classId].push(item.subject);
        }
      });

      return successResponse(res, {
        classes: assignments.map((a) => ({
          id: a.class.id,
          name: a.class.name,
          grade: a.class.grade,
          section: a.class.section,
          studentCount: a.class._count.students,
          subjects: subjectsByClass[a.classId] || [],
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

// GET /api/teacher/classes/:classId - Get class details
router.get(
  '/classes/:classId',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const classId = req.params.classId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify teacher is assigned to this class
      const isAssigned = await verifyTeacherClass(teacher.id, classId);
      if (!isAssigned) {
        return errorResponse(res, 'You are not assigned to this class', 403, 'FORBIDDEN');
      }

      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { rollNumber: 'asc' },
          },
          school: { select: { id: true, name: true } },
        },
      });

      if (!classData) {
        return notFoundResponse(res, 'Class not found');
      }

      return successResponse(res, {
        id: classData.id,
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        school: classData.school,
        studentCount: classData.students.length,
        students: classData.students.map((s) => ({
          id: s.id,
          userId: s.user.id,
          name: s.user.name,
          email: s.user.email,
          rollNumber: s.rollNumber,
          totalPoints: s.totalPoints,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/classes/:classId/students - List students in a class (paginated)
router.get(
  '/classes/:classId/students',
  authMiddleware,
  authorize('teacher'),
  validateQuery(teacherStudentQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const classId = req.params.classId as string;
      const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = req.query as any;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify teacher is assigned to this class
      const isAssigned = await verifyTeacherClass(teacher.id, classId);
      if (!isAssigned) {
        return errorResponse(res, 'You are not assigned to this class', 403, 'FORBIDDEN');
      }

      const skip = (page - 1) * limit;

      // Build orderBy
      let orderBy: any;
      if (sortBy === 'name') {
        orderBy = { user: { name: sortOrder } };
      } else if (sortBy === 'rollNumber') {
        orderBy = { rollNumber: sortOrder };
      } else if (sortBy === 'totalPoints') {
        orderBy = { totalPoints: sortOrder };
      } else {
        orderBy = { user: { name: sortOrder } };
      }

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where: { classId },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.student.count({ where: { classId } }),
      ]);

      return successResponse(res, {
        students: students.map((s) => ({
          id: s.id,
          userId: s.user.id,
          name: s.user.name,
          email: s.user.email,
          rollNumber: s.rollNumber,
          totalPoints: s.totalPoints,
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

// ============================================
// QUIZ ATTEMPT ENDPOINTS
// ============================================

// GET /api/teacher/quizzes/:quizId/attempts - List all attempts for a quiz
router.get(
  '/quizzes/:quizId/attempts',
  authMiddleware,
  authorize('teacher'),
  validateQuery(quizAttemptsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;
      const { status, page = 1, limit = 20, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query as any;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify teacher owns this quiz
      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return errorResponse(res, 'Quiz not found or you do not own this quiz', 404, 'NOT_FOUND');
      }

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { quizId };
      if (status) {
        where.status = status;
      }

      // Build orderBy
      let orderBy: any;
      if (sortBy === 'submittedAt') {
        orderBy = { submittedAt: sortOrder };
      } else if (sortBy === 'score') {
        orderBy = { score: sortOrder };
      } else if (sortBy === 'studentName') {
        orderBy = { student: { user: { name: sortOrder } } };
      } else {
        orderBy = { submittedAt: sortOrder };
      }

      const [attempts, total] = await Promise.all([
        prisma.quizAttempt.findMany({
          where,
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.quizAttempt.count({ where }),
      ]);

      return successResponse(res, {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          totalMarks: quiz.totalMarks,
        },
        attempts: attempts.map((a) => ({
          id: a.id,
          studentId: a.studentId,
          studentName: a.student.user.name,
          studentEmail: a.student.user.email,
          score: a.score,
          totalMarks: a.totalMarks,
          status: a.status,
          startedAt: a.startedAt,
          submittedAt: a.submittedAt,
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

// GET /api/teacher/quiz-attempts/:attemptId - Get single attempt with all answers
router.get(
  '/quiz-attempts/:attemptId',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const attemptId = req.params.attemptId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get attempt with quiz verification
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              teacherId: true,
              totalMarks: true,
            },
          },
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: { select: { id: true, optionText: true, optionLabel: true, isCorrect: true } },
                },
              },
              selectedOption: { select: { id: true, optionText: true, optionLabel: true, isCorrect: true } },
            },
          },
        },
      });

      if (!attempt) {
        return notFoundResponse(res, 'Quiz attempt not found');
      }

      // Verify teacher owns the quiz
      if (attempt.quiz.teacherId !== teacher.id) {
        return errorResponse(res, 'You do not own this quiz', 403, 'FORBIDDEN');
      }

      return successResponse(res, {
        attempt: {
          id: attempt.id,
          status: attempt.status,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
        },
        quiz: {
          id: attempt.quiz.id,
          title: attempt.quiz.title,
          totalMarks: attempt.quiz.totalMarks,
        },
        student: {
          id: attempt.student.id,
          name: attempt.student.user.name,
          email: attempt.student.user.email,
        },
        answers: attempt.answers.map((a) => ({
          id: a.id,
          questionId: a.questionId,
          questionText: a.question.questionText,
          questionType: a.question.questionType,
          marks: a.question.marks,
          isCorrect: a.isCorrect,
          marksObtained: a.marksObtained,
          // For MCQ, show selected option and correct option
          selectedOption: a.selectedOption
            ? {
                id: a.selectedOption.id,
                text: a.selectedOption.optionText,
                label: a.selectedOption.optionLabel,
                isCorrect: a.selectedOption.isCorrect,
              }
            : null,
          correctOptions: a.question.options.filter((o: { isCorrect: boolean }) => o.isCorrect),
          // For subjective questions, show answer text
          answerText: a.answerText,
          // All options for reference
          allOptions: a.question.options,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/teacher/quiz-attempts/:attemptId/grade - Grade subjective questions
router.patch(
  '/quiz-attempts/:attemptId/grade',
  authMiddleware,
  authorize('teacher'),
  validate(gradeAttemptSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const attemptId = req.params.attemptId as string;
      const { answers } = req.body;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get attempt with quiz verification
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: { select: { id: true, teacherId: true } },
          answers: {
            include: {
              question: { select: { marks: true, questionType: true } },
            },
          },
        },
      });

      if (!attempt) {
        return notFoundResponse(res, 'Quiz attempt not found');
      }

      // Verify teacher owns the quiz
      if (attempt.quiz.teacherId !== teacher.id) {
        return errorResponse(res, 'You do not own this quiz', 403, 'FORBIDDEN');
      }

      // Verify attempt has been submitted
      if (attempt.status === 'in_progress') {
        return errorResponse(res, 'Cannot grade an attempt that is still in progress', 400, 'INVALID_STATUS');
      }

      // Validate answer IDs and marks
      const answerMap = new Map(attempt.answers.map((a) => [a.id, a]));
      for (const grading of answers) {
        const answer = answerMap.get(grading.answerId);
        if (!answer) {
          return errorResponse(res, `Answer ID ${grading.answerId} not found in this attempt`, 400, 'INVALID_ANSWER');
        }
        if (grading.marksObtained > answer.question.marks) {
          return errorResponse(
            res,
            `Marks for answer ${grading.answerId} cannot exceed ${answer.question.marks}`,
            400,
            'INVALID_MARKS'
          );
        }
      }

      // Update answers in transaction
      await prisma.$transaction(async (tx) => {
        for (const grading of answers) {
          await tx.studentAnswer.update({
            where: { id: grading.answerId },
            data: {
              marksObtained: grading.marksObtained,
              isCorrect: grading.marksObtained > 0,
            },
          });
        }
      });

      // Recalculate total score
      const updatedAnswers = await prisma.studentAnswer.findMany({
        where: { attemptId },
      });
      const newScore = updatedAnswers.reduce((sum, a) => sum + a.marksObtained, 0);

      // Update attempt with new score and mark as graded
      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score: newScore,
          status: 'graded',
        },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
          quiz: { select: { title: true, totalMarks: true } },
        },
      });

      return successResponse(res, {
        message: 'Attempt graded successfully',
        attempt: {
          id: updatedAttempt.id,
          score: updatedAttempt.score,
          totalMarks: updatedAttempt.totalMarks,
          status: updatedAttempt.status,
          percentage: (updatedAttempt.totalMarks || 0) > 0
            ? Math.round(((updatedAttempt.score || 0) / (updatedAttempt.totalMarks || 1)) * 100)
            : 0,
        },
        quiz: {
          id: updatedAttempt.quizId,
          title: updatedAttempt.quiz.title,
        },
        student: {
          id: updatedAttempt.studentId,
          name: updatedAttempt.student.user.name,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// PERFORMANCE ENDPOINTS
// ============================================

// GET /api/teacher/students/:studentId/performance - Student's quiz performance
router.get(
  '/students/:studentId/performance',
  authMiddleware,
  authorize('teacher'),
  validateQuery(performanceQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.studentId as string;
      const { page = 1, limit = 20 } = req.query as any;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get student
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: { select: { name: true, email: true } },
          class: { select: { id: true, name: true, grade: true, section: true } },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student not found');
      }

      // Verify teacher is assigned to student's class
      const isAssigned = await verifyTeacherClass(teacher.id, student.classId);
      if (!isAssigned) {
        return errorResponse(res, 'You are not assigned to this student\'s class', 403, 'FORBIDDEN');
      }

      const skip = (page - 1) * limit;

      // Get student's attempts on teacher's quizzes
      const [attempts, total] = await Promise.all([
        prisma.quizAttempt.findMany({
          where: {
            studentId,
            quiz: { teacherId: teacher.id },
            submittedAt: { not: null },
          },
          include: {
            quiz: { select: { id: true, title: true, totalMarks: true } },
          },
          orderBy: { submittedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.quizAttempt.count({
          where: {
            studentId,
            quiz: { teacherId: teacher.id },
            submittedAt: { not: null },
          },
        }),
      ]);

      // Calculate average score
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
      const averagePercentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

      return successResponse(res, {
        student: {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          rollNumber: student.rollNumber,
          class: student.class,
        },
        performance: {
          totalAttempts: total,
          averagePercentage,
          totalScore,
          totalMarks,
        },
        attempts: attempts.map((a) => ({
          id: a.id,
          quizId: a.quiz.id,
          quizTitle: a.quiz.title,
          score: a.score,
          totalMarks: a.totalMarks,
          percentage: (a.totalMarks || 0) > 0 ? Math.round(((a.score || 0) / (a.totalMarks || 1)) * 100) : 0,
          status: a.status,
          submittedAt: a.submittedAt,
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

// GET /api/teacher/classes/:classId/performance - Class-wide performance stats
router.get(
  '/classes/:classId/performance',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const classId = req.params.classId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify teacher is assigned to this class
      const isAssigned = await verifyTeacherClass(teacher.id, classId);
      if (!isAssigned) {
        return errorResponse(res, 'You are not assigned to this class', 403, 'FORBIDDEN');
      }

      // Get class info
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, name: true, grade: true, section: true },
      });

      if (!classData) {
        return notFoundResponse(res, 'Class not found');
      }

      // Get all students in class
      const students = await prisma.student.findMany({
        where: { classId },
        select: { id: true },
      });
      const studentIds = students.map((s) => s.id);

      // Get all quiz attempts for this class on teacher's quizzes
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          studentId: { in: studentIds },
          quiz: { teacherId: teacher.id },
          submittedAt: { not: null },
        },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
          quiz: { select: { id: true, title: true, totalMarks: true } },
        },
      });

      // Calculate class average
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
      const classAverage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

      // Calculate per-student performance
      const studentPerformance: Record<string, { name: string; totalScore: number; totalMarks: number; attempts: number }> = {};
      attempts.forEach((a) => {
        if (!studentPerformance[a.studentId]) {
          studentPerformance[a.studentId] = {
            name: a.student.user.name,
            totalScore: 0,
            totalMarks: 0,
            attempts: 0,
          };
        }
        studentPerformance[a.studentId].totalScore += a.score || 0;
        studentPerformance[a.studentId].totalMarks += a.totalMarks || 0;
        studentPerformance[a.studentId].attempts += 1;
      });

      // Get top performers and struggling students
      const studentsWithPercentage = Object.entries(studentPerformance).map(([id, data]) => ({
        studentId: id,
        name: data.name,
        averagePercentage: data.totalMarks > 0 ? Math.round((data.totalScore / data.totalMarks) * 100) : 0,
        totalAttempts: data.attempts,
      }));

      studentsWithPercentage.sort((a, b) => b.averagePercentage - a.averagePercentage);

      const topPerformers = studentsWithPercentage.slice(0, 5);
      const strugglingStudents = studentsWithPercentage.filter((s) => s.averagePercentage < 50).slice(0, 5);

      // Quiz-wise breakdown
      const quizPerformance: Record<string, { title: string; attempts: number; avgScore: number; avgPercentage: number }> = {};
      attempts.forEach((a) => {
        if (!quizPerformance[a.quiz.id]) {
          quizPerformance[a.quiz.id] = {
            title: a.quiz.title,
            attempts: 0,
            avgScore: 0,
            avgPercentage: 0,
          };
        }
        quizPerformance[a.quiz.id].attempts += 1;
        quizPerformance[a.quiz.id].avgScore += a.score || 0;
      });

      // Calculate quiz averages
      const quizBreakdown = Object.entries(quizPerformance).map(([id, data]) => ({
        quizId: id,
        title: data.title,
        totalAttempts: data.attempts,
        averageScore: Math.round(data.avgScore / data.attempts),
      }));

      return successResponse(res, {
        class: classData,
        overview: {
          totalStudents: students.length,
          studentsWithAttempts: Object.keys(studentPerformance).length,
          totalAttempts: attempts.length,
          classAverage,
        },
        topPerformers,
        strugglingStudents,
        quizBreakdown,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// HISTORY ENDPOINT
// ============================================

// GET /api/teacher/history - Get teacher's content history
router.get(
  '/history',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { type = 'all', sort = 'date' } = req.query;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Build sort order
      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'title') {
        orderBy = { title: 'asc' };
      } else if (sort === 'class') {
        orderBy = { class: { grade: 'asc' } };
      }

      // Fetch data based on type
      const historyItems: Array<{
        id: string;
        type: string;
        title: string;
        subject: string;
        targetClass: string;
        createdAt: Date;
        status?: string;
      }> = [];

      // Fetch lessons
      if (type === 'all' || type === 'lesson') {
        const lessons = await prisma.lesson.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            subject: { select: { name: true } },
            class: { select: { grade: true, section: true } },
          },
          orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
          take: type === 'all' ? 50 : 100,
        });

        historyItems.push(
          ...lessons.map((l) => ({
            id: l.id,
            type: 'lesson' as const,
            title: l.title || 'Untitled Lesson',
            subject: l.subject?.name || 'Unknown',
            targetClass: l.class ? `Class ${l.class.grade}-${l.class.section}` : 'Unknown',
            createdAt: l.createdAt,
            status: l.status,
          }))
        );
      }

      // Fetch quizzes
      if (type === 'all' || type === 'quiz') {
        const quizzes = await prisma.quiz.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            subject: { select: { name: true } },
            class: { select: { grade: true, section: true } },
          },
          orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
          take: type === 'all' ? 50 : 100,
        });

        historyItems.push(
          ...quizzes.map((q) => ({
            id: q.id,
            type: 'quiz' as const,
            title: q.title || 'Untitled Quiz',
            subject: q.subject?.name || 'Unknown',
            targetClass: q.class ? `Class ${q.class.grade}-${q.class.section}` : 'Unknown',
            createdAt: q.createdAt,
            status: q.status,
          }))
        );
      }

      // Fetch assessments (question papers)
      if (type === 'all' || type === 'assessment') {
        const assessments = await prisma.assessment.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            subject: { select: { name: true } },
            class: { select: { grade: true, section: true } },
          },
          orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
          take: type === 'all' ? 50 : 100,
        });

        historyItems.push(
          ...assessments.map((a) => ({
            id: a.id,
            type: 'assessment' as const,
            title: a.title || 'Untitled Assessment',
            subject: a.subject?.name || 'Unknown',
            targetClass: a.class ? `Class ${a.class.grade}-${a.class.section}` : 'Unknown',
            createdAt: a.createdAt,
            status: a.status,
          }))
        );
      }

      // Fetch announcements
      if (type === 'all' || type === 'announcement') {
        const announcements = await prisma.announcement.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            createdAt: true,
            class: { select: { grade: true, section: true } },
          },
          orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
          take: type === 'all' ? 50 : 100,
        });

        historyItems.push(
          ...announcements.map((a) => ({
            id: a.id,
            type: 'announcement' as const,
            title: a.title || 'Untitled Announcement',
            subject: 'Notice',
            targetClass: a.class ? `Class ${a.class.grade}-${a.class.section}` : 'All Classes',
            createdAt: a.createdAt,
            status: 'published',
          }))
        );
      }

      // Sort combined results
      if (sort === 'date') {
        historyItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sort === 'title') {
        historyItems.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'class') {
        historyItems.sort((a, b) => a.targetClass.localeCompare(b.targetClass));
      }

      return successResponse(res, {
        items: historyItems,
        total: historyItems.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// CONTENT ENDPOINTS
// ============================================

// GET /api/teacher/content/summary - Content by status
router.get(
  '/content/summary',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get counts in parallel
      const [lessonCounts, quizCounts, assessmentCounts, announcementCount] = await Promise.all([
        prisma.lesson.groupBy({
          by: ['status'],
          where: { teacherId: teacher.id },
          _count: true,
        }),
        prisma.quiz.groupBy({
          by: ['status'],
          where: { teacherId: teacher.id },
          _count: true,
        }),
        prisma.assessment.groupBy({
          by: ['status'],
          where: { teacherId: teacher.id },
          _count: true,
        }),
        prisma.announcement.count({ where: { teacherId: teacher.id } }),
      ]);

      return successResponse(res, {
        lessons: {
          draft: lessonCounts.find((l) => l.status === 'draft')?._count || 0,
          saved: lessonCounts.find((l) => l.status === 'saved')?._count || 0,
          published: lessonCounts.find((l) => l.status === 'published')?._count || 0,
          total: lessonCounts.reduce((sum, l) => sum + l._count, 0),
        },
        quizzes: {
          draft: quizCounts.find((q) => q.status === 'draft')?._count || 0,
          saved: quizCounts.find((q) => q.status === 'saved')?._count || 0,
          published: quizCounts.find((q) => q.status === 'published')?._count || 0,
          total: quizCounts.reduce((sum, q) => sum + q._count, 0),
        },
        assessments: {
          draft: assessmentCounts.find((a) => a.status === 'draft')?._count || 0,
          saved: assessmentCounts.find((a) => a.status === 'saved')?._count || 0,
          published: assessmentCounts.find((a) => a.status === 'published')?._count || 0,
          total: assessmentCounts.reduce((sum, a) => sum + a._count, 0),
        },
        announcements: {
          total: announcementCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/subjects - List teacher's assigned subjects
router.get(
  '/subjects',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get assigned subjects
      const assignments = await prisma.teacherSubject.findMany({
        where: { teacherId: teacher.id },
        include: {
          subject: { select: { id: true, name: true } },
        },
      });

      // Get content counts per subject
      const subjectIds = assignments.map((a) => a.subjectId);

      const [lessonCounts, quizCounts] = await Promise.all([
        prisma.lesson.groupBy({
          by: ['subjectId'],
          where: {
            teacherId: teacher.id,
            subjectId: { in: subjectIds },
          },
          _count: true,
        }),
        prisma.quiz.groupBy({
          by: ['subjectId'],
          where: {
            teacherId: teacher.id,
            subjectId: { in: subjectIds },
          },
          _count: true,
        }),
      ]);

      // Map counts to subjects
      const lessonCountMap = new Map(lessonCounts.map((l) => [l.subjectId, l._count]));
      const quizCountMap = new Map(quizCounts.map((q) => [q.subjectId, q._count]));

      return successResponse(res, {
        subjects: assignments.map((a) => ({
          id: a.subject.id,
          name: a.subject.name,
          lessonCount: lessonCountMap.get(a.subjectId) || 0,
          quizCount: quizCountMap.get(a.subjectId) || 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// GET /api/teacher/grades - Get list of grades teacher teaches
router.get(
  '/grades',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get distinct grades from teacher's assigned classes
      const teacherClasses = await prisma.teacherClass.findMany({
        where: { teacherId: teacher.id },
        include: {
          class: { select: { grade: true } },
        },
      });

      const grades = [...new Set(teacherClasses.map((tc) => tc.class.grade))].sort((a, b) => a - b);
      const formattedGrades = grades.map((g) => `${g}th`);

      return successResponse(res, formattedGrades);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/overview - Overall quiz analytics
router.get(
  '/analytics/overview',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get all quizzes by this teacher
      const quizzes = await prisma.quiz.findMany({
        where: { teacherId: teacher.id },
        select: { id: true, classId: true },
      });

      const quizIds = quizzes.map((q) => q.id);
      const classIds = [...new Set(quizzes.map((q) => q.classId))];

      // Get total students in teacher's classes
      const totalStudents = await prisma.student.count({
        where: { classId: { in: classIds } },
      });

      // Get quiz attempts
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          quizId: { in: quizIds },
          status: 'submitted',
        },
        select: {
          studentId: true,
          percentage: true,
        },
      });

      const uniqueStudentsAssessed = new Set(attempts.map((a) => a.studentId)).size;
      const averageScore =
        attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / attempts.length)
          : 0;

      // Calculate completion rate per quiz and average
      let totalCompletionRate = 0;
      for (const quiz of quizzes) {
        const classStudents = await prisma.student.count({ where: { classId: quiz.classId } });
        const quizAttempts = attempts.filter((a) => true).length; // All attempts are for teacher's quizzes
        if (classStudents > 0) {
          const quizSubmissions = await prisma.quizAttempt.count({
            where: { quizId: quiz.id, status: 'submitted' },
          });
          totalCompletionRate += (quizSubmissions / classStudents) * 100;
        }
      }
      const averageCompletionRate = quizzes.length > 0 ? Math.round(totalCompletionRate / quizzes.length) : 0;

      return successResponse(res, {
        totalQuizzes: quizzes.length,
        totalStudentsAssessed: uniqueStudentsAssessed,
        averageCompletionRate,
        overallAverageScore: averageScore,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/class-performance - Section-wise performance for a grade
router.get(
  '/analytics/class-performance',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { grade } = req.query;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Parse grade number from "8th" format
      const gradeNum = parseInt(String(grade).replace(/\D/g, '')) || 8;

      // Get all sections for this grade that teacher teaches
      const teacherClasses = await prisma.teacherClass.findMany({
        where: { teacherId: teacher.id },
        include: {
          class: {
            select: { id: true, section: true, grade: true },
          },
        },
      });

      // Filter to only classes of the requested grade
      const classes = teacherClasses
        .filter((tc) => tc.class && tc.class.grade === gradeNum)
        .map((tc) => tc.class);

      const performance = [];
      for (const cls of classes) {
        if (!cls) continue;
        // Get average quiz score for this class
        const quizzes = await prisma.quiz.findMany({
          where: { teacherId: teacher.id, classId: cls.id },
          select: { id: true },
        });

        const quizIds = quizzes.map((q) => q.id);

        const attempts = await prisma.quizAttempt.findMany({
          where: {
            quizId: { in: quizIds },
            status: 'submitted',
          },
          select: { percentage: true },
        });

        const avgScore =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / attempts.length)
            : 0;

        performance.push({ name: cls.section, score: avgScore });
      }

      // Sort by section name
      performance.sort((a, b) => a.name.localeCompare(b.name));

      return successResponse(res, { performance });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/class-insights - Insights for a specific grade
router.get(
  '/analytics/class-insights',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { grade } = req.query;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const gradeNum = parseInt(String(grade).replace(/\D/g, '')) || 8;

      // Get classes for this grade
      const teacherClasses = await prisma.teacherClass.findMany({
        where: { teacherId: teacher.id },
        include: {
          class: {
            select: { id: true, grade: true },
          },
        },
      });

      // Filter to only classes of the requested grade
      const classIds = teacherClasses
        .filter((tc) => tc.class && tc.class.grade === gradeNum)
        .map((tc) => tc.class!.id);

      // Get quiz performance data
      const quizzes = await prisma.quiz.findMany({
        where: { teacherId: teacher.id, classId: { in: classIds } },
        select: { id: true },
      });

      const quizIds = quizzes.map((q) => q.id);

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: { in: quizIds }, status: 'submitted' },
        select: { percentage: true, submittedAt: true },
        orderBy: { submittedAt: 'desc' },
      });

      // Generate insights based on data
      const insights: string[] = [];

      if (attempts.length === 0) {
        insights.push('No quiz data available yet. Publish quizzes to start tracking performance.');
      } else {
        const avgScore = Math.round(
          attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / attempts.length
        );

        if (avgScore >= 80) {
          insights.push(`Excellent performance with an average score of ${avgScore}%`);
        } else if (avgScore >= 60) {
          insights.push(`Good overall performance with ${avgScore}% average score`);
        } else {
          insights.push(`Average score is ${avgScore}% - students may need additional support`);
        }

        // Check for high performers
        const highPerformers = attempts.filter((a) => Number(a.percentage) >= 90).length;
        if (highPerformers > 0) {
          insights.push(`${highPerformers} students scored above 90% - strong conceptual understanding`);
        }

        // Check for students needing attention
        const lowPerformers = attempts.filter((a) => Number(a.percentage) < 50).length;
        if (lowPerformers > 0) {
          insights.push(`${lowPerformers} students scored below 50% - consider review sessions`);
        }

        insights.push(`Total of ${quizzes.length} quizzes completed with ${attempts.length} submissions`);
      }

      return successResponse(res, {
        grade: String(grade),
        insights: insights.slice(0, 4),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/quiz/:quizId/stats - Stats for a specific quiz
router.get(
  '/analytics/quiz/:quizId/stats',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify quiz ownership
      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Get total students in the quiz's class
      const totalStudents = await prisma.student.count({
        where: { classId: quiz.classId },
      });

      // Get submitted attempts
      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: quizId, status: 'submitted' },
        select: { percentage: true, studentId: true },
      });

      const studentsAssessed = new Set(attempts.map((a) => a.studentId)).size;
      const averageScore =
        attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / attempts.length)
          : 0;
      const completionRate = totalStudents > 0 ? Math.round((studentsAssessed / totalStudents) * 100) : 0;

      return successResponse(res, {
        studentsAssessed,
        totalStudents,
        averageScore,
        completionRate,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/quiz/:quizId/score-distribution - Score distribution histogram
router.get(
  '/analytics/quiz/:quizId/score-distribution',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: quizId, status: 'submitted' },
        select: { percentage: true },
      });

      // Initialize distribution buckets
      const distribution = [
        { range: '0-20%', students: 0 },
        { range: '20-40%', students: 0 },
        { range: '40-50%', students: 0 },
        { range: '50-60%', students: 0 },
        { range: '60-80%', students: 0 },
        { range: '80-100%', students: 0 },
      ];

      // Bucket the scores
      for (const attempt of attempts) {
        const pct = Number(attempt.percentage) || 0;
        if (pct < 20) distribution[0].students++;
        else if (pct < 40) distribution[1].students++;
        else if (pct < 50) distribution[2].students++;
        else if (pct < 60) distribution[3].students++;
        else if (pct < 80) distribution[4].students++;
        else distribution[5].students++;
      }

      return successResponse(res, distribution);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/quiz/:quizId/students - Student performance list
router.get(
  '/analytics/quiz/:quizId/students',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: quizId, status: 'submitted' },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { percentage: 'desc' },
      });

      const students = attempts.map((attempt) => ({
        id: attempt.studentId,
        name: attempt.student.user.name,
        score: Math.round(Number(attempt.percentage) || 0),
        status: (Number(attempt.percentage) || 0) >= 70 ? 'Good' : 'Needs Attention',
        trend: '→', // Static for now - could be enhanced to compare with previous quizzes
      }));

      return successResponse(res, students);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/quiz/:quizId/top-missed-questions - Most missed questions
router.get(
  '/analytics/quiz/:quizId/top-missed-questions',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      // Get all questions for this quiz
      const questions = await prisma.question.findMany({
        where: { quizId: quizId },
        include: {
          options: true,
        },
        orderBy: { orderIndex: 'asc' },
      });

      // Get all student answers for this quiz
      const studentAnswers = await prisma.studentAnswer.findMany({
        where: {
          question: { quizId: quizId },
        },
        include: {
          selectedOption: true,
        },
      });

      // Calculate incorrect rate per question
      const questionStats = questions.map((q, idx) => {
        const answers = studentAnswers.filter((sa) => sa.questionId === q.id);
        const totalAnswers = answers.length;
        const incorrectAnswers = answers.filter((a) => !a.isCorrect).length;
        const incorrectPercentage = totalAnswers > 0 ? Math.round((incorrectAnswers / totalAnswers) * 100) : 0;

        // Find most chosen wrong answer
        const wrongAnswerCounts: Record<string, number> = {};
        answers
          .filter((a) => !a.isCorrect && a.selectedOptionId)
          .forEach((a) => {
            wrongAnswerCounts[a.selectedOptionId!] = (wrongAnswerCounts[a.selectedOptionId!] || 0) + 1;
          });

        const mostChosenWrongId = Object.entries(wrongAnswerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const mostChosenOption = q.options.find((o) => o.id === mostChosenWrongId);

        // Build options with percentages
        const optionPercentages = q.options.map((opt) => {
          const timesChosen = answers.filter((a) => a.selectedOptionId === opt.id).length;
          return {
            text: `${opt.optionLabel}) ${opt.optionText}`,
            percentage: totalAnswers > 0 ? Math.round((timesChosen / totalAnswers) * 100) : 0,
          };
        });

        return {
          id: q.id,
          number: `Q${idx + 1}`,
          title: q.questionText.slice(0, 50) + (q.questionText.length > 50 ? '...' : ''),
          percentage: incorrectPercentage,
          question: q.questionText,
          options: optionPercentages,
          mostChosenAnswer: mostChosenOption ? `Most chose: ${mostChosenOption.optionLabel}` : undefined,
        };
      });

      // Sort by incorrect percentage descending and take top 5
      const topMissed = questionStats.sort((a, b) => b.percentage - a.percentage).slice(0, 5);

      return successResponse(res, topMissed);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/quiz/:quizId/insights - Quiz performance insights
router.get(
  '/analytics/quiz/:quizId/insights',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: quizId, status: 'submitted' },
        select: { percentage: true },
      });

      const insights: string[] = [];

      if (attempts.length === 0) {
        insights.push('No submissions yet. Students are yet to complete this quiz.');
        return successResponse(res, { insights });
      }

      const avgScore = Math.round(
        attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / attempts.length
      );

      // Performance level insight
      if (avgScore >= 85) {
        insights.push('Students performed exceptionally well on this quiz');
      } else if (avgScore >= 70) {
        insights.push('Good overall performance - most students understood the material');
      } else if (avgScore >= 50) {
        insights.push('Mixed results - some topics may need reinforcement');
      } else {
        insights.push('Many students struggled - consider a review session');
      }

      // Distribution insights
      const highPerformers = attempts.filter((a) => Number(a.percentage) >= 90).length;
      const lowPerformers = attempts.filter((a) => Number(a.percentage) < 50).length;

      if (highPerformers > 0) {
        insights.push(`${highPerformers} student${highPerformers > 1 ? 's' : ''} scored above 90%`);
      }

      if (lowPerformers > 0) {
        insights.push(`${lowPerformers} student${lowPerformers > 1 ? 's' : ''} need additional support (below 50%)`);
      }

      // Completion insight
      const totalStudents = await prisma.student.count({ where: { classId: quiz.classId } });
      const completionRate = Math.round((attempts.length / totalStudents) * 100);
      insights.push(`${completionRate}% of the class has completed this quiz`);

      return successResponse(res, { insights: insights.slice(0, 4) });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teacher/analytics/quiz/:quizId/recommendations - Action recommendations
router.get(
  '/analytics/quiz/:quizId/recommendations',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId as string;

      const teacher = await getTeacher(userId);
      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const quiz = await verifyQuizOwnership(teacher.id, quizId);
      if (!quiz) {
        return notFoundResponse(res, 'Quiz not found');
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId: quizId, status: 'submitted' },
        select: { percentage: true },
      });

      const recommendations: string[] = [];

      if (attempts.length === 0) {
        recommendations.push('Send a reminder to students to complete the quiz');
        recommendations.push('Consider setting a deadline to encourage participation');
        return successResponse(res, { recommendations });
      }

      const avgScore = Math.round(
        attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / attempts.length
      );

      // Get questions with high miss rates
      const studentAnswers = await prisma.studentAnswer.findMany({
        where: { question: { quizId: quizId } },
        include: { question: true },
      });

      const questionMissRates: Record<string, { total: number; wrong: number }> = {};
      studentAnswers.forEach((sa) => {
        if (!questionMissRates[sa.questionId]) {
          questionMissRates[sa.questionId] = { total: 0, wrong: 0 };
        }
        questionMissRates[sa.questionId].total++;
        if (!sa.isCorrect) questionMissRates[sa.questionId].wrong++;
      });

      const highMissQuestions = Object.entries(questionMissRates).filter(
        ([, stats]) => stats.total > 0 && stats.wrong / stats.total > 0.4
      ).length;

      if (highMissQuestions > 0) {
        recommendations.push(`Conduct a review session for ${highMissQuestions} questions with >40% incorrect rate`);
      }

      if (avgScore < 60) {
        recommendations.push('Schedule additional practice sessions on this topic');
        recommendations.push('Create a simpler follow-up quiz to build confidence');
      }

      const lowPerformers = attempts.filter((a) => Number(a.percentage) < 70).length;
      if (lowPerformers > 0) {
        recommendations.push(`Consider one-on-one support for ${lowPerformers} students scoring below 70%`);
      }

      const totalStudents = await prisma.student.count({ where: { classId: quiz.classId } });
      const notCompleted = totalStudents - attempts.length;
      if (notCompleted > 0) {
        recommendations.push(`Send reminder to ${notCompleted} students who haven't completed the quiz`);
      }

      if (avgScore >= 80) {
        recommendations.push('Students are ready - consider advancing to more challenging topics');
      }

      return successResponse(res, { recommendations: recommendations.slice(0, 4) });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
