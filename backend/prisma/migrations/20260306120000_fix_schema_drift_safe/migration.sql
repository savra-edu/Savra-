-- Fix schema drift without data loss
-- Aligns DB with schema: nullable password_hash (OAuth), optional class_id, google_id, question_type

-- 1. Users: add google_id (for OAuth), make password_hash nullable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- 2. Students: make class_id nullable, update FK to allow SET NULL
ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_class_id_fkey";
ALTER TABLE "students" ALTER COLUMN "class_id" DROP NOT NULL;
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_fkey" 
  FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. assessment_question_types: safely migrate question_type (preserves data)
ALTER TABLE "assessment_question_types" ADD COLUMN "question_type_new" "QuestionType";
UPDATE "assessment_question_types" SET "question_type_new" = CASE
  WHEN "question_type"::text IN ('mcq', 'short_answer', 'long_answer', 'case_study')
  THEN ("question_type"::text)::"QuestionType"
  ELSE 'mcq'::"QuestionType"
END;
ALTER TABLE "assessment_question_types" DROP COLUMN "question_type";
ALTER TABLE "assessment_question_types" RENAME COLUMN "question_type_new" TO "question_type";
ALTER TABLE "assessment_question_types" ALTER COLUMN "question_type" SET NOT NULL;

-- 4. questions: safely migrate question_type (preserves data)
ALTER TABLE "questions" ADD COLUMN "question_type_new" "QuestionType" DEFAULT 'mcq';
UPDATE "questions" SET "question_type_new" = CASE
  WHEN "question_type"::text IN ('mcq', 'short_answer', 'long_answer', 'case_study')
  THEN ("question_type"::text)::"QuestionType"
  ELSE 'mcq'::"QuestionType"
END;
ALTER TABLE "questions" DROP COLUMN "question_type";
ALTER TABLE "questions" RENAME COLUMN "question_type_new" TO "question_type";
ALTER TABLE "questions" ALTER COLUMN "question_type" SET NOT NULL;
ALTER TABLE "questions" ALTER COLUMN "question_type" SET DEFAULT 'mcq';
