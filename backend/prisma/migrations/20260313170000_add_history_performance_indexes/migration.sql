-- CreateIndex
CREATE INDEX "lessons_teacher_id_status_created_at_idx" ON "lessons"("teacher_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "quizzes_teacher_id_status_created_at_idx" ON "quizzes"("teacher_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "assessments_teacher_id_status_created_at_idx" ON "assessments"("teacher_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "announcements_teacher_id_created_at_idx" ON "announcements"("teacher_id", "created_at");
