'use client';
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

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined));

const catFormSchema = z.object({
  registrationId: z.string().min(1, '登録IDは必須です'),
  name: z.string().min(1, '名前は必須です'),
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: '性別を選択してください' }),
  }),
  birthDate: z
    .string()
    .min(1, '生年月日を入力してください')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '生年月日はYYYY-MM-DD形式で入力してください'),
  breedId: optionalString,
  colorId: optionalString,
  pattern: optionalString,
  weight: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value.trim() === '') return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }),
  microchipId: optionalString,
  fatherId: optionalString,
  motherId: optionalString,
  imageUrl: optionalString,
  notes: optionalString,
});

type CatFormValues = z.infer<typeof catFormSchema>;

export default function CatRegistrationPage() {
  const router = useRouter();
  const createCat = useCreateCat();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      registrationId: '',
      name: '',
      gender: 'MALE',
      birthDate: '',
      breedId: undefined,
      colorId: undefined,
      pattern: undefined,
      weight: undefined,
      microchipId: undefined,
      fatherId: undefined,
      motherId: undefined,
      imageUrl: undefined,
      notes: undefined,
    },
  });

  const onSubmit = async (values: CatFormValues) => {
    const payload: CreateCatRequest = {
      registrationId: values.registrationId,
      name: values.name,
      gender: values.gender,
      birthDate: values.birthDate,
      breedId: values.breedId ?? null,
      colorId: values.colorId ?? null,
      pattern: values.pattern ?? null,
      weight: values.weight ?? null,
      microchipId: values.microchipId ?? null,
      fatherId: values.fatherId ?? null,
      motherId: values.motherId ?? null,
      imageUrl: values.imageUrl ?? null,
      notes: values.notes ?? null,
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
                  name="registrationId"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="登録ID"
                      placeholder="登録IDを入力してください（例：REG-001）"
                      required
                      error={errors.registrationId?.message}
                      {...field}
                      value={field.value}
                    />
                  )}
                />

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
                        required
                        error={errors.birthDate?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="colorId"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="毛色 ID"
                        placeholder="毛色IDまたは未設定"
                        error={errors.colorId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                <Group grow>
                  <Controller
                    name="pattern"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="模様・パターン"
                        placeholder="例：タビー、三毛"
                        error={errors.pattern?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="体重 (kg)"
                        placeholder="例：4.5"
                        type="number"
                        step="0.1"
                        error={errors.weight?.message}
                        {...field}
                        value={field.value !== undefined ? String(field.value) : ''}
                        onChange={(event) => field.onChange(event.currentTarget.value)}
                      />
                    )}
                  />
                </Group>

                <Group grow>
                  <Controller
                    name="microchipId"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="マイクロチップID"
                        placeholder="マイクロチップID"
                        error={errors.microchipId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="imageUrl"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="画像URL"
                        placeholder="画像のURL"
                        error={errors.imageUrl?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                <Group grow>
                  <Controller
                    name="fatherId"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="父猫ID"
                        placeholder="父猫のID"
                        error={errors.fatherId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="motherId"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="母猫ID"
                        placeholder="母猫のID"
                        error={errors.motherId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="備考"
                      placeholder="特徴や性格などを記入してください"
                      minRows={3}
                      error={errors.notes?.message}
                      {...field}
                      value={field.value ?? ''}
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
        </Stack>
      </Container>
    </Box>
  );
}
