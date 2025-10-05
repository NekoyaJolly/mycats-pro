'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  TextInput,
  Select,
  Button,
  Table,
  Pagination,
  Badge,
  Group,
  Stack,
  Text,
  Card,
  Grid,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
} from '@mantine/core';
import { PageTitle } from '@/components/PageTitle';
import { IconSearch, IconEye, IconFilter, IconFileText, IconRefresh, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { apiGet } from '../../lib/api';

interface PedigreeData {
  id: string;
  pedigreeId: string;
  catName: string;
  breedCode: number | null;
  genderCode: number | null;
  gender?: { code: number; name: string } | null;
  breed?: { code: number; name: string } | null;
  coatColor?: { code: number; name: string } | null;
  birthDate: string | null;
  breederName: string | null;
  ownerName: string | null;
  registrationDate: string | null;
  notes: string | null;
  fatherPedigree?: { pedigreeId: string; catName: string } | null;
  motherPedigree?: { pedigreeId: string; catName: string } | null;
}

interface PedigreeResponse {
  data: PedigreeData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function PedigreesPage() {
  const router = useRouter();
  const [pedigrees, setPedigrees] = useState<PedigreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const genderOptions = [
    { value: '', label: '全て' },
    { value: '1', label: '雄' },
    { value: '2', label: '雌' },
  ];

  const fetchPedigrees = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      };

      if (searchTerm) {
        queryParams.search = searchTerm;
      }
      if (genderFilter) {
        queryParams.gender = genderFilter;
      }

      const response = await apiGet('/pedigrees', queryParams);
      if (!response.ok) {
        throw new Error('Failed to fetch pedigrees');
      }

      const data: PedigreeResponse = await response.json();
      setPedigrees(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
      setCurrentPage(data.meta.page);
    } catch (error) {
      console.error('Error fetching pedigrees:', error);
    } finally {
      setLoading(false);
    }
  }, [genderFilter, searchTerm]);

  useEffect(() => {
    fetchPedigrees(1);
  }, [fetchPedigrees]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPedigrees(1);
  };

  const handlePageChange = (page: number) => {
    fetchPedigrees(page);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatGender = (pedigree: PedigreeData) => {
    // gender オブジェクトがあればその name をそのまま使用
    if (pedigree.gender?.name) {
      return pedigree.gender.name;
    }
    // フォールバック: genderCode から判定
    switch (pedigree.genderCode) {
      case 1: return 'Male';
      case 2: return 'Female';
      case 3: return 'Neuter';
      case 4: return 'Spay';
      default: return 'Unknown';
    }
  };

  const getGenderColor = (pedigree: PedigreeData) => {
    const code = pedigree.gender?.code ?? pedigree.genderCode;
    switch (code) {
      case 1: return 'blue';
      case 2: return 'pink';
      case 3: return 'cyan';
      case 4: return 'violet';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Group justify="space-between">
          <PageTitle>血統書データ管理</PageTitle>
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/pedigrees/new')}
              size="md"
            >
              新規登録
            </Button>
            <Badge size="lg" color="blue">
              総計: {total}件
            </Badge>
          </Group>
        </Group>

        {/* フィルター・検索セクション */}
        <Paper p="md" shadow="sm">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                placeholder="猫名、繁殖者名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={16} />}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="性別で絞り込み"
                data={genderOptions}
                value={genderFilter}
                onChange={setGenderFilter}
                leftSection={<IconFilter size={16} />}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Group>
                <Button onClick={handleSearch} leftSection={<IconSearch size={16} />}>
                  検索
                </Button>
                <ActionIcon 
                  variant="light" 
                  onClick={() => fetchPedigrees(currentPage)}
                  size="lg"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 血統書リストテーブル */}
        <Paper shadow="sm" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
          
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>血統書番号</Table.Th>
                <Table.Th>猫名</Table.Th>
                <Table.Th>性別</Table.Th>
                <Table.Th>品種コード</Table.Th>
                <Table.Th>生年月日</Table.Th>
                <Table.Th>繁殖者</Table.Th>
                <Table.Th>父親</Table.Th>
                <Table.Th>母親</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pedigrees.map((pedigree) => (
                <Table.Tr key={pedigree.id}>
                  <Table.Td>
                    <Text fw={600} size="sm">
                      {pedigree.pedigreeId}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>
                      {pedigree.catName || '名前なし'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getGenderColor(pedigree)} size="sm" tt="none">
                      {formatGender(pedigree)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {pedigree.breedCode || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(pedigree.birthDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {pedigree.breederName || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="blue">
                      {pedigree.fatherPedigree 
                        ? `${pedigree.fatherPedigree.pedigreeId} (${pedigree.fatherPedigree.catName})`
                        : '-'
                      }
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="pink">
                      {pedigree.motherPedigree 
                        ? `${pedigree.motherPedigree.pedigreeId} (${pedigree.motherPedigree.catName})`
                        : '-'
                      }
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="詳細を見る">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => router.push(`/pedigrees/${pedigree.id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="家系図を見る">
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={() => router.push(`/pedigrees/${pedigree.id}/family-tree`)}
                        >
                          <IconFileText size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {pedigrees.length === 0 && !loading && (
            <Card mt="md" p="xl" style={{ textAlign: 'center' }}>
              <Text size="lg" c="dimmed">
                血統書データが見つかりませんでした
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                検索条件を変更してお試しください
              </Text>
            </Card>
          )}
        </Paper>

        {/* ページネーション */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              value={currentPage}
              onChange={handlePageChange}
              total={totalPages}
              size="md"
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
}
