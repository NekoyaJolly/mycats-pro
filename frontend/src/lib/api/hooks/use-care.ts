/**
 * ケアスケジュールAPIフック
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiPathParams, type ApiQueryParams, type ApiRequestBody } from '../client';
import { createDomainQueryKeys } from './query-key-factory';

export type CareType =
  | 'VACCINATION'
  | 'HEALTH_CHECK'
  | 'GROOMING'
  | 'DENTAL_CARE'
  | 'MEDICATION'
  | 'SURGERY'
  | 'OTHER';

export interface CareSchedule {
  id: string;
  title: string;
  description?: string | null;
  scheduleDate: string;
  scheduleType: 'CARE' | string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  catId?: string | null;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  cat?: { id: string; name: string } | null;
}

export interface CareScheduleMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type GetCareSchedulesParams = ApiQueryParams<'/care/schedules', 'get'>;

export interface CareScheduleListResponse {
  success: boolean;
  data?: CareSchedule[];
  meta?: CareScheduleMeta;
  message?: string;
  error?: string;
}

export type CreateCareScheduleRequest = ApiRequestBody<'/care/schedules', 'post'>;
export type CompleteCareScheduleRequest = ApiRequestBody<'/care/schedules/{id}/complete', 'patch'>;

const careScheduleKeys = createDomainQueryKeys<string, GetCareSchedulesParams>('care-schedules');

export { careScheduleKeys };

export function useGetCareSchedules(
  params: GetCareSchedulesParams = {},
  options?: Omit<UseQueryOptions<CareScheduleListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: careScheduleKeys.list(params),
    queryFn: () =>
      apiClient.get('/care/schedules', {
        query: params,
      }) as Promise<CareScheduleListResponse>,
    ...options,
  });
}

export function useAddCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCareScheduleRequest) =>
      apiClient.post('/care/schedules', {
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: careScheduleKeys.lists() });
      notifications.show({
        title: 'ケア予定を登録しました',
        message: 'ケアスケジュールを追加しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'ケア予定の登録に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useCompleteCareSchedule(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompleteCareScheduleRequest) =>
      apiClient.patch('/care/schedules/{id}/complete', {
        pathParams: { id } as ApiPathParams<'/care/schedules/{id}/complete', 'patch'>,
        body: payload,
      }),
    onSuccess: (_response) => {
      void queryClient.invalidateQueries({ queryKey: careScheduleKeys.lists() });
      notifications.show({
        title: 'ケア予定を完了しました',
        message: '完了履歴に記録しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'ケア完了処理に失敗しました',
        message: error.message ?? '入力内容をご確認ください。',
        color: 'red',
      });
    },
  });
}
