import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { avatarUpload } from '../middleware/upload';
import { uploadBufferToR2, deleteFromR2 } from '../lib/r2';
import { updateProfileSchema } from '../schemas/profile';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response';

const router = Router();

// GET /api/profile - Get current user's profile
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    // Get base user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Get role-specific profile
    if (role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: {
          id: true,
          location: true,
          school: {
            select: { id: true, name: true, code: true },
          },
          subjects: {
            select: {
              subject: { select: { id: true, name: true, code: true } },
            },
          },
          classes: {
            select: {
              class: { select: { id: true, name: true, grade: true, section: true } },
            },
          },
        },
      });

      if (!teacher) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      return successResponse(res, {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: 'teacher',
        createdAt: user.createdAt,
        teacherId: teacher.id,
        location: teacher.location,
        school: teacher.school,
        subjects: teacher.subjects.map((s) => s.subject),
        classes: teacher.classes.map((c) => c.class),
      });
    }

    if (role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          class: {
            include: {
              school: true,
            },
          },
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });

      if (!student) {
        return notFoundResponse(res, 'Student profile not found');
      }

      return successResponse(res, {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: 'student',
        createdAt: user.createdAt,
        studentId: student.id,
        rollNumber: student.rollNumber,
        totalPoints: student.totalPoints,
        class: student.class ? {
          id: student.class.id,
          name: student.class.name,
          grade: student.class.grade,
          section: student.class.section,
        } : null,
        school: student.class?.school ?? null,
        subjects: student.subjects.map((s) => s.subject),
      });
    }

    if (role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { userId },
        select: {
          id: true,
          school: { select: { id: true, name: true, code: true } },
        },
      });

      if (!admin) {
        return notFoundResponse(res, 'Admin profile not found');
      }

      return successResponse(res, {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: 'admin',
        createdAt: user.createdAt,
        adminId: admin.id,
        school: admin.school,
      });
    }

    return notFoundResponse(res, 'Profile not found');
  } catch (error) {
    next(error);
  }
});

// PUT /api/profile - Update user profile
router.put(
  '/',
  authMiddleware,
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { name, location, subjectIds, classIds } = req.body;

      // Update base user data if name is provided
      if (name) {
        await prisma.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      // Handle role-specific updates
      if (role === 'teacher') {
        const teacher = await prisma.teacher.findUnique({
          where: { userId },
        });

        if (!teacher) {
          return notFoundResponse(res, 'Teacher profile not found');
        }

        // Update teacher profile
        await prisma.$transaction(async (tx) => {
          // Update location if provided
          if (location !== undefined) {
            await tx.teacher.update({
              where: { userId },
              data: { location },
            });
          }

          // Update subject assignments if provided
          if (subjectIds !== undefined) {
            // Remove existing assignments
            await tx.teacherSubject.deleteMany({
              where: { teacherId: teacher.id },
            });

            // Add new assignments
            if (subjectIds.length > 0) {
              await tx.teacherSubject.createMany({
                data: subjectIds.map((subjectId: string) => ({
                  teacherId: teacher.id,
                  subjectId,
                })),
              });
            }
          }

          // Update class assignments if provided
          if (classIds !== undefined) {
            // Remove existing assignments
            await tx.teacherClass.deleteMany({
              where: { teacherId: teacher.id },
            });

            // Add new assignments
            if (classIds.length > 0) {
              await tx.teacherClass.createMany({
                data: classIds.map((classId: string) => ({
                  teacherId: teacher.id,
                  classId,
                })),
              });
            }
          }
        });
      } else if (role === 'student') {
        const student = await prisma.student.findUnique({
          where: { userId },
        });

        if (!student) {
          return notFoundResponse(res, 'Student profile not found');
        }

        console.log('Updating student profile:', { studentId: student.id, classIds, subjectIds });

        try {
          await prisma.$transaction(async (tx) => {
            // Update class assignment if provided (single class for student)
            if (classIds !== undefined) {
              await tx.student.update({
                where: { id: student.id },
                data: { classId: classIds.length > 0 ? classIds[0] : null },
              });
            }

            // Update subject assignments if provided
            if (subjectIds !== undefined) {
              console.log('Updating subjects:', subjectIds);
              // Remove existing assignments
              await tx.studentSubject.deleteMany({
                where: { studentId: student.id },
              });

              // Add new assignments
              if (subjectIds.length > 0) {
                await tx.studentSubject.createMany({
                  data: subjectIds.map((subjectId: string) => ({
                    studentId: student.id,
                    subjectId,
                  })),
                });
              }
            }
          });
          console.log('Student profile updated successfully');
        } catch (txError) {
          console.error('Transaction error:', txError);
          throw txError;
        }
      } else if (role === 'admin') {
        // Admins can only update their name (handled above)
      }

      // Fetch and return updated profile
      // Re-use GET logic by making recursive-like call
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      });

      if (role === 'teacher') {
        const teacher = await prisma.teacher.findUnique({
          where: { userId },
          select: {
            id: true,
            location: true,
            school: { select: { id: true, name: true } },
            subjects: {
              select: {
                subject: { select: { id: true, name: true } },
              },
            },
            classes: {
              select: {
                class: { select: { id: true, name: true, grade: true, section: true } },
              },
            },
          },
        });

        return successResponse(res, {
          ...updatedUser,
          role: 'teacher',
          teacherId: teacher?.id,
          location: teacher?.location,
          school: teacher?.school,
          subjects: teacher?.subjects.map((s) => s.subject) || [],
          classes: teacher?.classes.map((c) => c.class) || [],
        });
      }

      if (role === 'student') {
        const student = await prisma.student.findUnique({
          where: { userId },
          include: {
            class: {
              include: {
                school: true,
              },
            },
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        });

        return successResponse(res, {
          ...updatedUser,
          role: 'student',
          studentId: student?.id,
          rollNumber: student?.rollNumber,
          totalPoints: student?.totalPoints,
          class: student?.class ? {
            id: student.class.id,
            name: student.class.name,
            grade: student.class.grade,
            section: student.class.section,
          } : null,
          school: student?.class?.school ? {
            id: student.class.school.id,
            name: student.class.school.name,
          } : null,
          subjects: student?.subjects.map((s) => s.subject) || [],
        });
      }

      return successResponse(res, { ...updatedUser, role });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/profile/avatar - Update avatar image
router.put(
  '/avatar',
  authMiddleware,
  avatarUpload.single('avatar'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      if (!req.file) {
        return errorResponse(res, 'No image file provided', 400, 'MISSING_FILE');
      }

      // Get current user to check for existing avatar
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      // Upload new avatar to R2
      let uploadResult;
      try {
        uploadResult = await uploadBufferToR2(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'savra-ai/avatars'
        );
      } catch (uploadError) {
        console.error('R2 upload error:', uploadError);
        return errorResponse(
          res,
          'Failed to upload image. Please check R2 configuration.',
          500,
          'UPLOAD_FAILED'
        );
      }

      // Delete old avatar from R2 if exists
      if (currentUser?.avatarUrl) {
        try {
          // Extract key from URL (assuming format: https://...r2.dev/key)
          const urlParts = currentUser.avatarUrl.split('/');
          const key = urlParts.slice(3).join('/'); // Get path after domain
          if (key) {
            await deleteFromR2(key);
          }
        } catch {
          // Ignore deletion errors for old avatars
          console.warn('Failed to delete old avatar');
        }
      }

      // Update user avatar URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: uploadResult.url },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      });

      return successResponse(res, {
        message: 'Avatar updated successfully',
        avatarUrl: updatedUser.avatarUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
