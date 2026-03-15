import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import schoolRoutes from './schools';
import classRoutes from './classes';
import subjectRoutes from './subjects';
import chapterRoutes from './chapters';
import lessonRoutes from './lessons';
import uploadRoutes from './upload';
import quizRoutes from './quizzes';
import assessmentRoutes from './assessments';
import publicRoutes from './public';
import announcementRoutes from './announcements';
import studentRoutes from './student';
import adminRoutes from './admin';
import teacherRoutes from './teacher';
import aiRoutes from './ai';
import generationJobRoutes from './generation-jobs';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/schools', schoolRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/chapters', chapterRoutes);
router.use('/lessons', lessonRoutes);
router.use('/upload', uploadRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/public', publicRoutes);
router.use('/announcements', announcementRoutes);
router.use('/student', studentRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/ai', aiRoutes);
router.use('/generation-jobs', generationJobRoutes);

export default router;
