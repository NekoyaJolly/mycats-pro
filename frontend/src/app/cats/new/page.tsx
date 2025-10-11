'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  Switch,
  Flex,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { z } from 'zod';
import { PageTitle } from '@/components/PageTitle';
import { useCreateCat, type CreateCatRequest } from '@/lib/api/hooks/use-cats';
import { useGetTags } from '@/lib/api/hooks/use-tags';
import TagSelector, { type TagCategory } from '@/components/TagSelector';

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined));

const catFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: '性別を選択してください' }),
  }),
  birthDate: z
    .string()
    .min(1, '生年月日を入力してください')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '生年月日はYYYY-MM-DD形式で入力してください'),
  breedId: optionalString,
  coatColorId: optionalString,
  microchipNumber: optionalString,
  registrationNumber: optionalString,
  description: optionalString,
  isInHouse: z.boolean().default(true),
  tagIds: z.array(z.string()).default([]),
});

type CatFormValues = z.infer<typeof catFormSchema>;

export default function CatRegistrationPage() {
  const router = useRouter();
  const createCat = useCreateCat();
  const { data: tagsResponse, isLoading: isLoadingTags } = useGetTags();

  const tagCategories = useMemo<TagCategory[] | undefined>(() => {
    if (!tagsResponse?.data) {
      return undefined;
    }

    const fallbackColor = '#228be6';

    return [
      {
        id: 'all',
        name: '全タグ',
        description: '登録済みのタグから選択できます',
        color: fallbackColor,
        tags: tagsResponse.data.map((tag) => ({
          id: tag.id,
          name: tag.name,
          categoryId: 'all',
          color: tag.color || fallbackColor,
          description: tag.description,
          usageCount: tag.usage_count ?? 0,
        })),
      },
    ];
  }, [tagsResponse]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: '',
      gender: 'MALE',
      birthDate: '',
      breedId: undefined,
      coatColorId: undefined,
      microchipNumber: undefined,
      registrationNumber: undefined,
      description: undefined,
      isInHouse: true,
      tagIds: [],
    },
  });

  const onSubmit = async (values: CatFormValues) => {
    const payload: CreateCatRequest = {
      name: values.name,
      gender: values.gender,
      birthDate: values.birthDate,
      breedId: values.breedId ?? null,
      coatColorId: values.coatColorId ?? null,
      microchipNumber: values.microchipNumber,
      registrationNumber: values.registrationNumber,
      description: values.description,
      isInHouse: values.isInHouse,
      tagIds: values.tagIds.length > 0 ? values.tagIds : undefined,
    };

    try {
      const response = await createCat.mutateAsync(payload);
      reset();
      const newCatId = response.data?.id;
      router.replace(newCatId ? `/cats/${newCatId}` : '/cats');
    } catch {
      // エラーハンドリングは useCreateCat 内で通知を表示
    }
  };

  const isSubmitting = createCat.isPending;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              戻る
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container size="lg" style={{ paddingTop: '2rem', position: 'relative' }}>
        <LoadingOverlay visible={isSubmitting} zIndex={1000} overlayProps={{ blur: 2 }} />

        <Stack gap="xl">
          <Group justify="space-between">
            <PageTitle>猫の新規登録</PageTitle>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
            >
              登録する
            </Button>
          </Group>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="猫の名前"
                      placeholder="名前を入力してください"
                      required
                      error={errors.name?.message}
                      {...field}
                      value={field.value}
                    />
                  )}
                />

                <Group grow>
                  <Controller
                    name="breedId"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="品種 ID"
                        placeholder="品種IDまたは未設定"
                        error={errors.breedId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="性別"
                        placeholder="性別を選択"
                        data={[
                          { value: 'MALE', label: 'オス' },
                          { value: 'FEMALE', label: 'メス' },
                        ]}
                        required
                        error={errors.gender?.message}
                        value={field.value}
                        onChange={(value) => field.onChange(value ?? field.value)}
                      />
                    )}
                  />
                </Group>

                <Group grow>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="生年月日"
                        placeholder="YYYY-MM-DD"
                        error={errors.birthDate?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="coatColorId"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="色柄 ID"
                        placeholder="色柄IDまたは未設定"
                        error={errors.coatColorId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                <Group grow>
                  <Controller
                    name="microchipNumber"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="マイクロチップ番号"
                        placeholder="マイクロチップ番号"
                        error={errors.microchipNumber?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="registrationNumber"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="登録番号"
                        placeholder="登録番号"
                        error={errors.registrationNumber?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="備考"
                      placeholder="特徴や性格などを記入してください"
                      minRows={3}
                      error={errors.description?.message}
                      {...field}
                      value={field.value ?? ''}
                    />
                  )}
                />

                <Controller
                  name="isInHouse"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label="施設内に在舎している猫です"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.currentTarget.checked)}
                    />
                  )}
                />

                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <TagSelector
                      selectedTags={field.value ?? []}
                      onChange={field.onChange}
                      label="タグ"
                      placeholder="猫の特徴タグを選択"
                      categories={tagCategories ?? []}
                      disabled={isLoadingTags}
                    />
                  )}
                />

                {createCat.isError && (
                  <Alert color="red" title="登録に失敗しました">
                    {(createCat.error as Error)?.message ?? '時間をおいて再度お試しください。'}
                  </Alert>
                )}

                <Group justify="flex-end" mt="sm">
                  <Button
                    type="submit"
                    leftSection={<IconDeviceFloppy size={16} />}
                    loading={isSubmitting}
                  >
                    登録する
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>

          {isLoadingTags && (
            <Alert color="blue" title="タグを取得しています" variant="light">
              タグ情報を読み込み中です。
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
