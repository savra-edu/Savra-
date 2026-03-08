import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { successResponse } from '../utils/response';

const router = Router();

// GET /api/chapters - List chapters filtered by subject and optionally grade
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject: subjectId, grade: gradeParam } = req.query;

    const where: { subjectId?: string; grade?: number } = {};
    if (subjectId) where.subjectId = subjectId as string;
    const gradeNum = gradeParam != null ? parseInt(String(gradeParam), 10) : NaN;
    if (!isNaN(gradeNum) && gradeNum > 0) where.grade = gradeNum;

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
