'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { fetchApiData, queryKeys, useAppQueryClient } from '@/hooks/use-query';
import type { GenerationArtifactType, GenerationJob } from '@/types/api';
import { isGenerationJobActive } from '@/lib/generation-jobs';

type GenerationTrackingMetadata = {
  artifactType: GenerationArtifactType;
  artifactId: string;
  targetPath?: string;
  label?: string;
};

type StoredGenerationState = {
  jobId: string | null;
  panelOpen: boolean;
  metadata: GenerationTrackingMetadata | null;
};

type GenerationContextValue = {
  activeJob: GenerationJob | null;
  metadata: GenerationTrackingMetadata | null;
  isPanelOpen: boolean;
  isHydrated: boolean;
  trackJob: (job: GenerationJob, metadata: GenerationTrackingMetadata) => void;
  openPanel: () => void;
  closePanel: () => void;
  dismissJob: () => void;
  refreshJob: () => Promise<void>;
};

const GenerationContext = createContext<GenerationContextValue | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'teacherGenerationState';

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function readStoredState(userId: string): StoredGenerationState | null {
  if (!isBrowser()) return null;
  const rawValue = window.localStorage.getItem(getStorageKey(userId));
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as StoredGenerationState;
  } catch {
    return null;
  }
}

function writeStoredState(userId: string, state: StoredGenerationState | null) {
  if (!isBrowser()) return;
  const storageKey = getStorageKey(userId);
  if (!state) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function GenerationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useAppQueryClient();
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [metadata, setMetadata] = useState<GenerationTrackingMetadata | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const activeJobIdRef = useRef<string | null>(null);
  const prefetchedCompletedJobIdRef = useRef<string | null>(null);

  const clearLocalState = useCallback(() => {
    setActiveJob(null);
    setMetadata(null);
    setIsPanelOpen(false);
  }, []);

  const persistState = useCallback(
    (jobId: string | null, panelOpen: boolean, nextMetadata: GenerationTrackingMetadata | null) => {
      if (!user?.id || user.role !== 'teacher') {
        return;
      }

      writeStoredState(user.id, {
        jobId,
        panelOpen,
        metadata: nextMetadata,
      });
    },
    [user?.id, user?.role]
  );

  const dismissJob = useCallback(() => {
    clearLocalState();
    if (user?.id && user.role === 'teacher') {
      writeStoredState(user.id, null);
    }
  }, [clearLocalState, user?.id, user?.role]);

  const fetchJobById = useCallback(async (jobId: string): Promise<GenerationJob | null> => {
    const response = await api.get<{ success: boolean; data: { job: GenerationJob | null } }>(
      `/generation-jobs/${jobId}`
    );
    return response.data.job;
  }, []);

  const fetchActiveJob = useCallback(async (): Promise<GenerationJob | null> => {
    const response = await api.get<{ success: boolean; data: { job: GenerationJob | null } }>(
      '/generation-jobs/active'
    );
    return response.data.job;
  }, []);

  const refreshJob = useCallback(async () => {
    if (!user?.id || user.role !== 'teacher') {
      return;
    }

    const trackedJobId = activeJobIdRef.current;

    try {
      if (trackedJobId) {
        const job = await fetchJobById(trackedJobId);
        if (job) {
          setActiveJob(job);
          return;
        }
      }
    } catch {
      // Fall back to active-job lookup below.
    }

    try {
      const active = await fetchActiveJob();
      if (active) {
        setActiveJob(active);
        if (!metadata) {
          setMetadata({
            artifactType: active.artifactType,
            artifactId: active.artifactId,
          });
        }
      } else if (!trackedJobId) {
        setActiveJob(null);
      }
    } catch {
      // Keep the last known state to avoid flicker during transient failures.
    }
  }, [fetchActiveJob, fetchJobById, metadata, user?.id, user?.role]);

  const trackJob = useCallback(
    (job: GenerationJob, nextMetadata: GenerationTrackingMetadata) => {
      activeJobIdRef.current = job.id;
      setActiveJob(job);
      setMetadata(nextMetadata);
      setIsPanelOpen(false);
      persistState(job.id, false, nextMetadata);
    },
    [persistState]
  );

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const prefetchCompletedArtifact = useCallback(
    async (job: GenerationJob) => {
      switch (job.artifactType) {
        case 'lesson':
          await queryClient.prefetchQuery({
            queryKey: queryKeys.lesson(job.artifactId),
            queryFn: () => fetchApiData(`/lessons/${job.artifactId}`),
          });
          return;
        case 'assessment':
          await queryClient.prefetchQuery({
            queryKey: queryKeys.assessment(job.artifactId),
            queryFn: () => fetchApiData(`/assessments/${job.artifactId}`),
          });
          return;
        case 'quiz':
          await Promise.all([
            queryClient.prefetchQuery({
              queryKey: queryKeys.quiz(job.artifactId),
              queryFn: () => fetchApiData(`/quizzes/${job.artifactId}`),
            }),
            queryClient.prefetchQuery({
              queryKey: queryKeys.quizQuestions(job.artifactId),
              queryFn: () => fetchApiData(`/quizzes/${job.artifactId}/questions`),
            }),
          ]);
          return;
        default:
          return;
      }
    },
    [queryClient]
  );

  useEffect(() => {
    activeJobIdRef.current = activeJob?.id ?? null;
  }, [activeJob?.id]);

  useEffect(() => {
    if (!activeJob || activeJob.status !== 'completed') {
      return;
    }

    if (prefetchedCompletedJobIdRef.current === activeJob.id) {
      return;
    }

    prefetchedCompletedJobIdRef.current = activeJob.id;

    void prefetchCompletedArtifact(activeJob).catch(() => {
      prefetchedCompletedJobIdRef.current = null;
    });
  }, [activeJob, prefetchCompletedArtifact]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || user?.role !== 'teacher' || !user?.id) {
      clearLocalState();
      setIsHydrated(true);
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      const storedState = readStoredState(user.id);

      if (cancelled) return;

      if (storedState) {
        setMetadata(storedState.metadata);
        setIsPanelOpen(storedState.panelOpen);
        activeJobIdRef.current = storedState.jobId;
      }

      try {
        if (storedState?.jobId) {
          try {
            const job = await fetchJobById(storedState.jobId);
            if (!cancelled && job) {
              setActiveJob(job);
              return;
            }
          } catch {
            // Fall through to active-job discovery below.
          }
        }

        const active = await fetchActiveJob();
        if (!cancelled && active) {
          setActiveJob(active);
          setMetadata((current) =>
            current ?? {
              artifactType: active.artifactType,
              artifactId: active.artifactId,
            }
          );
        } else if (!cancelled && !storedState?.jobId) {
          setActiveJob(null);
        }
      } catch {
        if (!cancelled) {
          setActiveJob(null);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [clearLocalState, fetchActiveJob, fetchJobById, isAuthenticated, isLoading, user?.id, user?.role]);

  useEffect(() => {
    if (!user?.id || user.role !== 'teacher') {
      return;
    }

    persistState(activeJob?.id ?? null, isPanelOpen, metadata);
  }, [activeJob?.id, isPanelOpen, metadata, persistState, user?.id, user?.role]);

  useEffect(() => {
    if (!user?.id || user.role !== 'teacher') {
      return;
    }

    if (!activeJob || !isGenerationJobActive(activeJob)) {
      return;
    }

    const intervalMs = isPanelOpen ? 3000 : 5000;
    const intervalId = window.setInterval(() => {
      void refreshJob();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeJob, isPanelOpen, refreshJob, user?.id, user?.role]);

  const value = useMemo<GenerationContextValue>(
    () => ({
      activeJob,
      metadata,
      isPanelOpen,
      isHydrated,
      trackJob,
      openPanel,
      closePanel,
      dismissJob,
      refreshJob,
    }),
    [activeJob, closePanel, dismissJob, isHydrated, isPanelOpen, metadata, openPanel, refreshJob, trackJob]
  );

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within GenerationProvider');
  }

  return context;
}
