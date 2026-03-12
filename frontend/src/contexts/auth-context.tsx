'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { googleLogout } from '@react-oauth/google';
import { api, setTokens, clearTokens, getToken, AUTH_SESSION_EXPIRED_EVENT } from '@/lib/api';
=======
import { api, setTokens, clearTokens, getToken, AUTH_SESSION_EXPIRED_EVENT, ApiError } from '@/lib/api';
>>>>>>> origin/main
import type { User, LoginRequest, LoginResponse, ApiResponse } from '@/types/api';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'teacher' | 'student' | 'admin';
  schoolName?: string;
  classId?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (credential: string, role: 'teacher') => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      setUser(response.data);
    } catch (err) {
      // Only clear tokens on definitive auth failures — avoid logout on transient 500/network errors
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearTokens();
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-validate session when tab becomes visible (helps maintain session across tab switches)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && getToken()) {
        checkAuth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAuth]);

  // Sync auth state across tabs when another tab logs in/out (localStorage changes)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        checkAuth();
      }
      if ((e.key === 'token' || e.key === 'refreshToken') && e.newValue === null) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkAuth]);

  // Handle session expired (e.g. refresh token failed) — clear user so AuthGuard redirects
  useEffect(() => {
    const handleSessionExpired = () => {
      clearTokens();
      setUser(null);
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);

    const user = response.data.user;
    const onboardingCompleted = user.onboardingCompleted ?? (user as { profile?: { onboardingCompleted?: boolean } })?.profile?.onboardingCompleted ?? false;

    if (user.role === 'teacher' && !onboardingCompleted) {
      router.push('/home?setup=true');
      return;
    }

    const redirectMap: Record<string, string> = {
      teacher: '/home',
      student: '/student-home',
      admin: '/admin-dashboard',
    };
    router.push(redirectMap[user.role] || '/');
  };

  const loginWithGoogle = async (credential: string, role: 'teacher') => {
    const response = await api.post<LoginResponse>('/auth/google', {
      credential,
      role,
    });
    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);

    const loggedInUser = response.data.user;

    if (loggedInUser.role === 'teacher' && !loggedInUser.onboardingCompleted) {
      router.push('/home?setup=true');
      return;
    }

    const redirectMap: Record<string, string> = {
      teacher: '/home',
      student: '/student-home',
      admin: '/admin-dashboard',
    };
    router.push(redirectMap[loggedInUser.role] || '/');
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    setUser(response.data.user);

    const user = response.data.user;

    // New teachers always go to onboarding
    if (user.role === 'teacher') {
      router.push('/home?setup=true');
      return;
    }

    // Redirect based on role for non-teachers
    const redirectMap: Record<string, string> = {
      student: '/student-home',
      admin: '/admin-dashboard',
    };
    router.push(redirectMap[user.role] || '/');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors - we still want to clear local state
    }
    try {
      googleLogout();
    } catch {
      // Ignore if Google OAuth not initialized
    }
    clearTokens();
    setUser(null);
    router.push('/teacher/login');
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      setUser(response.data);
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export the context for testing purposes
export { AuthContext };
