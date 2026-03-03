'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data from an API endpoint
 * @param endpoint - The API endpoint to fetch from
 * @param immediate - Whether to fetch immediately on mount (default: true)
 */
export function useFetch<T>(
  endpoint: string | null,
  immediate = true
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate && !!endpoint,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.get<{ success: boolean; data: T }>(endpoint);
      setState({ data: response.data, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Request failed';
      setState({
        data: null,
        isLoading: false,
        error: message,
      });
    }
  }, [endpoint]);

  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [fetchData, immediate, endpoint]);

  return { ...state, refetch: fetchData };
}

interface UseMutationResult<TData, TResponse> {
  mutate: (data?: TData) => Promise<TResponse | null>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for mutating data (POST, PUT, PATCH, DELETE)
 * @param method - The HTTP method to use
 * @param endpoint - The API endpoint
 */
export function useMutation<TData = unknown, TResponse = unknown>(
  method: 'post' | 'put' | 'patch' | 'delete',
  endpoint: string
): UseMutationResult<TData, TResponse> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (data?: TData): Promise<TResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api[method]<{ success: boolean; data: TResponse }>(
        endpoint,
        data
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Request failed';
      setError(message);
      setIsLoading(false);
      return null;
    }
  };

  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  return { mutate, isLoading, error, reset };
}

interface UsePaginatedResult<T> extends UseApiState<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * Hook for fetching paginated data
 * @param baseEndpoint - The base API endpoint (without query params)
 * @param initialPage - Initial page number (default: 1)
 * @param limit - Items per page (default: 10)
 */
export function usePaginated<T>(
  baseEndpoint: string,
  initialPage = 1,
  limit = 10
): UsePaginatedResult<T> {
  const [page, setPage] = useState(initialPage);
  const [state, setState] = useState<UseApiState<T[]>>({
    data: null,
    isLoading: true,
    error: null,
  });
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const separator = baseEndpoint.includes('?') ? '&' : '?';
      const endpoint = `${baseEndpoint}${separator}page=${page}&limit=${limit}`;
      const response = await api.get<{
        success: boolean;
        data: T[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(endpoint);
      setState({ data: response.data, isLoading: false, error: null });
      setPagination(response.pagination);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Request failed';
      setState({
        data: null,
        isLoading: false,
        error: message,
      });
    }
  }, [baseEndpoint, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return {
    ...state,
    pagination,
    refetch: fetchData,
    goToPage,
    nextPage,
    prevPage,
  };
}
