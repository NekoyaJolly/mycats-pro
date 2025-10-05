'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Paper, Title, Text, PasswordInput, Button, Alert, Group, Anchor } from '@mantine/core';
import { IconLock, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('リセットトークンが見つかりません');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'リセットに失敗しました');
      }

      setSuccess(true);
      
      // 3秒後にログインページへリダイレクト
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <Container size="xs" style={{ marginTop: '5rem' }}>
        <Paper shadow="md" p="xl" radius="md">
          <Text ta="center">読み込み中...</Text>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container size="xs" style={{ marginTop: '5rem' }}>
        <Paper shadow="md" p="xl" radius="md">
          <Alert icon={<IconCheck size={16} />} title="パスワードをリセットしました" color="green" mb="lg">
            パスワードが正常にリセットされました。
            まもなくログインページにリダイレクトします...
          </Alert>
          <Group justify="center">
            <Anchor component={Link} href="/login">
              今すぐログイン
            </Anchor>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" style={{ marginTop: '5rem' }}>
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="md">
          新しいパスワードを設定
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          新しいパスワードを入力してください
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red" mb="lg">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="新しいパスワード"
            placeholder="8文字以上"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftSection={<IconLock size={16} />}
            mb="md"
          />

          <PasswordInput
            label="パスワード（確認）"
            placeholder="もう一度入力してください"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftSection={<IconLock size={16} />}
            mb="lg"
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={!token}
            mb="md"
          >
            パスワードをリセット
          </Button>

          <Group justify="center">
            <Anchor component={Link} href="/login" size="sm">
              ログインページに戻る
            </Anchor>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container size="xs" style={{ marginTop: '5rem' }}>
        <Paper shadow="md" p="xl" radius="md">
          <Text ta="center">読み込み中...</Text>
        </Paper>
      </Container>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
