-- Add share_token to lessons table
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "share_token" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_share_token_key" ON "lessons"("share_token");
