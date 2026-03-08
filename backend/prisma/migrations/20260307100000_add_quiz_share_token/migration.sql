-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_share_token_key" ON "quizzes"("share_token");
