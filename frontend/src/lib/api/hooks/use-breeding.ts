/**
 * 交配管理APIフック
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  apiClient,
  apiRequest,
  type ApiPathParams,
  type ApiQueryParams,
  type ApiRequestBody,
  type ApiResponse,
} from '../client';
import { createDomainQueryKeys } from './query-key-factory';

export type BreedingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface BreedingRecord {
  id: string;
  maleId: string;
  femaleId: string;
  breedingDate: string;
  expectedDueDate?: string | null;
  actualDueDate?: string | null;
  numberOfKittens?: number | null;
  notes?: string | null;
  status: BreedingStatus;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  male?: { id: string; name: string | null } | null;
  female?: { id: string; name: string | null } | null;
}

export interface BreedingListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type GetBreedingParams = ApiQueryParams<'/breeding', 'get'>;

export interface BreedingListResponse {
  success: boolean;
  data?: BreedingRecord[];
  meta?: BreedingListMeta;
  message?: string;
  error?: string;
}

export type CreateBreedingRequest = ApiRequestBody<'/breeding', 'post'>;
export type UpdateBreedingRequest = Partial<CreateBreedingRequest>;

const breedingKeys = createDomainQueryKeys<string, GetBreedingParams>('breeding');

export type BreedingNgRuleType = 'TAG_COMBINATION' | 'INDIVIDUAL_PROHIBITION' | 'GENERATION_LIMIT';

export interface BreedingNgRule {
  id: string;
  name: string;
  description: string | null;
  type: BreedingNgRuleType;
  maleConditions: string[];
  femaleConditions: string[];
  maleNames: string[];
  femaleNames: string[];
  generationLimit: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BreedingNgRuleFilter {
  active?: boolean;
  type?: BreedingNgRuleType;
  search?: string;
}

export type CreateBreedingNgRuleRequest = {
  name: string;
  description?: string;
  type: BreedingNgRuleType;
  active?: boolean;
  maleConditions?: string[];
  femaleConditions?: string[];
  maleNames?: string[];
  femaleNames?: string[];
  generationLimit?: number;
};

export type UpdateBreedingNgRuleRequest = Partial<CreateBreedingNgRuleRequest>;

export type BreedingNgRuleListResponse = ApiResponse<BreedingNgRule[]>;
export type BreedingNgRuleResponse = ApiResponse<BreedingNgRule>;

const breedingNgRuleKeys = createDomainQueryKeys<string, BreedingNgRuleFilter>('breeding-ng-rules', {
  extras: {
    filterState: (...args: unknown[]) => {
      const [filters] = args as [BreedingNgRuleFilter | undefined];
      return [filters ?? {}] as const;
    },
    type: (...args: unknown[]) => {
      const [type] = args as [BreedingNgRuleType | 'ALL' | undefined];
      return [type ?? 'ALL'] as const;
    },
    search: (...args: unknown[]) => {
      const [keyword] = args as [string | undefined];
      return [keyword ?? ''] as const;
    },
  },
});

// Pregnancy Check types and hooks
export type PregnancyStatus = 'CONFIRMED' | 'SUSPECTED' | 'NEGATIVE' | 'ABORTED';

export interface PregnancyCheck {
  id: string;
  motherId: string;
  checkDate: string;
  status: PregnancyStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  mother?: { id: string; name: string | null } | null;
}

export interface PregnancyCheckListResponse {
  success: boolean;
  data?: PregnancyCheck[];
  meta?: BreedingListMeta;
  message?: string;
  error?: string;
}

export type CreatePregnancyCheckRequest = {
  motherId: string;
  checkDate: string;
  status: PregnancyStatus;
  notes?: string;
};

export type UpdatePregnancyCheckRequest = Partial<CreatePregnancyCheckRequest>;

const pregnancyCheckKeys = createDomainQueryKeys<string, Record<string, unknown>>('pregnancy-checks');

// Birth Plan types and hooks
export type BirthStatus = 'EXPECTED' | 'BORN' | 'ABORTED' | 'STILLBORN';

export interface BirthPlan {
  id: string;
  motherId: string;
  expectedBirthDate: string;
  actualBirthDate?: string | null;
  status: BirthStatus;
  expectedKittens?: number | null;
  actualKittens?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  mother?: { id: string; name: string | null } | null;
}

export interface BirthPlanListResponse {
  success: boolean;
  data?: BirthPlan[];
  meta?: BreedingListMeta;
  message?: string;
  error?: string;
}

export type CreateBirthPlanRequest = {
  motherId: string;
  expectedBirthDate: string;
  actualBirthDate?: string;
  status: BirthStatus;
  expectedKittens?: number;
  actualKittens?: number;
  notes?: string;
};

export type UpdateBirthPlanRequest = Partial<CreateBirthPlanRequest>;

const birthPlanKeys = createDomainQueryKeys<string, Record<string, unknown>>('birth-plans');

export { breedingKeys };
export { breedingNgRuleKeys };
export { pregnancyCheckKeys };
export { birthPlanKeys };

export function useGetBreedingRecords(
  params: GetBreedingParams = {},
  options?: Omit<UseQueryOptions<BreedingListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: breedingKeys.list(params),
    queryFn: () =>
      apiClient.get('/breeding', {
        query: params,
      }) as Promise<BreedingListResponse>,
    ...options,
  });
}

export function useCreateBreedingRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBreedingRequest) =>
      apiClient.post('/breeding', {
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
      notifications.show({
        title: '交配記録を登録しました',
        message: '交配スケジュールを管理画面に反映しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '交配記録の登録に失敗しました',
        message: error.message ?? '入力内容をご確認の上、再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useUpdateBreedingRecord(
  id: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBreedingRequest) =>
      apiClient.patch('/breeding/{id}', {
        pathParams: { id } as ApiPathParams<'/breeding/{id}', 'patch'>,
        body: payload as ApiRequestBody<'/breeding/{id}', 'patch'>,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
      notifications.show({
        title: '交配記録を更新しました',
        message: '最新の情報に更新されました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '交配記録の更新に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useDeleteBreedingRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) =>
      apiClient.delete('/breeding/{id}', {
        pathParams: { id: recordId } as ApiPathParams<'/breeding/{id}', 'delete'>,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
      notifications.show({
        title: '交配記録を削除しました',
        message: 'リストから該当レコードを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '交配記録の削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

const NG_RULES_ENDPOINT = '/breeding/ng-rules';

function buildNgRuleEndpoint(id?: string): string {
  if (!id) {
    return NG_RULES_ENDPOINT;
  }

  return `${NG_RULES_ENDPOINT}/${id}`;
}

export function useGetBreedingNgRules(
  options?: Omit<UseQueryOptions<BreedingNgRuleListResponse, Error, BreedingNgRuleListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: breedingNgRuleKeys.lists(),
    queryFn: () => apiRequest<BreedingNgRule[]>(buildNgRuleEndpoint(), { method: 'GET' }),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useCreateBreedingNgRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBreedingNgRuleRequest) =>
      apiRequest<BreedingNgRule>(buildNgRuleEndpoint(), {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: breedingNgRuleKeys.lists() });
      notifications.show({
        title: 'NGルールを登録しました',
        message: '交配NGルールを追加しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'NGルールの登録に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export interface UpdateBreedingNgRuleVariables {
  id: string;
  payload: UpdateBreedingNgRuleRequest;
}

export function useUpdateBreedingNgRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateBreedingNgRuleVariables) =>
      apiRequest<BreedingNgRule>(buildNgRuleEndpoint(id), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: breedingNgRuleKeys.lists() });
      notifications.show({
        title: 'NGルールを更新しました',
        message: '交配NGルールの内容を更新しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'NGルールの更新に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useDeleteBreedingNgRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) =>
      apiRequest<unknown>(buildNgRuleEndpoint(ruleId), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: breedingNgRuleKeys.lists() });
      notifications.show({
        title: 'NGルールを削除しました',
        message: '交配NGルールを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'NGルールの削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

// Pregnancy Check hooks
export function useGetPregnancyChecks(
  params: Record<string, unknown> = {},
  options?: Omit<UseQueryOptions<PregnancyCheckListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: pregnancyCheckKeys.list(params),
    queryFn: () => apiRequest<PregnancyCheck[]>('/breeding/pregnancy-checks', { 
      method: 'GET'
    }) as Promise<PregnancyCheckListResponse>,
    ...options,
  });
}

export function useCreatePregnancyCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePregnancyCheckRequest) =>
      apiRequest<PregnancyCheck>('/breeding/pregnancy-checks', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pregnancyCheckKeys.lists() });
      notifications.show({
        title: '妊娠チェックを登録しました',
        message: '妊娠確認リストに追加しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '妊娠チェックの登録に失敗しました',
        message: error.message ?? '入力内容をご確認の上、再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useUpdatePregnancyCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePregnancyCheckRequest }) =>
      apiRequest<PregnancyCheck>(`/breeding/pregnancy-checks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pregnancyCheckKeys.lists() });
      notifications.show({
        title: '妊娠チェックを更新しました',
        message: '最新の情報に更新されました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '妊娠チェックの更新に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useDeletePregnancyCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<unknown>(`/breeding/pregnancy-checks/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pregnancyCheckKeys.lists() });
      notifications.show({
        title: '妊娠チェックを削除しました',
        message: 'リストから該当レコードを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '妊娠チェックの削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

// Birth Plan hooks
export function useGetBirthPlans(
  params: Record<string, unknown> = {},
  options?: Omit<UseQueryOptions<BirthPlanListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: birthPlanKeys.list(params),
    queryFn: () => apiRequest<BirthPlan[]>('/breeding/birth-plans', { 
      method: 'GET'
    }) as Promise<BirthPlanListResponse>,
    ...options,
  });
}

export function useCreateBirthPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBirthPlanRequest) =>
      apiRequest<BirthPlan>('/breeding/birth-plans', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: birthPlanKeys.lists() });
      notifications.show({
        title: '出産計画を登録しました',
        message: '出産予定リストに追加しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '出産計画の登録に失敗しました',
        message: error.message ?? '入力内容をご確認の上、再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useUpdateBirthPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBirthPlanRequest }) =>
      apiRequest<BirthPlan>(`/breeding/birth-plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: birthPlanKeys.lists() });
      notifications.show({
        title: '出産計画を更新しました',
        message: '最新の情報に更新されました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '出産計画の更新に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useDeleteBirthPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<unknown>(`/breeding/birth-plans/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: birthPlanKeys.lists() });
      notifications.show({
        title: '出産計画を削除しました',
        message: 'リストから該当レコードを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '出産計画の削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}
