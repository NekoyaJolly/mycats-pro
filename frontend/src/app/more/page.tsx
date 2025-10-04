'use client';

import { useRouter } from 'next/navigation';
import {
  Container,
  Card,
  Group,
  Text,
  Stack,
  Button,
  SimpleGrid,
  Box,
} from '@mantine/core';
import { PageTitle } from '@/components/PageTitle';
import { 
  IconPlus, 
  IconTag, 
  IconUsers, 
  IconSettings, 
  IconDatabase,
  IconFileExport,
  IconFileImport,
  IconReport,
  IconChevronRight
} from '@tabler/icons-react';

interface MenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    title: '血統書管理',
    description: '血統書データの閲覧・検索・家系図表示',
    icon: <IconFileExport size={24} />,
    href: '/pedigrees',
    color: 'purple'
  },
  {
    title: '新規猫登録',
    description: '新しい猫の情報を登録します',
    icon: <IconPlus size={24} />,
    href: '/cats/new',
    color: 'blue'
  },
  {
    title: 'タグ管理',
    description: 'タグカテゴリとカスタムタグの作成・編集',
    icon: <IconTag size={24} />,
    href: '/tags',
    color: 'green'
  },
  {
    title: 'ユーザー管理',
    description: 'ユーザーアカウントと権限の管理',
    icon: <IconUsers size={24} />,
    href: '/users',
    color: 'purple'
  },
  {
    title: 'システム設定',
    description: 'アプリケーションの設定と環境設定',
    icon: <IconSettings size={24} />,
    href: '/settings',
    color: 'gray'
  },
  {
    title: 'データベース管理',
    description: 'データのバックアップと復元',
    icon: <IconDatabase size={24} />,
    href: '/database',
    color: 'orange'
  },
  {
    title: 'データエクスポート',
    description: '猫の情報をCSVやPDFで出力',
    icon: <IconFileExport size={24} />,
    href: '/export',
    color: 'cyan'
  },
  {
    title: 'データインポート',
    description: 'CSVファイルから猫の情報を一括登録',
    icon: <IconFileImport size={24} />,
    href: '/import',
    color: 'teal'
  },
  {
    title: 'レポート',
    description: '統計情報とレポートの表示',
    icon: <IconReport size={24} />,
    href: '/reports',
    color: 'red'
  }
];

export default function MorePage() {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
  <Container size="lg" style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)', padding: '1rem', paddingBottom: '5rem' }}>
      {/* ヘッダー */}
      <Group justify="center" mb="lg">
  <PageTitle style={{ color: 'var(--text-primary)' }}>その他の機能</PageTitle>
      </Group>

      {/* 機能一覧 */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => handleNavigate(item.href)}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group align="flex-start" gap="md">
                <Box
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: `var(--mantine-color-${item.color}-1)`,
                    color: `var(--mantine-color-${item.color}-7)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="md" mb="xs">
                    {item.title}
                  </Text>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
                    {item.description}
                  </Text>
                </Box>
              </Group>
              <IconChevronRight 
                size={20} 
                style={{ 
                  color: 'var(--mantine-color-gray-5)',
                  marginTop: '2px',
                  flexShrink: 0
                }} 
              />
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* システム情報 */}
      <Card shadow="sm" padding="md" radius="md" withBorder mt="xl">
  <PageTitle withMarginBottom={true} style={{ color: 'var(--text-secondary)' }}>システム情報</PageTitle>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">アプリバージョン</Text>
            <Text size="sm">v1.0.0</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">データベース</Text>
            <Text size="sm">PostgreSQL</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">最終更新</Text>
            <Text size="sm">2025年8月3日</Text>
          </Group>
        </Stack>
      </Card>

      {/* お問い合わせ */}
      <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
  <PageTitle withMarginBottom={true} style={{ color: 'var(--text-secondary)' }}>サポート</PageTitle>
        <Stack gap="sm">
          <Button variant="subtle" fullWidth justify="space-between" rightSection={<IconChevronRight size={16} />}>
            ヘルプ・使い方
          </Button>
          <Button variant="subtle" fullWidth justify="space-between" rightSection={<IconChevronRight size={16} />}>
            お問い合わせ
          </Button>
          <Button variant="subtle" fullWidth justify="space-between" rightSection={<IconChevronRight size={16} />}>
            アプリについて
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
