'use client';

import { useState } from 'react';
import {
  Box,
  Title,
  Tabs,
  Button,
  Group,
  Card,
  Text,
  Badge,
  Collapse,
  ActionIcon,
  Grid,
  Stack,
  Modal,
  Select,
  NumberInput,
  Divider,
  Container,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconDeviceFloppy,
  IconCalendar,
} from '@tabler/icons-react';
import TagSelector, { TagDisplay } from '../../components/TagSelector';

// サンプルデータ型定義
interface Kitten {
  id: string;
  name: string;
  color: string;
  gender: 'オス' | 'メス';
  weight: number;
  birthDate: string;
  notes?: string;
  tags?: string[];
}

interface MotherCat {
  id: string;
  name: string;
  kittens: Kitten[];
  deliveryDate: string;
  monthsOld: number;
}

// サンプルデータ
const sampleMotherCats: MotherCat[] = [
  {
    id: '1',
    name: 'ミケ',
    deliveryDate: '2024-06-01',
    monthsOld: 2,
    kittens: [
      {
        id: 'k1',
        name: 'ミケ1号',
        color: '三毛',
        gender: 'メス',
        weight: 450,
        birthDate: '2024-06-01',
        notes: '元気',
        tags: ['t4', 't8'] // 人懐っこい、健康
      },
      {
        id: 'k2',
        name: 'ミケ2号',
        color: '黒白',
        gender: 'オス',
        weight: 480,
        birthDate: '2024-06-01',
        notes: '',
        tags: ['t6'] // 活発
      },
    ]
  },
  {
    id: '2',
    name: 'シロ',
    deliveryDate: '2024-05-15',
    monthsOld: 3,
    kittens: [
      {
        id: 'k3',
        name: 'シロ1号',
        color: '白',
        gender: 'メス',
        weight: 520,
        birthDate: '2024-05-15',
        tags: ['t2', 't5'] // 中型、内気
      },
    ]
  },
];

