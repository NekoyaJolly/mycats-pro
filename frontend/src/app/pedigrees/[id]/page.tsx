'use client'

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Grid,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Card,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconCalendar, IconUser, IconDna, IconFileText } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';

interface PedigreeDetail {
  id: string;
  pedigreeId: string;
  catId: string | null;
  title: string | null;
  catName: string;
  breedCode: number | null;
  gender: number | null;
  eyeColor: string | null;
  coatColorCode: number | null;
  birthDate: string | null;
  registrationDate: string | null;
  breederName: string | null;
  ownerName: string | null;
  brotherCount: number | null;
  sisterCount: number | null;
  notes: string | null;
  notes2: string | null;
  otherNo: string | null;
  oldCode: string | null;
  breed: { id: string; name: string; code: number } | null;
  color: { id: string; name: string; code: number } | null;
  fatherPedigree: {
    id: string;
    pedigreeId: string;
    catName: string;
    breedCode: number | null;
    coatColorCode: number | null;
  } | null;
  motherPedigree: {
    id: string;
    pedigreeId: string;
    catName: string;
    breedCode: number | null;
    coatColorCode: number | null;
  } | null;
  fatherOf: Array<{ id: string; pedigreeId: string; catName: string }>;
  motherOf: Array<{ id: string; pedigreeId: string; catName: string }>;
}

