/**
 * 品種管理APIフック (TanStack Query)
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, type ApiQueryParams, type ApiResponse } from '../client';
import { createDomainQueryKeys } from './query-key-factory';

/**
 * 品種情報の型定義
 */
export interface Breed {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 品種一覧取得パラメータ
 */
export interface GetBreedsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type BreedsListQuery = ApiQueryParams<'/breeds', 'get'>;

/**
 * 品種一覧レスポンス
 */
export interface GetBreedsResponse {
  data: Breed[];
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
const baseBreedKeys = createDomainQueryKeys<string, GetBreedsParams>('breeds');

export const breedKeys = {
  ...baseBreedKeys,
};

/**
 * 品種一覧を取得するフック
 */
export function useGetBreeds(
  params: GetBreedsParams = {},
  options?: Omit<UseQueryOptions<ApiResponse<GetBreedsResponse>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: breedKeys.list(params),
    queryFn: () => apiClient.get('/breeds', { query: params as BreedsListQuery }) as Promise<ApiResponse<GetBreedsResponse>>,
    ...options,
  });
}