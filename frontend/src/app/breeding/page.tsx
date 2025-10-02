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
  TextInput,
  Checkbox,
  MultiSelect,
  NumberInput,
  Radio,
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
  IconSettings,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react';

// 型定義
interface NgPairingRule {
  id: string;
  name: string;
  type: 'tag_combination' | 'individual_prohibition' | 'generation_limit';
  maleConditions?: string[];
  femaleConditions?: string[];
  maleNames?: string[];
  femaleNames?: string[];
  generationLimit?: number;
  description: string;
  active: boolean;
}

interface BreedingCat {
  id: string;
  name: string;
  breed: string;
  status: string;
  tags: string[];
  lastMating?: string | null;
}

interface BreedingScheduleEntry {
  maleId: string;
  maleName: string;
  femaleId: string;
  femaleName: string;
  date: string;
  duration: number;
  dayIndex: number;
  isHistory: boolean;
  result?: string;
}

interface PregnancyCheckItem {
  id: string;
  maleName: string;
  femaleName: string;
  matingDate: string;
  checkDate: string;
  status: string;
}

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
const initialNgPairingRules: NgPairingRule[] = [
  {
    id: '1',
    name: '近親交配防止',
    type: 'tag_combination',
    maleConditions: ['血統書付き'],
    femaleConditions: ['血統書付き'],
    description: '血統書付き同士の交配は避ける',
    active: true,
  },
  {
    id: '2',
    name: 'サイズ不適合',
    type: 'tag_combination',
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 現在の月
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // 現在の年
  const [breedingSchedule, setBreedingSchedule] = useState<Record<string, BreedingScheduleEntry>>({});
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
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // 交配期間（日数）
  const [defaultDuration, setDefaultDuration] = useState<number>(1); // デフォルト交配期間
  const [availableFemales, setAvailableFemales] = useState<BreedingCat[]>([]);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [maleModalOpened, { open: openMaleModal, close: closeMaleModal }] = useDisclosure(false);
  const [rulesModalOpened, { open: openRulesModal, close: closeRulesModal }] = useDisclosure(false);
  const [newRuleModalOpened, { open: openNewRuleModal, close: closeNewRuleModal }] = useDisclosure(false);
  
  // 交配チェック記録管理 - キー: "オスID-メスID-日付", 値: チェック回数
  const [matingChecks, setMatingChecks] = useState<{[key: string]: number}>({});
  
  const [ngPairingRules, setNgPairingRules] = useState(initialNgPairingRules);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'tag_combination',
    maleNames: [] as string[],
    femaleNames: [] as string[],
    maleConditions: [] as string[],
    femaleConditions: [] as string[],
    generationLimit: 3,
    description: '',
  });

  // 次のルール番号を生成する関数
  const getNextRuleName = () => {
    const existingNumbers = ngPairingRules
      .map(rule => {
        const match = rule.name.match(/^NG(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `NG${maxNumber + 1}`;
  };
  
  const availableTags = [...new Set([...maleCats.flatMap(cat => cat.tags), ...femaleCats.flatMap(cat => cat.tags)])];
  
  const router = useRouter();

  const monthDates = generateMonthDates(selectedYear, selectedMonth);

  // NGペアチェック関数
  const isNGPairing = (maleId: string, femaleId: string) => {
    const male = maleCats.find(m => m.id === maleId);
    const female = femaleCats.find(f => f.id === femaleId);
    
    if (!male || !female) return false;
    
    return ngPairingRules.some(rule => {
      if (!rule.active) return false;
      
      if (rule.type === 'tag_combination' && rule.maleConditions && rule.femaleConditions) {
        const maleMatches = rule.maleConditions.some(condition => male.tags.includes(condition));
        const femaleMatches = rule.femaleConditions.some(condition => female.tags.includes(condition));
        return maleMatches && femaleMatches;
      }
      
      if (rule.type === 'individual_prohibition' && rule.maleNames && rule.femaleNames) {
        return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
      }
      
      // generation_limit の実装（将来的にpedigree機能連携）
      if (rule.type === 'generation_limit') {
        // 血統データとの連携は将来実装予定
        return false;
      }
      
      return false;
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
  const handleAddMale = (maleData: BreedingCat) => {
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
    setSelectedDuration(defaultDuration); // デフォルト期間を使用
    
    // 交配可能なメス猫をフィルタリング（妊娠中・確認中以外）
    const available = femaleCats.filter(female => 
      female.status === '繁殖可能' &&
      !pregnancyCheckList.some(p => p.femaleName === female.name) &&
      !birthPlanList.some(b => b.femaleName === female.name)
    );
    
    setAvailableFemales(available);
    openModal();
  };

  // デフォルト期間を更新
  const handleSetDefaultDuration = (duration: number, setAsDefault: boolean) => {
    if (setAsDefault) {
      setDefaultDuration(duration);
    }
  };

  // 交配結果処理
  const handleMatingResult = (maleId: string, femaleId: string, femaleName: string, result: 'success' | 'failure') => {
    const male = activeMales.find(m => m.id === maleId);
    
    if (result === 'success') {
      // ○ボタン：妊娠確認中リストに追加
      const newPregnancyCheck = {
        id: Date.now().toString(),
        maleName: male?.name || '',
        femaleName: femaleName,
        matingDate: new Date().toISOString().split('T')[0],
        checkDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30日後
        status: '確認中'
      };
      
      setPregnancyCheckList(prev => [...prev, newPregnancyCheck]);
    }
    
    // 交配スケジュールを履歴として残す（○×どちらも）
    setBreedingSchedule(prev => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(key => {
        if (key.includes(maleId) && newSchedule[key].femaleName === femaleName && !newSchedule[key].isHistory) {
          newSchedule[key] = {
            ...newSchedule[key],
            isHistory: true,
            result: '' // 成功・失敗問わず結果表示なし
          };
        }
      });
      return newSchedule;
    });
  };

  // 交配チェックを追加
  const handleMatingCheck = (maleId: string, femaleId: string, date: string) => {
    const key = `${maleId}-${femaleId}-${date}`;
    setMatingChecks(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  // その日のチェック回数を取得
  const getMatingCheckCount = (maleId: string, femaleId: string, date: string): number => {
    const key = `${maleId}-${femaleId}-${date}`;
    return matingChecks[key] || 0;
  };

  // オス猫名クリック時の編集モード
  const handleMaleNameClick = (maleId: string) => {
    setSelectedMaleForEdit(selectedMaleForEdit === maleId ? null : maleId);
  };

  // メス猫をスケジュールに追加
  const handleAddFemaleToSchedule = (femaleId: string) => {
    const female = femaleCats.find(f => f.id === femaleId);
    const male = activeMales.find(m => m.id === selectedMale);
    
    if (female && male && selectedDate && selectedMale) {
      // NGペアチェック
      if (isNGPairing(selectedMale, femaleId)) {
        const ngRule = ngPairingRules.find(rule => {
          if (!rule.active) return false;
          
          if (rule.type === 'tag_combination' && rule.maleConditions && rule.femaleConditions) {
            const maleMatches = rule.maleConditions.some(condition => male.tags.includes(condition));
            const femaleMatches = rule.femaleConditions.some(condition => female.tags.includes(condition));
            return maleMatches && femaleMatches;
          }
          
          if (rule.type === 'individual_prohibition' && rule.maleNames && rule.femaleNames) {
            return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
          }
          
          return false;
        });
        
        const confirmed = window.confirm(
          `警告: このペアは「${ngRule?.name}」ルールに該当します。\n${ngRule?.description}\n\n本当に交配を予定しますか？`
        );
        
        if (!confirmed) {
          closeModal();
          return;
        }
      }
      
      // 交配期間の日付を計算
      const startDate = new Date(selectedDate);
      const scheduleDates: string[] = [];
      for (let i = 0; i < selectedDuration; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        scheduleDates.push(date.toISOString().split('T')[0]);
      }
      
      // 各日付にスケジュールを追加
      const newSchedules: Record<string, BreedingScheduleEntry> = {};
      scheduleDates.forEach((dateStr, index) => {
        const scheduleKey = `${selectedMale}-${dateStr}`;
        
        // 前回のペアがある場合、成功/失敗の確認
        const existingPair = breedingSchedule[scheduleKey];
        if (existingPair && index === 0) { // 初日のみチェック
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
          newSchedules[scheduleKey] = {
            ...existingPair,
            isHistory: true,
            result: success ? '成功' : '失敗',
          };
        } else if (!existingPair) {
          // 新しいペアを追加
          newSchedules[scheduleKey] = {
            maleId: selectedMale,
            maleName: male.name,
            femaleId: femaleId,
            femaleName: female.name,
            date: dateStr,
            duration: selectedDuration,
            dayIndex: index, // 0: 初日, 1: 2日目, 2: 3日目...
            isHistory: false,
          };
        }
      });
      
      setBreedingSchedule(prev => ({ ...prev, ...newSchedules }));
    }
    
    closeModal();
  };

  // 妊娠確認
  const handlePregnancyCheck = (checkItem: PregnancyCheckItem, isPregnant: boolean) => {
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

  // NGルール管理機能
  const addNewRule = () => {
    const id = Date.now().toString();
    const ruleToAdd: NgPairingRule = {
      id,
      name: newRule.name,
      type: newRule.type as 'tag_combination' | 'individual_prohibition' | 'generation_limit',
      description: newRule.description,
      active: true,
    };

    if (newRule.type === 'tag_combination') {
      ruleToAdd.maleConditions = newRule.maleConditions;
      ruleToAdd.femaleConditions = newRule.femaleConditions;
    } else if (newRule.type === 'individual_prohibition') {
      ruleToAdd.maleNames = newRule.maleNames;
      ruleToAdd.femaleNames = newRule.femaleNames;
    } else if (newRule.type === 'generation_limit') {
      ruleToAdd.generationLimit = newRule.generationLimit;
    }

    setNgPairingRules(prev => [...prev, ruleToAdd]);
    resetNewRuleForm();
    closeNewRuleModal();
  };

  const resetNewRuleForm = () => {
    setNewRule({
      name: getNextRuleName(),
      type: 'tag_combination',
      maleNames: [],
      femaleNames: [],
      maleConditions: [],
      femaleConditions: [],
      generationLimit: 3,
      description: '',
    });
  };

  // 新規ルールモーダルを開く時にルール名を自動生成
  const openNewRuleModalWithName = () => {
    setNewRule(prev => ({
      ...prev,
      name: getNextRuleName()
    }));
    openNewRuleModal();
  };

  // 新規ルールのバリデーション
  const isNewRuleValid = () => {
    // ルール名は必須
    if (!newRule.name.trim()) {
      return false;
    }

    // ルールタイプ別のバリデーション
    if (newRule.type === 'tag_combination') {
      return newRule.maleConditions.length > 0 && newRule.femaleConditions.length > 0;
    } else if (newRule.type === 'individual_prohibition') {
      return newRule.maleNames.length > 0 && newRule.femaleNames.length > 0;
    } else if (newRule.type === 'generation_limit') {
      return newRule.generationLimit > 0;
    }

    return false;
  };

  const deleteRule = (ruleId: string) => {
    setNgPairingRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    setNgPairingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    );
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
  backgroundColor: 'var(--background-base)',
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
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
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
              <Button
                variant="light"
                onClick={openRulesModal}
                leftSection={<IconSettings size={16} />}
                size="sm"
              >
                NG設定
              </Button>
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
                      backgroundColor: 'var(--surface)',
                      zIndex: 10,
                      borderBottom: '2px solid var(--border-subtle)'
                    }}
                  >
                    <Table.Tr>
                      <Table.Th 
                        style={{ 
                          minWidth: isFullscreen ? 60 : 80,
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'var(--surface)',
                          zIndex: 11,
                          borderRight: '2px solid var(--border-subtle)'
                        }}
                      >
                        <Flex align="center" gap={4} justify="center">
                          <Text size={isFullscreen ? "xs" : "sm"} fw={600}>
                            日付
                          </Text>
                        </Flex>
                      </Table.Th>
                      {activeMales.map(male => (
                        <Table.Th 
                          key={male.id} 
                          style={{ 
                            minWidth: isFullscreen ? 100 : 120,
                            borderRight: '1px solid var(--border-subtle)' // オス名の境界線
                          }}
                        >
                          <Box
                            onClick={() => handleMaleNameClick(male.id)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                          >
                            <Text fw={600} size={isFullscreen ? "xs" : "sm"} ta="center">
                              {male.name}
                            </Text>
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
                            backgroundColor: 'var(--surface)',
                            zIndex: 5,
                            borderRight: '1px solid var(--border-subtle)'
                          }}
                        >
                          <Flex align="center" gap={4} justify="center">
                            <Text size={isFullscreen ? "xs" : "sm"} fw={dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400}>
                              {date}日
                            </Text>
                            <Text size={isFullscreen ? "8px" : "xs"} c="dimmed">
                              ({['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]})
                            </Text>
                          </Flex>
                        </Table.Td>
                        {activeMales.map(male => {
                          const scheduleKey = `${male.id}-${dateString}`;
                          const schedule = breedingSchedule[scheduleKey];
                          
                          // 次の日も同じ交配期間かチェック
                          const nextDate = new Date(selectedYear, selectedMonth, date + 1);
                          const nextDateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                          const nextScheduleKey = `${male.id}-${nextDateString}`;
                          const nextSchedule = breedingSchedule[nextScheduleKey];
                          const hasNextSameMating = schedule && nextSchedule && 
                            schedule.femaleName === nextSchedule.femaleName && 
                            !schedule.isHistory && !nextSchedule.isHistory;
                          
                          return (
                            <Table.Td 
                              key={male.id} 
                              style={{ 
                                textAlign: 'center',
                                // 交配期間中で次の日も同じ交配の場合は境界線を消す
                                borderRight: hasNextSameMating ? 'none' : '1px solid var(--border-subtle)',
                                // 交配期間中は薄い黄色の背景
                                backgroundColor: schedule && !schedule.isHistory ? '#fffacd' : 'transparent'
                              }}
                            >
                              {schedule ? (
                                schedule.isHistory ? (
                                  // 履歴：名前とチェックマークを一行表示
                                  <Box style={{ position: 'relative', width: '100%', height: '100%', minHeight: isFullscreen ? '28px' : '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0.6 }}>
                                    <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
                                      {/* 履歴のメス名表示（初日と最終日） */}
                                      {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
                                        <Badge size={isFullscreen ? "xs" : "sm"} color="gray" variant="light">
                                          {schedule.femaleName}
                                        </Badge>
                                      )}
                                      
                                      {/* 履歴のチェックマーク表示エリア */}
                                      <Box
                                        style={{
                                          flex: 1,
                                          minHeight: isFullscreen ? '20px' : '24px',
                                          padding: '2px 4px',
                                          borderRadius: '3px',
                                          border: '1px dashed #d3d3d3',
                                          backgroundColor: getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? '#f8f8f8' : 'transparent',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? (
                                          <Text size={isFullscreen ? "8px" : "xs"} c="dimmed" ta="center" lh={1}>
                                            {'✓'.repeat(getMatingCheckCount(male.id, schedule.femaleId, dateString))}
                                          </Text>
                                        ) : (
                                          <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.3 }} lh={1}>
                                            -
                                          </Text>
                                        )}
                                      </Box>
                                    </Flex>
                                  </Box>
                                ) : (
                                  <Box style={{ position: 'relative', width: '100%', height: '100%', minHeight: isFullscreen ? '28px' : '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {/* 一行表示：メス名バッジ（初日と最終日）とチェックエリア */}
                                    <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
                                      {/* メス名表示（初日と最終日） */}
                                      {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
                                        <Badge size={isFullscreen ? "xs" : "sm"} color="pink">
                                          {schedule.femaleName}
                                        </Badge>
                                      )}
                                      
                                      {/* チェックマーク表示エリアまたは最終日のボタン */}
                                      {schedule.dayIndex === schedule.duration - 1 ? (
                                        /* 最終日：○×ボタン */
                                        <Group gap={2}>
                                          <ActionIcon
                                            size={isFullscreen ? "xs" : "sm"}
                                            variant="light"
                                            color="green"
                                            onClick={() => handleMatingResult(male.id, schedule.femaleId, schedule.femaleName, 'success')}
                                            title="交配成功"
                                          >
                                            ○
                                          </ActionIcon>
                                          <ActionIcon
                                            size={isFullscreen ? "xs" : "sm"}
                                            variant="light"
                                            color="red"
                                            onClick={() => handleMatingResult(male.id, schedule.femaleId, schedule.femaleName, 'failure')}
                                            title="交配失敗"
                                          >
                                            ×
                                          </ActionIcon>
                                        </Group>
                                      ) : (
                                        /* 初日・中間日：チェックマーク表示エリア */
                                        <Box
                                          style={{
                                            flex: 1,
                                            minHeight: isFullscreen ? '16px' : '18px',
                                            cursor: 'pointer',
                                            padding: '1px 4px',
                                            borderRadius: '3px',
                                            border: '1px dashed var(--border-subtle)',
                                            backgroundColor: getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? '#f0f9f0' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}
                                          onClick={() => handleMatingCheck(male.id, schedule.femaleId, dateString)}
                                          title="クリックして交配記録を追加"
                                        >
                                          {getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? (
                                            <Text size={isFullscreen ? "8px" : "xs"} c="green" ta="center" lh={1}>
                                              {'✓'.repeat(getMatingCheckCount(male.id, schedule.femaleId, dateString))}
                                            </Text>
                                          ) : (
                                            <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.5 }} lh={1}>
                                              +
                                            </Text>
                                          )}
                                        </Box>
                                      )}
                                    </Flex>
                                  </Box>
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
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {selectedMale && activeMales.find(m => m.id === selectedMale)?.name} との交配相手を選択してください
          </Text>
          
          <Stack gap="xs">
            <NumberInput
              label="交配期間"
              description="交配を行う日数を設定してください"
              value={selectedDuration}
              onChange={(value) => setSelectedDuration(typeof value === 'number' ? value : 1)}
              min={1}
              max={7}
              suffix="日間"
            />
            <Checkbox
              label="この期間をデフォルトに設定"
              size="sm"
              onChange={(event) => handleSetDefaultDuration(selectedDuration, event.currentTarget.checked)}
            />
          </Stack>

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
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              交配時に警告を表示するルールを設定できます
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openNewRuleModalWithName}
              size="sm"
            >
              新規ルール作成
            </Button>
          </Group>

          {ngPairingRules.map((rule) => (
            <Card key={rule.id} shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{rule.name}</Text>
                <Group gap="xs">
                  <Badge color={rule.active ? 'green' : 'gray'}>
                    {rule.active ? '有効' : '無効'}
                  </Badge>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" mb="xs">
                {rule.description}
              </Text>

              {/* ルールタイプ別の詳細表示 */}
              {rule.type === 'tag_combination' && rule.maleConditions && rule.femaleConditions && (
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
              )}

              {rule.type === 'individual_prohibition' && rule.maleNames && rule.femaleNames && (
                <Group gap="xs">
                  <Text size="xs">禁止ペア:</Text>
                  {rule.maleNames.map((maleName, _index) => 
                    rule.femaleNames!.map((femaleName) => (
                      <Badge key={`${maleName}-${femaleName}`} variant="outline" size="xs" color="red">
                        {maleName} × {femaleName}
                      </Badge>
                    ))
                  )}
                </Group>
              )}

              {rule.type === 'generation_limit' && (
                <Text size="xs" c="dimmed">
                  近親係数制限: {rule.generationLimit}親等まで禁止
                </Text>
              )}
            </Card>
          ))}

          {ngPairingRules.length === 0 && (
            <Text ta="center" c="dimmed" py="md">
              NGルールが設定されていません
            </Text>
          )}
        </Stack>
      </Modal>

      {/* 新規ルール作成モーダル */}
      <Modal
        opened={newRuleModalOpened}
        onClose={closeNewRuleModal}
        title="NGルール新規作成"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="ルール名"
            placeholder="例: 大型×小型禁止"
            value={newRule.name}
            onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Radio.Group
            label="ルールタイプ"
            value={newRule.type}
            onChange={(value) => setNewRule(prev => ({ ...prev, type: value }))}
            required
          >
            <Stack gap="xs">
              <Radio value="tag_combination" label="タグ組み合わせ禁止" />
              <Radio value="individual_prohibition" label="個別ペア禁止" />
              <Radio value="generation_limit" label="近親係数制限" />
            </Stack>
          </Radio.Group>

          {newRule.type === 'tag_combination' && (
            <>
              <MultiSelect
                label="オス猫の条件タグ"
                data={availableTags}
                value={newRule.maleConditions}
                onChange={(value) => setNewRule(prev => ({ ...prev, maleConditions: value }))}
                placeholder="禁止するオス猫のタグを選択"
                required
              />
              <MultiSelect
                label="メス猫の条件タグ"
                data={availableTags}
                value={newRule.femaleConditions}
                onChange={(value) => setNewRule(prev => ({ ...prev, femaleConditions: value }))}
                placeholder="禁止するメス猫のタグを選択"
                required
              />
            </>
          )}

          {newRule.type === 'individual_prohibition' && (
            <>
              <MultiSelect
                label="禁止するオス猫"
                data={maleCats.map(cat => ({ value: cat.name, label: cat.name }))}
                value={newRule.maleNames}
                onChange={(value) => setNewRule(prev => ({ ...prev, maleNames: value }))}
                placeholder="禁止するオス猫を選択"
                required
              />
              <MultiSelect
                label="禁止するメス猫"
                data={femaleCats.map(cat => ({ value: cat.name, label: cat.name }))}
                value={newRule.femaleNames}
                onChange={(value) => setNewRule(prev => ({ ...prev, femaleNames: value }))}
                placeholder="禁止するメス猫を選択"
                required
              />
            </>
          )}

          {newRule.type === 'generation_limit' && (
            <NumberInput
              label="親等制限"
              description="指定した親等以内の近親交配を禁止します"
              value={newRule.generationLimit}
              onChange={(value) => setNewRule(prev => ({ ...prev, generationLimit: typeof value === 'number' ? value : 3 }))}
              min={1}
              max={10}
              suffix="親等"
              required
            />
          )}

          <TextInput
            label="説明"
            placeholder="このルールの詳細説明（任意）"
            value={newRule.description}
            onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeNewRuleModal}>
              キャンセル
            </Button>
            <Button 
              onClick={addNewRule}
              disabled={!isNewRuleValid()}
            >
              ルール作成
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
