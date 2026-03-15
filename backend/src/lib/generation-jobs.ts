import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import {
  executeGenerationJob,
  type GenerationArtifactTypeValue,
  type GenerationJobStageValue,
} from './generation-artifacts';

const ACTIVE_JOB_STATUSES = ['queued', 'running'] as const;
const DEFAULT_MAX_CONCURRENT_JOBS = 1;

let activeWorkers = 0;
let workerInitialized = false;

type CreateGenerationJobInput = {
  teacherId: string;
  artifactType: GenerationArtifactTypeValue;
  artifactId: string;
  payload?: Record<string, unknown>;
};

type GenerationJobRecord = {
  id: string;
  teacherId: string;
  artifactType: GenerationArtifactTypeValue;
  artifactId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  stage: GenerationJobStageValue;
  progress: number;
  payload: unknown;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function getMaxConcurrentJobs(): number {
  const configured = Number.parseInt(process.env.GENERATION_MAX_CONCURRENT ?? '', 10);
  if (!Number.isFinite(configured) || configured < 1) {
    return DEFAULT_MAX_CONCURRENT_JOBS;
  }
  return configured;
}

function isActiveJobStatus(status: string): status is (typeof ACTIVE_JOB_STATUSES)[number] {
  return ACTIVE_JOB_STATUSES.includes(status as (typeof ACTIVE_JOB_STATUSES)[number]);
}

export function serializeGenerationJob(job: GenerationJobRecord | null) {
  if (!job) return null;

  return {
    id: job.id,
    teacherId: job.teacherId,
    artifactType: job.artifactType,
    artifactId: job.artifactId,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    errorMessage: job.errorMessage,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function findTeacherActiveGenerationJob(teacherId: string) {
  return prisma.generationJob.findFirst({
    where: {
      teacherId,
      status: { in: [...ACTIVE_JOB_STATUSES] },
    },
    orderBy: [{ status: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function findGenerationJobById(jobId: string) {
  return prisma.generationJob.findUnique({
    where: { id: jobId },
  });
}

export async function createGenerationJob(input: CreateGenerationJobInput) {
  const activeJob = await findTeacherActiveGenerationJob(input.teacherId);
  if (activeJob) {
    throw new Error('A generation is already in progress. Please wait for it to finish.');
  }

  const duplicateJob = await prisma.generationJob.findFirst({
    where: {
      teacherId: input.teacherId,
      artifactType: input.artifactType,
      artifactId: input.artifactId,
      status: { in: [...ACTIVE_JOB_STATUSES] },
    },
  });

  if (duplicateJob) {
    return duplicateJob;
  }

  const job = await prisma.generationJob.create({
    data: {
      teacherId: input.teacherId,
      artifactType: input.artifactType,
      artifactId: input.artifactId,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      status: 'queued',
      stage: 'queued',
      progress: 0,
    },
  });

  scheduleQueueProcessing();

  return job;
}

export async function initializeGenerationJobs(): Promise<void> {
  await prisma.generationJob.updateMany({
    where: {
      status: 'running',
    },
    data: {
      status: 'queued',
      stage: 'queued',
      progress: 0,
      startedAt: null,
    },
  });

  workerInitialized = true;
  scheduleQueueProcessing();
}

function scheduleQueueProcessing(): void {
  if (!workerInitialized) {
    return;
  }

  queueMicrotask(() => {
    void pumpGenerationQueue();
  });
}

async function pumpGenerationQueue(): Promise<void> {
  if (!workerInitialized) {
    return;
  }

  const maxConcurrentJobs = getMaxConcurrentJobs();
  while (activeWorkers < maxConcurrentJobs) {
    const claimedJob = await claimNextQueuedJob();
    if (!claimedJob) {
      return;
    }

    activeWorkers += 1;
    void runGenerationJob(claimedJob.id).finally(() => {
      activeWorkers -= 1;
      scheduleQueueProcessing();
    });
  }
}

async function claimNextQueuedJob(): Promise<GenerationJobRecord | null> {
  const nextJob = await prisma.generationJob.findFirst({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
  });

  if (!nextJob) {
    return null;
  }

  const claimed = await prisma.generationJob.updateMany({
    where: {
      id: nextJob.id,
      status: 'queued',
    },
    data: {
      status: 'running',
      stage: 'preparing',
      progress: 10,
      startedAt: new Date(),
      errorMessage: null,
      completedAt: null,
    },
  });

  if (claimed.count !== 1) {
    return null;
  }

  return prisma.generationJob.findUnique({
    where: { id: nextJob.id },
  }) as Promise<GenerationJobRecord | null>;
}

async function updateGenerationJobProgress(
  jobId: string,
  stage: Exclude<GenerationJobStageValue, 'queued' | 'completed' | 'failed'>,
  progress: number
): Promise<void> {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      stage,
      progress: Math.max(0, Math.min(99, progress)),
    },
  });
}

async function markGenerationJobCompleted(jobId: string): Promise<void> {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      completedAt: new Date(),
      errorMessage: null,
    },
  });
}

async function markGenerationJobFailed(jobId: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : 'Generation failed.';

  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      stage: 'failed',
      errorMessage: message,
      completedAt: new Date(),
    },
  });
}

async function runGenerationJob(jobId: string): Promise<void> {
  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
  });

  if (!job || !isActiveJobStatus(job.status)) {
    return;
  }

  try {
    await executeGenerationJob(
      {
        id: job.id,
        teacherId: job.teacherId,
        artifactType: job.artifactType as GenerationArtifactTypeValue,
        artifactId: job.artifactId,
        payload: job.payload ?? {},
      },
      async (stage, progress) => {
        await updateGenerationJobProgress(job.id, stage, progress);
      }
    );

    await markGenerationJobCompleted(job.id);
  } catch (error) {
    console.error(`Generation job ${job.id} failed:`, error);
    await markGenerationJobFailed(job.id, error);
  }
}
