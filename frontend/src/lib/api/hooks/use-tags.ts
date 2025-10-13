import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import {
  apiClient,
  type ApiPathParams,
  type ApiQueryParams,
  type ApiRequestBody,
  type ApiResponse,
} from '../client';
import { createDomainQueryKeys } from './query-key-factory';
import { catKeys } from './use-cats';

export interface TagView {
  id: string;
  groupId: string;
  categoryId: string;
  name: string;
  color: string;
  description?: string;
  displayOrder: number;
  allowsManual: boolean;
  allowsAutomation: boolean;
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  usageCount: number;
}

export interface TagGroupView {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  tags: TagView[];
}

export interface TagCategoryView {
  id: string;
  key: string;
  name: string;
  description?: string;
  color?: string;
  displayOrder: number;
  scopes: string[];
  isActive: boolean;
  groups: TagGroupView[];
  tags: TagView[];
}

export type TagCategoriesResponse = ApiResponse<TagCategoryView[]>;

export interface TagCategoryFilters {
  scope?: string[];
  includeInactive?: boolean;
}

export type CreateTagCategoryRequest = ApiRequestBody<'/tags/categories', 'post'>;
export type UpdateTagCategoryRequest = ApiRequestBody<'/tags/categories/{id}', 'patch'>;
export type ReorderTagCategoriesRequest = ApiRequestBody<'/tags/categories/reorder', 'patch'>;

export type CreateTagRequest = ApiRequestBody<'/tags', 'post'>;
export type UpdateTagRequest = ApiRequestBody<'/tags/{id}', 'patch'>;
export type ReorderTagsRequest = ApiRequestBody<'/tags/reorder', 'patch'>;

export type CreateTagGroupRequest = ApiRequestBody<'/tags/groups', 'post'>;
export type UpdateTagGroupRequest = ApiRequestBody<'/tags/groups/{id}', 'patch'>;
export type ReorderTagGroupsRequest = ApiRequestBody<'/tags/groups/reorder', 'patch'>;

type AssignTagRequest = ApiRequestBody<'/tags/cats/{id}/tags', 'post'>;

const tagCategoryKeys = createDomainQueryKeys<string, TagCategoryFilters>('tagCategories');

export { tagCategoryKeys };

type TagCategoryQueryParams = ApiQueryParams<'/tags', 'get'>;

function buildTagCategoryQuery(filters?: TagCategoryFilters): TagCategoryQueryParams | undefined {
  if (!filters) {
    return undefined;
  }

  const query: Record<string, unknown> = {};

  if (filters.scope && filters.scope.length > 0) {
    query.scope = filters.scope;
  }

  if (filters.includeInactive) {
    query.includeInactive = true;
  }

  return Object.keys(query).length > 0 ? (query as TagCategoryQueryParams) : undefined;
}

function showErrorNotification(title: string, error: unknown) {
  notifications.show({
    title,
    message: error instanceof Error ? error.message : '時間をおいて再度お試しください。',
    color: 'red',
  });
}

export function useGetTagCategories(
  filters?: TagCategoryFilters,
  options?: Omit<UseQueryOptions<TagCategoriesResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: tagCategoryKeys.list(filters),
    queryFn: async () => {
      const response = (await apiClient.get('/tags', {
        query: buildTagCategoryQuery(filters),
      })) as TagCategoriesResponse;

      if (!response.data) {
        return response;
      }

      const data = response.data.map((category) => {
        const groups = category.groups ?? [];
        return {
          ...category,
          groups,
          tags: groups.flatMap((group) => group.tags ?? []),
        };
      });

      return { ...response, data } satisfies TagCategoriesResponse;
    },
    staleTime: 1000 * 60,
    ...options,
  });
}

export function useCreateTagCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagCategoryRequest) =>
      apiClient.post('/tags/categories', {
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'カテゴリを作成しました',
        message: '新しいカテゴリが利用可能になりました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('カテゴリの作成に失敗しました', error);
    },
  });
}

export function useUpdateTagCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagCategoryRequest }) =>
      apiClient.patch('/tags/categories/{id}', {
        pathParams: { id } as ApiPathParams<'/tags/categories/{id}', 'patch'>,
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'カテゴリを更新しました',
        message: 'カテゴリ情報を保存しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('カテゴリの更新に失敗しました', error);
    },
  });
}

export function useDeleteTagCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete('/tags/categories/{id}', {
        pathParams: { id } as ApiPathParams<'/tags/categories/{id}', 'delete'>,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'カテゴリを削除しました',
        message: 'カテゴリを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('カテゴリの削除に失敗しました', error);
    },
  });
}

export function useReorderTagCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderTagCategoriesRequest) =>
      apiClient.patch('/tags/categories/reorder', {
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
    },
    onError: (error: unknown) => {
      showErrorNotification('カテゴリの並び替えに失敗しました', error);
    },
  });
}

export function useCreateTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagGroupRequest) =>
      apiClient.post('/tags/groups', {
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'グループを作成しました',
        message: '新しいタググループが利用可能になりました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タググループの作成に失敗しました', error);
    },
  });
}

export function useUpdateTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagGroupRequest }) =>
      apiClient.patch('/tags/groups/{id}', {
        pathParams: { id } as ApiPathParams<'/tags/groups/{id}', 'patch'>,
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'グループを更新しました',
        message: 'タググループ情報を保存しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タググループの更新に失敗しました', error);
    },
  });
}

export function useDeleteTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete('/tags/groups/{id}', {
        pathParams: { id } as ApiPathParams<'/tags/groups/{id}', 'delete'>,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'グループを削除しました',
        message: 'タググループを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タググループの削除に失敗しました', error);
    },
  });
}

export function useReorderTagGroups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderTagGroupsRequest) =>
      apiClient.patch('/tags/groups/reorder', {
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
    },
    onError: (error: unknown) => {
      showErrorNotification('タググループの並び替えに失敗しました', error);
    },
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
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'タグを作成しました',
        message: '新しいタグが利用可能になりました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タグの作成に失敗しました', error);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagRequest }) =>
      apiClient.patch('/tags/{id}', {
        pathParams: { id } as ApiPathParams<'/tags/{id}', 'patch'>,
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'タグを更新しました',
        message: 'タグ情報を保存しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タグの更新に失敗しました', error);
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
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'タグを削除しました',
        message: 'タグを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タグの削除に失敗しました', error);
    },
  });
}

export function useReorderTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderTagsRequest) =>
      apiClient.patch('/tags/reorder', {
        body: payload,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
    },
    onError: (error: unknown) => {
      showErrorNotification('タグの並び替えに失敗しました', error);
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
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'タグを付与しました',
        message: '猫のタグ情報を更新しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タグ付与に失敗しました', error);
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
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: 'タグを削除しました',
        message: '猫からタグを解除しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('タグ解除に失敗しました', error);
    },
  });
}
