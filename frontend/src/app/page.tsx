'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Box,
  Badge,
  SimpleGrid,
  ActionIcon,
  Modal,
  Checkbox,
} from '@mantine/core';
import { IconPlus, IconSettings, IconCalendarEvent, IconStethoscope, IconChevronDown } from '@tabler/icons-react';

// 猫のデータ型
interface Cat {
  id: string;
  name: string;
  breed: string;
  gender: 'オス' | 'メス';
  color: string;
  birthDate: string;
  bodyType: string;
  pedigreeId: string;
  tags: string[];
  status: string;
}

// ケアスケジュール型（項目ごと）
interface CareScheduleItem {
  id: string;
  careType: string;
  cats: Array<{
    id: string;
    name: string;
    catType: 'parent' | 'kitten';
    completed: boolean;
  }>;
  isPriority: boolean; // 優先タグの有無
  isCompleted: boolean; // 項目全体の完了状態
  isExpanded: boolean; // アコーディオンの展開状態
}

// 交配予定型
interface BreedingSchedule {
  id: string;
  maleName: string;
  femaleName: string;
  scheduledDate: string;
  type: 'mating' | 'birth_expected' | 'checkup';
  notes?: string;
}

// ダッシュボード項目の定義
interface DashboardItem {
  id: string;
  label: string;
  getValue: (cats: Cat[]) => number | string;
  color: string;
  enabled: boolean;
}

