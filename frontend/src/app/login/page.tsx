/**
 * ログイン画面 (再構築: ブランディング/フォント正規化)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading, error, clearError, initialized } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnTo = searchParams?.get('returnTo') ?? null;
  const targetPath = useMemo(() => {
    if (typeof returnTo !== 'string' || returnTo.length === 0) {
      return '/';
    }

    if (!returnTo.startsWith('/') || returnTo.startsWith('//')) {
      return '/';
    }

    const disallowed = ['/login', '/register'];
    if (disallowed.includes(returnTo)) {
      return '/';
    }

    return returnTo;
  }, [returnTo]);

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
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
    },
  });

  // 既ログイン時リダイレクト
  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace(targetPath);
    }
  }, [initialized, isAuthenticated, router, targetPath]);

  // アンマウント時エラークリア
  useEffect(() => () => clearError(), [clearError]);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    clearError();
    try {
      await login(values);
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      role="main"
      aria-label="ログインページ"
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
            <Box style={{ textAlign: 'center' }}>
              <Text
                size="xl"
                style={{ fontSize: '3.5rem', marginBottom: '0.75rem', lineHeight: 1 }}
              >
                🐈
              </Text>
              <Title
                order={2}
                style={{
                  color: 'var(--text-primary)',
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  letterSpacing: 0.5,
                }}
              >
                MyCats
              </Title>
              <Text style={{ color: 'var(--text-secondary)' }}>ログインして続行</Text>
            </Box>

            <Paper radius="lg" p="xl" shadow="xl" style={{ boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
              <form onSubmit={form.onSubmit(handleSubmit)} aria-label="ログインフォーム">
                <Stack gap="md">
                  {error && (
                    <Alert
                      icon={<IconAlertCircle size="1rem" />}
                      title="ログインエラー"
                      color="red"
                      onClose={clearError}
                      withCloseButton
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </Alert>
                  )}
                  <TextInput
                    required
                    label="メールアドレス"
                    placeholder="your@email.com"
                    size="md"
                    aria-label="メールアドレス"
                    aria-required="true"
                    autoComplete="email"
                    {...form.getInputProps('email')}
                    disabled={isSubmitting || isLoading}
                    styles={{
                      label: { color: 'var(--text-secondary)', fontWeight: 500 },
                      input: { backgroundColor: 'var(--surface)' },
                    }}
                  />
                  <PasswordInput
                    required
                    label="パスワード"
                    placeholder="パスワードを入力"
                    size="md"
                    aria-label="パスワード"
                    aria-required="true"
                    autoComplete="current-password"
                    {...form.getInputProps('password')}
                    disabled={isSubmitting || isLoading}
                    styles={{
                      label: { color: 'var(--text-secondary)', fontWeight: 500 },
                      input: { backgroundColor: 'var(--surface)' },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    loading={isSubmitting || isLoading}
                    aria-label="ログイン"
                    style={{
                      marginTop: '1rem',
                      background: 'var(--accent)',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    ログイン
                  </Button>
                  <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    パスワードをお忘れですか？{' '}
                    <Text
                      component="span"
                      style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (returnTo) {
                          params.set('returnTo', targetPath);
                        }
                        const query = params.toString();
                        router.push(query ? `/forgot-password?${query}` : '/forgot-password');
                      }}
                    >
                      リセット
                    </Text>
                  </Text>
                  <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    アカウントをお持ちでない方は{' '}
                    <Text
                      component="span"
                      style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (returnTo) {
                          params.set('returnTo', targetPath);
                        }
                        const query = params.toString();
                        router.push(query ? `/register?${query}` : '/register');
                      }}
                    >
                      新規登録
                    </Text>
                  </Text>
                </Stack>
              </form>
            </Paper>
            <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              © 2025 MyCats. All rights reserved.
            </Text>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
