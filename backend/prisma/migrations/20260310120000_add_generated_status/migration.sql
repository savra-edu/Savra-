-- AlterEnum
-- Add 'generated' to LessonStatus and QuizStatus.
-- Generated items are excluded from history/recent until user explicitly saves as draft.
ALTER TYPE "LessonStatus" ADD VALUE IF NOT EXISTS 'generated';
ALTER TYPE "QuizStatus" ADD VALUE IF NOT EXISTS 'generated';
