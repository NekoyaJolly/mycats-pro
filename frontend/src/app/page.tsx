'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
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
} from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';

// 在舎猫データ（設計書に基づく）
const cats = [
  { 
    id: '1', 
    name: 'レオ', 
    breed: 'アメリカンショートヘア',
    gender: 'オス',
    color: '茶トラ', 
    birthDate: '2023-03-15',
    bodyType: '大型',
    pedigreeId: 'P001',
    tags: ['繁殖用', '健康'],
    status: '在舎',
  },
  { 
    id: '2', 
    name: 'ミミ', 
    breed: '雑種',
    gender: 'メス',
    color: '三毛', 
    birthDate: '2023-02-20',
    bodyType: '中型',
    pedigreeId: 'P002',
    tags: ['繁殖用', '妊娠中'],
    status: '在舎',
  },
  { 
    id: '3', 
    name: 'ハナ', 
    breed: 'ペルシャ',
    gender: 'メス',
    color: '白',
    birthDate: '2022-11-10',
    bodyType: '小型',
    pedigreeId: 'P003',
    tags: ['展示用', '健康'],
    status: '在舎',
  },
  { 
    id: '4', 
    name: 'タロウ', 
    breed: 'スコティッシュフォールド',
    gender: 'オス',
    color: 'グレー',
    birthDate: '2023-01-05',
    bodyType: '中型',
    pedigreeId: 'P004',
    tags: ['繁殖用'],
    status: '在舎',
  },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cats');
  const [sortBy, setSortBy] = useState('name'); // 並び替え条件
  const router = useRouter();

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
    let filtered = cats;
    
    switch (activeTab) {
      case 'male':
        filtered = cats.filter(cat => cat.gender === 'オス');
        break;
      case 'female':
        filtered = cats.filter(cat => cat.gender === 'メス');
        break;
      case 'kitten':
        // 1歳未満を子猫とする
        filtered = cats.filter(cat => {
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
          return ageInMonths < 12;
        });
        break;
      case 'raising':
        filtered = cats.filter(cat => cat.tags.includes('繁殖用') || cat.tags.includes('妊娠中'));
        break;
      default:
        filtered = cats;
    }
    
    // 検索フィルター適用
    if (searchTerm) {
      filtered = filtered.filter((cat) =>
        cat.name.includes(searchTerm) || 
        cat.color.includes(searchTerm) ||
        cat.breed.includes(searchTerm)
      );
    }
    
    // ソート適用
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime(); // 新しい順
        case 'breed':
          return a.breed.localeCompare(b.breed);
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
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* ヘッダー */}
      <Box style={{ backgroundColor: 'white', borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}>
        <Container size="xl">
          <Title order={1} c="blue.6">
            猫管理システム
          </Title>
        </Container>
      </Box>

      {/* メインコンテンツ */}
      <Container size="lg" style={{ paddingTop: '1rem' }}>
        {/* タイトルと新規登録ボタン */}
        <Flex justify="space-between" align="center" mb="md">
          <Title order={2}>在舎猫一覧</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push('/cats/new')}
          >
            新規登録
          </Button>
        </Flex>
        
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
            <Tabs.Tab value="cats">Cats ({cats.length})</Tabs.Tab>
            <Tabs.Tab value="male">Male ({cats.filter(c => c.gender === 'オス').length})</Tabs.Tab>
            <Tabs.Tab value="female">Female ({cats.filter(c => c.gender === 'メス').length})</Tabs.Tab>
            <Tabs.Tab value="kitten">Kitten</Tabs.Tab>
            <Tabs.Tab value="raising">Raising</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* 猫リスト（コンパクト表示） */}
        <Stack gap="xs">
          {filteredCats.map((cat) => (
            <Card key={cat.id} shadow="sm" padding="sm" radius="md" withBorder>
              <Flex justify="space-between" align="center">
                <Group gap="md" style={{ flex: 1 }}>
                  <Text fw={600}>{cat.name}</Text>
                  <Badge color={cat.gender === 'オス' ? 'blue' : 'pink'} size="sm">
                    {cat.gender}
                  </Badge>
                  <Text size="sm">{cat.breed}</Text>
                  <Text size="sm" c="dimmed">{calculateAge(cat.birthDate)}</Text>
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

        {filteredCats.length === 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text ta="center" c="dimmed">
              条件に一致する猫が見つかりませんでした
            </Text>
          </Card>
        )}

        {/* サブページへの遷移ボタン */}
        <Group justify="center" mt="xl">
          <Button variant="outline" onClick={() => router.push("/breeding")}>交配管理</Button>
          <Button variant="outline" onClick={() => router.push("/kittens")}>子猫管理</Button>
          <Button variant="outline" onClick={() => router.push("/tags")}>タグ管理</Button>
        </Group>
      </Container>
    </Box>
  );
}
