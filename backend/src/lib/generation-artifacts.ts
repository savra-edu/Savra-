import prisma, { withRetry } from './prisma';
import {
  generateAssessment,
  generateLessonPlanPeriods,
  generateQuizQuestions,
} from './gemini';

export type GenerationArtifactTypeValue = 'lesson' | 'quiz' | 'assessment';
export type GenerationJobStageValue =
  | 'queued'
  | 'preparing'
  | 'generating'
  | 'saving'
  | 'completed'
  | 'failed';

type JobProgressUpdater = (
  stage: Exclude<GenerationJobStageValue, 'queued' | 'completed' | 'failed'>,
  progress: number
) => Promise<void>;

type GenerationJobExecutionInput = {
  id: string;
  teacherId: string;
  artifactType: GenerationArtifactTypeValue;
  artifactId: string;
  payload?: unknown;
};

function convertToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : String(item))).join('\n');
  }
  return String(value);
}

function getPayloadObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  return payload as Record<string, unknown>;
}

export async function executeGenerationJob(
  job: GenerationJobExecutionInput,
  updateProgress: JobProgressUpdater
): Promise<void> {
  switch (job.artifactType) {
    case 'assessment':
      await executeAssessmentGeneration(job, updateProgress);
      return;
    case 'lesson':
      await executeLessonGeneration(job, updateProgress);
      return;
    case 'quiz':
      await executeQuizGeneration(job, updateProgress);
      return;
    default:
      throw new Error(`Unsupported artifact type: ${job.artifactType}`);
  }
}

