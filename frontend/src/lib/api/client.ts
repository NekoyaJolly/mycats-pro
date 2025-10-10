/**
 * API Client
 * バックエンドAPIとの通信を行う共通クライアント
 */

// NOTE: generated/schema.ts は最初の型生成後にインポート可能になります
async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    const parseError = error instanceof Error ? error : undefined;
    if (parseError) {
      throw parseError;
    }
    throw new Error('JSONレスポンスの解析に失敗しました');
  }
}
// import type { paths } from './generated/schema';

/**
 * API基底URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

/**
 * APIレスポンスの共通型
 */
export interface ApiResponse<T = object> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.success !== 'boolean') {
    return false;
  }

  if ('message' in value && value.message !== undefined && typeof value.message !== 'string') {
    return false;
  }

  if ('error' in value && value.error !== undefined && typeof value.error !== 'string') {
    return false;
  }

  return true;
}

/**
 * トークン管理
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Cookie に値を設定
 */
function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Cookie から値を取得
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Cookie を削除
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  
  // ブラウザ環境ではlocalStorageとCookieに保存
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    // Cookieにも保存（middlewareで使用）
    setCookie('accessToken', access, 7);
    setCookie('refreshToken', refresh, 7);
  }
}

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken') || getCookie('accessToken');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refreshToken') || getCookie('refreshToken');
  }
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
  }
}

/**
 * トークンリフレッシュ
 */
function isTokenPair(value: unknown): value is { accessToken: string; refreshToken: string } {
  return (
    isRecord(value)
    && typeof value.accessToken === 'string'
    && typeof value.refreshToken === 'string'
  );
}

async function refreshAccessToken(): Promise<string | null> {
  const token = getRefreshToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await parseJson(response);

    if (!isApiResponse(data)) {
      throw new ApiError('トークンリフレッシュのレスポンス形式が不正です', response.status, data);
    }

    if (data.success && data.data && isTokenPair(data.data)) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return null;
  }
}

/**
 * API リクエスト共通処理
 */
export async function apiRequest<T = object>(
  url: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<ApiResponse<T>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 既存のヘッダーをマージ
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  // 認証トークンを追加
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // 401 Unauthorized の場合、トークンをリフレッシュしてリトライ
    if (response.status === 401 && retryOnUnauthorized) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(fullUrl, {
          ...options,
          headers,
        });
        return handleResponse<T>(retryResponse);
      } else {
        // リフレッシュ失敗 - ログインページへリダイレクト
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('認証が必要です', 401);
      }
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '通信エラーが発生しました',
      0,
    );
  }
}

/**
 * レスポンス処理
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData: unknown;

    if (isJson) {
      try {
        errorData = await parseJson(response);
        if (isRecord(errorData) && 'message' in errorData && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      } catch {
        // JSON解析失敗
      }
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (isJson) {
    try {
      const data = await parseJson(response);
      if (!isApiResponse(data)) {
        throw new ApiError('APIレスポンスの形式が不正です', response.status, data);
      }
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'JSONレスポンスの解析に失敗しました',
        response.status,
      );
    }
  }

  return {
    success: true,
    data: undefined as T,
  };
}

/**
 * GET リクエスト
 */
export async function get<T = object>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ApiResponse<T>> {
  let fullUrl = url;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl = `${url}?${queryString}`;
    }
  }

  return apiRequest<T>(fullUrl, { method: 'GET' });
}

/**
 * POST リクエスト
 */
export async function post<T = object>(
  url: string,
  body?: object,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH リクエスト
 */
export async function patch<T = object>(
  url: string,
  body?: object,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE リクエスト
 */
export async function del<T = object>(
  url: string,
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE' });
}

/**
 * 型安全なAPIクライアント（OpenAPI型定義を使用）
 */
export type ApiClient = {
  get: typeof get;
  post: typeof post;
  patch: typeof patch;
  delete: typeof del;
};

export const apiClient: ApiClient = {
  get,
  post,
  patch,
  delete: del,
};
