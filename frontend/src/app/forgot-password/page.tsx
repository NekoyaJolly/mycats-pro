'use client';

import { useState } from 'react';
import { Container, Paper, Title, Text, TextInput, Button, Alert, Group, Anchor } from '@mantine/core';
import { IconMail, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1'}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message = isRecord(data) && typeof data.message === 'string'
          ? data.message
          : 'リクエストに失敗しました';
        throw new Error(message);
      }

      setSuccess(true);
      
      // 開発環境でトークンが返却された場合はコンソールに出力
      if (isRecord(data) && typeof data.token === 'string') {
        console.log('🔑 Password reset token:', data.token);
        console.log('🔗 Reset URL:', `${window.location.origin}/reset-password?token=${data.token}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size="xs" style={{ marginTop: '5rem' }}>
        <Paper shadow="md" p="xl" radius="md">
          <Alert icon={<IconCheck size={16} />} title="メールを送信しました" color="green" mb="lg">
            パスワードリセットの手順を記載したメールを送信しました。
            メールに記載されたリンクをクリックして、パスワードをリセットしてください。
          </Alert>
          <Group justify="center">
            <Anchor component={Link} href="/login">
              ログインページに戻る
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
          パスワードをお忘れですか？
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          登録されたメールアドレスを入力してください。
          パスワードリセット用のリンクをお送りします。
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red" mb="lg">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="メールアドレス"
            placeholder="your@email.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftSection={<IconMail size={16} />}
            mb="lg"
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            mb="md"
          >
            リセットリンクを送信
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
