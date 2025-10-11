'use client';

import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextInput,
  Table,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCheck, IconPlus, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
  type CareSchedule,
  type CareType,
  type GetCareSchedulesParams,
  useAddCareSchedule,
  useCompleteCareSchedule,
  useGetCareSchedules,
} from '@/lib/api/hooks/use-care';
import { useGetCats } from '@/lib/api/hooks/use-cats';

const CARE_TYPE_LABELS: Record<CareType, string> = {
  VACCINATION: 'ワクチン',
  HEALTH_CHECK: '健康診断',
  GROOMING: 'グルーミング',
  DENTAL_CARE: 'デンタルケア',
  MEDICATION: '投薬',
  SURGERY: '手術・処置',
  OTHER: 'その他',
};

const STATUS_LABELS = {
  PENDING: '未着手',
  IN_PROGRESS: '進行中',
  COMPLETED: '完了',
  CANCELLED: 'キャンセル',
} as const;

const STATUS_COLORS = {
  PENDING: 'yellow',
  IN_PROGRESS: 'blue',
  COMPLETED: 'teal',
  CANCELLED: 'gray',
} as const;

const CARE_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'すべて' },
  { value: 'VACCINATION', label: CARE_TYPE_LABELS.VACCINATION },
  { value: 'HEALTH_CHECK', label: CARE_TYPE_LABELS.HEALTH_CHECK },
  { value: 'GROOMING', label: CARE_TYPE_LABELS.GROOMING },
  { value: 'DENTAL_CARE', label: CARE_TYPE_LABELS.DENTAL_CARE },
  { value: 'MEDICATION', label: CARE_TYPE_LABELS.MEDICATION },
  { value: 'SURGERY', label: CARE_TYPE_LABELS.SURGERY },
  { value: 'OTHER', label: CARE_TYPE_LABELS.OTHER },
] as const;

const PAGE_LIMIT = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return dayjs(value).format('YYYY年MM月DD日');
}

function useCareScheduleStats(schedules: CareSchedule[] | undefined) {
  return useMemo(() => {
    if (!schedules || schedules.length === 0) {
      return {
        total: 0,
        upcoming: 0,
        completed: 0,
        overdue: 0,
      };
    }

    const today = dayjs().startOf('day');
    const upcoming = schedules.filter((schedule) =>
      ['PENDING', 'IN_PROGRESS'].includes(schedule.status) && dayjs(schedule.scheduleDate).isAfter(today.subtract(1, 'day')),
    ).length;
    const completed = schedules.filter((schedule) => schedule.status === 'COMPLETED').length;
    const overdue = schedules.filter((schedule) =>
      ['PENDING', 'IN_PROGRESS'].includes(schedule.status) && dayjs(schedule.scheduleDate).isBefore(today),
    ).length;

    return {
      total: schedules.length,
      upcoming,
      completed,
      overdue,
    };
  }, [schedules]);
}

interface CreateScheduleFormState {
  name: string;
  catId: string;
  careType: CareType | null;
  scheduledDate: Date | null;
  description: string;
}

interface CompleteScheduleFormState {
  completedDate: Date | null;
  nextScheduledDate: Date | null;
  notes: string;
}

