/**
 * ユーザー登録画面
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Stack,
  Center,
  Box,
  Text,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // フォーム設定
  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'メールアドレスを入力してください';
        if (!/^\S+@\S+$/i.test(value)) return 'メールアドレスの形式が正しくありません';
        return null;
      },
      password: (value) => {
        if (!value) return 'パスワードを入力してください';
        if (value.length < 6) return 'パスワードは6文字以上で入力してください';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return '確認用パスワードを入力してください';
        if (value !== values.password) return 'パスワードが一致しません';
        return null;
      },
    },
  });

  // 登録処理
  const handleSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', {
        email: values.email,
        password: values.password,
      });

      if (response.success) {
        setSuccess(true);
        // 3秒後にログインページへリダイレクト
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.message || '登録に失敗しました');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('登録中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e1f1ff 100%)',
        padding: '1rem',
      }}
    >
      <Container size={420}>
        <Center>
          <Stack gap="lg" style={{ width: '100%' }}>
            {/* ロゴ・タイトル */}
            <Paper
              shadow="md"
              p="xl"
              radius="lg"
              style={{ width: '100%', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}
            >
              <Title order={2} ta="center" mb="md" style={{ color: 'var(--text-primary)', fontSize: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '3.5rem', lineHeight: 1, display: 'block' }}>🐈</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>MyCats 新規登録</span>
              </Title>
              <Text size="sm" ta="center" mb="xl" style={{ color: 'var(--text-muted)' }}>
                MyCats のアカウントを作成
              </Text>

              {/* 成功メッセージ */}
              {success && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="登録成功！"
                  color="green"
                  mb="md"
                >
                  アカウントが作成されました。ログインページへ移動します...
                </Alert>
              )}

              {/* エラーメッセージ */}
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="エラー"
                  color="red"
                  mb="md"
                  withCloseButton
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {!success && (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    {/* メールアドレス */}
                    <TextInput
                      label="メールアドレス"
                      placeholder="your@email.com"
                      required
                      styles={{
                        label: { color: 'var(--text-secondary)', fontWeight: 500 },
                        input: { backgroundColor: 'var(--surface)' },
                      }}
                      {...form.getInputProps('email')}
                    />

                    {/* パスワード */}
                    <PasswordInput
                      label="パスワード"
                      placeholder="6文字以上"
                      required
                      styles={{
                        label: { color: 'var(--text-secondary)', fontWeight: 500 },
                        input: { backgroundColor: 'var(--surface)' },
                      }}
                      {...form.getInputProps('password')}
                    />

                    {/* 確認用パスワード */}
                    <PasswordInput
                      label="パスワード（確認）"
                      placeholder="もう一度入力"
                      required
                      styles={{
                        label: { color: 'var(--text-secondary)', fontWeight: 500 },
                        input: { backgroundColor: 'var(--surface)' },
                      }}
                      {...form.getInputProps('confirmPassword')}
                    />

                    {/* 登録ボタン */}
                    <Button
                      type="submit"
                      fullWidth
                      mt="md"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}
                    >
                      登録
                    </Button>

                    {/* ログインリンク */}
                    <Text ta="center" mt="md" size="sm" style={{ color: 'var(--text-secondary)' }}>
                      既にアカウントをお持ちですか？{' '}
                      <Anchor
                        component="button"
                        type="button"
                        onClick={() => router.push('/login')}
                        fw={500}
                        style={{ color: 'var(--accent)' }}
                      >
                        ログイン
                      </Anchor>
                    </Text>
                  </Stack>
                </form>
              )}
            </Paper>

            {/* パスワード要件とテスト用情報 */}
            <Paper
              shadow="sm"
              p="md"
              radius="lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
            >
              <Text size="xs" ta="center" mb="xs" fw={700} style={{ color: 'var(--text-secondary)' }}>
                🔐 パスワード要件
              </Text>
              <Stack gap={4}>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 8文字以上
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 小文字を含む (a-z)
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 大文字を含む (A-Z)
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 数字を含む (0-9)
                </Text>
              </Stack>
              <Text size="xs" ta="center" mt="md" fw={700} style={{ color: 'var(--text-secondary)' }}>
                💡 テスト用アカウント例
              </Text>
              <Stack gap={4} mt="xs">
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  📧 Email: admin@example.com
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  🔐 Password: Admin123
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
