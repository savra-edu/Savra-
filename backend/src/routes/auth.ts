import { Router, Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { validate } from '../middleware/validate';
import {
  authMiddleware,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  deleteAccountSchema,
  googleAuthSchema,
} from '../schemas/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '../utils/response';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role, schoolName, classId, location } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return errorResponse(res, 'User with this email already exists', 400, 'DUPLICATE_ENTRY');
      }

      // Resolve school for teacher/admin: create from optional schoolName
      let school: { id: string } | null = null;
      if (role === 'teacher' || role === 'admin') {
        const schoolDisplayName = (schoolName?.trim() || 'Unassigned').slice(0, 255);
        const code = `SCH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        school = await prisma.school.create({
          data: { name: schoolDisplayName, code },
        });

        // Create default classes (grades 6-12, sections A-E) for the new school
        const grades = [6, 7, 8, 9, 10, 11, 12];
        const sections = ['A', 'B', 'C', 'D', 'E'];
        const classData = grades.flatMap((grade) =>
          sections.map((section) => ({
            schoolId: school!.id,
            grade,
            section,
            name: `Class ${grade} ${section}`,
          }))
        );
        await prisma.class.createMany({ data: classData });
      }

      // For students, validate classId
      if (role === 'student') {
        if (!classId) {
          return errorResponse(res, 'Class ID is required for students', 400, 'VALIDATION_ERROR');
        }

        const classExists = await prisma.class.findUnique({
          where: { id: classId },
        });

        if (!classExists) {
          return errorResponse(res, 'Invalid class ID', 400, 'INVALID_CLASS_ID');
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user with role-specific profile in a transaction
      const user = await prisma.$transaction(async (tx) => {
        // Create base user
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role,
          },
        });

        // Create role-specific profile
        if (role === 'teacher' && school) {
          await tx.teacher.create({
            data: {
              userId: newUser.id,
              schoolId: school.id,
              location: location?.trim() || null,
            },
          });
        } else if (role === 'student') {
          await tx.student.create({
            data: {
              userId: newUser.id,
              classId: classId!,
            },
          });
        } else if (role === 'admin' && school) {
          await tx.admin.create({
            data: {
              userId: newUser.id,
              schoolId: school.id,
            },
          });
        }

        return newUser;
      });

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // New teachers need onboarding
      const onboardingCompleted = role !== 'teacher' ? true : false;

      return successResponse(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            onboardingCompleted,
          },
          accessToken,
          refreshToken,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return unauthorizedResponse(res, 'Invalid email or password');
      }

      // Check if account is deleted
      if (user.deletedAt) {
        return errorResponse(
          res,
          'This account has been deleted. Please contact support if you wish to recover it.',
          403,
          'ACCOUNT_DELETED'
        );
      }

      // OAuth users have no password
      if (!user.passwordHash) {
        return unauthorizedResponse(res, 'Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return unauthorizedResponse(res, 'Invalid email or password');
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Check onboarding status for teachers
      let onboardingCompleted = true; // Default to true for non-teachers
      if (user.role === 'teacher') {
        const teacher = await prisma.teacher.findUnique({
          where: { userId: user.id },
          select: { onboardingCompleted: true },
        });
        onboardingCompleted = teacher?.onboardingCompleted ?? false;
      }

      return successResponse(res, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          onboardingCompleted,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/google - Google OAuth (teachers only)
router.post(
  '/google',
  validate(googleAuthSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { credential } = req.body;
      const clientId = process.env.GOOGLE_CLIENT_ID;

      if (!clientId) {
        return errorResponse(
          res,
          'Google sign-in is not configured. Please contact support.',
          503,
          'GOOGLE_AUTH_NOT_CONFIGURED'
        );
      }

      const client = new OAuth2Client(clientId);
      let payload;
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        payload = ticket.getPayload();
      } catch {
        return unauthorizedResponse(res, 'Invalid Google credential');
      }

      if (!payload || !payload.email || !payload.sub) {
        return unauthorizedResponse(res, 'Invalid Google credential');
      }

      // Reject unverified emails (Google includes this claim)
      if (payload.email_verified === false) {
        return errorResponse(
          res,
          'Please verify your Google account email before signing in.',
          403,
          'EMAIL_NOT_VERIFIED'
        );
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || payload.email.split('@')[0] || 'Teacher';
      const avatarUrl = payload.picture || undefined;

      // Check for existing user by googleId
      let user = await prisma.user.findUnique({
        where: { googleId },
      });

      if (user) {
        // Existing Google user - login
        if (user.deletedAt) {
          return errorResponse(
            res,
            'This account has been deleted. Please contact support if you wish to recover it.',
            403,
            'ACCOUNT_DELETED'
          );
        }
      } else {
        // Check for existing user by email (password account)
        const existingByEmail = await prisma.user.findUnique({
          where: { email },
        });
        if (existingByEmail) {
          return errorResponse(
            res,
            'This email is registered with a password. Please use email and password to sign in.',
            400,
            'USE_PASSWORD_LOGIN'
          );
        }

        // New user - create teacher account (same flow as register)
        const schoolDisplayName = 'Unassigned';
        const code = `SCH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const school = await prisma.school.create({
          data: { name: schoolDisplayName, code },
        });

        const grades = [6, 7, 8, 9, 10, 11, 12];
        const sections = ['A', 'B', 'C', 'D', 'E'];
        const classData = grades.flatMap((grade) =>
          sections.map((section) => ({
            schoolId: school.id,
            grade,
            section,
            name: `Class ${grade} ${section}`,
          }))
        );
        await prisma.class.createMany({ data: classData });

        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              name,
              role: 'teacher',
              googleId,
              avatarUrl,
              passwordHash: null,
            },
          });
          await tx.teacher.create({
            data: {
              userId: newUser.id,
              schoolId: school.id,
            },
          });
          return newUser;
        });
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      let onboardingCompleted = false;
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: { onboardingCompleted: true },
      });
      onboardingCompleted = teacher?.onboardingCompleted ?? false;

      return successResponse(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            onboardingCompleted,
            authMethod: 'google',
          },
          accessToken,
          refreshToken,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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
        role: true,
        avatarUrl: true,
        createdAt: true,
        googleId: true,
      },
    });

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Get role-specific profile
    let profile: Record<string, unknown> = {};

    if (role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: {
          id: true,
          location: true,
          teacherRole: true,
          onboardingCompleted: true,
          school: {
            select: { id: true, name: true, code: true },
          },
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

      if (teacher) {
        profile = {
          teacherId: teacher.id,
          location: teacher.location,
          teacherRole: teacher.teacherRole,
          onboardingCompleted: teacher.onboardingCompleted,
          school: teacher.school,
          subjects: teacher.subjects.map((s) => s.subject),
          classes: teacher.classes.map((c) => c.class),
        };
      }
    } else if (role === 'student') {
      const student = await prisma.student.findUnique({
        where: { userId },
        select: {
          id: true,
          rollNumber: true,
          totalPoints: true,
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              school: { select: { id: true, name: true } },
            },
          },
          subjects: {
            select: {
              subject: { select: { id: true, name: true, code: true } },
            },
          },
        },
      });

      if (student) {
        profile = {
          studentId: student.id,
          rollNumber: student.rollNumber,
          totalPoints: student.totalPoints,
          class: student.class ?? null,
          subjects: student.subjects.map((s) => s.subject),
        };
      }
    } else if (role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { userId },
        select: {
          id: true,
          school: { select: { id: true, name: true, code: true } },
        },
      });

      if (admin) {
        profile = {
          adminId: admin.id,
          school: admin.school,
        };
      }
    }

    return successResponse(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      authMethod: user.googleId ? 'google' : 'password',
      profile,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (_req: Request, res: Response) => {
  // For JWT, logout is handled client-side by removing the token
  // Optionally, you could implement a token blacklist here
  return successResponse(res, { message: 'Logged out successfully' });
});

// POST /api/auth/refresh-token
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch {
        return unauthorizedResponse(res, 'Invalid or expired refresh token');
      }

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return unauthorizedResponse(res, 'User not found');
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return successResponse(res, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/auth/account - Soft delete user account
router.delete(
  '/account',
  authMiddleware,
  validate(deleteAccountSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return notFoundResponse(res, 'User not found');
      }

      // Check if already deleted
      if (user.deletedAt) {
        return errorResponse(res, 'Account is already scheduled for deletion', 400, 'ALREADY_DELETED');
      }

      // OAuth users have no password - skip password check
      if (user.passwordHash) {
        if (!password || typeof password !== 'string' || !password.trim()) {
          return errorResponse(res, 'Password is required for verification', 400, 'VALIDATION_ERROR');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return unauthorizedResponse(res, 'Invalid password');
        }
      }

      // Soft delete - set deletedAt timestamp
      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
        },
      });

      // Log deletion for audit purposes
      console.log(`Account deletion requested: User ${userId} (${user.email}) at ${new Date().toISOString()}`);

      return successResponse(res, {
        message: 'Account has been scheduled for deletion. You can recover your account within 30 days by contacting support.',
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
