import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { successResponse, notFoundResponse } from '../utils/response';

const router = Router();

// GET /api/classes/by-school-code - Public endpoint for registration
router.get('/by-school-code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schoolCode } = req.query;

    if (!schoolCode) {
      return res.status(400).json({
        success: false,
        error: { message: 'School code is required', code: 'VALIDATION_ERROR' },
      });
    }

    // Find school by code
    const school = await prisma.school.findUnique({
      where: { code: schoolCode as string },
      select: { id: true, name: true },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        error: { message: 'School not found', code: 'NOT_FOUND' },
      });
    }

    // Get all classes for this school
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    });

    return successResponse(res, {
      school: { id: school.id, name: school.name },
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        section: c.section,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/classes - List classes (role-filtered)
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { grade, section } = req.query;

    // Build where clause based on role
    let whereClause: {
      grade?: number;
      section?: string;
      schoolId?: string;
      id?: string;
      teachers?: { some: { teacherId: string } };
    } = {};

    // Apply optional filters
    if (grade) {
      whereClause.grade = parseInt(grade as string);
    }
    if (section) {
      whereClause.section = section as string;
    }

    if (role === 'teacher') {
      // Get teacher's assigned classes
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: {
          id: true,
          schoolId: true,
          classes: {
            select: { classId: true },
          },
        },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // If teacher has assigned classes, filter by them
      // Otherwise, show all classes in their school
      if (teacher.classes.length > 0) {
        whereClause.teachers = { some: { teacherId: teacher.id } };
      } else {
        whereClause.schoolId = teacher.schoolId;
      }
    } else if (role === 'student') {
      // Get student's class only
      const student = await prisma.student.findUnique({
        where: { userId },
        select: { classId: true },
      });

      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      whereClause.id = student.classId;
    } else if (role === 'admin') {
      // Get all classes in admin's school
      const admin = await prisma.admin.findUnique({
        where: { userId },
        select: { schoolId: true },
      });

      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      whereClause.schoolId = admin.schoolId;
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        _count: {
          select: { students: true },
        },
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    });

    // Format response
    const formattedClasses = classes.map((c) => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      section: c.section,
      studentCount: c._count.students,
    }));

    return successResponse(res, formattedClasses);
  } catch (error) {
    next(error);
  }
});

export default router;
