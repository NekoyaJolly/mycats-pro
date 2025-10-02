/**
 * ログイン画面
 */

'use client';

import { useState, useEffect } from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/lib/api/auth-store';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォーム設定
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
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
    },
  });

  // 既にログイン済みの場合はホームへリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // エラーが変更されたときにクリア
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // ログイン処理
  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login(values);
      // ログイン成功後は自動的にホームへリダイレクト（useEffectで処理）
    } catch (error) {
      // エラーは useAuth の error ステートで管理される
      console.error('Login error:', error);
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
            <Box style={{ textAlign: 'center' }}>
              <Text
                size="xl"
                style={{
                  fontSize: '4rem',
                  marginBottom: '1rem',
                }}
              >
                🐱
              </Text>
              <Title
                order={1}
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                猫生体管理システム
              </Title>
              <Text style={{ color: 'var(--text-secondary)' }}>
                ログインして続行
              </Text>
            </Box>

            {/* ログインフォーム */}
            <Paper radius="lg" p="xl" shadow="xl" style={{ boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  {/* エラーメッセージ */}
                  {error && (
                    <Alert
                      icon={<IconAlertCircle size="1rem" />}
                      title="ログインエラー"
                      color="red"
                      onClose={clearError}
                      withCloseButton
                    >
                      {error}
                    </Alert>
                  )}

                  {/* メールアドレス */}
                  <TextInput
                    required
                    label="メールアドレス"
                    placeholder="your@email.com"
                    size="md"
                    {...form.getInputProps('email')}
                    disabled={isSubmitting || isLoading}
                    styles={{
                      label: { color: 'var(--text-secondary)', fontWeight: 500 },
                      input: { backgroundColor: 'var(--surface)' },
                    }}
                  />

                  {/* パスワード */}
                  <PasswordInput
                    required
                    label="パスワード"
                    placeholder="パスワードを入力"
                    size="md"
                    {...form.getInputProps('password')}
                    disabled={isSubmitting || isLoading}
                    styles={{
                      label: { color: 'var(--text-secondary)', fontWeight: 500 },
                      input: { backgroundColor: 'var(--surface)' },
                    }}
                  />

                  {/* ログインボタン */}
                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    loading={isSubmitting || isLoading}
                    style={{
                      marginTop: '1rem',
                      background: 'var(--accent)',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    ログイン
                  </Button>

                  {/* パスワードリセットリンク（将来実装） */}
                  <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    パスワードをお忘れですか？{' '}
                    <Text
                      component="span"
                      style={{ color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5 }}
                    >
                      リセット（準備中）
                    </Text>
                  </Text>

                  {/* 新規登録リンク */}
                  <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    アカウントをお持ちでない方は{' '}
                    <Text
                      component="span"
                      style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => router.push('/register')}
                    >
                      新規登録
                    </Text>
                  </Text>
                </Stack>
              </form>
            </Paper>

            {/* フッター */}
            <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              © 2025 猫生体管理システム. All rights reserved.
            </Text>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
