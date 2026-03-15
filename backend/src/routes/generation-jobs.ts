import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, authorize } from '../middleware/auth';
import { successResponse, notFoundResponse, forbiddenResponse } from '../utils/response';
import {
  findGenerationJobById,
  findTeacherActiveGenerationJob,
  serializeGenerationJob,
} from '../lib/generation-jobs';

const router = Router();

async function getTeacherId(userId: string): Promise<string | null> {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true },
  });

  return teacher?.id ?? null;
}

router.get(
  '/active',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = await getTeacherId(req.user!.id);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const job = await findTeacherActiveGenerationJob(teacherId);
      return successResponse(res, { job: serializeGenerationJob(job as any) });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = await getTeacherId(req.user!.id);
      if (!teacherId) {
        return notFoundResponse(res, 'Teacher profile not found');
      }

      const jobId = req.params.id as string;
      const job = await findGenerationJobById(jobId);
      if (!job) {
        return notFoundResponse(res, 'Generation job not found');
      }

      if (job.teacherId !== teacherId) {
        return forbiddenResponse(res, 'You do not have access to this generation job');
      }

      return successResponse(res, { job: serializeGenerationJob(job as any) });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
