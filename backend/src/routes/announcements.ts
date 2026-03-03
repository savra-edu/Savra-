import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementQuerySchema,
} from '../schemas/announcement';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

const router = Router();

// Helper to get teacher ID from user
const getTeacherId = async (userId: string): Promise<string | null> => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true },
  });
  return teacher?.id || null;
};

// Helper to verify announcement ownership
const verifyAnnouncementOwnership = async (announcementId: string, teacherId: string) => {
  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, teacherId },
  });
  return announcement;
};

// POST /api/announcements - Create a new announcement
router.post(
  '/',
  authMiddleware,
  authorize('teacher'),
  validate(createAnnouncementSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { classId, title, content, attachmentUrl } = req.body;

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

      // Create announcement
      const announcement = await prisma.announcement.create({
        data: {
          teacherId,
          classId,
          title,
          content,
          attachmentUrl: attachmentUrl || null,
        },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
        },
      });

      return successResponse(
        res,
        {
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          attachmentUrl: announcement.attachmentUrl,
          class: announcement.class,
          createdAt: announcement.createdAt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/announcements - Get all announcements for the teacher
router.get(
  '/',
  authMiddleware,
  authorize('teacher'),
  validateQuery(announcementQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Parse query params
      const { classId, sortBy, sortOrder } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: {
        teacherId: string;
        classId?: string;
      } = { teacherId };

      if (classId) {
        whereClause.classId = classId as string;
      }

      // Build order by
      const orderBy: { [key: string]: 'asc' | 'desc' } = {};
      orderBy[(sortBy as string) || 'createdAt'] = (sortOrder as 'asc' | 'desc') || 'desc';

      // Get announcements with pagination
      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            content: true,
            attachmentUrl: true,
            createdAt: true,
            class: { select: { id: true, name: true, grade: true, section: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.announcement.count({ where: whereClause }),
      ]);

      return successResponse(res, {
        announcements,
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

// GET /api/announcements/:id - Get single announcement
router.get(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const announcementId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Get announcement and verify ownership
      const announcement = await prisma.announcement.findFirst({
        where: { id: announcementId, teacherId },
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
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
        class: announcement.class,
        createdAt: announcement.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/announcements/:id - Update announcement
router.put(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  validate(updateAnnouncementSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const announcementId = req.params.id as string;
      const { classId, title, content, attachmentUrl } = req.body;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify announcement ownership
      const existingAnnouncement = await verifyAnnouncementOwnership(announcementId, teacherId);
      if (!existingAnnouncement) {
        return notFoundResponse(res, 'Announcement not found');
      }

      // Build update data
      const updateData: {
        classId?: string;
        title?: string;
        content?: string;
        attachmentUrl?: string | null;
      } = {};

      if (classId !== undefined) {
        // Verify new class exists
        const classExists = await prisma.class.findUnique({ where: { id: classId } });
        if (!classExists) {
          return errorResponse(res, 'Class not found', 400, 'INVALID_CLASS');
        }
        updateData.classId = classId;
      }
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (attachmentUrl !== undefined) updateData.attachmentUrl = attachmentUrl;

      // Update announcement
      const updatedAnnouncement = await prisma.announcement.update({
        where: { id: announcementId },
        data: updateData,
        include: {
          class: { select: { id: true, name: true, grade: true, section: true } },
        },
      });

      return successResponse(res, {
        id: updatedAnnouncement.id,
        title: updatedAnnouncement.title,
        content: updatedAnnouncement.content,
        attachmentUrl: updatedAnnouncement.attachmentUrl,
        class: updatedAnnouncement.class,
        createdAt: updatedAnnouncement.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/announcements/:id - Delete announcement
router.delete(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const announcementId = req.params.id as string;

      // Get teacher ID
      const teacherId = await getTeacherId(userId);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      // Verify announcement ownership
      const existingAnnouncement = await verifyAnnouncementOwnership(announcementId, teacherId);
      if (!existingAnnouncement) {
        return notFoundResponse(res, 'Announcement not found');
      }

      // Delete announcement
      await prisma.announcement.delete({ where: { id: announcementId } });

      return successResponse(res, { message: 'Announcement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
