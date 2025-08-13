'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Flex,
  Badge,
  Tabs,
  Table,
  Modal,
  Select,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconPlus, 
  IconHeart, 
  IconCalendar,
  IconPaw,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconMaximize,
  IconMinimize,
  IconSettings
} from '@tabler/icons-react';

// 猫データ（繁殖用）
const maleCats = [
  { id: '1', name: 'レオ', breed: 'アメリカンショートヘア', status: '繁殖可能', tags: ['血統書付き', '大型'] },
  { id: '4', name: 'タロウ', breed: 'スコティッシュフォールド', status: '繁殖可能', tags: ['純血', '中型'] },
  { id: '7', name: 'クロ', breed: '雑種', status: '繁殖可能', tags: ['健康', '中型'] },
  { id: '8', name: 'シロ', breed: 'ペルシャ', status: '繁殖可能', tags: ['血統書付き', '小型'] },
];

const femaleCats = [
  { id: '2', name: 'ミミ', breed: '雑種', status: '繁殖可能', lastMating: null, tags: ['健康', '中型'] },
  { id: '3', name: 'ハナ', breed: 'ペルシャ', status: '繁殖可能', lastMating: null, tags: ['血統書付き', '小型'] },
  { id: '5', name: 'サクラ', breed: 'ラグドール', status: '繁殖可能', lastMating: null, tags: ['純血', '大型'] },
  { id: '6', name: 'ユキ', breed: 'メインクーン', status: '繁殖可能', lastMating: null, tags: ['血統書付き', '大型'] },
];

// NGペアルール
const ngPairingRules = [
  {
    id: '1',
    name: '近親交配防止',
    maleConditions: ['血統書付き'],
    femaleConditions: ['血統書付き'],
    description: '血統書付き同士の交配は避ける',
    active: true,
  },
  {
    id: '2',
    name: 'サイズ不適合',
    maleConditions: ['大型'],
    femaleConditions: ['小型'],
    description: '大型オスと小型メスの交配は避ける',
    active: true,
  },
];

// 現在の日付から1ヶ月のカレンダーを生成
const generateMonthDates = (year: number, month: number) => {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    dates.push({
      date: day,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dayOfWeek: date.getDay(),
    });
  }
  return dates;
};

