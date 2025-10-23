'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { IconSearch, IconPlus, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useGetCats, useGetCatStatistics, type Cat, type GetCatsParams } from '@/lib/api/hooks/use-cats';
import { useDebouncedValue } from '@mantine/hooks';

export default function CatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cats');
  const [sortBy, setSortBy] = useState('name');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const router = useRouter();
  const searchParams = useSearchParams();

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
        // We need the full dataset client-side to determine which mothers are raising kittens.
        // Request a larger limit so client can compute correctly.
        params.limit = 1000;
        break;
      case 'kitten':
        // Kitten filtering is done client-side (motherId present + <12 months old).
        // Make sure we fetch sufficient rows to compute correctly.
        params.limit = 1000;
        break;
      default:
        // For 'cats' tab, also fetch sufficient data for accurate counts
        params.limit = 1000;
        break;
    }

    return params;
  }, [debouncedSearch, activeTab]);

  // API連携でデータ取得
  const { data, isLoading, isError, error, isRefetching, refetch } = useGetCats(queryParams, {
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: statsData } = useGetCatStatistics();

  // 新規登録からの遷移を検知して自動リフレッシュ
  useEffect(() => {
    const refreshParam = searchParams.get('t');
    if (refreshParam) {
      refetch();
      // URLからパラメータを削除
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('t');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, refetch]);

  const apiCats = data?.data || [];

  // compute counts for kitten / raising
  const kittenCount = apiCats.filter((cat: Cat) => {
    if (!cat.birthDate || !cat.motherId) return false;
    const birthDate = new Date(cat.birthDate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return ageInDays <= 60; // 60日以内
  }).length;

  // Raising: 新規登録された生後11ヶ月以内の猫
  const raisingCount = apiCats.filter((cat: Cat) => {
    if (!cat.birthDate) return false;
    const birthDate = new Date(cat.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    return ageInMonths < 11; // 11ヶ月以内
  }).length;

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
        filtered = apiCats.filter((cat: Cat) => cat.gender === 'MALE');
        break;
      case 'female':
        filtered = apiCats.filter((cat: Cat) => cat.gender === 'FEMALE');
        break;
      case 'kitten':
        // 母猫の出産時に登録された生後60日以内の子猫のみ表示
        filtered = apiCats.filter((cat: Cat) => {
          if (!cat.birthDate || !cat.motherId) return false;
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
          return ageInDays <= 60; // 60日以内
        });
        break;
      case 'raising':
        // 新規登録された生後11ヶ月以内の猫（養成中の猫）
        filtered = apiCats.filter((cat: Cat) => {
          if (!cat.birthDate) return false;
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
          return ageInMonths < 11; // 11ヶ月以内
        });
        break;
      default:
        filtered = apiCats;
    }
    
    // 検索フィルター適用
    if (searchTerm) {
      filtered = filtered.filter((cat: Cat) =>
        cat.name.includes(searchTerm) || 
        (cat.coatColor?.name || '').includes(searchTerm) ||
        (cat.breed?.name || '').includes(searchTerm)
      );
    }
    
    // ソート適用
    filtered.sort((a: Cat, b: Cat) => {
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
            <Group gap="sm">
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={() => refetch()}
                loading={isRefetching}
              >
                更新
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push('/cats/new')}
                variant="filled"
              >
                新規登録
              </Button>
            </Group>
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
              <Tabs.Tab value="cats">Cats ({(statsData && (statsData as any).data?.total) ?? apiCats.length})</Tabs.Tab>
              <Tabs.Tab value="male">Male ({(statsData && (statsData as any).data?.genderDistribution?.MALE) ?? apiCats.filter((c: Cat) => c.gender === 'MALE').length})</Tabs.Tab>
              <Tabs.Tab value="female">Female ({(statsData && (statsData as any).data?.genderDistribution?.FEMALE) ?? apiCats.filter((c: Cat) => c.gender === 'FEMALE').length})</Tabs.Tab>
              <Tabs.Tab value="kitten">Kitten ({kittenCount})</Tabs.Tab>
              <Tabs.Tab value="raising">Raising ({raisingCount})</Tabs.Tab>
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
            {filteredCats.map((cat: Cat) => (
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