async function executeAssessmentGeneration(
  job: GenerationJobExecutionInput,
  updateProgress: JobProgressUpdater
): Promise<void> {
  const payload = getPayloadObject(job.payload);
  const regenerate = payload.regenerate === true;

  await updateProgress('preparing', 15);

  const assessment = await prisma.assessment.findFirst({
    where: { id: job.artifactId, teacherId: job.teacherId },
    include: {
      subject: { select: { name: true } },
      class: { select: { grade: true } },
      chapters: {
        select: {
          chapter: { select: { name: true } },
        },
      },
      questionTypes: {
        select: {
          questionType: true,
          numberOfQuestions: true,
          marksPerQuestion: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  if (assessment.questionPaper && !regenerate) {
    throw new Error('Question paper already exists. Set regenerate to true to regenerate.');
  }

  const subjectName = assessment.subject.name;
  const grade = assessment.class.grade;
  const chapterNames = assessment.chapters.map((chapter) => chapter.chapter.name);
  const questionTypesForAI = assessment.questionTypes.map((questionType) => ({
    type: questionType.questionType,
    count: questionType.numberOfQuestions,
    marks: questionType.marksPerQuestion,
  }));

  await updateProgress('generating', 65);

  const generatedPaper = await generateAssessment(
    subjectName,
    chapterNames,
    questionTypesForAI,
    assessment.totalMarks,
    assessment.difficultyLevel,
    grade,
    assessment.objective || undefined,
    assessment.referenceFileUrl ?? undefined
  );

  await updateProgress('saving', 90);

  await prisma.assessment.update({
    where: { id: job.artifactId },
    data: { questionPaper: generatedPaper },
  });
}

async function executeLessonGeneration(
  job: GenerationJobExecutionInput,
  updateProgress: JobProgressUpdater
): Promise<void> {
  const payload = getPayloadObject(job.payload);
  const regenerate = payload.regenerate === true;

  await updateProgress('preparing', 15);

  const lesson = await prisma.lesson.findFirst({
    where: { id: job.artifactId, teacherId: job.teacherId },
    include: {
      subject: { select: { name: true } },
      class: { select: { grade: true } },
      chapters: {
        select: {
          chapter: { select: { name: true } },
        },
      },
      periods: {
        orderBy: { periodNo: 'asc' },
      },
    },
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  let hasPeriodContent = false;
  if (lesson.periods.length > 0) {
    hasPeriodContent = lesson.periods.some(
      (period) =>
        (period.concept && period.concept.trim().length > 0) ||
        (period.learningOutcomes && period.learningOutcomes.trim().length > 0) ||
        (period.teacherLearningProcess && period.teacherLearningProcess.trim().length > 0)
    );
  }

  if (hasPeriodContent && !regenerate) {
    throw new Error('Content already exists. Set regenerate to true to regenerate.');
  }

  const subjectName = lesson.subject.name;
  const chapterNames = lesson.chapters.map((chapter) => chapter.chapter.name);
  const topic = lesson.topic || lesson.title;
  const numberOfPeriods = lesson.numberOfPeriods || lesson.periods.length || 1;
  const objective = lesson.objective || 'Teach the selected topics effectively';
  const grade = lesson.class.grade;

  if (!topic || numberOfPeriods < 1) {
    throw new Error('Topic and number of periods are required to generate lesson plan content.');
  }

  await updateProgress('generating', 65);

  const generatedPeriods = await generateLessonPlanPeriods(
    subjectName,
    chapterNames,
    topic,
    numberOfPeriods,
    objective,
    grade,
    lesson.referenceFileUrl ?? undefined
  );

  if (!generatedPeriods || generatedPeriods.length === 0) {
    throw new Error('Failed to generate lesson plan periods. No periods were returned.');
  }

  await updateProgress('saving', 90);

  await withRetry(async () => {
    return prisma.$transaction(
      async (tx) => {
        const shouldDelete = regenerate || (lesson.periods.length > 0 && !hasPeriodContent);

        if (shouldDelete) {
          await tx.lessonPeriod.deleteMany({ where: { lessonId: job.artifactId } });
        }

        if (shouldDelete) {
          await tx.lessonPeriod.createMany({
            data: generatedPeriods.map((period) => ({
              lessonId: job.artifactId,
              periodNo: period.periodNo,
              concept: convertToString(period.concept),
              learningOutcomes: convertToString(period.learningOutcomes),
              teacherLearningProcess: convertToString(period.teacherLearningProcess),
              assessment: convertToString(period.assessment),
              resources: convertToString(period.resources),
              centurySkillsValueEducation: convertToString(period.centurySkillsValueEducation),
              realLifeApplication: convertToString(period.realLifeApplication),
              reflection: convertToString(period.reflection),
            })),
          });
        } else {
          for (const period of generatedPeriods) {
            await tx.lessonPeriod.upsert({
              where: {
                lessonId_periodNo: {
                  lessonId: job.artifactId,
                  periodNo: period.periodNo,
                },
              },
              update: {
                concept: convertToString(period.concept),
                learningOutcomes: convertToString(period.learningOutcomes),
                teacherLearningProcess: convertToString(period.teacherLearningProcess),
                assessment: convertToString(period.assessment),
                resources: convertToString(period.resources),
                centurySkillsValueEducation: convertToString(period.centurySkillsValueEducation),
                realLifeApplication: convertToString(period.realLifeApplication),
                reflection: convertToString(period.reflection),
              },
              create: {
                lessonId: job.artifactId,
                periodNo: period.periodNo,
                concept: convertToString(period.concept),
                learningOutcomes: convertToString(period.learningOutcomes),
                teacherLearningProcess: convertToString(period.teacherLearningProcess),
                assessment: convertToString(period.assessment),
                resources: convertToString(period.resources),
                centurySkillsValueEducation: convertToString(period.centurySkillsValueEducation),
                realLifeApplication: convertToString(period.realLifeApplication),
                reflection: convertToString(period.reflection),
              },
            });
          }
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  }, 2, 1000);
}

async function executeQuizGeneration(
  job: GenerationJobExecutionInput,
  updateProgress: JobProgressUpdater
): Promise<void> {
  const payload = getPayloadObject(job.payload);
  const regenerate = payload.regenerate === true;
  const requestedQuestionCount =
    typeof payload.numberOfQuestions === 'number' && Number.isFinite(payload.numberOfQuestions)
      ? payload.numberOfQuestions
      : undefined;

  await updateProgress('preparing', 15);

  const quiz = await prisma.quiz.findFirst({
    where: { id: job.artifactId, teacherId: job.teacherId },
    select: {
      id: true,
      objective: true,
      totalQuestions: true,
      totalMarks: true,
      difficultyLevel: true,
      referenceFileUrl: true,
      subject: { select: { name: true } },
      chapters: {
        select: {
          chapter: { select: { name: true } },
        },
      },
      _count: { select: { questions: true } },
    },
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const existingQuestionsCount = quiz._count.questions;
  if (existingQuestionsCount > 0 && !regenerate) {
    throw new Error('Questions already exist. Set regenerate to true to regenerate.');
  }

  const subjectName = quiz.subject.name;
  const chapterNames = quiz.chapters.map((chapter) => chapter.chapter.name);
  const questionsToGenerate = requestedQuestionCount || quiz.totalQuestions;
  const difficultyLevel = quiz.difficultyLevel as 'easy' | 'medium' | 'hard';
  const quizObjective = quiz.objective || undefined;

  await updateProgress('generating', 65);

  const generatedQuestions = await generateQuizQuestions(
    subjectName,
    chapterNames,
    questionsToGenerate,
    difficultyLevel,
    quizObjective,
    quiz.referenceFileUrl ?? undefined
  );

  if (!generatedQuestions || generatedQuestions.length === 0) {
    throw new Error('Failed to generate questions. No questions were returned.');
  }

  await updateProgress('saving', 90);

  if (regenerate && existingQuestionsCount > 0) {
    await prisma.question.deleteMany({ where: { quizId: job.artifactId } });
  }

  const marksPerQuestion = Math.ceil(quiz.totalMarks / quiz.totalQuestions);

  await Promise.all(
    generatedQuestions.map((question, index) =>
      prisma.question.create({
        data: {
          quizId: job.artifactId,
          questionText: question.questionText,
          questionType: 'mcq',
          marks: marksPerQuestion,
          orderIndex: index + 1,
          options: {
            create: question.options.map((option) => ({
              optionLabel: option.label,
              optionText: option.text,
              isCorrect: option.isCorrect,
            })),
          },
        },
      })
    )
  );
}