// サンプルデータ
const cats: Cat[] = [
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

// 今日のケアスケジュール（項目ごと・サンプル）
const todayCareSchedules: CareScheduleItem[] = [
  {
    id: '1',
    careType: '妊娠検診',
    cats: [
      { id: '1', name: 'ミミ', catType: 'parent', completed: false },
      { id: '2', name: 'ハナ', catType: 'parent', completed: true },
    ],
    isPriority: true,
    isCompleted: false,
    isExpanded: false,
  },
  {
    id: '2',
    careType: '体重測定',
    cats: [
      { id: '3', name: 'チビ', catType: 'kitten', completed: false },
      { id: '4', name: 'ピノ', catType: 'kitten', completed: false },
      { id: '5', name: 'モコ', catType: 'kitten', completed: true },
      { id: '6', name: 'ココ', catType: 'kitten', completed: false },
      { id: '7', name: 'ララ', catType: 'kitten', completed: false },
    ],
    isPriority: true,
    isCompleted: false,
    isExpanded: false,
  },
  {
    id: '3',
    careType: 'ワクチン接種',
    cats: [
      { id: '8', name: 'レオ', catType: 'parent', completed: true },
    ],
    isPriority: false,
    isCompleted: true,
    isExpanded: false,
  },
  {
    id: '4',
    careType: 'グルーミング',
    cats: [
      { id: '9', name: 'ハナ', catType: 'parent', completed: false },
      { id: '10', name: 'タロウ', catType: 'parent', completed: false },
      { id: '11', name: 'ミミ', catType: 'parent', completed: false },
    ],
    isPriority: false,
    isCompleted: false,
    isExpanded: false,
  },
];

// 今日の交配予定（サンプル）
const todayBreedingSchedules: BreedingSchedule[] = [
  {
    id: '1',
    maleName: 'レオ',
    femaleName: 'ミミ',
    scheduledDate: '2025-09-26',
    type: 'birth_expected',
    notes: '予定日から3日経過',
  },
  {
    id: '2',
    maleName: 'タロウ',
    femaleName: 'ハナ',
    scheduledDate: '2025-09-26',
    type: 'checkup',
    notes: '交配後健康チェック',
  },
];

export default function Home() {
  const [dashboardModalOpened, setDashboardModalOpened] = useState(false);
  const [careSchedules, setCareSchedules] = useState<CareScheduleItem[]>(todayCareSchedules);
  const router = useRouter();

  // ダッシュボード項目の初期設定
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    {
      id: 'female-count',
      label: 'Female頭数',
      getValue: (cats) => cats.filter(cat => cat.gender === 'メス').length,
      color: 'pink',
      enabled: true,
    },
    {
      id: 'kitten-count',
      label: '子猫頭数',
      getValue: (cats) => {
        const today = new Date();
        return cats.filter(cat => {
          const birthDate = new Date(cat.birthDate);
          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
          return ageInMonths < 12;
        }).length;
      },
      color: 'orange',
      enabled: true,
    },
    {
      id: 'shipping-scheduled',
      label: '出荷予定',
      getValue: (cats) => cats.filter(cat => cat.tags.includes('出荷予定')).length,
      color: 'blue',
      enabled: true,
    },
    {
      id: 'graduation-scheduled',
      label: '卒業予定',
      getValue: (cats) => cats.filter(cat => cat.tags.includes('卒業予定')).length,
      color: 'green',
      enabled: true,
    },
    {
      id: 'breeding-cats',
      label: '繁殖用頭数',
      getValue: (cats) => cats.filter(cat => cat.tags.includes('繁殖用')).length,
      color: 'violet',
      enabled: false,
    },
    {
      id: 'total-cats',
      label: '総頭数',
      getValue: (cats) => cats.length,
      color: 'gray',
      enabled: false,
    },
  ]);

  // 有効なダッシュボード項目のみを取得
  const enabledDashboardItems = useMemo(
    () => dashboardItems.filter(item => item.enabled),
    [dashboardItems]
  );

  // ダッシュボード項目の有効/無効を切り替え
  const toggleDashboardItem = (itemId: string) => {
    setDashboardItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // 項目全体の完了状態を切り替える
  const toggleCareItemCompletion = (itemId: string) => {
    setCareSchedules((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newCompleted = !item.isCompleted;
          return {
            ...item,
            isCompleted: newCompleted,
            // 全体をチェックした場合、すべての個別チェックも完了状態にする
            cats: item.cats.map((cat) => ({ ...cat, completed: newCompleted })),
          };
        }
        return item;
      })
    );
  };

  // 個別の猫のケア完了状態を切り替える
  const toggleIndividualCatCare = (itemId: string, catId: string) => {
    setCareSchedules((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedCats = item.cats.map((cat) =>
            cat.id === catId ? { ...cat, completed: !cat.completed } : cat
          );

          // すべての個別チェックが完了している場合、全体も完了状態にする
          const allCompleted = updatedCats.every((cat) => cat.completed);

          return {
            ...item,
            cats: updatedCats,
            isCompleted: allCompleted,
          };
        }
        return item;
      })
    );
  };

  // アコーディオンの展開/折り畳みを切り替える
  const toggleAccordion = (itemId: string) => {
    setCareSchedules((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isExpanded: !item.isExpanded }
          : item
      )
    );
  };

  // 今日の日付
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 猫の種類による表示
  const getCatTypeLabel = (catType: string) => {
    switch (catType) {
      case 'parent': return '親猫';
      case 'kitten': return '子猫';
      default: return '';
    }
  };

  // 猫の種類による色
  const getCatTypeColor = (catType: string) => {
    switch (catType) {
      case 'parent': return 'blue';
      case 'kitten': return 'orange';
      default: return 'gray';
    }
  };

  // 優先度による色分け (現在未使用だが将来使用予定)
  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'high': return 'red';
  //     case 'medium': return 'yellow';
  //     case 'low': return 'green';
  //     default: return 'gray';
  //   }
  // };

  // 交配予定タイプによる表示
  const getBreedingTypeLabel = (type: string) => {
    switch (type) {
      case 'mating': return '交配予定';
      case 'birth_expected': return '出産予定';
      case 'checkup': return '健康チェック';
      default: return type;
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background-base)',
        color: 'var(--text-primary)',
      }}
    >
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
          {/* 日付表示 */}
          <Group justify="space-between" align="center" mb="md">
            <Text size="lg" fw={600} style={{ color: 'var(--text-primary)' }}>
              {today}
            </Text>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setDashboardModalOpened(true)}
              title="ダッシュボード設定"
              style={{ color: 'var(--text-muted)' }}
            >
              <IconSettings size={16} />
            </ActionIcon>
          </Group>

          {/* ダッシュボード */}
          <Text size="sm" fw={600} style={{ color: 'var(--text-muted)' }} mb="sm">
            ダッシュボード
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="lg">
            {enabledDashboardItems.map((item) => (
              <Card
                key={item.id}
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Text size="xs" fw={500} style={{ color: 'var(--text-muted)' }}>
                    {item.label}
                  </Text>
                </Group>
                <Text size="xl" fw={700} c={item.color}>
                  {item.getValue(cats)}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* メインコンテンツ */}
      <Container size="lg" style={{ paddingTop: '2rem' }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* 今日のケアスケジュール */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="center" mb="md">
              <Group gap="sm">
                <IconStethoscope size={20} color="#228BE6" />
                <Title order={4}>今日のケアスケジュール</Title>
              </Group>
              <Badge variant="light" color="blue">
                {careSchedules.filter(item => !item.isCompleted).length}件
              </Badge>
            </Group>
            
            <Stack gap="sm">
              {careSchedules.map((item) => (
                <Card key={item.id} shadow="xs" padding="sm" radius="sm" withBorder={false} bg={item.isCompleted ? 'gray.1' : 'white'}>
                  <Group justify="space-between" align="center" mb={item.isExpanded ? 'xs' : 0}>
                    <Group gap="sm" style={{ flex: 1 }}>
                      <Checkbox
                        checked={item.isCompleted}
                        onChange={() => toggleCareItemCompletion(item.id)}
                        size="sm"
                      />
                      <Text size="sm" fw={500} td={item.isCompleted ? 'line-through' : undefined}>
                        {item.careType}：{item.cats.length}頭
                      </Text>
                      {item.isPriority && (
                        <Badge size="xs" color="red" variant="light">
                          優先
                        </Badge>
                      )}
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => toggleAccordion(item.id)}
                    >
                      <IconChevronDown size={14} style={{ 
                        transform: item.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} />
                    </ActionIcon>
                  </Group>
                  
                  {/* アコーディオン詳細部分 */}
                  {item.isExpanded && (
                    <Box pl="lg" pt="xs">
                      <Stack gap="xs">
                        {item.cats.map((cat) => (
                          <Group key={cat.id} gap="sm" justify="space-between">
                            <Group gap="sm">
                              <Checkbox
                                checked={cat.completed}
                                onChange={() => toggleIndividualCatCare(item.id, cat.id)}
                                size="xs"
                              />
                              <Badge size="xs" color={getCatTypeColor(cat.catType)}>
                                {getCatTypeLabel(cat.catType)}
                              </Badge>
                              <Text size="xs" td={cat.completed ? 'line-through' : undefined}>
                                {cat.name}
                              </Text>
                            </Group>
                            <Badge size="xs" variant="light" color={cat.completed ? 'green' : 'orange'}>
                              {cat.completed ? '完了' : '予定'}
                            </Badge>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Card>
              ))}
              
              {careSchedules.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  今日のケア予定はありません
                </Text>
              )}
            </Stack>
          </Card>

          {/* 今日の交配予定 */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="center" mb="md">
              <Group gap="sm">
                <IconCalendarEvent size={20} color="#FA5252" />
                <Title order={4}>交配カレンダー（今日の予定）</Title>
              </Group>
              <Badge variant="light" color="red">
                {todayBreedingSchedules.length}件
              </Badge>
            </Group>
            
            <Stack gap="sm">
              {todayBreedingSchedules.map((schedule) => (
                <Card key={schedule.id} shadow="xs" padding="sm" radius="sm" withBorder={false} bg="red.0">
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Group gap="sm">
                        <Text size="sm" fw={500}>
                          {schedule.maleName} × {schedule.femaleName}
                        </Text>
                      </Group>
                      <Badge variant="light" color="red" size="sm">
                        {getBreedingTypeLabel(schedule.type)}
                      </Badge>
                    </Group>
                    {schedule.notes && (
                      <Text size="xs">
                        {schedule.notes}
                      </Text>
                    )}
                  </Stack>
                </Card>
              ))}
              
              {todayBreedingSchedules.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  今日の交配予定はありません
                </Text>
              )}
            </Stack>
          </Card>
        </SimpleGrid>

        {/* クイックアクション */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={4} mb="md">クイックアクション</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Button
              leftSection={<IconPlus size={16} />}
              variant="outline"
              onClick={() => router.push('/cats/new')}
            >
              新しい猫を登録
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/cats')}
            >
              猫一覧を見る
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/breeding')}
            >
              交配管理
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/care')}
            >
              ケア管理
            </Button>
          </SimpleGrid>
        </Card>
      </Container>

      {/* ダッシュボード設定モーダル */}
      <Modal
        opened={dashboardModalOpened}
        onClose={() => setDashboardModalOpened(false)}
        title="ダッシュボード設定"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            表示したい項目を選択してください（最大4項目まで）
          </Text>
          {dashboardItems.map((item) => (
            <Checkbox
              key={item.id}
              label={`${item.label} (${item.getValue(cats)})`}
              checked={item.enabled}
              onChange={() => toggleDashboardItem(item.id)}
              disabled={!item.enabled && enabledDashboardItems.length >= 4}
            />
          ))}
          <Group justify="flex-end" mt="md">
            <Button onClick={() => setDashboardModalOpened(false)}>
              完了
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
