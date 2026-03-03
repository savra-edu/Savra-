import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { successResponse } from '../utils/response';

const router = Router();

// GET /api/chapters - List all chapters (optionally filtered by subject)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject: subjectId } = req.query;

    const where = subjectId ? { subjectId: subjectId as string } : {};

    const chapters = await prisma.chapter.findMany({
      where,
      select: {
        id: true,
        name: true,
        orderIndex: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { orderIndex: 'asc' },
      ],
    });

    return successResponse(res, chapters);
  } catch (error) {
    next(error);
  }
});

export default router;
