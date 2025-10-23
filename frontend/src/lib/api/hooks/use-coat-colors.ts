/**
 * 毛色管理APIフック (TanStack Query)
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, type ApiQueryParams, type ApiResponse } from '../client';
import { createDomainQueryKeys } from './query-key-factory';

/**
 * 毛色情報の型定義
 */
export interface CoatColor {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 毛色一覧取得パラメータ
 */
export interface GetCoatColorsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type CoatColorsListQuery = ApiQueryParams<'/coat-colors', 'get'>;

/**
 * 毛色一覧レスポンス
 */
export interface GetCoatColorsResponse {
  data: CoatColor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * クエリキー定義
 */
const baseCoatColorKeys = createDomainQueryKeys<string, GetCoatColorsParams>('coat-colors');

export const coatColorKeys = {
  ...baseCoatColorKeys,
};

/**
 * 毛色一覧を取得するフック
 */
export function useGetCoatColors(
  params: GetCoatColorsParams = {},
  options?: Omit<UseQueryOptions<ApiResponse<GetCoatColorsResponse>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: coatColorKeys.list(params),
    queryFn: () => apiClient.get('/coat-colors', { query: params as CoatColorsListQuery }) as Promise<ApiResponse<GetCoatColorsResponse>>,
    ...options,
  });
}