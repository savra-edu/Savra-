DO $$
BEGIN
  CREATE TYPE "GenerationArtifactType" AS ENUM ('lesson', 'quiz', 'assessment');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "GenerationJobStatus" AS ENUM ('queued', 'running', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "GenerationJobStage" AS ENUM ('queued', 'preparing', 'generating', 'saving', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "generation_jobs" (
  "id" TEXT NOT NULL,
  "teacher_id" TEXT NOT NULL,
  "artifact_type" "GenerationArtifactType" NOT NULL,
  "artifact_id" TEXT NOT NULL,
  "status" "GenerationJobStatus" NOT NULL DEFAULT 'queued',
  "stage" "GenerationJobStage" NOT NULL DEFAULT 'queued',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "payload" JSONB,
  "error_message" TEXT,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "generation_jobs_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "generation_jobs_teacher_id_status_created_at_idx"
  ON "generation_jobs"("teacher_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "generation_jobs_status_created_at_idx"
  ON "generation_jobs"("status", "created_at");

CREATE INDEX IF NOT EXISTS "generation_jobs_artifact_type_artifact_id_idx"
  ON "generation_jobs"("artifact_type", "artifact_id");