export default function BreedingPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedMonth, setSelectedMonth] = useState(8); // 8月
  const [selectedYear, setSelectedYear] = useState(2024);
  const [breedingSchedule, setBreedingSchedule] = useState<Record<string, any>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMaleForEdit, setSelectedMaleForEdit] = useState<string | null>(null);
  const [activeMales, setActiveMales] = useState(maleCats.slice(0, 4)); // 最初は4頭表示
  const [pregnancyCheckList, setPregnancyCheckList] = useState([
    {
      id: '1',
      maleName: 'レオ',
      femaleName: 'ハナ',
      matingDate: '2024-07-15',
      checkDate: '2024-08-05',
      status: '確認待ち',
    },
  ]);
  const [birthPlanList, setBirthPlanList] = useState([
    {
      id: '1',
      maleName: 'タロウ',
      femaleName: 'ミミ',
      matingDate: '2024-06-20',
      expectedDate: '2024-08-20',
      status: '出産予定',
    },
  ]);
  
  const [selectedMale, setSelectedMale] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableFemales, setAvailableFemales] = useState<any[]>([]);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [maleModalOpened, { open: openMaleModal, close: closeMaleModal }] = useDisclosure(false);
  const [rulesModalOpened, { open: openRulesModal, close: closeRulesModal }] = useDisclosure(false);
  
  const router = useRouter();

  const monthDates = generateMonthDates(selectedYear, selectedMonth);

  // NGペアチェック関数
  const isNGPairing = (maleId: string, femaleId: string) => {
    const male = maleCats.find(m => m.id === maleId);
    const female = femaleCats.find(f => f.id === femaleId);
    
    if (!male || !female) return false;
    
    return ngPairingRules.some(rule => {
      if (!rule.active) return false;
      
      const maleMatches = rule.maleConditions.some(condition => male.tags.includes(condition));
      const femaleMatches = rule.femaleConditions.some(condition => female.tags.includes(condition));
      
      return maleMatches && femaleMatches;
    });
  };

  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // オス猫追加
  const handleAddMale = (maleData: any) => {
    setActiveMales(prev => [...prev, maleData]);
    closeMaleModal();
  };

  // オス猫削除
  const handleRemoveMale = (maleId: string) => {
    setActiveMales(prev => prev.filter(m => m.id !== maleId));
    setSelectedMaleForEdit(null);
  };

  // オス猫選択時に交配可能メス一覧を表示
  const handleMaleSelect = (maleId: string, date: string) => {
    setSelectedMale(maleId);
    setSelectedDate(date);
    
    // 交配可能なメス猫をフィルタリング（妊娠中・確認中以外）
    const available = femaleCats.filter(female => 
      female.status === '繁殖可能' &&
      !pregnancyCheckList.some(p => p.femaleName === female.name) &&
      !birthPlanList.some(b => b.femaleName === female.name)
    );
    
    setAvailableFemales(available);
    openModal();
  };

  // オス猫名クリック時の編集モード
  const handleMaleNameClick = (maleId: string) => {
    setSelectedMaleForEdit(selectedMaleForEdit === maleId ? null : maleId);
  };

  // メス猫をスケジュールに追加
  const handleAddFemaleToSchedule = (femaleId: string) => {
    const female = femaleCats.find(f => f.id === femaleId);
    const male = activeMales.find(m => m.id === selectedMale);
    
    if (female && male && selectedDate) {
      // NGペアチェック
      if (isNGPairing(selectedMale!, femaleId)) {
        const ngRule = ngPairingRules.find(rule => {
          const maleMatches = rule.maleConditions.some(condition => male.tags.includes(condition));
          const femaleMatches = rule.femaleConditions.some(condition => female.tags.includes(condition));
          return rule.active && maleMatches && femaleMatches;
        });
        
        const confirmed = window.confirm(
          `警告: このペアは「${ngRule?.name}」ルールに該当します。\n${ngRule?.description}\n\n本当に交配を予定しますか？`
        );
        
        if (!confirmed) {
          closeModal();
          return;
        }
      }
      
      const scheduleKey = `${selectedMale}-${selectedDate}`;
      
      // 前回のペアがある場合、成功/失敗の確認
      const existingPair = breedingSchedule[scheduleKey];
      if (existingPair) {
        const success = window.confirm(`前回のペア（${male.name} × ${existingPair.femaleName}）は成功しましたか？`);
        
        if (success) {
          // 成功：メスを妊娠確認中リストに追加
          const checkDate = new Date(selectedDate);
          checkDate.setDate(checkDate.getDate() + 21); // 21日後に妊娠確認
          
          setPregnancyCheckList(prev => [...prev, {
            id: Date.now().toString(),
            maleName: male.name,
            femaleName: existingPair.femaleName,
            matingDate: selectedDate,
            checkDate: checkDate.toISOString().split('T')[0],
            status: '確認待ち',
          }]);
        }
        
        // 成功・失敗に関わらず、既存のペアをテキスト記録に変更
        setBreedingSchedule((prev: Record<string, any>) => ({
          ...prev,
          [scheduleKey]: {
            ...existingPair,
            isHistory: true,
            result: success ? '成功' : '失敗',
          }
        }));
      }
      
      // 新しいペアを追加
      setBreedingSchedule((prev: Record<string, any>) => ({
        ...prev,
        [scheduleKey]: {
          maleId: selectedMale,
          maleName: male.name,
          femaleId: femaleId,
          femaleName: female.name,
          date: selectedDate,
          isHistory: false,
        }
      }));
    }
    
    closeModal();
  };

  // 妊娠確認
  const handlePregnancyCheck = (checkItem: any, isPregnant: boolean) => {
    if (isPregnant) {
      // 妊娠の場合：出産予定リストに追加
      const matingDate = new Date(checkItem.matingDate);
      const expectedDate = new Date(matingDate);
      expectedDate.setDate(expectedDate.getDate() + 65); // 約65日後に出産予定
      
      setBirthPlanList(prev => [...prev, {
        id: Date.now().toString(),
        maleName: checkItem.maleName,
        femaleName: checkItem.femaleName,
        matingDate: checkItem.matingDate,
        expectedDate: expectedDate.toISOString().split('T')[0],
        status: '出産予定',
      }]);
    } else {
      // 妊娠していない場合：メス猫を繁殖可能に戻す
      // （実際の実装では猫データの状態を更新）
    }
    
    // 妊娠確認中リストから削除
    setPregnancyCheckList(prev => prev.filter(p => p.id !== checkItem.id));
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        position: isFullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: isFullscreen ? 9999 : 'auto',
        overflow: isFullscreen ? 'hidden' : 'auto',
      }}
    >
      {/* ヘッダー */}
      <Box style={{ backgroundColor: 'white', borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}>
        <Container size="xl">
          <Flex align="center" gap="md">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => router.push('/')}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={1} c="blue.6">
              繁殖管理
            </Title>
            <Group gap="sm" ml="auto">
              <ActionIcon
                variant="light"
                onClick={openRulesModal}
                title="NGペアルール設定"
              >
                <IconSettings size={18} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'フルスクリーン終了' : 'フルスクリーン'}
              >
                {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
              </ActionIcon>
            </Group>
          </Flex>
        </Container>
      </Box>

      {/* メインコンテンツ */}
      <Container 
        size={isFullscreen ? "100%" : "xl"} 
        style={{ 
          paddingTop: '1rem',
          height: isFullscreen ? 'calc(100vh - 80px)' : 'auto',
          overflow: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        <Title order={2} mb="md" size={isFullscreen ? "h3" : "h2"}>
          交配スケジュール管理
        </Title>

        {/* タブ */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'schedule')} mb="md">
          <Tabs.List>
            <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
              交配管理表
            </Tabs.Tab>
            <Tabs.Tab value="pregnancy" leftSection={<IconHeart size={16} />}>
              妊娠確認中 ({pregnancyCheckList.length})
            </Tabs.Tab>
            <Tabs.Tab value="birth" leftSection={<IconPaw size={16} />}>
              出産予定一覧 ({birthPlanList.length})
            </Tabs.Tab>
          </Tabs.List>

          {/* 交配管理表タブ */}
          <Tabs.Panel value="schedule" pt="md">
            <Card 
              shadow="sm" 
              padding={isFullscreen ? "xs" : "md"} 
              radius="md" 
              withBorder 
              mb="md"
              style={{ height: isFullscreen ? 'calc(100vh - 180px)' : 'auto' }}
            >
              <Group gap="md" mb="md">
                <Select
                  label="年"
                  value={selectedYear.toString()}
                  onChange={(value) => setSelectedYear(parseInt(value || '2024'))}
                  data={['2024', '2025', '2026'].map(year => ({ value: year, label: year + '年' }))}
                  size={isFullscreen ? "xs" : "sm"}
                />
                <Select
                  label="月"
                  value={selectedMonth.toString()}
                  onChange={(value) => setSelectedMonth(parseInt(value || '8'))}
                  data={Array.from({ length: 12 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: (i + 1) + '月'
                  }))}
                  size={isFullscreen ? "xs" : "sm"}
                />
              </Group>
              
              <ScrollArea 
                style={{ 
                  height: isFullscreen ? 'calc(100% - 80px)' : '600px',
                  width: '100%'
                }}
              >
                <Table
                  style={{ 
                    fontSize: isFullscreen ? '11px' : '14px',
                    minWidth: isFullscreen ? '1200px' : '800px',
                    position: 'relative'
                  }}
                >
                  <Table.Thead 
                    style={{ 
                      position: 'sticky',
                      top: 0,
                      backgroundColor: 'white',
                      zIndex: 10,
                      borderBottom: '2px solid #e9ecef'
                    }}
                  >
                    <Table.Tr>
                      <Table.Th 
                        style={{ 
                          minWidth: isFullscreen ? 60 : 80,
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'white',
                          zIndex: 11,
                          borderRight: '2px solid #e9ecef'
                        }}
                      >
                        日付
                      </Table.Th>
                      {activeMales.map(male => (
                        <Table.Th key={male.id} style={{ minWidth: isFullscreen ? 100 : 120 }}>
                          <Box
                            onClick={() => handleMaleNameClick(male.id)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                          >
                            <Text fw={600} size={isFullscreen ? "xs" : "sm"} ta="center">
                              {male.name}
                            </Text>
                            <Text size={isFullscreen ? "8px" : "xs"} c="dimmed" ta="center">
                              {male.breed}
                            </Text>
                            {/* +ボタンを名前の中心に配置 */}
                            <Box
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.7,
                                pointerEvents: 'none'
                              }}
                            >
                              <ActionIcon
                                variant="light"
                                size={isFullscreen ? "xs" : "sm"}
                                color="gray"
                                style={{ 
                                  opacity: 0.5,
                                  backgroundColor: 'rgba(255,255,255,0.8)'
                                }}
                              >
                                <IconPlus size={isFullscreen ? 12 : 14} />
                              </ActionIcon>
                            </Box>
                          </Box>
                          {selectedMaleForEdit === male.id && (
                            <Group gap="xs" justify="center" mt="xs">
                              <Button
                                size="xs"
                                color="red"
                                onClick={() => handleRemoveMale(male.id)}
                              >
                                削除
                              </Button>
                              <Button
                                size="xs"
                                onClick={() => setSelectedMaleForEdit(null)}
                              >
                                保存
                              </Button>
                            </Group>
                          )}
                        </Table.Th>
                      ))}
                      <Table.Th style={{ minWidth: isFullscreen ? 60 : 80 }}>
                        <ActionIcon
                          variant="light"
                          onClick={openMaleModal}
                          title="オス猫追加"
                        >
                          <IconPlus size={isFullscreen ? 14 : 16} />
                        </ActionIcon>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {monthDates.map(({ date, dateString, dayOfWeek }) => (
                      <Table.Tr key={date}>
                        <Table.Td
                          style={{
                            position: 'sticky',
                            left: 0,
                            backgroundColor: 'white',
                            zIndex: 5,
                            borderRight: '1px solid #e9ecef'
                          }}
                        >
                          <Text size={isFullscreen ? "xs" : "sm"} fw={dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400}>
                            {date}日
                          </Text>
                          <Text size={isFullscreen ? "8px" : "xs"} c="dimmed">
                            {['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}
                          </Text>
                        </Table.Td>
                        {activeMales.map(male => {
                          const scheduleKey = `${male.id}-${dateString}`;
                          const schedule = breedingSchedule[scheduleKey];
                          
                          return (
                            <Table.Td key={male.id} style={{ textAlign: 'center' }}>
                              {schedule ? (
                                schedule.isHistory ? (
                                  <Text size={isFullscreen ? "8px" : "xs"} c="dimmed">
                                    {schedule.femaleName}
                                    <br />
                                    ({schedule.result})
                                  </Text>
                                ) : (
                                  <Badge size={isFullscreen ? "xs" : "sm"} color="blue">
                                    {schedule.femaleName}
                                  </Badge>
                                )
                              ) : (
                                <Button
                                  variant="subtle"
                                  size={isFullscreen ? "xs" : "sm"}
                                  onClick={() => handleMaleSelect(male.id, dateString)}
                                  style={{ 
                                    width: '100%',
                                    height: isFullscreen ? '24px' : '32px'
                                  }}
                                >
                                  +
                                </Button>
                              )}
                            </Table.Td>
                          );
                        })}
                        <Table.Td></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Tabs.Panel>

          {/* 妊娠確認中タブ */}
          <Tabs.Panel value="pregnancy" pt="md">
            <Stack gap="sm">
              {pregnancyCheckList.map((item) => (
                <Card key={item.id} shadow="sm" padding="md" radius="md" withBorder>
                  <Flex justify="space-between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Group gap="md" mb="xs">
                        <Text fw={600} size="md">
                          {item.maleName} × {item.femaleName}
                        </Text>
                        <Badge color="orange" size="sm">
                          {item.status}
                        </Badge>
                      </Group>
                      <Group gap="md">
                        <Text size="sm" c="dimmed">交配日: {item.matingDate}</Text>
                        <Text size="sm" c="dimmed">確認予定: {item.checkDate}</Text>
                      </Group>
                    </Box>
                    <Group gap="xs">
                      <Button
                        leftSection={<IconCheck size={16} />}
                        color="green"
                        size="sm"
                        onClick={() => handlePregnancyCheck(item, true)}
                      >
                        妊娠
                      </Button>
                      <Button
                        leftSection={<IconX size={16} />}
                        color="red"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePregnancyCheck(item, false)}
                      >
                        非妊娠
                      </Button>
                    </Group>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          {/* 出産予定一覧タブ */}
          <Tabs.Panel value="birth" pt="md">
            <Stack gap="sm">
              {birthPlanList.map((item) => (
                <Card key={item.id} shadow="sm" padding="md" radius="md" withBorder>
                  <Flex justify="space-between" align="center">
                    <Box style={{ flex: 1 }}>
                      <Group gap="md" mb="xs">
                        <Text fw={600} size="md">
                          {item.maleName} × {item.femaleName}
                        </Text>
                        <Badge color="green" size="sm">
                          {item.status}
                        </Badge>
                      </Group>
                      <Group gap="md">
                        <Text size="sm" c="dimmed">交配日: {item.matingDate}</Text>
                        <Text size="sm" c="dimmed">出産予定: {item.expectedDate}</Text>
                      </Group>
                    </Box>
                    <Button
                      variant="light"
                      size="sm"
                    >
                      詳細
                    </Button>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Container>

      {/* メス猫選択モーダル */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="交配するメス猫を選択"
        size="md"
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {selectedMale && activeMales.find(m => m.id === selectedMale)?.name} との交配相手を選択してください
          </Text>
          {availableFemales.map((female) => {
            const isNG = selectedMale ? isNGPairing(selectedMale, female.id) : false;
            return (
              <Card 
                key={female.id} 
                shadow="sm" 
                padding="sm" 
                radius="md" 
                withBorder
                style={{ borderColor: isNG ? '#ff6b6b' : undefined }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Group gap="xs">
                      <Text fw={600}>{female.name}</Text>
                      {isNG && <Badge color="red" size="xs">NG</Badge>}
                    </Group>
                    <Text size="sm" c="dimmed">{female.breed}</Text>
                    <Group gap="xs">
                      {female.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" size="xs">
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                  <Button
                    size="sm"
                    color={isNG ? "red" : undefined}
                    variant={isNG ? "outline" : "filled"}
                    onClick={() => handleAddFemaleToSchedule(female.id)}
                  >
                    {isNG ? '警告選択' : '選択'}
                  </Button>
                </Flex>
              </Card>
            );
          })}
          {availableFemales.length === 0 && (
            <Text ta="center" c="dimmed">
              現在交配可能なメス猫がいません
            </Text>
          )}
        </Stack>
      </Modal>

      {/* オス猫追加モーダル */}
      <Modal
        opened={maleModalOpened}
        onClose={closeMaleModal}
        title="オス猫をスケジュールに追加"
        size="md"
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            スケジュールに追加するオス猫を選択してください
          </Text>
          {maleCats.filter(male => !activeMales.some(am => am.id === male.id)).map((male) => (
            <Card key={male.id} shadow="sm" padding="sm" radius="md" withBorder>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fw={600}>{male.name}</Text>
                  <Text size="sm" c="dimmed">{male.breed}</Text>
                  <Group gap="xs">
                    {male.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" size="xs">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Box>
                <Button
                  size="sm"
                  onClick={() => handleAddMale(male)}
                >
                  追加
                </Button>
              </Flex>
            </Card>
          ))}
          {maleCats.filter(male => !activeMales.some(am => am.id === male.id)).length === 0 && (
            <Text ta="center" c="dimmed">
              追加可能なオス猫がいません
            </Text>
          )}
        </Stack>
      </Modal>

      {/* NGペアルール設定モーダル */}
      <Modal
        opened={rulesModalOpened}
        onClose={closeRulesModal}
        title="NGペアルール設定"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            交配時に警告を表示するルールを設定できます
          </Text>
          {ngPairingRules.map((rule) => (
            <Card key={rule.id} shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{rule.name}</Text>
                <Badge color={rule.active ? 'green' : 'gray'}>
                  {rule.active ? '有効' : '無効'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="xs">
                {rule.description}
              </Text>
              <Group gap="xs">
                <Text size="xs">オス条件:</Text>
                {rule.maleConditions.map((condition: string) => (
                  <Badge key={condition} variant="outline" size="xs" color="blue">
                    {condition}
                  </Badge>
                ))}
                <Text size="xs">メス条件:</Text>
                {rule.femaleConditions.map((condition: string) => (
                  <Badge key={condition} variant="outline" size="xs" color="pink">
                    {condition}
                  </Badge>
                ))}
              </Group>
            </Card>
          ))}
        </Stack>
      </Modal>
    </Box>
  );
}
