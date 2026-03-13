'use client';

import {
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

type ApiQueryOptions<TData, TSelect = TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<TData, Error, TSelect, TQueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKey: TQueryKey;
  endpoint: string;
};

export const queryKeys = {
  teacherProfile: () => ['teacher', 'profile'] as const,
  teacherHistory: (type: string, sort: string) => ['teacher', 'history', type, sort] as const,
  lesson: (lessonId: string) => ['lesson', lessonId] as const,
  quiz: (quizId: string) => ['quiz', quizId] as const,
  quizQuestions: (quizId: string) => ['quiz', quizId, 'questions'] as const,
  assessment: (assessmentId: string) => ['assessment', assessmentId] as const,
};

export async function fetchApiData<TData>(endpoint: string): Promise<TData> {
  const response = await api.get<{ success: boolean; data: TData }>(endpoint);
  return response.data;
}

export function useApiQuery<
  TData,
  TSelect = TData,
  TQueryKey extends QueryKey = QueryKey,
>({ queryKey, endpoint, ...options }: ApiQueryOptions<TData, TSelect, TQueryKey>) {
  return useQuery<TData, Error, TSelect, TQueryKey>({
    queryKey,
    queryFn: () => fetchApiData<TData>(endpoint),
    ...options,
  });
}

export function useAppQueryClient() {
  return useQueryClient();
}
