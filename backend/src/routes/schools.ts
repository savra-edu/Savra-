import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { successResponse } from '../utils/response';

const router = Router();

// GET /api/schools - List all schools
router.get('/', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(res, schools);
  } catch (error) {
    next(error);
  }
});

export default router;
