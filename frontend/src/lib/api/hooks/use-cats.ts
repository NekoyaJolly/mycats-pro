/**
 * 猫管理APIフック (TanStack Query)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../client';
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

/**
 * 猫一覧レスポンス
 */
export interface GetCatsResponse {
  cats: Cat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
export const catKeys = {
  all: ['cats'] as const,
  lists: () => [...catKeys.all, 'list'] as const,
  list: (params: GetCatsParams) => [...catKeys.lists(), params] as const,
  details: () => [...catKeys.all, 'detail'] as const,
  detail: (id: string) => [...catKeys.details(), id] as const,
  statistics: () => [...catKeys.all, 'statistics'] as const,
  breedingHistory: (id: string) => [...catKeys.all, id, 'breeding-history'] as const,
  careHistory: (id: string) => [...catKeys.all, id, 'care-history'] as const,
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
    queryFn: () => apiClient.get<GetCatsResponse>('/cats', params as Record<string, string | number | boolean | undefined>),
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
    queryFn: () => apiClient.get<Cat>(`/cats/${id}`),
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
    mutationFn: (data: CreateCatRequest) => apiClient.post<Cat>('/cats', data),
    onSuccess: (response) => {
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
    mutationFn: (data: UpdateCatRequest) => apiClient.patch<Cat>(`/cats/${id}`, data),
    onSuccess: (response) => {
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
    mutationFn: (id: string) => apiClient.delete(`/cats/${id}`),
    onSuccess: (response, id) => {
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
