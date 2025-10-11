'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Paper, Title, Text, TextInput, Button, Alert, Group, Anchor, CopyButton, ActionIcon, Tooltip, Code } from '@mantine/core';
import { IconMail, IconCheck, IconAlertCircle, IconCopy, IconCheck as IconCheckmark } from '@tabler/icons-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePasswordResetActions, usePasswordResetSelectors } from '@/lib/auth/password-reset-store';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { requestStatus, requestError, devToken, lastRequestedEmail } = usePasswordResetSelectors();
  const { requestPasswordReset, resetRequestState, clearDevToken } = usePasswordResetActions();

  const returnTo = searchParams?.get('returnTo') ?? null;
  const targetPath = useMemo(() => {
    if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
      return '/';
    }
    const disallowed = ['/login', '/register', '/forgot-password'];
    return disallowed.includes(returnTo) ? '/' : returnTo;
  }, [returnTo]);

  const loginHref = useMemo(() => {
    if (returnTo && targetPath !== '/') {
      return `/login?returnTo=${encodeURIComponent(targetPath)}`;
    }
    return '/login';
  }, [returnTo, targetPath]);

  useEffect(() => {
    resetRequestState();
    clearDevToken();
    return () => {
      resetRequestState();
      clearDevToken();
    };
  }, [resetRequestState, clearDevToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await requestPasswordReset(email);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const loading = requestStatus === 'loading';
  const success = requestStatus === 'success';
  const error = localError || requestError;

  if (success) {
    return (
      <Container size="xs" style={{ marginTop: '5rem' }}>
        <Paper shadow="md" p="xl" radius="md">
          <Alert icon={<IconCheck size={16} />} title="メールを送信しました" color="green" mb="lg">
            パスワードリセットの手順を記載したメールを送信しました。
            メールに記載されたリンクをクリックして、パスワードをリセットしてください。
            {lastRequestedEmail && (
              <Text size="sm" mt="sm">
                送信先: <strong>{lastRequestedEmail}</strong>
              </Text>
            )}
            {devToken && (
              <Alert mt="md" variant="light" color="blue" title="開発モード情報">
                <Text size="sm" mb="xs">
                  下記トークンでリセットページにアクセスできます。
                </Text>
                <Group justify="space-between" wrap="nowrap">
                  <Code style={{ flex: 1, overflowX: 'auto' }}>{devToken}</Code>
                  <CopyButton value={devToken} timeout={1500}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'コピーしました' : 'コピー'} withArrow position="left">
                        <ActionIcon variant="subtle" color={copied ? 'teal' : 'blue'} onClick={copy}>
                          {copied ? <IconCheckmark size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Alert>
            )}
          </Alert>
          <Group justify="center">
            <Anchor component={Link} href={loginHref}>
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
            <Anchor component={Link} href={loginHref} size="sm">
              ログインページに戻る
            </Anchor>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
