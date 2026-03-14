'use client';

import { LoaderCircle, Sparkles, XCircle, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/contexts/generation-context';
import {
  getGenerationArtifactLabel,
  getGenerationStageLabel,
  getGenerationStatusLabel,
  normalizeGenerationProgress,
} from '@/lib/generation-jobs';

export function GenerationFloatingUI() {
  const router = useRouter();
  const { activeJob, metadata, isPanelOpen, openPanel, closePanel, dismissJob } = useGeneration();

  if (!activeJob) {
    return null;
  }

  const artifactLabel = getGenerationArtifactLabel(activeJob.artifactType);
  const stageLabel = getGenerationStageLabel(activeJob.stage);
  const statusLabel = getGenerationStatusLabel(activeJob.status);
  const progress = normalizeGenerationProgress(activeJob);
  const isCompleted = activeJob.status === 'completed';
  const isFailed = activeJob.status === 'failed';
  const buttonLabel = isCompleted
    ? `${artifactLabel} ready`
    : isFailed
      ? `${artifactLabel} failed`
      : `${artifactLabel} generating`;

  return (
    <div className="fixed right-4 bottom-4 z-70 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {isPanelOpen && (
        <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[#E8E2F0] bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C74B3]">Generating</p>
              <h3 className="mt-1 text-base font-semibold text-[#242220]">
                {metadata?.label || artifactLabel}
              </h3>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close generation panel"
              className="rounded-full p-1.5 text-[#6A6A6A] transition-colors hover:bg-[#F4F0FA] hover:text-[#242220]"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-[#F8F5FC] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-[#1D8F5A]" />
                ) : isFailed ? (
                  <XCircle className="h-4 w-4 text-[#D9485F]" />
                ) : (
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#9B61FF]" />
                )}
                <span className="text-sm font-semibold text-[#242220]">{statusLabel}</span>
              </div>
              <span className="text-xs font-medium text-[#6A6A6A]">{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#E8E2F0]">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  isFailed ? 'bg-[#D9485F]' : isCompleted ? 'bg-[#1D8F5A]' : 'bg-[#9B61FF]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-sm font-medium text-[#353535]">{stageLabel}</p>
            <p className="mt-1 text-xs leading-5 text-[#6A6A6A]">
              {isCompleted
                ? 'Your content is ready. You can open it now whenever you want.'
                : isFailed
                  ? activeJob.errorMessage || 'Generation did not complete successfully. You can dismiss this card and try again.'
                  : 'Your content is being prepared. You can keep using the app while it finishes.'}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {metadata?.targetPath && (
              <button
                type="button"
                onClick={() => router.push(metadata.targetPath!)}
                className="rounded-full bg-[#242220] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#353535]"
              >
                {isCompleted ? 'Open content' : 'Go to page'}
              </button>
            )}
            <button
              type="button"
              onClick={isCompleted || isFailed ? dismissJob : closePanel}
              className="rounded-full border border-[#D9C6FF] px-4 py-2 text-sm font-semibold text-[#7D5CB0] transition-colors hover:bg-[#F6F1FF]"
            >
              {isCompleted || isFailed ? 'Dismiss' : 'Hide'}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={isPanelOpen ? closePanel : openPanel}
        className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold shadow-xl transition-all ${
          isFailed
            ? 'bg-[#FFF1F3] text-[#B4233A] ring-1 ring-[#F6CAD1]'
            : isCompleted
              ? 'bg-[#EEF8F2] text-[#1D8F5A] ring-1 ring-[#C5E8D3]'
              : 'bg-white text-[#242220] ring-1 ring-[#E8E2F0]'
        }`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isFailed
              ? 'bg-[#FFD9DF]'
              : isCompleted
                ? 'bg-[#D8F2E3]'
                : 'bg-[#F1E9FF]'
          }`}
        >
          {isFailed ? (
            <XCircle className="h-4 w-4" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4 text-[#9B61FF]" />
          )}
        </span>

        <span className="text-left leading-tight">
          <span className="block">{buttonLabel}</span>
          <span className="block text-xs font-medium text-[#6A6A6A]">
            {isCompleted || isFailed ? stageLabel : `${progress}% complete`}
          </span>
        </span>

        {isPanelOpen ? <ChevronDown className="h-4 w-4 text-[#6A6A6A]" /> : <ChevronUp className="h-4 w-4 text-[#6A6A6A]" />}
      </button>
    </div>
  );
}
