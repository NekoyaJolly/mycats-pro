/**
 * 猫管理APIフック (TanStack Query)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, type ApiPathParams, type ApiQueryParams, type ApiRequestBody, type ApiResponse } from '../client';
import { createDomainQueryKeys } from './query-key-factory';
import { notifications } from '@mantine/notifications';

/**
 * 猫情報の型定義
 */
export interface Cat {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  breedId: string | null;
  coatColorId: string | null;
  microchipNumber: string | null;
  registrationNumber: string | null;
  description: string | null;
  isInHouse: boolean;
  adoptedAt: string | null;
  deathDate: string | null;
  fatherId: string | null;
  motherId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // リレーション（オプショナル）
  breed?: { id: string; name: string };
  coatColor?: { id: string; name: string };
  father?: Cat;
  mother?: Cat;
  tags?: Array<{ id: string; name: string; color: string }>;
}

/**
 * 猫一覧取得パラメータ
 */
export interface GetCatsParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: 'MALE' | 'FEMALE';
  breedId?: string;
  coatColorId?: string;
  isInHouse?: boolean;
}

type CatsListQuery = ApiQueryParams<'/cats', 'get'>;
type CatDetailPathParams = ApiPathParams<'/cats/{id}', 'get'>;

/**
 * 猫一覧レスポンス
 */
export interface GetCatsResponse {
  data: Cat[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 猫作成/更新リクエスト
 */
export interface CreateCatRequest {
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  breedId?: string | null;
  coatColorId?: string | null;
  microchipNumber?: string | null;
  registrationNumber?: string | null;
  description?: string | null;
  isInHouse?: boolean;
  fatherId?: string | null;
  motherId?: string | null;
  tagIds?: string[];
}

export type UpdateCatRequest = Partial<CreateCatRequest>;

/**
 * クエリキー定義
 */
const baseCatKeys = createDomainQueryKeys<string, GetCatsParams>('cats');

export const catKeys = {
  ...baseCatKeys,
  statistics: () => [...baseCatKeys.all, 'statistics'] as const,
  breedingHistory: (id: string) => [...baseCatKeys.all, 'breeding-history', id] as const,
  careHistory: (id: string) => [...baseCatKeys.all, 'care-history', id] as const,
};

/**
 * 猫一覧を取得するフック
 */
export function useGetCats(
  params: GetCatsParams = {},
  options?: Omit<UseQueryOptions<ApiResponse<GetCatsResponse>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.list(params),
    queryFn: () => apiClient.get('/cats', { query: params as CatsListQuery }) as Promise<ApiResponse<GetCatsResponse>>,
    ...options,
  });
}

/**
 * 猫詳細を取得するフック
 */
export function useGetCat(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<Cat>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.detail(id),
  queryFn: () => apiClient.get('/cats/{id}', { pathParams: { id } as CatDetailPathParams }) as Promise<ApiResponse<Cat>>,
    enabled: !!id,
    ...options,
  });
}

/**
 * 猫統計を取得するフック
 */
export function useGetCatStatistics(
  options?: Omit<UseQueryOptions<ApiResponse<unknown>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.statistics(),
    queryFn: () => apiClient.get('/cats/statistics'),
    ...options,
  });
}

/**
 * 猫を作成するフック
 */
export function useCreateCat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCatRequest) =>
      apiClient.post('/cats', {
        body: data as unknown as ApiRequestBody<'/cats', 'post'>,
      }) as Promise<ApiResponse<Cat>>,
  onSuccess: (_response) => {
      // キャッシュを無効化して再フェッチ
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: catKeys.statistics() });
      
      notifications.show({
        title: '成功',
        message: '猫情報を登録しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '猫情報の登録に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 猫情報を更新するフック
 */
export function useUpdateCat(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCatRequest) =>
      apiClient.patch('/cats/{id}', {
        pathParams: { id } as ApiPathParams<'/cats/{id}', 'patch'>,
        body: data as unknown as ApiRequestBody<'/cats/{id}', 'patch'>,
      }) as Promise<ApiResponse<Cat>>,
  onSuccess: (_response) => {
      // 特定の猫の詳細キャッシュを更新
      void queryClient.invalidateQueries({ queryKey: catKeys.detail(id) });
      // 一覧のキャッシュも無効化
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: catKeys.statistics() });
      
      notifications.show({
        title: '成功',
        message: '猫情報を更新しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '猫情報の更新に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 猫を削除するフック
 */
export function useDeleteCat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete('/cats/{id}', {
      pathParams: { id } as ApiPathParams<'/cats/{id}', 'delete'>,
    }),
  onSuccess: (_response, id) => {
      // 削除した猫のキャッシュを削除
      void queryClient.removeQueries({ queryKey: catKeys.detail(id) });
      // 一覧のキャッシュも無効化
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: catKeys.statistics() });
      
      notifications.show({
        title: '成功',
        message: '猫情報を削除しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '猫情報の削除に失敗しました',
        color: 'red',
      });
    },
  });
}
