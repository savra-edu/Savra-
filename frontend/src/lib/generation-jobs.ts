import type { GenerationArtifactType, GenerationJob, GenerationJobStage, GenerationJobStatus } from '@/types/api';

export function getGenerationStageLabel(stage: GenerationJobStage): string {
  switch (stage) {
    case 'queued':
      return 'Queued';
    case 'preparing':
      return 'Preparing references';
    case 'generating':
      return 'Generating content';
    case 'saving':
      return 'Saving result';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'In progress';
  }
}

export function getGenerationStatusLabel(status: GenerationJobStatus): string {
  switch (status) {
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Generating';
    case 'completed':
      return 'Ready';
    case 'failed':
      return 'Failed';
    default:
      return 'Generating';
  }
}

export function getGenerationArtifactLabel(type: GenerationArtifactType): string {
  switch (type) {
    case 'lesson':
      return 'Lesson plan';
    case 'quiz':
      return 'Quiz';
    case 'assessment':
      return 'Question paper';
    default:
      return 'Content';
  }
}

export function normalizeGenerationProgress(job: GenerationJob): number {
  if (job.status === 'completed') return 100;
  if (job.status === 'failed') return Math.max(8, job.progress || 0);
  if (job.status === 'queued') return Math.max(8, job.progress || 0);
  return Math.max(12, Math.min(99, job.progress || 0));
}

export function isGenerationJobActive(job: GenerationJob | null | undefined): boolean {
  if (!job) return false;
  return job.status === 'queued' || job.status === 'running';
}
