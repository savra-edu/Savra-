import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { successResponse, notFoundResponse } from '../utils/response';

const router = Router();

// GET /api/subjects - List all subjects (public for dropdowns)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(res, subjects);
  } catch (error) {
    next(error);
  }
});

// GET /api/subjects/:subjectId/chapters - Get chapters for a subject
router.get('/:subjectId/chapters', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = req.params.subjectId as string;

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return notFoundResponse(res, 'Subject not found');
    }

    const chapters = await prisma.chapter.findMany({
      where: { subjectId: subjectId },
      select: {
        id: true,
        name: true,
        orderIndex: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return successResponse(res, chapters);
  } catch (error) {
    next(error);
  }
});

export default router;
