'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Text,
  Button,
  TextInput,
  Card,
  Group,
  Stack,
  Flex,
  Box,
  Badge,
  Tabs,
  Select,
  Skeleton,
  Alert,
} from '@mantine/core';
import { PageTitle } from '@/components/PageTitle';
import { IconSearch, IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { useGetCats } from '@/lib/api/hooks/use-cats';
import { useDebouncedValue } from '@mantine/hooks';
import type { GetCatsParams } from '@/lib/api/hooks/use-cats';

export default function CatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cats');
  const [sortBy, setSortBy] = useState('name');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const router = useRouter();

  const queryParams = useMemo<GetCatsParams>(() => {
    const params: GetCatsParams = {};

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    switch (activeTab) {
      case 'male':
        params.gender = 'MALE';
        break;
      case 'female':
        params.gender = 'FEMALE';
        break;
      case 'raising':
        params.isInHouse = true;
        break;
      default:
        break;
    }

    return params;
  }, [debouncedSearch, activeTab]);

  // API連携でデータ取得
  const { data, isLoading, isError, error, isRefetching } = useGetCats(queryParams);

  const apiCats = data?.data?.data || [];

  // 年齢計算関数
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths}ヶ月`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}歳${months}ヶ月` : `${years}歳`;
    }
  };

  const handleViewDetails = (catId: string) => {
    router.push(`/cats/${catId}`);
  };

  // タブ別フィルタリングとソート
  const getFilteredCats = () => {
    let filtered = Array.from(apiCats);
    
    switch (activeTab) {
      case 'male':
        filtered = apiCats.filter((cat) => cat.gender === 'MALE');
        break;
      case 'female':
        filtered = apiCats.filter((cat) => cat.gender === 'FEMALE');
        break;
      case 'kitten':
        // 1歳未満を子猫とする
        filtered = apiCats.filter((cat) => {
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
          return ageInMonths < 12;
        });
        break;
      case 'raising':
        filtered = apiCats.filter((cat) => cat.isInHouse);
        break;
      default:
        filtered = apiCats;
    }
    
    // 検索フィルター適用
    if (searchTerm) {
      filtered = filtered.filter((cat) =>
        cat.name.includes(searchTerm) || 
        (cat.coatColor?.name || '').includes(searchTerm) ||
        (cat.breed?.name || '').includes(searchTerm)
      );
    }
    
    // ソート適用
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
        case 'breed':
          return (a.breed?.name || '').localeCompare(b.breed?.name || '');
        case 'gender':
          return a.gender.localeCompare(b.gender);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredCats = getFilteredCats();

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* ヘッダー */}
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Group justify="space-between" align="center">
            <PageTitle withMarginBottom={false}>在舎猫一覧</PageTitle>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/cats/new')}
              variant="filled"
            >
              新規登録
            </Button>
          </Group>
        </Container>
      </Box>

      {/* メインコンテンツ */}
      <Container size="lg" style={{ paddingTop: '1rem' }}>
        {/* 旧タイトル+ボタンはヘッダーへ移動済み */}
        
        {/* 検索バーと並び替え */}
        <Group gap="md" mb="md">
          <TextInput
            placeholder="名前・品種・色柄で検索..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <Select
            placeholder="並び替え"
            data={[
              { value: 'name', label: '名前順' },
              { value: 'age', label: '年齢順（新しい順）' },
              { value: 'breed', label: '品種順' },
              { value: 'gender', label: '性別順' }
            ]}
            value={sortBy}
            onChange={(value) => setSortBy(value || 'name')}
            style={{ minWidth: 150 }}
          />
        </Group>

        {/* タブ */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'cats')} mb="md">
          <Tabs.List>
            <Tabs.Tab value="cats">Cats ({apiCats.length})</Tabs.Tab>
            <Tabs.Tab value="male">Male ({apiCats.filter(c => c.gender === 'MALE').length})</Tabs.Tab>
            <Tabs.Tab value="female">Female ({apiCats.filter(c => c.gender === 'FEMALE').length})</Tabs.Tab>
            <Tabs.Tab value="kitten">Kitten</Tabs.Tab>
            <Tabs.Tab value="raising">Raising</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* エラー表示 */}
        {isError && (
          <Alert icon={<IconAlertCircle />} title="エラー" color="red" mb="md">
            {error instanceof Error ? error.message : 'データ取得失敗'}
          </Alert>
        )}

        {/* ローディング */}
        {(isLoading || isRefetching) && (
          <Stack gap="xs">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={60} radius="md" />
            ))}
          </Stack>
        )}

        {/* 猫リスト（コンパクト表示） */}
        {!isLoading && !isError && (
          <Stack gap="xs">
            {filteredCats.map((cat) => (
              <Card key={cat.id} shadow="sm" padding="sm" radius="md" withBorder>
                <Flex justify="space-between" align="center">
                  <Group gap="md" style={{ flex: 1 }}>
                    <Text fw={600}>{cat.name}</Text>
                    <Badge color={cat.gender === 'MALE' ? 'blue' : 'pink'} size="sm">
                      {cat.gender === 'MALE' ? 'オス' : 'メス'}
                    </Badge>
                    <Text size="sm">{cat.breed?.name || '未登録'}</Text>
                    <Text size="sm">{calculateAge(cat.birthDate)}</Text>
                  </Group>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => handleViewDetails(cat.id)}
                  >
                    詳細
                  </Button>
                </Flex>
              </Card>
            ))}
          </Stack>
        )}

        {!isLoading && !isError && filteredCats.length === 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text ta="center">
              条件に一致する猫が見つかりませんでした
            </Text>
          </Card>
        )}
      </Container>
    </Box>
  );
}
