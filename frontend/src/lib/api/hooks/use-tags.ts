/**
 * タグ管理APIフック
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiPathParams, type ApiRequestBody } from '../client';
import { createDomainQueryKeys } from './query-key-factory';
import { catKeys } from './use-cats';

export interface TagSummary {
  id: string;
  name: string;
  color: string;
  description?: string;
  usage_count: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTagRequest = ApiRequestBody<'/tags', 'post'>;

type AssignTagRequest = ApiRequestBody<'/tags/cats/{id}/tags', 'post'>;

type TagListResponse = {
  success: boolean;
  data?: TagSummary[];
  message?: string;
  error?: string;
};

const tagKeys = createDomainQueryKeys<string>('tags');

export { tagKeys };

export function useGetTags(
  options?: Omit<UseQueryOptions<TagListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => apiClient.get('/tags') as Promise<TagListResponse>,
    staleTime: 1000 * 60,
    ...options,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagRequest) =>
      apiClient.post('/tags', {
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      notifications.show({
        title: 'タグを作成しました',
        message: '新しいタグが利用可能になりました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'タグの作成に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete('/tags/{id}', {
        pathParams: { id } as ApiPathParams<'/tags/{id}', 'delete'>,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      notifications.show({
        title: 'タグを削除しました',
        message: 'タグを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'タグの削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useAssignTagToCat(catId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignTagRequest) =>
      apiClient.post('/tags/cats/{id}/tags', {
        pathParams: { id: catId } as ApiPathParams<'/tags/cats/{id}/tags', 'post'>,
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catKeys.detail(catId) });
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      notifications.show({
        title: 'タグを付与しました',
        message: '猫のタグ情報を更新しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'タグ付与に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useUnassignTagFromCat(catId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) =>
      apiClient.delete('/tags/cats/{id}/tags/{tagId}', {
        pathParams: { id: catId, tagId } as ApiPathParams<'/tags/cats/{id}/tags/{tagId}', 'delete'>,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catKeys.detail(catId) });
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      notifications.show({
        title: 'タグを削除しました',
        message: '猫からタグを解除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'タグ解除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}
