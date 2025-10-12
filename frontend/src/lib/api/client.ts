/**
 * API Client
 * バックエンドAPIとの通信を行う共通クライアント
 */

import type { operations, paths } from './generated/schema';

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
export interface ApiResponse<T = unknown, M = unknown> {
  success: boolean;
  data?: T;
  meta?: M;
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

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ApiHttpMethod = HttpMethod;

type ApiPrefix = '/api/v1';

type NormalizePath<Path extends string> = Path extends `${ApiPrefix}${infer Rest}`
  ? Rest extends ''
    ? '/'
    : Rest extends `/${string}`
      ? Rest
      : `/${Rest}`
  : Path;

type CanonicalPath<Path extends string> = Path extends `${ApiPrefix}${string}`
  ? Path
  : `${ApiPrefix}${Path extends `/${string}` ? Path : `/${Path}`}`;

type FilterPathsByMethod<M extends HttpMethod> = {
  [P in keyof paths]: paths[P][M] extends never ? never : NormalizePath<P & string>;
}[keyof paths];

type ExtractOperation<P extends string, M extends HttpMethod> = CanonicalPath<P> extends infer Canonical
  ? Canonical extends keyof paths
    ? paths[Canonical][M] extends operations[keyof operations]
      ? paths[Canonical][M]
      : never
    : never
  : never;

type PathParamsFor<P extends string, M extends HttpMethod> = ExtractOperation<P, M> extends {
  parameters: { path: infer Params };
}
  ? Params
  : Record<string, never>;

type QueryParamsFor<P extends string, M extends HttpMethod> = ExtractOperation<P, M> extends {
  parameters: { query: infer Params };
}
  ? Params
  : Record<string, never>;

type RequestBodyFor<P extends string, M extends HttpMethod> = ExtractOperation<P, M> extends {
  requestBody: { content: infer Content };
}
  ? Content extends { 'application/json': infer Json }
    ? Json
    : Content extends Record<string, unknown>
      ? Content[keyof Content]
      : unknown
  : never;

type ResponsesOf<Operation> = Operation extends { responses: infer Responses } ? Responses : never;

type ExtractJsonContent<Response> = Response extends { content: { 'application/json': infer Json } }
  ? Json
  : Response extends { content: infer Content }
    ? Content extends Record<string, unknown>
      ? Content[keyof Content]
      : unknown
    : unknown;

type ExtractResponsePayload<Responses, Status extends number> = Responses extends Record<number | string, unknown>
  ? Status extends keyof Responses
    ? ExtractJsonContent<Responses[Status]>
    : undefined
  : undefined;

type ExtractSuccessResponse<Operation> = Operation extends never
  ? unknown
  : ResponsesOf<Operation> extends infer Responses
    ? Responses extends Record<number | string, unknown>
      ? ExtractResponsePayload<Responses, 200> extends infer R200
        ? [R200] extends [undefined]
          ? ExtractResponsePayload<Responses, 201> extends infer R201
            ? [R201] extends [undefined]
              ? ExtractResponsePayload<Responses, 202> extends infer R202
                ? [R202] extends [undefined]
                  ? ExtractResponsePayload<Responses, 204> extends infer R204
                    ? [R204] extends [undefined]
                      ? unknown
                      : R204
                    : unknown
                  : R202
                : unknown
              : R201
            : unknown
          : R200
        : unknown
      : unknown
    : unknown;

export type ApiSuccessData<P extends FilterPathsByMethod<M>, M extends HttpMethod> = ExtractSuccessResponse<
  ExtractOperation<P, M>
>;

export type ApiRequestOptions<P extends FilterPathsByMethod<M>, M extends HttpMethod> = {
  pathParams?: PathParamsFor<P, M>;
  query?: QueryParamsFor<P, M>;
  body?: RequestBodyFor<P, M>;
  init?: Omit<RequestInit, 'method' | 'body'>;
  retryOnUnauthorized?: boolean;
};

type AllPaths = {
  [P in keyof paths]: NormalizePath<P & string>;
}[keyof paths];

export type ApiPath = AllPaths;
export type ApiMethodPaths<M extends HttpMethod> = FilterPathsByMethod<M>;
export type ApiPathParams<P extends FilterPathsByMethod<M>, M extends HttpMethod> = PathParamsFor<P, M>;
export type ApiQueryParams<P extends FilterPathsByMethod<M>, M extends HttpMethod> = QueryParamsFor<P, M>;
export type ApiRequestBody<P extends FilterPathsByMethod<M>, M extends HttpMethod> = RequestBodyFor<P, M>;

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

function applyPathParams(path: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    if (/\{[^}]+\}/.test(path)) {
      throw new Error(`必須のパスパラメータが指定されていません: ${path}`);
    }
    return path;
  }

  const resolved = path.replace(/\{([^}]+)\}/g, (_segment, key: string) => {
    if (!(key in params)) {
      throw new Error(`パスパラメータ '${key}' が不足しています`);
    }

    const value = params[key];

    if (value === undefined || value === null) {
      throw new Error(`パスパラメータ '${key}' が無効です`);
    }

    return encodeURIComponent(String(value));
  });

  if (/\{[^}]+\}/.test(resolved)) {
    throw new Error(`未解決のパスパラメータが存在します: ${resolved}`);
  }

  return resolved;
}

function serializeQueryValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value ?? '');
}

function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) {
          return;
        }
        searchParams.append(key, serializeQueryValue(item));
      });
      return;
    }

    searchParams.append(key, serializeQueryValue(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function buildRequestUrl<Method extends HttpMethod, PathKey extends FilterPathsByMethod<Method>>(
  path: PathKey,
  options: Pick<ApiRequestOptions<PathKey, Method>, 'pathParams' | 'query'> = {},
): string {
  const resolvedPath = applyPathParams(
    path as string,
    options.pathParams as unknown as Record<string, unknown> | undefined,
  );
  const queryString = buildQueryString(options.query as unknown as Record<string, unknown> | undefined);
  return `${resolvedPath}${queryString}`;
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

export function setTokens(access: string | null, refresh?: string | null): void {
  accessToken = access ?? null;

  if (refresh !== undefined) {
    refreshToken = refresh ?? null;
  }

  if (typeof window !== 'undefined') {
    if (access) {
      localStorage.setItem('accessToken', access);
      setCookie('accessToken', access, 7);
    } else {
      localStorage.removeItem('accessToken');
      deleteCookie('accessToken');
    }

    if (refresh !== undefined) {
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
        setCookie('refreshToken', refresh, 7);
      } else {
        localStorage.removeItem('refreshToken');
        deleteCookie('refreshToken');
      }
    }
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

  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: token ? JSON.stringify({ refreshToken: token }) : JSON.stringify({}),
      credentials: 'include',
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

    if (data.success && data.data && isRecord(data.data) && typeof data.data.access_token === 'string') {
      const access = data.data.access_token;
      const refresh = 'refresh_token' in data.data && typeof data.data.refresh_token === 'string'
        ? data.data.refresh_token
        : undefined;
      setTokens(access, refresh ?? null);
      return access;
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
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<ApiResponse<T>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const headers = new Headers(options.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials ?? 'include',
  };

  try {
    const response = await fetch(fullUrl, requestInit);

    if (response.status === 401 && retryOnUnauthorized) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(fullUrl, {
          ...requestInit,
          headers,
        });
        return handleResponse<T>(retryResponse);
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError('認証が必要です', 401);
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

export async function request<M extends HttpMethod, P extends FilterPathsByMethod<M>>(
  path: P,
  method: M,
  options: ApiRequestOptions<P, M> = {},
): Promise<ApiResponse<ApiSuccessData<P, M>>> {
  const { pathParams, query, body, init, retryOnUnauthorized } = options;
  const url = buildRequestUrl<M, P>(path, { pathParams, query });
  const requestInit: RequestInit = {
    ...init,
    method: method.toUpperCase() as Uppercase<M>,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  return apiRequest<ApiSuccessData<P, M>>(url, requestInit, retryOnUnauthorized);
}

export async function get<P extends FilterPathsByMethod<'get'>>(
  path: P,
  options: ApiRequestOptions<P, 'get'> = {},
): Promise<ApiResponse<ApiSuccessData<P, 'get'>>> {
  return request(path, 'get', options);
}

export async function post<P extends FilterPathsByMethod<'post'>>(
  path: P,
  options: ApiRequestOptions<P, 'post'> = {},
): Promise<ApiResponse<ApiSuccessData<P, 'post'>>> {
  return request(path, 'post', options);
}

export async function patch<P extends FilterPathsByMethod<'patch'>>(
  path: P,
  options: ApiRequestOptions<P, 'patch'> = {},
): Promise<ApiResponse<ApiSuccessData<P, 'patch'>>> {
  return request(path, 'patch', options);
}

export async function del<P extends FilterPathsByMethod<'delete'>>(
  path: P,
  options: ApiRequestOptions<P, 'delete'> = {},
): Promise<ApiResponse<ApiSuccessData<P, 'delete'>>> {
  return request(path, 'delete', options);
}

export type ApiClient = {
  request: typeof request;
  get: typeof get;
  post: typeof post;
  patch: typeof patch;
  delete: typeof del;
};

export const apiClient: ApiClient = {
  request,
  get,
  post,
  patch,
  delete: del,
};
