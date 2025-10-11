import { create } from 'zustand';
import { apiClient, clearTokens, setTokens } from '../api/client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: (payload: unknown) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

type RawAuthPayload = {
  accessToken?: unknown;
  access_token?: unknown;
  refreshToken?: unknown;
  refresh_token?: unknown;
  user?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const idCandidate = typeof value.id === 'string' ? value.id : typeof value.userId === 'string' ? value.userId : null;
  const emailCandidate = typeof value.email === 'string' ? value.email : null;
  const roleCandidate = typeof value.role === 'string' ? value.role : null;

  if (!idCandidate || !emailCandidate || !roleCandidate) {
    return null;
  }

  const firstName = 'firstName' in value && typeof value.firstName === 'string' ? value.firstName : null;
  const lastName = 'lastName' in value && typeof value.lastName === 'string' ? value.lastName : null;

  return {
    id: idCandidate,
    email: emailCandidate,
    role: roleCandidate,
    firstName,
    lastName,
  };
}

function extractAuthPayload(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const payload = value as RawAuthPayload;
  const accessToken = typeof payload.accessToken === 'string'
    ? payload.accessToken
    : typeof payload.access_token === 'string'
      ? payload.access_token
      : null;

  if (!accessToken) {
    return null;
  }

  const refreshToken = typeof payload.refreshToken === 'string'
    ? payload.refreshToken
    : typeof payload.refresh_token === 'string'
      ? payload.refresh_token
      : null;

  const user = toAuthUser(payload.user ?? null);

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post('/auth/login', {
        body: credentials,
        retryOnUnauthorized: false,
      });

      if (!response.success) {
        throw new Error(response.error || response.message || 'ログインに失敗しました');
      }

      const payload = extractAuthPayload(response.data);
      if (!payload || !payload.user) {
        throw new Error('ログインレスポンスの形式が正しくありません');
      }

      setTokens(payload.accessToken, payload.refreshToken ?? null);

      set({
        user: payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? null,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        error: message,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout', {
        retryOnUnauthorized: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        error: null,
      });
    }
  },

  bootstrap: (payload) => {
    const data = extractAuthPayload(payload ?? null);

    if (data) {
      setTokens(data.accessToken, data.refreshToken ?? null);
    }

    set({
      user: data?.user ?? null,
      accessToken: data?.accessToken ?? null,
      refreshToken: data?.refreshToken ?? null,
      isAuthenticated: !!(data?.accessToken && data?.user),
      isLoading: false,
      initialized: true,
      error: null,
    });
  },

  setError: (message) => set({ error: message ?? null }),

  clearError: () => set({ error: null }),
}));

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialized = useAuthStore((state) => state.initialized);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    initialized,
    error,
    login,
    logout,
    clearError,
  };
}
