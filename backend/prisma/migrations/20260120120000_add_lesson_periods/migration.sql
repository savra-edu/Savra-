-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "start_date" TIMESTAMP(3),
ADD COLUMN "end_date" TIMESTAMP(3),
ADD COLUMN "topic" TEXT,
ADD COLUMN "number_of_periods" INTEGER;

-- CreateTable
CREATE TABLE "lesson_periods" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "period_no" INTEGER NOT NULL,
    "concept" TEXT,
    "learning_outcomes" TEXT,
    "teacher_learning_process" TEXT,
    "assessment" TEXT,
    "resources" TEXT,
    "century_skills_value_education" TEXT,
    "real_life_application" TEXT,
    "reflection" TEXT,

    CONSTRAINT "lesson_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_periods_lesson_id_period_no_key" ON "lesson_periods"("lesson_id", "period_no");

-- AddForeignKey
ALTER TABLE "lesson_periods" ADD CONSTRAINT "lesson_periods_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