export default function PedigreeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pedigreeId = params.id as string;
  
  const [pedigree, setPedigree] = useState<PedigreeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedigree = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3004/api/v1/pedigrees/${pedigreeId}`);
        
        if (!response.ok) {
          throw new Error('血統書データの取得に失敗しました');
        }

        const data = await response.json();
        setPedigree(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (pedigreeId) {
      fetchPedigree();
    }
  }, [pedigreeId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatGender = (gender: number | null) => {
    switch (gender) {
      case 1: return '雄';
      case 2: return '雌';
      default: return '不明';
    }
  };

  const getGenderColor = (gender: number | null) => {
    switch (gender) {
      case 1: return 'blue';
      case 2: return 'pink';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="md">
        <Paper p="md" style={{ position: 'relative', minHeight: '400px' }}>
          <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (error || !pedigree) {
    return (
      <Container size="lg" py="md">
        <Alert color="red" title="エラー">
          {error || '血統書データが見つかりませんでした'}
        </Alert>
        <Button mt="md" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            血統書一覧に戻る
          </Button>
          <Group>
            <Button
              variant="light"
              color="green"
              leftSection={<IconFileText size={16} />}
              onClick={() => router.push(`/pedigrees/${pedigree.id}/family-tree`)}
            >
              家系図を見る
            </Button>
          </Group>
        </Group>

        <Title order={1}>血統書詳細情報</Title>

        {/* 基本情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">基本情報</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Group>
                  <Text fw={600}>血統書番号:</Text>
                  <Badge size="lg" color="blue">{pedigree.pedigreeId}</Badge>
                </Group>
                <Group>
                  <Text fw={600}>猫名:</Text>
                  <Text size="lg" fw={500}>{pedigree.catName || '名前なし'}</Text>
                </Group>
                <Group>
                  <Text fw={600}>タイトル:</Text>
                  <Text>{pedigree.title || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={600}>性別:</Text>
                  <Badge color={getGenderColor(pedigree.gender)}>
                    {formatGender(pedigree.gender)}
                  </Badge>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Group>
                  <IconCalendar size={16} />
                  <Text fw={600}>生年月日:</Text>
                  <Text>{formatDate(pedigree.birthDate)}</Text>
                </Group>
                <Group>
                  <IconCalendar size={16} />
                  <Text fw={600}>登録年月日:</Text>
                  <Text>{formatDate(pedigree.registrationDate)}</Text>
                </Group>
                <Group>
                  <Text fw={600}>品種コード:</Text>
                  <Text>{pedigree.breedCode || '-'}</Text>
                  {pedigree.breed && (
                    <Badge variant="light">{pedigree.breed.name}</Badge>
                  )}
                </Group>
                <Group>
                  <Text fw={600}>毛色コード:</Text>
                  <Text>{pedigree.coatColorCode || '-'}</Text>
                  {pedigree.color && (
                    <Badge variant="light" color="orange">{pedigree.color.name}</Badge>
                  )}
                </Group>
                <Group>
                  <Text fw={600}>目色:</Text>
                  <Text>{pedigree.eyeColor || '-'}</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 関係者情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">関係者情報</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group>
                <IconUser size={16} />
                <Text fw={600}>繁殖者:</Text>
                <Text>{pedigree.breederName || '-'}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group>
                <IconUser size={16} />
                <Text fw={600}>所有者:</Text>
                <Text>{pedigree.ownerName || '-'}</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 家族情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">家族情報</Title>
          
          <Grid>
            {/* 兄弟姉妹情報 */}
            <Grid.Col span={12}>
              <Group>
                <Text fw={600}>兄弟:</Text>
                <Badge>{pedigree.brotherCount ?? 0}匹</Badge>
                <Text fw={600}>姉妹:</Text>
                <Badge>{pedigree.sisterCount ?? 0}匹</Badge>
              </Group>
            </Grid.Col>

            {/* 両親情報 */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card p="md" style={{ border: '2px solid #228be6' }}>
                <Group mb="xs">
                  <IconDna size={16} />
                  <Text fw={600} c="blue">父親</Text>
                </Group>
                {pedigree.fatherPedigree ? (
                  <Stack gap="xs">
                    <Text size="sm">
                      <Text span fw={500}>血統書番号:</Text> {pedigree.fatherPedigree.pedigreeId}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>猫名:</Text> {pedigree.fatherPedigree.catName}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>品種コード:</Text> {pedigree.fatherPedigree.breedCode || '-'}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => router.push(`/pedigrees/${pedigree.fatherPedigree!.id}`)}
                    >
                      詳細を見る
                    </Button>
                  </Stack>
                ) : (
                  <Text c="dimmed">情報なし</Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card p="md" style={{ border: '2px solid #e64980' }}>
                <Group mb="xs">
                  <IconDna size={16} />
                  <Text fw={600} c="pink">母親</Text>
                </Group>
                {pedigree.motherPedigree ? (
                  <Stack gap="xs">
                    <Text size="sm">
                      <Text span fw={500}>血統書番号:</Text> {pedigree.motherPedigree.pedigreeId}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>猫名:</Text> {pedigree.motherPedigree.catName}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>品種コード:</Text> {pedigree.motherPedigree.breedCode || '-'}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => router.push(`/pedigrees/${pedigree.motherPedigree!.id}`)}
                    >
                      詳細を見る
                    </Button>
                  </Stack>
                ) : (
                  <Text c="dimmed">情報なし</Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 子供情報 */}
        {(pedigree.fatherOf.length > 0 || pedigree.motherOf.length > 0) && (
          <Paper p="md" shadow="sm">
            <Title order={2} size="h3" mb="md">子供</Title>
            <Grid>
              {pedigree.fatherOf.length > 0 && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} mb="xs">父親として</Text>
                  <Stack gap="xs">
                    {pedigree.fatherOf.map((child) => (
                      <Card key={child.id} p="xs" style={{ border: '1px solid #dee2e6' }}>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>{child.catName}</Text>
                            <Text size="xs" c="dimmed">{child.pedigreeId}</Text>
                          </div>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => router.push(`/pedigrees/${child.id}`)}
                          >
                            詳細
                          </Button>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Grid.Col>
              )}
              
              {pedigree.motherOf.length > 0 && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} mb="xs">母親として</Text>
                  <Stack gap="xs">
                    {pedigree.motherOf.map((child) => (
                      <Card key={child.id} p="xs" style={{ border: '1px solid #dee2e6' }}>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>{child.catName}</Text>
                            <Text size="xs" c="dimmed">{child.pedigreeId}</Text>
                          </div>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => router.push(`/pedigrees/${child.id}`)}
                          >
                            詳細
                          </Button>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* その他の情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">その他の情報</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Group>
                  <Text fw={600}>他団体No:</Text>
                  <Text>{pedigree.otherNo || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={600}>旧コード:</Text>
                  <Text>{pedigree.oldCode || '-'}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <div>
                  <Text fw={600} mb="xs">摘要:</Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {pedigree.notes || '記載なし'}
                  </Text>
                </div>
                {pedigree.notes2 && (
                  <div>
                    <Text fw={600} mb="xs">摘要2:</Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {pedigree.notes2}
                    </Text>
                  </div>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}
