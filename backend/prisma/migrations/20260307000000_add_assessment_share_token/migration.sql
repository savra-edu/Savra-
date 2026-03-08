-- AlterTable
ALTER TABLE "assessments" ADD COLUMN "share_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "assessments_share_token_key" ON "assessments"("share_token");
