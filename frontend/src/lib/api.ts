const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** Event dispatched when refresh token fails — auth context should clear user and redirect */
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

// Token management
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const setTokens = (token: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

// API error class
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/** Endpoints that must not trigger token refresh on 401 (prevents loops) */
const NO_REFRESH_ENDPOINTS = ['/auth/refresh-token', '/auth/login'];

function shouldAttemptRefresh(endpoint: string): boolean {
  return !NO_REFRESH_ENDPOINTS.some((noRefresh) => endpoint.includes(noRefresh));
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempt to refresh access token. Serializes concurrent calls. Returns true if succeeded. */
async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return false;
      }

      const res = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const json = await res.json();

      if (!res.ok) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
        }
        return false;
      }

      const { accessToken, refreshToken: newRefreshToken } = json.data ?? json;
      if (accessToken && newRefreshToken) {
        setTokens(accessToken, newRefreshToken);
        return true;
      }

      clearTokens();
      return false;
    } catch {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
      }
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// API fetch wrapper
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses (e.g. proxy HTML on 401)
  const contentType = response.headers.get('content-type');
  const isAuthError = response.status === 401 || response.status === 481;
  if (!contentType || !contentType.includes('application/json')) {
    if (isAuthError && !isRetry && shouldAttemptRefresh(endpoint)) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) return apiFetch<T>(endpoint, options, true);
    }
    if (!response.ok) {
      throw new ApiError('Request failed', response.status);
    }
    return {} as T;
  }

  const data = await response.json();

  // 401 or 481 (proxy auth): try token refresh once, then retry
  if (isAuthError && !isRetry && shouldAttemptRefresh(endpoint)) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return apiFetch<T>(endpoint, options, true);
    }
  }

  if (!response.ok) {
    const message =
      (data as { error?: { message?: string }; message?: string })?.error?.message ??
      (data as { message?: string })?.message ??
      'Request failed';
    throw new ApiError(message, response.status, (data as { errors?: Record<string, string[]> })?.errors);
  }

  return data as T;
}

// File upload wrapper (for multipart/form-data)
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST',
  isRetry = false
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  const data = await response.json();

  const isAuthError = response.status === 401 || response.status === 481;
  if (isAuthError && !isRetry && shouldAttemptRefresh(endpoint)) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return apiUpload<T>(endpoint, formData, method, true);
    }
  }

  if (!response.ok) {
    const message =
      (data as { error?: { message?: string }; message?: string })?.error?.message ??
      (data as { message?: string })?.message ??
      'Upload failed';
    throw new ApiError(message, response.status, (data as { errors?: Record<string, string[]> })?.errors);
  }

  return data as T;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, data?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }),

  upload: <T>(endpoint: string, formData: FormData) =>
    apiUpload<T>(endpoint, formData, 'POST'),

  putUpload: <T>(endpoint: string, formData: FormData) =>
    apiUpload<T>(endpoint, formData, 'PUT'),
};

export default api;
