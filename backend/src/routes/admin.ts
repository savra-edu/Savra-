import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  adminTeacherQuerySchema,
  adminStudentQuerySchema,
  adminClassQuerySchema,
  createTeacherSchema,
  updateTeacherSchema,
  assignSubjectsSchema,
  assignClassesSchema,
  createStudentSchema,
  updateStudentSchema,
  transferStudentSchema,
  createClassSchema,
  updateClassSchema,
  updateSchoolSchema,
} from '../schemas/admin';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

const router = Router();

// Helper to get admin info with schoolId
const getAdmin = async (userId: string) => {
  return prisma.admin.findUnique({
    where: { userId },
    select: { id: true, schoolId: true },
  });
};

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

// GET /api/admin/dashboard/stats - Get school dashboard statistics
router.get(
  '/dashboard/stats',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Get all teachers in school for content queries
      const schoolTeachers = await prisma.teacher.findMany({
        where: { schoolId: admin.schoolId },
        select: { id: true },
      });
      const teacherIds = schoolTeachers.map((t) => t.id);

      // Get counts in parallel
      const [
        totalTeachers,
        totalStudents,
        totalClasses,
        classStats,
        totalLessons,
        totalAssessments,
        totalQuizzes,
        quizAttemptStats,
      ] = await Promise.all([
        // Count teachers in school
        prisma.teacher.count({
          where: { schoolId: admin.schoolId },
        }),
        // Count students in school (via class)
        prisma.student.count({
          where: { class: { schoolId: admin.schoolId } },
        }),
        // Count classes in school
        prisma.class.count({
          where: { schoolId: admin.schoolId },
        }),
        // Get students per class
        prisma.class.findMany({
          where: { schoolId: admin.schoolId },
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            _count: { select: { students: true } },
          },
          orderBy: [{ grade: 'asc' }, { section: 'asc' }],
        }),
        // Count lessons created by teachers in this school
        prisma.lesson.count({
          where: { teacherId: { in: teacherIds } },
        }),
        // Count assessments created by teachers in this school
        prisma.assessment.count({
          where: { teacherId: { in: teacherIds } },
        }),
        // Count quizzes created by teachers in this school
        prisma.quiz.count({
          where: { teacherId: { in: teacherIds } },
        }),
        // Get quiz attempt stats for submission rate
        prisma.quizAttempt.aggregate({
          where: {
            quiz: { teacherId: { in: teacherIds } },
          },
          _count: { id: true },
          _avg: { score: true },
        }),
      ]);

      // Calculate submission rate (percentage of students who attempted quizzes)
      const submissionRate = totalStudents > 0 && totalQuizzes > 0
        ? Math.round((quizAttemptStats._count.id / (totalStudents * totalQuizzes)) * 100)
        : 0;

      // Get teacher workload (classes and subjects per teacher)
      const teacherWorkload = await prisma.teacher.findMany({
        where: { schoolId: admin.schoolId },
        select: {
          id: true,
          user: { select: { name: true } },
          _count: {
            select: {
              classes: true,
              subjects: true,
            },
          },
        },
        orderBy: { user: { name: 'asc' } },
      });

      return successResponse(res, {
        totalTeachers,
        totalStudents,
        totalClasses,
        totalLessons,
        totalAssessments,
        totalQuizzes,
        submissionRate: Math.min(submissionRate, 100), // Cap at 100%
        studentsPerClass: classStats.map((c) => ({
          id: c.id,
          name: c.name,
          grade: c.grade,
          section: c.section,
          studentCount: c._count.students,
        })),
        teacherWorkload: teacherWorkload.map((t) => ({
          id: t.id,
          name: t.user.name,
          classCount: t._count.classes,
          subjectCount: t._count.subjects,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/dashboard/activity - Get content creation activity by time period
router.get(
  '/dashboard/activity',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const period = (req.query.period as string) || 'week';

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Get all teachers in the school
      const teachers = await prisma.teacher.findMany({
        where: { schoolId: admin.schoolId },
        select: { id: true },
      });
      const teacherIds = teachers.map((t) => t.id);

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      let groupByFormat: 'day' | 'week' | 'month';

      if (period === 'week') {
        // Start from beginning of current week (Sunday)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        groupByFormat = 'day';
      } else if (period === 'month') {
        // Start from beginning of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupByFormat = 'week';
      } else {
        // Year - last 6 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        groupByFormat = 'month';
      }

      // Fetch all content created after startDate
      const [lessons, quizzes, assessments] = await Promise.all([
        prisma.lesson.findMany({
          where: {
            teacherId: { in: teacherIds },
            createdAt: { gte: startDate },
          },
          select: { createdAt: true },
        }),
        prisma.quiz.findMany({
          where: {
            teacherId: { in: teacherIds },
            createdAt: { gte: startDate },
          },
          select: { createdAt: true },
        }),
        prisma.assessment.findMany({
          where: {
            teacherId: { in: teacherIds },
            createdAt: { gte: startDate },
          },
          select: { createdAt: true },
        }),
      ]);

      // Group data based on period
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const aggregateByKey = (items: { createdAt: Date }[], getKey: (date: Date) => string) => {
        const counts = new Map<string, number>();
        for (const item of items) {
          const key = getKey(new Date(item.createdAt));
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        return counts;
      };

      let data: Array<{ day: string; lessons: number; quizzes: number; assessments: number }> = [];

      if (groupByFormat === 'day') {
        // Weekly view - group by day of week
        const lessonCounts = aggregateByKey(lessons, (d) => dayNames[d.getDay()]);
        const quizCounts = aggregateByKey(quizzes, (d) => dayNames[d.getDay()]);
        const assessmentCounts = aggregateByKey(assessments, (d) => dayNames[d.getDay()]);

        data = dayNames.map((day) => ({
          day,
          lessons: lessonCounts.get(day) || 0,
          quizzes: quizCounts.get(day) || 0,
          assessments: assessmentCounts.get(day) || 0,
        }));
      } else if (groupByFormat === 'week') {
        // Monthly view - group by week of month
        const getWeekOfMonth = (date: Date) => {
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
        };

        const lessonCounts = aggregateByKey(lessons, (d) => `W${getWeekOfMonth(d)}`);
        const quizCounts = aggregateByKey(quizzes, (d) => `W${getWeekOfMonth(d)}`);
        const assessmentCounts = aggregateByKey(assessments, (d) => `W${getWeekOfMonth(d)}`);

        for (let w = 1; w <= 5; w++) {
          const key = `W${w}`;
          if (lessonCounts.has(key) || quizCounts.has(key) || assessmentCounts.has(key)) {
            data.push({
              day: key,
              lessons: lessonCounts.get(key) || 0,
              quizzes: quizCounts.get(key) || 0,
              assessments: assessmentCounts.get(key) || 0,
            });
          }
        }

        // If no data, show all 4 weeks with zeros
        if (data.length === 0) {
          data = ['W1', 'W2', 'W3', 'W4'].map((w) => ({
            day: w,
            lessons: 0,
            quizzes: 0,
            assessments: 0,
          }));
        }
      } else {
        // Yearly view - group by month (last 6 months)
        const lessonCounts = aggregateByKey(lessons, (d) => monthNames[d.getMonth()]);
        const quizCounts = aggregateByKey(quizzes, (d) => monthNames[d.getMonth()]);
        const assessmentCounts = aggregateByKey(assessments, (d) => monthNames[d.getMonth()]);

        // Get last 6 months in order
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = monthNames[date.getMonth()];
          data.push({
            day: month,
            lessons: lessonCounts.get(month) || 0,
            quizzes: quizCounts.get(month) || 0,
            assessments: assessmentCounts.get(month) || 0,
          });
        }
      }

      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// SCHOOL ENDPOINTS
// ============================================

// GET /api/admin/school - Get admin's school details
router.get(
  '/school',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const school = await prisma.school.findUnique({
        where: { id: admin.schoolId },
        include: {
          _count: {
            select: {
              teachers: true,
              classes: true,
            },
          },
        },
      });

      if (!school) {
        return notFoundResponse(res, 'School not found');
      }

      // Get student count (students belong to classes, not directly to school)
      const studentCount = await prisma.student.count({
        where: { class: { schoolId: admin.schoolId } },
      });

      return successResponse(res, {
        id: school.id,
        name: school.name,
        code: school.code,
        createdAt: school.createdAt,
        teacherCount: school._count.teachers,
        classCount: school._count.classes,
        studentCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/school - Update school info
router.put(
  '/school',
  authMiddleware,
  authorize('admin'),
  validate(updateSchoolSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, code } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // If updating code, check for uniqueness
      if (code) {
        const existingSchool = await prisma.school.findFirst({
          where: {
            code,
            id: { not: admin.schoolId },
          },
        });
        if (existingSchool) {
          return errorResponse(res, 'School code already exists', 400, 'DUPLICATE_CODE');
        }
      }

      const school = await prisma.school.update({
        where: { id: admin.schoolId },
        data: {
          ...(name && { name }),
          ...(code && { code }),
        },
      });

      return successResponse(res, {
        id: school.id,
        name: school.name,
        code: school.code,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// TEACHER ENDPOINTS
// ============================================

// GET /api/admin/teachers - List all teachers in school
router.get(
  '/teachers',
  authMiddleware,
  authorize('admin'),
  validateQuery(adminTeacherQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const skip = (page - 1) * limit;

      const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
          where: { schoolId: admin.schoolId },
          include: {
            user: { select: { id: true, name: true, email: true } },
            subjects: { include: { subject: { select: { id: true, name: true } } } },
            classes: { include: { class: { select: { id: true, name: true, grade: true, section: true } } } },
            _count: {
              select: {
                lessons: true,
                quizzes: true,
                assessments: true,
              },
            },
          },
          orderBy: sortBy === 'name' ? { user: { name: sortOrder } } : { createdAt: sortOrder },
          skip,
          take: limit,
        }),
        prisma.teacher.count({ where: { schoolId: admin.schoolId } }),
      ]);

      return res.json({
        success: true,
        data: teachers.map((t) => ({
          id: t.id,
          userId: t.user.id,
          name: t.user.name,
          email: t.user.email,
          location: t.location,
          subjects: t.subjects.map((s) => s.subject),
          classes: t.classes.map((c) => c.class),
          lessonCount: t._count.lessons,
          quizCount: t._count.quizzes,
          assessmentCount: t._count.assessments,
          createdAt: t.createdAt,
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

// GET /api/admin/teachers/:id - Get teacher details
router.get(
  '/teachers/:id',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const teacherId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId: admin.schoolId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          subjects: { include: { subject: { select: { id: true, name: true } } } },
          classes: {
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
          },
        },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher not found');
      }

      return successResponse(res, {
        id: teacher.id,
        userId: teacher.user.id,
        name: teacher.user.name,
        email: teacher.user.email,
        location: teacher.location,
        subjects: teacher.subjects.map((s) => s.subject),
        classes: teacher.classes.map((c) => ({
          id: c.class.id,
          name: c.class.name,
          grade: c.class.grade,
          section: c.class.section,
          studentCount: c.class._count.students,
        })),
        createdAt: teacher.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/teachers - Create a new teacher
router.post(
  '/teachers',
  authMiddleware,
  authorize('admin'),
  validate(createTeacherSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, email, password, location } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return errorResponse(res, 'Email already in use', 400, 'DUPLICATE_EMAIL');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user and teacher in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role: 'teacher',
          },
        });

        const teacher = await tx.teacher.create({
          data: {
            userId: user.id,
            schoolId: admin.schoolId,
            location: location || null,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        });

        return teacher;
      });

      return successResponse(
        res,
        {
          id: result.id,
          userId: result.user.id,
          name: result.user.name,
          email: result.user.email,
          location: result.location,
          createdAt: result.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/teachers/:id - Update teacher info
router.put(
  '/teachers/:id',
  authMiddleware,
  authorize('admin'),
  validate(updateTeacherSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const teacherId = req.params.id as string;
      const { name, location } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify teacher belongs to admin's school
      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId: admin.schoolId },
        include: { user: true },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher not found');
      }

      // Update in transaction with extended timeout
      const result = await prisma.$transaction(
        async (tx) => {
          // Update user name if provided
          if (name) {
            await tx.user.update({
              where: { id: teacher.userId },
              data: { name },
            });
          }

          // Update teacher location if provided
          const updatedTeacher = await tx.teacher.update({
            where: { id: teacherId },
            data: {
              ...(location !== undefined && { location }),
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
              subjects: { include: { subject: { select: { id: true, name: true } } } },
              classes: { include: { class: { select: { id: true, name: true, grade: true, section: true } } } },
            },
          });

          return updatedTeacher;
        },
        { timeout: 15000 }
      );

      return successResponse(res, {
        id: result.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        location: result.location,
        subjects: result.subjects.map((s) => s.subject),
        classes: result.classes.map((c) => c.class),
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/teachers/:id - Delete teacher
router.delete(
  '/teachers/:id',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const teacherId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify teacher belongs to admin's school
      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId: admin.schoolId },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher not found');
      }

      // Delete teacher and user in transaction
      await prisma.$transaction(async (tx) => {
        // Delete teacher first (this will cascade to related records)
        await tx.teacher.delete({ where: { id: teacherId } });
        // Delete user
        await tx.user.delete({ where: { id: teacher.userId } });
      });

      return successResponse(res, { message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/admin/teachers/:id/subjects - Assign subjects to teacher
router.patch(
  '/teachers/:id/subjects',
  authMiddleware,
  authorize('admin'),
  validate(assignSubjectsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const teacherId = req.params.id as string;
      const { subjectIds } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify teacher belongs to admin's school
      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId: admin.schoolId },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher not found');
      }

      // Verify all subjects exist
      if (subjectIds.length > 0) {
        const subjects = await prisma.subject.findMany({
          where: { id: { in: subjectIds } },
        });
        if (subjects.length !== subjectIds.length) {
          return errorResponse(res, 'One or more subjects not found', 400, 'INVALID_SUBJECTS');
        }
      }

      // Update teacher's subjects in transaction (delete all then create new)
      await prisma.$transaction(async (tx) => {
        // Delete existing assignments
        await tx.teacherSubject.deleteMany({ where: { teacherId } });
        // Create new assignments
        if (subjectIds.length > 0) {
          await tx.teacherSubject.createMany({
            data: subjectIds.map((subjectId: string) => ({ teacherId, subjectId })),
          });
        }
      });

      // Fetch updated teacher
      const updatedTeacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          subjects: { include: { subject: { select: { id: true, name: true } } } },
          classes: { include: { class: { select: { id: true, name: true, grade: true, section: true } } } },
        },
      });

      return successResponse(res, {
        id: updatedTeacher!.id,
        name: updatedTeacher!.user.name,
        subjects: updatedTeacher!.subjects.map((s) => s.subject),
        classes: updatedTeacher!.classes.map((c) => c.class),
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/admin/teachers/:id/classes - Assign classes to teacher
router.patch(
  '/teachers/:id/classes',
  authMiddleware,
  authorize('admin'),
  validate(assignClassesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const teacherId = req.params.id as string;
      const { classIds } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify teacher belongs to admin's school
      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId: admin.schoolId },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher not found');
      }

      // Verify all classes belong to admin's school
      if (classIds.length > 0) {
        const classes = await prisma.class.findMany({
          where: { id: { in: classIds }, schoolId: admin.schoolId },
        });
        if (classes.length !== classIds.length) {
          return errorResponse(
            res,
            'One or more classes not found or do not belong to your school',
            400,
            'INVALID_CLASSES'
          );
        }
      }

      // Update teacher's classes in transaction (delete all then create new)
      await prisma.$transaction(async (tx) => {
        // Delete existing assignments
        await tx.teacherClass.deleteMany({ where: { teacherId } });
        // Create new assignments
        if (classIds.length > 0) {
          await tx.teacherClass.createMany({
            data: classIds.map((classId: string) => ({ teacherId, classId })),
          });
        }
      });

      // Fetch updated teacher
      const updatedTeacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          subjects: { include: { subject: { select: { id: true, name: true } } } },
          classes: { include: { class: { select: { id: true, name: true, grade: true, section: true } } } },
        },
      });

      return successResponse(res, {
        id: updatedTeacher!.id,
        name: updatedTeacher!.user.name,
        subjects: updatedTeacher!.subjects.map((s) => s.subject),
        classes: updatedTeacher!.classes.map((c) => c.class),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// STUDENT ENDPOINTS
// ============================================

// GET /api/admin/students - List all students in school
router.get(
  '/students',
  authMiddleware,
  authorize('admin'),
  validateQuery(adminStudentQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const {
        classId,
        grade,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as any;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        class: { schoolId: admin.schoolId },
      };

      if (classId) {
        where.classId = classId;
      }

      if (grade) {
        where.class = { ...where.class, grade };
      }

      // Determine sort order
      let orderBy: any;
      if (sortBy === 'name') {
        orderBy = { user: { name: sortOrder } };
      } else if (sortBy === 'rollNumber') {
        orderBy = { rollNumber: sortOrder };
      } else {
        orderBy = { createdAt: sortOrder };
      }

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: { select: { id: true, name: true, grade: true, section: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.student.count({ where }),
      ]);

      return res.json({
        success: true,
        data: students.map((s) => ({
          id: s.id,
          userId: s.user.id,
          name: s.user.name,
          email: s.user.email,
          rollNumber: s.rollNumber,
          totalPoints: s.totalPoints,
          class: s.class,
          createdAt: s.createdAt,
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

// GET /api/admin/students/:id - Get student details
router.get(
  '/students/:id',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          class: { schoolId: admin.schoolId },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: { select: { id: true, name: true, grade: true, section: true } },
          quizAttempts: {
            select: {
              id: true,
              score: true,
              totalMarks: true,
              submittedAt: true,
              quiz: { select: { id: true, title: true } },
            },
            orderBy: { submittedAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student not found');
      }

      // Calculate quiz performance summary
      const completedAttempts = student.quizAttempts.filter((a) => a.submittedAt);
      const avgScore =
        completedAttempts.length > 0
          ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
          : 0;

      return successResponse(res, {
        id: student.id,
        userId: student.user.id,
        name: student.user.name,
        email: student.user.email,
        rollNumber: student.rollNumber,
        totalPoints: student.totalPoints,
        class: student.class,
        quizPerformance: {
          totalAttempts: completedAttempts.length,
          averageScore: Math.round(avgScore * 100) / 100,
          recentAttempts: student.quizAttempts.map((a) => ({
            id: a.id,
            quizTitle: a.quiz.title,
            score: a.score,
            totalMarks: a.totalMarks,
            submittedAt: a.submittedAt,
          })),
        },
        createdAt: student.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/students - Create a new student
router.post(
  '/students',
  authMiddleware,
  authorize('admin'),
  validate(createStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, email, password, classId, rollNumber } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return errorResponse(res, 'Email already in use', 400, 'DUPLICATE_EMAIL');
      }

      // Verify class belongs to admin's school
      const classExists = await prisma.class.findFirst({
        where: { id: classId, schoolId: admin.schoolId },
      });
      if (!classExists) {
        return errorResponse(res, 'Class not found or does not belong to your school', 400, 'INVALID_CLASS');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user and student in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role: 'student',
          },
        });

        const student = await tx.student.create({
          data: {
            userId: user.id,
            classId,
            rollNumber: rollNumber || null,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: { select: { id: true, name: true, grade: true, section: true } },
          },
        });

        return student;
      });

      return successResponse(
        res,
        {
          id: result.id,
          userId: result.user.id,
          name: result.user.name,
          email: result.user.email,
          rollNumber: result.rollNumber,
          totalPoints: result.totalPoints,
          class: result.class,
          createdAt: result.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/students/:id - Update student info
router.put(
  '/students/:id',
  authMiddleware,
  authorize('admin'),
  validate(updateStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.id as string;
      const { name, rollNumber } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify student belongs to admin's school
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          class: { schoolId: admin.schoolId },
        },
        include: { user: true },
      });

      if (!student) {
        return notFoundResponse(res, 'Student not found');
      }

      // Update in transaction with extended timeout
      const result = await prisma.$transaction(
        async (tx) => {
          // Update user name if provided
          if (name) {
            await tx.user.update({
              where: { id: student.userId },
              data: { name },
            });
          }

          // Update student roll number if provided
          const updatedStudent = await tx.student.update({
            where: { id: studentId },
            data: {
              ...(rollNumber !== undefined && { rollNumber }),
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
              class: { select: { id: true, name: true, grade: true, section: true } },
            },
          });

          return updatedStudent;
        },
        { timeout: 15000 }
      );

      return successResponse(res, {
        id: result.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        rollNumber: result.rollNumber,
        totalPoints: result.totalPoints,
        class: result.class,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/admin/students/:id/class - Transfer student to different class
router.patch(
  '/students/:id/class',
  authMiddleware,
  authorize('admin'),
  validate(transferStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.id as string;
      const { classId } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify student belongs to admin's school
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          class: { schoolId: admin.schoolId },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student not found');
      }

      // Verify new class belongs to admin's school
      const newClass = await prisma.class.findFirst({
        where: { id: classId, schoolId: admin.schoolId },
      });

      if (!newClass) {
        return errorResponse(res, 'Target class not found or does not belong to your school', 400, 'INVALID_CLASS');
      }

      // Transfer student
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: { classId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: { select: { id: true, name: true, grade: true, section: true } },
        },
      });

      return successResponse(res, {
        id: updatedStudent.id,
        userId: updatedStudent.user.id,
        name: updatedStudent.user.name,
        email: updatedStudent.user.email,
        rollNumber: updatedStudent.rollNumber,
        totalPoints: updatedStudent.totalPoints,
        class: updatedStudent.class,
        message: 'Student transferred successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/students/:id - Delete student
router.delete(
  '/students/:id',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify student belongs to admin's school
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          class: { schoolId: admin.schoolId },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student not found');
      }

      // Delete student and user in transaction
      await prisma.$transaction(async (tx) => {
        // Delete student first (this will cascade to related records)
        await tx.student.delete({ where: { id: studentId } });
        // Delete user
        await tx.user.delete({ where: { id: student.userId } });
      });

      return successResponse(res, { message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// CLASS ENDPOINTS
// ============================================

// GET /api/admin/classes - List all classes in school
router.get(
  '/classes',
  authMiddleware,
  authorize('admin'),
  validateQuery(adminClassQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { grade, page = 1, limit = 20 } = req.query as any;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { schoolId: admin.schoolId };
      if (grade) {
        where.grade = grade;
      }

      const [classes, total] = await Promise.all([
        prisma.class.findMany({
          where,
          include: {
            _count: {
              select: {
                students: true,
                teachers: true,
              },
            },
            students: {
              select: { id: true },
            },
          },
          orderBy: [{ grade: 'asc' }, { section: 'asc' }],
          skip,
          take: limit,
        }),
        prisma.class.count({ where }),
      ]);

      // Calculate average scores for each class
      const classAverages = new Map<string, number>();

      for (const c of classes) {
        if (c.students.length === 0) {
          classAverages.set(c.id, 0);
          continue;
        }

        const studentIds = c.students.map((s) => s.id);
        const attempts = await prisma.quizAttempt.findMany({
          where: {
            studentId: { in: studentIds },
            status: { in: ['submitted', 'graded'] },
          },
          select: { score: true, totalMarks: true },
        });

        if (attempts.length === 0) {
          classAverages.set(c.id, 0);
          continue;
        }

        const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const totalMarks = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
        const avg = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
        classAverages.set(c.id, Math.round(avg * 10) / 10);
      }

      return res.json({
        success: true,
        data: classes.map((c) => ({
          id: c.id,
          name: c.name,
          grade: c.grade,
          section: c.section,
          studentCount: c._count.students,
          teacherCount: c._count.teachers,
          averageScore: classAverages.get(c.id) || 0,
          createdAt: c.createdAt,
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

// GET /api/admin/classes/:id - Get class details
router.get(
  '/classes/:id',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const classId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      const classData = await prisma.class.findFirst({
        where: { id: classId, schoolId: admin.schoolId },
        include: {
          students: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { rollNumber: 'asc' },
          },
          teachers: {
            include: {
              teacher: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
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
        studentCount: classData.students.length,
        teacherCount: classData.teachers.length,
        students: classData.students.map((s) => ({
          id: s.id,
          userId: s.user.id,
          name: s.user.name,
          email: s.user.email,
          rollNumber: s.rollNumber,
          totalPoints: s.totalPoints,
        })),
        teachers: classData.teachers.map((t) => ({
          id: t.teacher.id,
          userId: t.teacher.user.id,
          name: t.teacher.user.name,
          email: t.teacher.user.email,
          location: t.teacher.location,
        })),
        createdAt: classData.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/classes - Create a new class
router.post(
  '/classes',
  authMiddleware,
  authorize('admin'),
  validate(createClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { grade, section, name } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Check for duplicate grade+section in school
      const existingClass = await prisma.class.findFirst({
        where: {
          schoolId: admin.schoolId,
          grade,
          section,
        },
      });

      if (existingClass) {
        return errorResponse(
          res,
          `Class for Grade ${grade} Section ${section} already exists`,
          400,
          'DUPLICATE_CLASS'
        );
      }

      const newClass = await prisma.class.create({
        data: {
          schoolId: admin.schoolId,
          grade,
          section,
          name,
        },
      });

      return successResponse(
        res,
        {
          id: newClass.id,
          name: newClass.name,
          grade: newClass.grade,
          section: newClass.section,
          createdAt: newClass.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/classes/:id - Update class info
router.put(
  '/classes/:id',
  authMiddleware,
  authorize('admin'),
  validate(updateClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const classId = req.params.id as string;
      const { grade, section, name } = req.body;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify class belongs to admin's school
      const existingClass = await prisma.class.findFirst({
        where: { id: classId, schoolId: admin.schoolId },
      });

      if (!existingClass) {
        return notFoundResponse(res, 'Class not found');
      }

      // If updating grade or section, check for duplicates
      if (grade !== undefined || section !== undefined) {
        const newGrade = grade !== undefined ? grade : existingClass.grade;
        const newSection = section !== undefined ? section : existingClass.section;

        const duplicateClass = await prisma.class.findFirst({
          where: {
            schoolId: admin.schoolId,
            grade: newGrade,
            section: newSection,
            id: { not: classId },
          },
        });

        if (duplicateClass) {
          return errorResponse(
            res,
            `Class for Grade ${newGrade} Section ${newSection} already exists`,
            400,
            'DUPLICATE_CLASS'
          );
        }
      }

      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
          ...(grade !== undefined && { grade }),
          ...(section !== undefined && { section }),
          ...(name !== undefined && { name }),
        },
        include: {
          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
      });

      return successResponse(res, {
        id: updatedClass.id,
        name: updatedClass.name,
        grade: updatedClass.grade,
        section: updatedClass.section,
        studentCount: updatedClass._count.students,
        teacherCount: updatedClass._count.teachers,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// INSIGHTS & ANALYTICS ENDPOINTS
// ============================================

// GET /api/admin/teachers/:id/insights - Get detailed teacher activity insights
router.get(
  '/teachers/:id/insights',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const teacherId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Get teacher with details
      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId: admin.schoolId },
        include: {
          user: { select: { id: true, name: true, email: true, createdAt: true } },
          subjects: { include: { subject: { select: { id: true, name: true } } } },
          classes: { include: { class: { select: { id: true, name: true, grade: true, section: true } } } },
        },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher not found');
      }

      // Get content counts
      const [lessonCount, quizCount, assessmentCount, announcementCount] = await Promise.all([
        prisma.lesson.count({ where: { teacherId } }),
        prisma.quiz.count({ where: { teacherId } }),
        prisma.assessment.count({ where: { teacherId } }),
        prisma.announcement.count({ where: { teacherId } }),
      ]);

      // Get content by status
      const [lessonsByStatus, quizzesByStatus] = await Promise.all([
        prisma.lesson.groupBy({
          by: ['status'],
          where: { teacherId },
          _count: { id: true },
        }),
        prisma.quiz.groupBy({
          by: ['status'],
          where: { teacherId },
          _count: { id: true },
        }),
      ]);

      // Get recent activity
      const [recentLessons, recentQuizzes] = await Promise.all([
        prisma.lesson.findMany({
          where: { teacherId },
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.quiz.findMany({
          where: { teacherId },
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      // Get student engagement stats
      const teacherClassIds = teacher.classes.map((tc) => tc.class.id);
      const [totalStudents, quizAttempts] = await Promise.all([
        prisma.student.count({
          where: { classId: { in: teacherClassIds } },
        }),
        prisma.quizAttempt.findMany({
          where: {
            quiz: { teacherId },
            status: { in: ['submitted', 'graded'] },
          },
          select: { score: true, totalMarks: true },
        }),
      ]);

      const totalScore = quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = quizAttempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
      const avgScore = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

      return successResponse(res, {
        teacher: {
          id: teacher.id,
          userId: teacher.user.id,
          name: teacher.user.name,
          email: teacher.user.email,
          location: teacher.location,
          joinedAt: teacher.user.createdAt,
          subjects: teacher.subjects.map((ts) => ts.subject),
          classes: teacher.classes.map((tc) => tc.class),
        },
        contentStats: {
          lessons: {
            total: lessonCount,
            byStatus: lessonsByStatus.reduce(
              (acc, item) => ({ ...acc, [item.status]: item._count.id }),
              {} as Record<string, number>
            ),
          },
          quizzes: {
            total: quizCount,
            byStatus: quizzesByStatus.reduce(
              (acc, item) => ({ ...acc, [item.status]: item._count.id }),
              {} as Record<string, number>
            ),
          },
          assessments: assessmentCount,
          announcements: announcementCount,
        },
        recentActivity: {
          lessons: recentLessons,
          quizzes: recentQuizzes,
        },
        studentEngagement: {
          totalStudents,
          totalQuizAttempts: quizAttempts.length,
          averageScore: Math.round(avgScore * 100) / 100,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/classes/:id/performance - Get class performance analytics
router.get(
  '/classes/:id/performance',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const classId = req.params.id as string;

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      // Verify class belongs to admin's school
      const classData = await prisma.class.findFirst({
        where: { id: classId, schoolId: admin.schoolId },
        include: {
          students: {
            select: {
              id: true,
              totalPoints: true,
              user: { select: { name: true } },
            },
          },
        },
      });

      if (!classData) {
        return notFoundResponse(res, 'Class not found');
      }

      // Get all quiz attempts for students in this class
      const studentIds = classData.students.map((s) => s.id);
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          studentId: { in: studentIds },
          status: { in: ['submitted', 'graded'] },
        },
        include: {
          student: {
            select: {
              id: true,
              user: { select: { name: true } },
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              subject: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Calculate class average
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalMarks = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
      const classAverage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

      // Calculate participation rate
      const studentsWithAttempts = new Set(attempts.map((a) => a.studentId));
      const participationRate =
        classData.students.length > 0
          ? (studentsWithAttempts.size / classData.students.length) * 100
          : 0;

      // Calculate per-student performance
      const studentPerformance = new Map<
        string,
        { name: string; totalScore: number; totalMarks: number; attempts: number }
      >();
      for (const attempt of attempts) {
        const existing = studentPerformance.get(attempt.studentId) || {
          name: attempt.student.user.name,
          totalScore: 0,
          totalMarks: 0,
          attempts: 0,
        };
        existing.totalScore += attempt.score || 0;
        existing.totalMarks += attempt.totalMarks || 0;
        existing.attempts++;
        studentPerformance.set(attempt.studentId, existing);
      }

      const studentScores = Array.from(studentPerformance.entries())
        .map(([id, data]) => ({
          studentId: id,
          name: data.name,
          average: data.totalMarks > 0 ? (data.totalScore / data.totalMarks) * 100 : 0,
          attempts: data.attempts,
        }))
        .sort((a, b) => b.average - a.average);

      // Top performers (top 5)
      const topPerformers = studentScores.slice(0, 5);

      // Needs attention (bottom 5 with attempts, <50% average)
      const needsAttention = studentScores
        .filter((s) => s.average < 50)
        .slice(-5)
        .reverse();

      // Subject breakdown
      const subjectMap = new Map<string, { name: string; totalScore: number; totalMarks: number }>();
      for (const attempt of attempts) {
        const subjectId = attempt.quiz.subject.id;
        const existing = subjectMap.get(subjectId) || {
          name: attempt.quiz.subject.name,
          totalScore: 0,
          totalMarks: 0,
        };
        existing.totalScore += attempt.score || 0;
        existing.totalMarks += attempt.totalMarks || 0;
        subjectMap.set(subjectId, existing);
      }

      const subjectBreakdown = Array.from(subjectMap.entries()).map(([id, data]) => ({
        subjectId: id,
        subjectName: data.name,
        averageScore: data.totalMarks > 0 ? Math.round((data.totalScore / data.totalMarks) * 10000) / 100 : 0,
      }));

      // Calculate monthly averages for the last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = new Map<string, { totalScore: number; totalMarks: number }>();

      for (const attempt of attempts) {
        if (attempt.submittedAt) {
          const date = new Date(attempt.submittedAt);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          const existing = monthlyData.get(monthKey) || { totalScore: 0, totalMarks: 0 };
          existing.totalScore += attempt.score || 0;
          existing.totalMarks += attempt.totalMarks || 0;
          monthlyData.set(monthKey, existing);
        }
      }

      // Get last 6 months in order
      const now = new Date();
      const monthlyAverages: Array<{ month: string; value: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const data = monthlyData.get(monthKey);
        if (data && data.totalMarks > 0) {
          monthlyAverages.push({
            month: monthNames[date.getMonth()],
            value: Math.round((data.totalScore / data.totalMarks) * 1000) / 10,
          });
        }
      }

      // Calculate weekly participation for the current week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyParticipants = new Map<number, Set<string>>();

      for (const attempt of attempts) {
        if (attempt.submittedAt) {
          const date = new Date(attempt.submittedAt);
          if (date >= startOfWeek) {
            const dayOfWeek = date.getDay();
            if (!dailyParticipants.has(dayOfWeek)) {
              dailyParticipants.set(dayOfWeek, new Set());
            }
            dailyParticipants.get(dayOfWeek)!.add(attempt.studentId);
          }
        }
      }

      const totalStudents = classData.students.length;
      const weeklyParticipation: Array<{ day: string; value: number }> = [];
      for (let i = 1; i <= 5; i++) { // Mon-Fri
        const participants = dailyParticipants.get(i)?.size || 0;
        const rate = totalStudents > 0 ? Math.round((participants / totalStudents) * 100) : 0;
        weeklyParticipation.push({ day: dayNames[i], value: rate });
      }

      return successResponse(res, {
        class: {
          id: classData.id,
          name: classData.name,
          grade: classData.grade,
          section: classData.section,
        },
        studentCount: classData.students.length,
        averageScore: Math.round(classAverage * 100) / 100,
        participationRate: Math.round(participationRate * 100) / 100,
        totalQuizAttempts: attempts.length,
        topPerformers,
        needsAttention,
        subjectBreakdown,
        monthlyAverages,
        weeklyParticipation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/reports/export - Export school data
router.get(
  '/reports/export',
  authMiddleware,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const type = (req.query.type as string) || 'students';
      const format = (req.query.format as string) || 'json';

      const admin = await getAdmin(userId);
      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      let data: any[] = [];

      if (type === 'students') {
        const students = await prisma.student.findMany({
          where: { class: { schoolId: admin.schoolId } },
          include: {
            user: { select: { name: true, email: true, createdAt: true } },
            class: { select: { name: true, grade: true, section: true } },
          },
          orderBy: [{ class: { grade: 'asc' } }, { class: { section: 'asc' } }, { rollNumber: 'asc' }],
        });

        data = students.map((s) => ({
          id: s.id,
          name: s.user.name,
          email: s.user.email,
          rollNumber: s.rollNumber,
          class: s.class?.name ?? '—',
          grade: s.class?.grade ?? '—',
          section: s.class?.section ?? '—',
          totalPoints: s.totalPoints,
          joinedAt: s.user.createdAt,
        }));
      } else if (type === 'teachers') {
        const teachers = await prisma.teacher.findMany({
          where: { schoolId: admin.schoolId },
          include: {
            user: { select: { name: true, email: true, createdAt: true } },
            subjects: { include: { subject: { select: { name: true } } } },
            classes: { include: { class: { select: { name: true } } } },
            _count: { select: { lessons: true, quizzes: true, assessments: true } },
          },
        });

        data = teachers.map((t) => ({
          id: t.id,
          name: t.user.name,
          email: t.user.email,
          location: t.location,
          subjects: t.subjects.map((ts) => ts.subject.name).join(', '),
          classes: t.classes.map((tc) => tc.class.name).join(', '),
          lessonsCreated: t._count.lessons,
          quizzesCreated: t._count.quizzes,
          assessmentsCreated: t._count.assessments,
          joinedAt: t.user.createdAt,
        }));
      } else if (type === 'classes') {
        const classes = await prisma.class.findMany({
          where: { schoolId: admin.schoolId },
          include: {
            _count: { select: { students: true, teachers: true } },
          },
          orderBy: [{ grade: 'asc' }, { section: 'asc' }],
        });

        data = classes.map((c) => ({
          id: c.id,
          name: c.name,
          grade: c.grade,
          section: c.section,
          studentCount: c._count.students,
          teacherCount: c._count.teachers,
          createdAt: c.createdAt,
        }));
      } else if (type === 'class') {
        // Export single class performance data
        const classId = req.query.classId as string;
        if (!classId) {
          return errorResponse(res, 'classId is required for class export', 400, 'MISSING_CLASS_ID');
        }

        const classData = await prisma.class.findFirst({
          where: { id: classId, schoolId: admin.schoolId },
          include: {
            students: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        });

        if (!classData) {
          return notFoundResponse(res, 'Class not found');
        }

        // Get quiz attempts for students in this class
        const studentIds = classData.students.map((s) => s.id);
        const attempts = await prisma.quizAttempt.findMany({
          where: {
            studentId: { in: studentIds },
            status: { in: ['submitted', 'graded'] },
          },
          select: { studentId: true, score: true, totalMarks: true },
        });

        // Calculate per-student averages
        const studentScores = new Map<string, { totalScore: number; totalMarks: number; attempts: number }>();
        for (const attempt of attempts) {
          const existing = studentScores.get(attempt.studentId) || { totalScore: 0, totalMarks: 0, attempts: 0 };
          existing.totalScore += attempt.score || 0;
          existing.totalMarks += attempt.totalMarks || 0;
          existing.attempts++;
          studentScores.set(attempt.studentId, existing);
        }

        data = classData.students.map((s) => {
          const scores = studentScores.get(s.id);
          const avg = scores && scores.totalMarks > 0 ? (scores.totalScore / scores.totalMarks) * 100 : 0;
          return {
            studentId: s.id,
            name: s.user.name,
            email: s.user.email,
            rollNumber: s.rollNumber,
            quizAttempts: scores?.attempts || 0,
            averageScore: Math.round(avg * 10) / 10,
          };
        });
      } else {
        return errorResponse(res, 'Invalid export type. Use: students, teachers, classes, or class', 400, 'INVALID_TYPE');
      }

      // Return based on format
      if (format === 'csv') {
        if (data.length === 0) {
          return res.setHeader('Content-Type', 'text/csv').send('');
        }

        // Generate CSV
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map((row) =>
            headers
              .map((h) => {
                const val = row[h];
                if (val === null || val === undefined) return '';
                const str = String(val);
                // Escape quotes and wrap if contains comma or quote
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                  return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
              })
              .join(',')
          ),
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
        return res.send(csvRows.join('\n'));
      }

      // Default: JSON
      return successResponse(res, {
        type,
        count: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
