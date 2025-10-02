/**
 * 認証状態管理ストア (Zustand)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient, setTokens as setApiTokens, clearTokens as clearApiTokens } from './client';
import type { ApiResponse } from './client';

/**
 * ユーザー情報の型定義
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

/**
 * ログインレスポンスの型定義
 */
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * ログインリクエストの型定義
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 認証ストアの状態型定義
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 認証ストアのアクション型定義
 */
interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * 認証ストア
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // 状態
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // アクション
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            // トークンをセット
            setApiTokens(accessToken, refreshToken);
            
            // ユーザー情報をストアに保存
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.error || 'ログインに失敗しました');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          // バックエンドのログアウトエンドポイントを呼び出し
          await apiClient.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // トークンをクリア
          clearApiTokens();
          
          // 状態をリセット
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // SSR対応: サーバーサイドではlocalStorageが無いため
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        // persistする項目を選択（tokenは除外、user情報のみ）
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/**
 * 認証状態を取得するカスタムフック
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
