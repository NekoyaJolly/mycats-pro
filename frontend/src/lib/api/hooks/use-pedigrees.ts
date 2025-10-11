/**
 * 血統書管理APIフック
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiPathParams, type ApiQueryParams, type ApiRequestBody } from '../client';
import { createDomainQueryKeys } from './query-key-factory';

export interface PedigreeRecord {
  id: string;
  pedigreeId: string;
  catName?: string | null;
  title?: string | null;
  genderCode?: number | null;
  eyeColor?: string | null;
  breedCode?: number | null;
  coatColorCode?: number | null;
  birthDate?: string | null;
  breederName?: string | null;
  ownerName?: string | null;
  registrationDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PedigreeListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type GetPedigreesParams = ApiQueryParams<'/pedigrees', 'get'>;

export interface PedigreeListResponse {
  success: boolean;
  data?: PedigreeRecord[];
  meta?: PedigreeListMeta;
  message?: string;
  error?: string;
}

export type CreatePedigreeRequest = ApiRequestBody<'/pedigrees', 'post'>;
export type UpdatePedigreeRequest = ApiRequestBody<'/pedigrees/{id}', 'patch'>;

const basePedigreeKeys = createDomainQueryKeys<string, GetPedigreesParams>('pedigrees');

export const pedigreeKeys = {
  ...basePedigreeKeys,
  byNumber: (pedigreeId: string) => [...basePedigreeKeys.all, 'by-number', pedigreeId] as const,
  family: (id: string, generations?: number) =>
    [...basePedigreeKeys.all, 'family', id, generations ?? 'default'] as const,
  familyTree: (id: string) => [...basePedigreeKeys.all, 'family-tree', id] as const,
  descendants: (id: string) => [...basePedigreeKeys.all, 'descendants', id] as const,
};

export function useGetPedigrees(
  params: GetPedigreesParams = {},
  options?: Omit<UseQueryOptions<PedigreeListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pedigreeKeys.list(params),
    queryFn: () =>
      apiClient.get('/pedigrees', {
        query: params,
      }) as Promise<PedigreeListResponse>,
    ...options,
  });
}

export function useGetPedigree(
  id: string,
  options?: Omit<UseQueryOptions<PedigreeRecord | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pedigreeKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get('/pedigrees/{id}', {
        pathParams: { id } as ApiPathParams<'/pedigrees/{id}', 'get'>,
      });
      return (response.data ?? null) as PedigreeRecord | null;
    },
    enabled: !!id,
    ...options,
  });
}

export function useGetPedigreeByNumber(
  pedigreeId: string,
  options?: Omit<UseQueryOptions<PedigreeRecord | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pedigreeKeys.byNumber(pedigreeId),
    queryFn: async () => {
      if (!pedigreeId) return null;
      const response = await apiClient.get('/pedigrees/pedigree-id/{pedigreeId}', {
        pathParams: { pedigreeId } as ApiPathParams<'/pedigrees/pedigree-id/{pedigreeId}', 'get'>,
      });
      return (response.data ?? null) as PedigreeRecord | null;
    },
    enabled: !!pedigreeId,
    ...options,
  });
}

export function useGetPedigreeFamily(
  id: string,
  generations?: number,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pedigreeKeys.family(id, generations),
    queryFn: () =>
      apiClient.get('/pedigrees/{id}/family', {
        pathParams: { id } as ApiPathParams<'/pedigrees/{id}/family', 'get'>,
        query: generations
          ? ({ generations } as unknown as ApiQueryParams<'/pedigrees/{id}/family', 'get'>)
          : undefined,
      }),
    enabled: !!id,
    ...options,
  });
}

export function useGetPedigreeDescendants(
  id: string,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pedigreeKeys.descendants(id),
    queryFn: () =>
      apiClient.get('/pedigrees/{id}/descendants', {
        pathParams: { id } as ApiPathParams<'/pedigrees/{id}/descendants', 'get'>,
      }),
    enabled: !!id,
    ...options,
  });
}

export function useGetPedigreeFamilyTree(
  id: string,
  options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pedigreeKeys.familyTree(id),
    queryFn: () =>
      apiClient.get('/pedigrees/{id}/family-tree', {
        pathParams: { id } as ApiPathParams<'/pedigrees/{id}/family-tree', 'get'>,
      }),
    enabled: !!id,
    ...options,
  });
}

export function useCreatePedigree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePedigreeRequest) =>
      apiClient.post('/pedigrees', {
        body: payload,
      }),
    onSuccess: (response) => {
      const createdId = (response.data as PedigreeRecord | undefined)?.id;
      void queryClient.invalidateQueries({ queryKey: pedigreeKeys.lists() });
      if (createdId) {
        void queryClient.invalidateQueries({ queryKey: pedigreeKeys.detail(createdId) });
      }
      notifications.show({
        title: '血統書データを登録しました',
        message: '血統書情報が追加されました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '血統書データの登録に失敗しました',
        message: error.message ?? '入力内容をご確認の上、再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useUpdatePedigree(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePedigreeRequest) =>
      apiClient.patch('/pedigrees/{id}', {
        pathParams: { id } as ApiPathParams<'/pedigrees/{id}', 'patch'>,
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pedigreeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: pedigreeKeys.detail(id) });
      notifications.show({
        title: '血統書データを更新しました',
        message: '血統書情報を更新しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '血統書データの更新に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useDeletePedigree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete('/pedigrees/{id}', {
        pathParams: { id } as ApiPathParams<'/pedigrees/{id}', 'delete'>,
      }),
    onSuccess: (_response, id) => {
      void queryClient.invalidateQueries({ queryKey: pedigreeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: pedigreeKeys.detail(id) });
      notifications.show({
        title: '血統書データを削除しました',
        message: '血統書情報を削除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '血統書データの削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}