export default function CarePage() {
  const [page, setPage] = useState(1);
  const [careTypeFilter, setCareTypeFilter] = useState<(typeof CARE_TYPE_FILTER_OPTIONS)[number]['value']>('ALL');

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [completeModalOpened, { open: openCompleteModal, close: closeCompleteModal }] = useDisclosure(false);

  const [createForm, setCreateForm] = useState<CreateScheduleFormState>({
    name: '',
    catId: '',
    careType: null,
    scheduledDate: null,
    description: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const [completeForm, setCompleteForm] = useState<CompleteScheduleFormState>({
    completedDate: new Date(),
    nextScheduledDate: null,
    notes: '',
  });
  const [targetSchedule, setTargetSchedule] = useState<CareSchedule | null>(null);

  const scheduleParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: PAGE_LIMIT,
    };
    if (careTypeFilter && careTypeFilter !== 'ALL') {
      params.careType = careTypeFilter;
    }
    return params as unknown as GetCareSchedulesParams;
  }, [page, careTypeFilter]);

  const scheduleQuery = useGetCareSchedules(scheduleParams);
  const addScheduleMutation = useAddCareSchedule();
  const completeScheduleMutation = useCompleteCareSchedule();

  const catsQuery = useGetCats({ limit: 100 });
  const catsOptions = useMemo(() => {
    return (
      catsQuery.data?.data?.cats?.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })) ?? []
    );
  }, [catsQuery.data?.data?.cats]);

  const schedules = scheduleQuery.data?.data ?? [];
  const meta = scheduleQuery.data?.meta ?? {
    total: 0,
    totalPages: 1,
    page,
    limit: PAGE_LIMIT,
  };

  const stats = useCareScheduleStats(schedules);

  const handleRefresh = () => {
    void scheduleQuery.refetch();
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      catId: '',
      careType: null,
      scheduledDate: null,
      description: '',
    });
    setCreateError(null);
  };

  const handleCreateSubmit = () => {
    const trimmedName = createForm.name.trim();
    const trimmedDescription = createForm.description.trim();

    if (!trimmedName || !createForm.catId || !createForm.careType || !createForm.scheduledDate) {
      setCreateError('ケア名、猫、ケア種別、予定日は必須です。');
      return;
    }

    setCreateError(null);
    addScheduleMutation.mutate(
      {
        name: trimmedName,
        catId: createForm.catId,
        careType: createForm.careType,
        scheduledDate: dayjs(createForm.scheduledDate).toISOString(),
        description: trimmedDescription || undefined,
      },
      {
        onSuccess: () => {
          resetCreateForm();
          closeCreateModal();
        },
      },
    );
  };

  const openCompleteScheduleModal = (schedule: CareSchedule) => {
    setTargetSchedule(schedule);
    setCompleteForm({
      completedDate: new Date(),
      nextScheduledDate: null,
      notes: '',
    });
    openCompleteModal();
  };

  const handleCompleteSubmit = () => {
    if (!targetSchedule) return;

    completeScheduleMutation.mutate(
      {
        id: targetSchedule.id,
        payload: {
          completedDate: completeForm.completedDate
            ? dayjs(completeForm.completedDate).format('YYYY-MM-DD')
            : undefined,
          nextScheduledDate: completeForm.nextScheduledDate
            ? dayjs(completeForm.nextScheduledDate).format('YYYY-MM-DD')
            : undefined,
          notes: completeForm.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          closeCompleteModal();
          setTargetSchedule(null);
        },
      },
    );
  };

  const isInitialLoading = scheduleQuery.isLoading && schedules.length === 0;
  const isEmpty = !isInitialLoading && schedules.length === 0;

  return (
    <Container size="lg" pb="xl">
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={2} mb={4}>
            ケアスケジュール管理
          </Title>
          <Text size="sm" c="dimmed">
            ケア予定の確認、登録、完了処理を行います。
          </Text>
        </div>
        <Group gap="xs">
          <ActionIcon variant="subtle" aria-label="refresh" onClick={handleRefresh} loading={scheduleQuery.isFetching}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            ケア予定を追加
          </Button>
        </Group>
      </Group>

      <Group grow mb="lg">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text size="xs" c="dimmed" mb={4}>
            合計
          </Text>
          <Text size="xl" fw={700}>
            {stats.total}
          </Text>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text size="xs" c="dimmed" mb={4}>
            近日予定
          </Text>
          <Text size="xl" fw={700}>
            {stats.upcoming}
          </Text>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text size="xs" c="dimmed" mb={4}>
            完了済み
          </Text>
          <Text size="xl" fw={700}>
            {stats.completed}
          </Text>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder color="red">
          <Text size="xs" c="dimmed" mb={4}>
            期限超過
          </Text>
          <Text size="xl" fw={700} c="red">
            {stats.overdue}
          </Text>
        </Card>
      </Group>

      <Card withBorder shadow="xs" radius="md">
        <LoadingOverlay visible={scheduleQuery.isFetching && !scheduleQuery.isLoading} zIndex={10} />
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <Box>
              <Text size="sm" fw={600}>
                フィルター
              </Text>
              <Text size="xs" c="dimmed">
                ケア種別で絞り込み
              </Text>
            </Box>
            <Select
              data={CARE_TYPE_FILTER_OPTIONS}
              value={careTypeFilter}
              onChange={(value) => {
                setPage(1);
                setCareTypeFilter((value as (typeof CARE_TYPE_FILTER_OPTIONS)[number]['value']) ?? 'ALL');
              }}
              w={200}
            />
          </Group>

          {scheduleQuery.isError && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              ケアスケジュールの取得中にエラーが発生しました。時間をおいて再度お試しください。
            </Alert>
          )}

          {isInitialLoading ? (
            <Stack>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={72} radius="md" />
              ))}
            </Stack>
          ) : isEmpty ? (
            <Card padding="xl" radius="md" bg="gray.0">
              <Stack gap="sm" align="center">
                <IconCheck size={28} color="var(--mantine-color-teal-6)" />
                <Text fw={600}>表示するケア予定はありません</Text>
                <Text size="sm" c="dimmed" ta="center">
                  {careTypeFilter === 'ALL'
                    ? 'ケア予定を追加して、ケアの履歴を管理しましょう。'
                    : '選択した条件に一致するケア予定がありません。'}
                </Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal} variant="light">
                  ケア予定を登録する
                </Button>
              </Stack>
            </Card>
          ) : (
            <>
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '18%' }}>猫</Table.Th>
                    <Table.Th style={{ width: '18%' }}>ケア種別</Table.Th>
                    <Table.Th style={{ width: '18%' }}>予定日</Table.Th>
                    <Table.Th style={{ width: '28%' }}>詳細</Table.Th>
                    <Table.Th style={{ width: '10%' }}>状態</Table.Th>
                    <Table.Th style={{ width: '8%' }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {schedules.map((schedule) => (
                    <Table.Tr key={schedule.id}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={600}>{schedule.cat?.name ?? '未設定'}</Text>
                          <Text size="xs" c="dimmed">
                            登録者: {schedule.assignedTo || 'システム'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light">
                          {schedule.careType ? CARE_TYPE_LABELS[schedule.careType] : '未設定'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={500}>{formatDate(schedule.scheduleDate)}</Text>
                          <Text size="xs" c="dimmed">
                            追加: {dayjs(schedule.createdAt).format('YYYY/MM/DD')}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>
                            {schedule.name || schedule.title}
                          </Text>
                          <Text size="sm" c={schedule.description ? undefined : 'dimmed'}>
                            {schedule.description ?? 'メモは登録されていません'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[schedule.status]} variant="light">
                          {STATUS_LABELS[schedule.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          variant="light"
                          disabled={schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED'}
                          onClick={() => openCompleteScheduleModal(schedule)}
                        >
                          完了
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {meta.totalPages > 1 && (
                <Group justify="center">
                  <Pagination
                    value={meta.page ?? page}
                    onChange={(value) => setPage(value)}
                    total={meta.totalPages}
                    siblings={1}
                  />
                </Group>
              )}
            </>
          )}
        </Stack>
      </Card>

      <Modal opened={createModalOpened} onClose={() => {
        closeCreateModal();
        resetCreateForm();
      }} title="ケア予定を追加" size="lg">
        <Stack gap="md">
          <TextInput
            label="ケア名"
            placeholder="例: 年次健康診断"
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                name: event.currentTarget.value,
              }))
            }
            required
          />

          <Select
            label="猫"
            placeholder="ケア対象となる猫を選択"
            data={catsOptions}
            value={createForm.catId}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, catId: value ?? '' }))}
            searchable
            required
          />

          <Select
            label="ケア種別"
            placeholder="実施するケア種別を選択"
            data={CARE_TYPE_FILTER_OPTIONS.filter((option) => option.value !== 'ALL')}
            value={createForm.careType ?? null}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, careType: value as CareType | null }))}
            required
          />

          <DatePickerInput
            label="予定日"
            placeholder="ケアの予定日を選択"
            value={createForm.scheduledDate}
            onChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                scheduledDate: value ? new Date(value) : null,
              }))
            }
            required
            minDate={new Date('2020-01-01')}
          />

          <Textarea
            label="備考"
            placeholder="ケアの詳細やメモを入力（任意）"
            value={createForm.description}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.currentTarget.value }))}
            minRows={3}
            autosize
          />

          {createError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {createError}
            </Alert>
          )}

          <Divider />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => {
              closeCreateModal();
              resetCreateForm();
            }}>
              キャンセル
            </Button>
            <Button onClick={handleCreateSubmit} loading={addScheduleMutation.isPending}>
              登録する
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={completeModalOpened} onClose={() => {
        closeCompleteModal();
        setTargetSchedule(null);
  }} title={targetSchedule ? `${targetSchedule.cat?.name ?? '未設定'} - ${targetSchedule.name || targetSchedule.title} を完了` : 'ケア完了処理'} size="lg">
        {targetSchedule ? (
          <Stack gap="md">
            <Card withBorder shadow="xs" radius="md">
              <Stack gap={4}>
                <Group justify="space-between">
                  <Badge size="sm" variant="light">
                    {targetSchedule.careType ? CARE_TYPE_LABELS[targetSchedule.careType] : '未設定'}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    予定日: {formatDate(targetSchedule.scheduleDate)}
                  </Text>
                </Group>
                <Stack gap={2}>
                  <Text fw={600}>{targetSchedule.name || targetSchedule.title}</Text>
                  <Text size="sm">{targetSchedule.description ?? 'メモは登録されていません'}</Text>
                </Stack>
              </Stack>
            </Card>

            <DatePickerInput
              label="完了日"
              placeholder="完了日を選択"
              value={completeForm.completedDate}
              onChange={(value) =>
                setCompleteForm((prev) => ({
                  ...prev,
                  completedDate: value ? new Date(value) : null,
                }))
              }
              required
            />

            <DatePickerInput
              label="次回予定日 (任意)"
              placeholder="次回ケアを予定している場合は選択"
              value={completeForm.nextScheduledDate}
              onChange={(value) =>
                setCompleteForm((prev) => ({
                  ...prev,
                  nextScheduledDate: value ? new Date(value) : null,
                }))
              }
              minDate={completeForm.completedDate ?? undefined}
            />

            <Textarea
              label="メモ"
              placeholder="ケア内容の詳細、体調、次回の注意点など"
              value={completeForm.notes}
              onChange={(event) => setCompleteForm((prev) => ({ ...prev, notes: event.currentTarget.value }))}
              autosize
              minRows={3}
            />

            <Divider />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => {
                closeCompleteModal();
                setTargetSchedule(null);
              }}>
                キャンセル
              </Button>
              <Button
                onClick={handleCompleteSubmit}
                loading={completeScheduleMutation.isPending}
                color="teal"
              >
                完了として記録
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            対象のケア予定が見つかりませんでした。
          </Text>
        )}
      </Modal>
    </Container>
  );
}
