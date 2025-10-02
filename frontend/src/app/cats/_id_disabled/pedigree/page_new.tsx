'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Flex,
  Grid,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useParams } from 'next/navigation';

// ダミーデータ
const pedigreeData = {
  id: '1',
  name: 'レオ',
  generation1: { // 親
    father: { name: 'パパ猫', color: '茶トラ' },
    mother: { name: 'ママ猫', color: '三毛' }
  },
  generation2: { // 祖父母
    paternalGrandfather: { name: '祖父1', color: '茶トラ' },
    paternalGrandmother: { name: '祖母1', color: '白' },
    maternalGrandfather: { name: '祖父2', color: '黒' },
    maternalGrandmother: { name: '祖母2', color: '三毛' }
  },
  generation3: { // 曾祖父母
    ppgf: { name: '曾祖父1', color: '茶トラ' }, // paternal paternal grandfather
    ppgm: { name: '曾祖母1', color: '白' },     // paternal paternal grandmother
    pmgf: { name: '曾祖父2', color: '茶' },     // paternal maternal grandfather
    pmgm: { name: '曾祖母2', color: '白' },     // paternal maternal grandmother
    mpgf: { name: '曾祖父3', color: '黒' },     // maternal paternal grandfather
    mpgm: { name: '曾祖母3', color: '灰' },     // maternal paternal grandmother
    mmgf: { name: '曾祖父4', color: '三毛' },   // maternal maternal grandfather
    mmgm: { name: '曾祖母4', color: '茶' }      // maternal maternal grandmother
  }
};

const CatCard = ({ cat, level = 0 }: { cat: { name: string; color: string } | null; level?: number }) => {
  if (!cat) {
    return (
      <Card shadow="sm" padding="sm" radius="md" withBorder style={{ minHeight: 60, opacity: 0.3 }}>
        <Text size="sm" c="dimmed">不明</Text>
      </Card>
    );
  }

  const colors = {
    0: '#e3f2fd', // 本人: ライトブルー
    1: '#f3e5f5', // 親: ライトパープル
    2: '#e8f5e8', // 祖父母: ライトグリーン
    3: '#fff3e0'  // 曾祖父母: ライトオレンジ
  };

  return (
    <Card 
      shadow="sm" 
      padding="sm" 
      radius="md" 
      withBorder 
      style={{ 
        backgroundColor: colors[level as keyof typeof colors] || '#f5f5f5',
        minHeight: 60 
      }}
    >
      <Stack gap="xs">
        <Text fw={600} size="sm">{cat.name}</Text>
        <Text size="xs" c="dimmed">{cat.color}</Text>
      </Stack>
    </Card>
  );
};

export default function PedigreePage() {
  const router = useRouter();
  const params = useParams();

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
          <Flex justify="space-between" align="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              戻る
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container size="xl" style={{ paddingTop: '2rem' }}>
        <Title order={1} mb="lg" ta="center">
          {pedigreeData.name}の血統表（4世代）
        </Title>

        {/* 血統表グリッド */}
        <Box style={{ overflowX: 'auto' }}>
          <Grid style={{ minWidth: '1200px' }}>
            {/* 第1列: 本人 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%', justifyContent: 'center' }}>
                <CatCard cat={{ name: pedigreeData.name, color: '茶トラ' }} level={0} />
              </Stack>
            </Grid.Col>

            {/* 第2列: 親 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation1.father} level={1} />
                <CatCard cat={pedigreeData.generation1.mother} level={1} />
              </Stack>
            </Grid.Col>

            {/* 第3列: 祖父母 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation2.paternalGrandfather} level={2} />
                <CatCard cat={pedigreeData.generation2.paternalGrandmother} level={2} />
                <CatCard cat={pedigreeData.generation2.maternalGrandfather} level={2} />
                <CatCard cat={pedigreeData.generation2.maternalGrandmother} level={2} />
              </Stack>
            </Grid.Col>

            {/* 第4列: 曾祖父母 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation3.ppgf} level={3} />
                <CatCard cat={pedigreeData.generation3.ppgm} level={3} />
                <CatCard cat={pedigreeData.generation3.pmgf} level={3} />
                <CatCard cat={pedigreeData.generation3.pmgm} level={3} />
                <CatCard cat={pedigreeData.generation3.mpgf} level={3} />
                <CatCard cat={pedigreeData.generation3.mpgm} level={3} />
                <CatCard cat={pedigreeData.generation3.mmgf} level={3} />
                <CatCard cat={pedigreeData.generation3.mmgm} level={3} />
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>

        {/* 世代ラベル */}
        <Box mt="xl">
          <Grid>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="blue">本人</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="purple">親（第1世代）</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="green">祖父母（第2世代）</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="orange">曾祖父母（第3世代）</Text>
            </Grid.Col>
          </Grid>
        </Box>

        {/* 注意書き */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={3} mb="md">血統表について</Title>
          <Stack gap="sm">
            <Text size="sm">• この血統表は4世代（本人 + 親、祖父母、曾祖父母）を表示しています</Text>
            <Text size="sm">• 各世代は色分けされており、世代が古くなるほど薄い色になります</Text>
            <Text size="sm">• 不明な個体は「不明」と表示されます</Text>
            <Text size="sm">• より詳細な血統情報が必要な場合は、個別にお問い合わせください</Text>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
