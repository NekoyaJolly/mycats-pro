'use client'

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Card,
  LoadingOverlay,
  Alert,
  Grid,
  Select,
} from '@mantine/core';
import { IconArrowLeft, IconDna } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';

interface FamilyTreeData {
  id: string;
  pedigreeId: string;
  catName: string;
  breedCode: number | null;
  gender: number | null;
  birthDate: string | null;
  coatColorCode: number | null;
  breed?: { name: string } | null;
  color?: { name: string } | null;
  father?: FamilyTreeData | null;
  mother?: FamilyTreeData | null;
}

export default function FamilyTreePage() {
  const router = useRouter();
  const params = useParams();
  const pedigreeId = params.id as string;
  
  const [familyTree, setFamilyTree] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState('3');

  const generationOptions = [
    { value: '2', label: '2世代' },
    { value: '3', label: '3世代' },
    { value: '4', label: '4世代' },
    { value: '5', label: '5世代' },
  ];

  useEffect(() => {
    const fetchFamilyTree = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3004/api/v1/pedigrees/${pedigreeId}/family-tree?generations=${generations}`
        );
        
        if (!response.ok) {
          throw new Error('家系図データの取得に失敗しました');
        }

        const data = await response.json();
        setFamilyTree(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (pedigreeId) {
      fetchFamilyTree();
    }
  }, [pedigreeId, generations]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
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

  const PedigreeCard: React.FC<{ 
    pedigree: FamilyTreeData | null;
    level: number;
    position?: 'father' | 'mother';
  }> = ({ pedigree, level: _level, position }) => {
    if (!pedigree) {
      return (
        <Card 
          p="sm" 
          style={{ 
            border: '2px dashed #dee2e6',
            minHeight: '120px',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Text c="dimmed" ta="center" mt="md">
            情報なし
          </Text>
        </Card>
      );
    }

    const borderColor = position === 'father' ? '#228be6' : position === 'mother' ? '#e64980' : '#868e96';
    
    return (
      <Card 
        p="sm" 
        style={{ 
          border: `2px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          minHeight: '120px'
        }}
        onClick={() => router.push(`/pedigrees/${pedigree.id}`)}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="sm" lineClamp={1}>
                {pedigree.catName || '名前なし'}
              </Text>
            </div>
            <Badge size="xs" color={getGenderColor(pedigree.gender)}>
              {formatGender(pedigree.gender)}
            </Badge>
          </Group>
          
          <div>
            <Text size="xs" fw={500} c="blue">
              {pedigree.pedigreeId}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(pedigree.birthDate)}
            </Text>
          </div>

          {pedigree.breed && (
            <Badge size="xs" variant="light">
              {pedigree.breed.name}
            </Badge>
          )}
        </Stack>
      </Card>
    );
  };

  const renderFamilyLevel = (pedigree: FamilyTreeData | null, currentLevel: number, maxLevel: number): React.ReactNode => {
    if (!pedigree || currentLevel > maxLevel) {
      return null;
    }

    return (
      <div key={`level-${currentLevel}-${pedigree.id}`}>
        <Grid gutter="md" mb="md">
          {/* 現在の個体 */}
          <Grid.Col span={12}>
            <Text fw={600} mb="sm" ta="center">
              {currentLevel === 0 ? '本猫' : `第${currentLevel}世代`}
            </Text>
            <Group justify="center">
              <div style={{ width: currentLevel === 0 ? '300px' : '250px' }}>
                <PedigreeCard pedigree={pedigree} level={currentLevel} />
              </div>
            </Group>
          </Grid.Col>

          {/* 両親 */}
          {(pedigree.father || pedigree.mother) && currentLevel < maxLevel && (
            <Grid.Col span={12}>
              <Text fw={600} mb="sm" ta="center">
                両親
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} mb="xs" ta="center" c="blue">
                    <Group justify="center" gap="xs">
                      <IconDna size={16} />
                      父親
                    </Group>
                  </Text>
                  <PedigreeCard pedigree={pedigree.father || null} level={currentLevel + 1} position="father" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} mb="xs" ta="center" c="pink">
                    <Group justify="center" gap="xs">
                      <IconDna size={16} />
                      母親
                    </Group>
                  </Text>
                  <PedigreeCard pedigree={pedigree.mother || null} level={currentLevel + 1} position="mother" />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          )}
        </Grid>

        {/* 祖父母以上の世代を再帰的に表示 */}
        {currentLevel < maxLevel - 1 && (pedigree.father || pedigree.mother) && (
          <div style={{ marginLeft: '20px', paddingLeft: '20px', borderLeft: '2px solid #dee2e6' }}>
            {pedigree.father && renderFamilyLevel(pedigree.father as FamilyTreeData, currentLevel + 1, maxLevel)}
            {pedigree.mother && renderFamilyLevel(pedigree.mother as FamilyTreeData, currentLevel + 1, maxLevel)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Paper p="md" style={{ position: 'relative', minHeight: '400px' }}>
          <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (error || !familyTree) {
    return (
      <Container size="xl" py="md">
        <Alert color="red" title="エラー">
          {error || '家系図データが見つかりませんでした'}
        </Alert>
        <Button mt="md" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            血統書詳細に戻る
          </Button>
          <Group>
            <Select
              label="表示世代数"
              data={generationOptions}
              value={generations}
              onChange={(value) => setGenerations(value || '3')}
              w={120}
            />
          </Group>
        </Group>

        <div>
          <Title order={1} mb="xs">
            {familyTree.catName}の家系図
          </Title>
          <Group>
            <Badge size="lg" color="blue">
              血統書番号: {familyTree.pedigreeId}
            </Badge>
            <Badge size="lg" color={getGenderColor(familyTree.gender)}>
              {formatGender(familyTree.gender)}
            </Badge>
            {familyTree.breed && (
              <Badge size="lg" variant="light">
                {familyTree.breed.name}
              </Badge>
            )}
          </Group>
        </div>

        {/* 家系図表示 */}
        <Paper p="md" shadow="sm" style={{ overflow: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {renderFamilyLevel(familyTree, 0, parseInt(generations))}
          </div>
        </Paper>

        {/* 説明 */}
        <Paper p="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Text size="sm" c="dimmed">
            <strong>使い方:</strong> 各カードをクリックすると、その個体の詳細情報に移動できます。
            世代数を変更することで、表示する祖先の数を調整できます。
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