export default function KittensPage() {
  const [motherCats, setMotherCats] = useState<MotherCat[]>(sampleMotherCats);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [opened, { open, close }] = useDisclosure(false);
  
  // 新規登録用の状態
  const [selectedMother, setSelectedMother] = useState<string>('');
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const toggleExpanded = (catId: string) => {
    const newExpanded = new Set(expandedCats);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCats(newExpanded);
  };

  // タグでフィルタリングする関数
  const getFilteredMotherCats = () => {
    if (filterTags.length === 0) {
      return motherCats;
    }

    return motherCats.map(mother => {
      // 子猫をフィルタリング
      const filteredKittens = mother.kittens.filter(kitten => {
        if (!kitten.tags || kitten.tags.length === 0) {
          return false;
        }
        return filterTags.some(filterTag => kitten.tags!.includes(filterTag));
      });

      return { ...mother, kittens: filteredKittens };
    }).filter(mother => mother.kittens.length > 0); // 該当する子猫がいる母猫のみ表示
  };

  const handleRegisterKittens = () => {
    if (!selectedMother || (maleCount === 0 && femaleCount === 0)) {
      return;
    }

    const mother = motherCats.find(cat => cat.id === selectedMother);
    if (!mother) return;

    const newKittens: Kitten[] = [];
    let kittenNumber = mother.kittens.length + 1;

    // オスの子猫を追加
    for (let i = 0; i < maleCount; i++) {
      newKittens.push({
        id: `k${Date.now()}-${i}`,
        name: `${mother.name}${kittenNumber}号`,
        color: '未確認',
        gender: 'オス',
        weight: 350,
        birthDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: selectedTags
      });
      kittenNumber++;
    }

    // メスの子猫を追加
    for (let i = 0; i < femaleCount; i++) {
      newKittens.push({
        id: `k${Date.now()}-${maleCount + i}`,
        name: `${mother.name}${kittenNumber}号`,
        color: '未確認',
        gender: 'メス',
        weight: 340,
        birthDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: selectedTags
      });
      kittenNumber++;
    }

    // 母猫の子猫リストを更新
    setMotherCats(prev => prev.map(cat => 
      cat.id === selectedMother 
        ? { ...cat, kittens: [...cat.kittens, ...newKittens] }
        : cat
    ));

    // フォームをリセット
    setSelectedMother('');
    setMaleCount(0);
    setFemaleCount(0);
    setSelectedTags([]);
    close();
  };

  return (
    <Container size="lg" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '1rem', paddingBottom: '5rem' }}>
      {/* ヘッダー - モバイル最適化 */}
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Title order={1} c="blue" size="h2">子猫管理</Title>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={open}
          size="sm"
        >
          新規登録
        </Button>
      </Group>

      {/* フィルタ */}
      <Card padding="md" mb="md" bg="gray.0">
        <TagSelector 
          selectedTags={filterTags}
          onChange={setFilterTags}
          label="タグでフィルタ"
          placeholder="表示する子猫のタグを選択"
        />
      </Card>

      {/* タブ - モバイル最適化 */}
      <Tabs defaultValue="list" variant="outline" mb="md">
        <Tabs.List grow>
          <Tabs.Tab value="list" leftSection={<IconEdit size={14} />}>
            子猫一覧
          </Tabs.Tab>
          <Tabs.Tab value="care" leftSection={<IconCalendar size={14} />}>
            ケアスケジュール
          </Tabs.Tab>
        </Tabs.List>

        {/* 子猫一覧タブ */}
        <Tabs.Panel value="list" pt="md">
          {filterTags.length > 0 && (
            <Card padding="sm" bg="blue.0" radius="sm" mb="md">
              <Group gap="xs">
                <Text size="sm" fw={500}>フィルタ適用中:</Text>
                <TagDisplay tagIds={filterTags} size="xs" />
                <Button 
                  variant="subtle" 
                  size="xs" 
                  onClick={() => setFilterTags([])}
                >
                  クリア
                </Button>
              </Group>
            </Card>
          )}
          <Stack gap="md">
            {getFilteredMotherCats().length === 0 ? (
              <Card padding="lg" bg="gray.0" radius="md">
                <Text ta="center" c="dimmed">
                  {filterTags.length > 0 ? '条件に該当する子猫が見つかりません' : '登録された子猫がありません'}
                </Text>
              </Card>
            ) : (
              getFilteredMotherCats().map((motherCat) => (
              <Card key={motherCat.id} shadow="sm" padding="md" radius="md" withBorder>
                {/* 母猫情報行 */}
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => toggleExpanded(motherCat.id)}
                    >
                      {expandedCats.has(motherCat.id) ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )}
                    </ActionIcon>
                    <Text fw={500} size="md">{motherCat.name}</Text>
                    <Badge size="sm" color="blue">
                      {motherCat.kittens.length}頭
                    </Badge>
                    <Badge size="sm" color="gray" variant="light">
                      {motherCat.monthsOld}ヶ月
                    </Badge>
                  </Group>
                  <Group gap="xs">
                    <ActionIcon variant="light" size="sm">
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="light" size="sm" color="green">
                      <IconDeviceFloppy size={14} />
                    </ActionIcon>
                  </Group>
                </Group>

                {/* 子猫詳細（展開時） */}
                <Collapse in={expandedCats.has(motherCat.id)}>
                  <Divider my="md" />
                  <Grid>
                    {motherCat.kittens.map((kitten) => (
                      <Grid.Col key={kitten.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card padding="sm" radius="sm" withBorder bg="gray.0">
                          <Stack gap="xs">
                            <Group justify="space-between" wrap="nowrap">
                              <Text size="sm" fw={500}>{kitten.name}</Text>
                              <Badge
                                size="xs"
                                color={kitten.gender === 'オス' ? 'cyan' : 'pink'}
                                variant="light"
                              >
                                {kitten.gender}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed">色柄: {kitten.color}</Text>
                            <Text size="xs" c="dimmed">体重: {kitten.weight}g</Text>
                            {kitten.notes && (
                              <Text size="xs" c="dimmed">備考: {kitten.notes}</Text>
                            )}
                            {kitten.tags && kitten.tags.length > 0 && (
                              <TagDisplay tagIds={kitten.tags} size="xs" />
                            )}
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Collapse>
              </Card>
              ))
            )}
          </Stack>
        </Tabs.Panel>

        {/* ケアスケジュールタブ */}
        <Tabs.Panel value="care" pt="md">
          <Stack gap="md">
            {/* 本日のケア一覧 */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text size="lg" fw={500}>本日のケア一覧</Text>
                <Text size="sm" c="dimmed">{new Date().toLocaleDateString('ja-JP')}</Text>
              </Group>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Card padding="sm" radius="sm" withBorder bg="blue.0">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>ミルク</Text>
                      <Badge size="xs" color="blue">3回</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">ミケ1号、ミケ2号、シロ1号</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Card padding="sm" radius="sm" withBorder bg="green.0">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>体重測定</Text>
                      <Badge size="xs" color="green">2頭</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">ミケ1号、シロ1号</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Card padding="sm" radius="sm" withBorder bg="yellow.0">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>投薬</Text>
                      <Badge size="xs" color="yellow">1頭</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">ミケ2号</Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Card>

            {/* ケアカレンダー */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="md" wrap="wrap">
                <Text size="lg" fw={500}>ケアカレンダー</Text>
                <Group gap="xs">
                  <Button variant="light" size="xs">
                    今週
                  </Button>
                  <Button variant="light" size="xs">
                    来週
                  </Button>
                </Group>
              </Group>
              
              {/* カレンダーテーブル - 横スクロール対応 */}
              <Box 
                style={{ 
                  overflowX: 'auto', 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin'
                }} 
                mb="md"
              >
                <table style={{ 
                  width: '100%', 
                  minWidth: '600px', 
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ 
                        padding: '6px 8px', 
                        border: '1px solid #dee2e6', 
                        minWidth: '80px',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: '#f8f9fa',
                        zIndex: 10
                      }}>
                        母猫名
                      </th>
                      {Array.from({ length: 7 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        return (
                          <th key={i} style={{ 
                            padding: '6px 4px', 
                            border: '1px solid #dee2e6', 
                            minWidth: '70px',
                            textAlign: 'center'
                          }}>
                            <div>
                              <Text size="xs" c="dimmed">
                                {date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                              </Text>
                              <Text size="xs" fw={500}>
                                {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
                              </Text>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {motherCats.map((motherCat) => (
                      <tr key={motherCat.id}>
                        <td style={{ 
                          padding: '6px 8px', 
                          border: '1px solid #dee2e6', 
                          verticalAlign: 'top',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: '#fff',
                          zIndex: 5
                        }}>
                          <Group gap="xs" wrap="nowrap">
                            <Text size="sm" fw={500}>{motherCat.name}</Text>
                            <ActionIcon size="xs" variant="light">
                              <IconPlus size={10} />
                            </ActionIcon>
                          </Group>
                        </td>
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                          <td key={dayIndex} style={{ 
                            padding: '2px', 
                            border: '1px solid #dee2e6', 
                            verticalAlign: 'top',
                            minHeight: '50px'
                          }}>
                            <Stack gap={2} align="center">
                              <Badge size="xs" color="blue" variant="light" style={{ fontSize: '0.65rem' }}>
                                ミルク
                              </Badge>
                              {dayIndex % 3 === 0 && (
                                <Badge size="xs" color="green" variant="light" style={{ fontSize: '0.65rem' }}>
                                  体重
                                </Badge>
                              )}
                              {dayIndex === 2 && (
                                <Badge size="xs" color="orange" variant="light" style={{ fontSize: '0.65rem' }}>
                                  洗い
                                </Badge>
                              )}
                            </Stack>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* スクロールヒント */}
              <Text size="xs" c="dimmed" ta="center" mb="md">
                ← → 横スクロールでカレンダーを確認できます
              </Text>

              {/* 特別ケア */}
              <Divider my="md" />
              <Text size="md" fw={500} mb="sm">特別ケア</Text>
              <Group>
                <Button variant="outline" size="xs" leftSection={<IconPlus size={12} />}>
                  特別ケア追加
                </Button>
              </Group>
              <Stack gap="xs" mt="sm">
                <Card padding="xs" radius="sm" withBorder bg="red.0">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Text size="sm">ミケ2号 - 投薬（抗生物質）</Text>
                      <Badge size="xs" color="red">継続中</Badge>
                    </Group>
                    <ActionIcon size="sm" color="green">
                      <IconDeviceFloppy size={12} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Stack>
            </Card>

            {/* 体重記録 */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text size="lg" fw={500} mb="md">最新体重記録</Text>
              <Grid>
                {motherCats.flatMap(mother => 
                  mother.kittens.map(kitten => (
                    <Grid.Col key={kitten.id} span={{ base: 12, sm: 6, md: 4 }}>
                      <Card padding="sm" radius="sm" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>{kitten.name}</Text>
                            <Badge size="xs" color={kitten.gender === 'オス' ? 'cyan' : 'pink'}>
                              {kitten.gender}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">現在: {kitten.weight}g</Text>
                          <Text size="xs" c="dimmed">前回: 420g (+30g)</Text>
                          <Text size="xs" c="dimmed">測定日: 2024/08/01</Text>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))
                )}
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* 新規登録モーダル */}
      <Modal opened={opened} onClose={close} title="子猫新規登録" size="md">
        <Stack gap="md">
          <Select
            label="母猫選択"
            placeholder="出産予定日の近い順"
            value={selectedMother}
            onChange={(value) => setSelectedMother(value || '')}
            data={motherCats
              .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime())
              .map(cat => ({ 
                value: cat.id, 
                label: `${cat.name} (${cat.deliveryDate} - ${cat.monthsOld}ヶ月)` 
              }))}
          />
          <Group grow>
            <NumberInput
              label="オス頭数"
              placeholder="0"
              min={0}
              max={10}
              value={maleCount}
              onChange={(value) => setMaleCount(Number(value) || 0)}
            />
            <NumberInput
              label="メス頭数"
              placeholder="0"
              min={0}
              max={10}
              value={femaleCount}
              onChange={(value) => setFemaleCount(Number(value) || 0)}
            />
          </Group>
          <TagSelector 
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            label="タグ"
            placeholder="子猫に適用するタグを選択"
          />
          {selectedMother && (maleCount > 0 || femaleCount > 0) && (
            <Card padding="sm" bg="blue.0" radius="sm">
              <Text size="sm" fw={500} mb="xs">生成される子猫名</Text>
              <Group gap="xs">
                {Array.from({ length: maleCount + femaleCount }, (_, i) => {
                  const mother = motherCats.find(cat => cat.id === selectedMother);
                  const kittenNumber = (mother?.kittens.length || 0) + i + 1;
                  return (
                    <Badge 
                      key={i} 
                      size="sm" 
                      color={i < maleCount ? 'cyan' : 'pink'}
                      variant="light"
                    >
                      {mother?.name}{kittenNumber}号
                    </Badge>
                  );
                })}
              </Group>
            </Card>
          )}
          <Text size="sm" c="dimmed">
            ※子猫名は自動生成されます（母猫名＋番号）
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={close}>
              キャンセル
            </Button>
            <Button 
              onClick={handleRegisterKittens}
              disabled={!selectedMother || (maleCount === 0 && femaleCount === 0)}
            >
              登録
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
