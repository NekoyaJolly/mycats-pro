'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Card,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Grid,
  Text,
  Alert,
  Box,
  Badge,
  Paper,
  Accordion,
  ActionIcon
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import '@mantine/dates/styles.css';
import { 
  IconDeviceFloppy, 
  IconArrowLeft, 
  IconGenderMale, 
  IconGenderFemale, 
  IconDna,
  IconInfoCircle,
  IconPaw,
  IconEye,
  IconCalendar,
  IconUser,
  IconPlus,
  
} from '@tabler/icons-react';

interface Breed {
  id: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
}

interface PedigreeFormData {
  pedigreeId: string;
  catName: string;
  CatName2?: string;
  title?: string;
  gender?: number;
  eyeColor?: string;
  birthDate?: Date;
  registrationDate?: Date;
  pedigreeIssueDate?: Date;
  breederName?: string;
  ownerName?: string;
  brotherCount?: number;
  sisterCount?: number;
  notes?: string;
  notes2?: string;
  otherNo?: string;
  breedId?: string;
  colorId?: string;
  breedCode?: string;
  coatColorCode?: string;
  championFlag?: string;
  fatherPedigreeId?: string;
  motherPedigreeId?: string;
  paternalGrandfatherId?: string;
  paternalGrandmotherId?: string;
  maternalGrandfatherId?: string;
  maternalGrandmotherId?: string;
}

interface PedigreeOption {
  value: string;
  label: string;
}

export default function NewPedigreePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [pedigreeOptions, setPedigreeOptions] = useState<PedigreeOption[]>([]);
  const [formData, setFormData] = useState<PedigreeFormData>({
    pedigreeId: '',
    catName: ''
  });

  // Call ID用の状態
  const [callIdData, setCallIdData] = useState({
    bothParentsId: '',
    fatherId: '',
    motherId: ''
  });

  // デバウンス用の状態
  const [searchTimeouts, setSearchTimeouts] = useState<{[key: string]: NodeJS.Timeout}>({});

  // デバウンス機能付きの血統データ検索
  const debouncedFetchPedigree = (pedigreeId: string, type: 'father' | 'mother' | 'both', delay = 800) => {
    // 既存のタイムアウトをクリア
    if (searchTimeouts[type]) {
      clearTimeout(searchTimeouts[type]);
    }

    // 新しいタイムアウトを設定
    const timeoutId = setTimeout(async () => {
      if (pedigreeId.trim()) {
        if (type === 'father') {
          await handleFatherIdChangeInternal(pedigreeId);
        } else if (type === 'mother') {
          await handleMotherIdChangeInternal(pedigreeId);
        } else if (type === 'both') {
          await handleBothParentsIdChangeInternal(pedigreeId);
        }
      }
    }, delay);

    setSearchTimeouts(prev => ({ ...prev, [type]: timeoutId }));
  };

  useEffect(() => {
    setMounted(true);
    fetchBreeds();
    fetchColors();
    fetchPedigreeOptions();
  }, []);

  const fetchBreeds = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/v1/breeds?limit=100');
      if (response.ok) {
        const result = await response.json();
        setBreeds(result.data || []);
      }
    } catch (error) {
      console.error('品種データの取得に失敗:', error);
      setBreeds([]);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/v1/coat-colors?limit=100');
      if (response.ok) {
        const result = await response.json();
        setColors(result.data || []);
      }
    } catch (error) {
      console.error('毛色データの取得に失敗:', error);
      setColors([]);
    }
  };

  const fetchPedigreeOptions = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/v1/pedigrees?limit=100');
      if (response.ok) {
        const result = await response.json();
        const options = (result.data || []).map((p: any) => ({
          value: p.id,
          label: `${p.pedigreeId} - ${p.catName || '名前なし'}`
        }));
        setPedigreeOptions(options);
      }
    } catch (error) {
      console.error('血統書データの取得に失敗:', error);
      setPedigreeOptions([]);
    }
  };

  // 親猫IDから血統データを自動取得する関数
  const fetchPedigreeById = async (pedigreeId: string) => {
    try {
      const response = await fetch(`http://localhost:3004/api/v1/pedigrees/pedigree-id/${pedigreeId}`);
      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('血統書データの取得に失敗:', error);
    }
    return null;
  };

  // 父猫IDが変更された時の処理（Accessのtxt父猫ID_AfterUpdateに相当）
  const handleFatherIdChangeInternal = async (fatherId: string) => {
    if (fatherId) {
      const fatherData = await fetchPedigreeById(fatherId);
      if (fatherData) {
        // 父猫情報をフォームに反映
        updateFormData('fatherPedigreeId', fatherData.id);
        
        // 父方の祖父母情報も自動設定
        if (fatherData.fatherPedigreeId) {
          updateFormData('paternalGrandfatherId', fatherData.fatherPedigreeId);
        }
        if (fatherData.motherPedigreeId) {
          updateFormData('paternalGrandmotherId', fatherData.motherPedigreeId);
        }
        
        notifications.show({
          title: '父猫データ取得',
          message: `${fatherData.catName}の血統情報を取得しました`,
          color: 'blue',
        });
      } else {
        notifications.show({
          title: '検索結果なし',
          message: `血統書番号 ${fatherId} が見つかりませんでした`,
          color: 'yellow',
        });
      }
    }
  };

  const handleFatherIdChange = async (fatherId: string) => {
    setCallIdData(prev => ({ ...prev, fatherId }));
    debouncedFetchPedigree(fatherId, 'father');
  };

  // 母猫IDが変更された時の処理（Accessのtxt母猫ID_AfterUpdateに相当）
  const handleMotherIdChangeInternal = async (motherId: string) => {
    if (motherId) {
      const motherData = await fetchPedigreeById(motherId);
      if (motherData) {
        // 母猫情報をフォームに反映
        updateFormData('motherPedigreeId', motherData.id);
        
        // 母方の祖父母情報も自動設定
        if (motherData.fatherPedigreeId) {
          updateFormData('maternalGrandfatherId', motherData.fatherPedigreeId);
        }
        if (motherData.motherPedigreeId) {
          updateFormData('maternalGrandmotherId', motherData.motherPedigreeId);
        }
        
        notifications.show({
          title: '母猫データ取得',
          message: `${motherData.catName}の血統情報を取得しました`,
          color: 'blue',
        });
      } else {
        notifications.show({
          title: '検索結果なし',
          message: `血統書番号 ${motherId} が見つかりませんでした`,
          color: 'yellow',
        });
      }
    }
  };

  const handleMotherIdChange = async (motherId: string) => {
    setCallIdData(prev => ({ ...prev, motherId }));
    debouncedFetchPedigree(motherId, 'mother');
  };

  // 両親IDが変更された時の処理（Accessのtxt両親ID_AfterUpdateに相当）
  const handleBothParentsIdChangeInternal = async (bothParentsId: string) => {
    if (bothParentsId) {
      const bothParentsData = await fetchPedigreeById(bothParentsId);
      if (bothParentsData) {
        // 両親の血統情報を一括設定
        updateFormData('fatherPedigreeId', bothParentsData.fatherPedigreeId);
        updateFormData('motherPedigreeId', bothParentsData.motherPedigreeId);
        updateFormData('paternalGrandfatherId', bothParentsData.paternalGrandfatherId);
        updateFormData('paternalGrandmotherId', bothParentsData.paternalGrandmotherId);
        updateFormData('maternalGrandfatherId', bothParentsData.maternalGrandfatherId);
        updateFormData('maternalGrandmotherId', bothParentsData.maternalGrandmotherId);
        
        notifications.show({
          title: '両親血統データ取得',
          message: '血統情報を一括取得しました',
          color: 'green',
        });
      } else {
        notifications.show({
          title: '検索結果なし',
          message: `血統書番号 ${bothParentsId} が見つかりませんでした`,
          color: 'yellow',
        });
      }
    }
  };

  const handleBothParentsIdChange = async (bothParentsId: string) => {
    setCallIdData(prev => ({ ...prev, bothParentsId }));
    debouncedFetchPedigree(bothParentsId, 'both');
  };

  // バリデーション関数
  const validateForm = () => {
    const errors: string[] = [];

    // 必須フィールドチェック
    if (!formData.pedigreeId.trim()) {
      errors.push('血統書番号は必須です');
    }
    
    if (!formData.catName.trim()) {
      errors.push('猫の名前は必須です');
    }

    // 血統書番号の形式チェック（数字のみ）
    if (formData.pedigreeId && !/^\d+$/.test(formData.pedigreeId.trim())) {
      errors.push('血統書番号は数字のみで入力してください');
    }

    // 日付の妥当性チェック
    if (formData.birthDate && formData.registrationDate) {
      if (formData.birthDate > formData.registrationDate) {
        errors.push('生年月日は登録年月日より前である必要があります');
      }
    }

    // 兄弟姉妹数の妥当性チェック
    if (formData.brotherCount && formData.brotherCount < 0) {
      errors.push('兄弟の人数は0以上である必要があります');
    }

    if (formData.sisterCount && formData.sisterCount < 0) {
      errors.push('姉妹の人数は0以上である必要があります');
    }

    return errors;
  };

  // 血統書番号の重複チェック
  const checkPedigreeIdDuplicate = async (pedigreeId: string) => {
    try {
      const response = await fetch(`http://localhost:3004/api/v1/pedigrees/pedigree-id/${pedigreeId}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // フォームバリデーション
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        notifications.show({
          title: 'バリデーションエラー',
          message: validationErrors.join('\n'),
          color: 'red',
        });
        setLoading(false);
        return;
      }

      // 血統書番号の重複チェック
      const isDuplicate = await checkPedigreeIdDuplicate(formData.pedigreeId.trim());
      if (isDuplicate) {
        notifications.show({
          title: '重複エラー',
          message: `血統書番号 ${formData.pedigreeId} は既に登録されています`,
          color: 'red',
        });
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        pedigreeId: formData.pedigreeId.trim(),
        catName: formData.catName.trim(),
        birthDate: formData.birthDate?.toISOString(),
        registrationDate: formData.registrationDate?.toISOString(),
        pedigreeIssueDate: formData.pedigreeIssueDate?.toISOString(),
      };

      const response = await fetch('http://localhost:3004/api/v1/pedigrees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        notifications.show({
          title: '登録完了',
          message: '血統書が正常に登録されました',
          color: 'green',
        });
        router.push('/pedigrees');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '登録に失敗しました');
      }
    } catch (error) {
      console.error('登録エラー:', error);
      notifications.show({
        title: '登録エラー',
        message: error instanceof Error ? error.message : '血統書の登録に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Hydrationエラーを防ぐため、クライアントサイドでマウントされるまで何も表示しない
  if (!mounted) {
    return null;
  }

  const updateFormData = (field: keyof PedigreeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

    // サンプルデータを入力する関数（実在するデータベースの133418番ベース）
  const fillSampleData = () => {
    setFormData({
      pedigreeId: '700545', // 新規番号として700545を使用
      title: '',
      catName: 'アンドレス B.F.C',
      CatName2:"アンドレス B.F.C",
      gender: 1, // Male
      eyeColor: 'Gold',
      birthDate: new Date('2019-01-05'),
      registrationDate: new Date('2022-02-22'),
      pedigreeIssueDate: undefined,
      breederName: 'Hayato Inami',
      ownerName: 'Hayato Inami',
      brotherCount: 2,
      sisterCount: 2,
      notes: '血統書サンプルデータ（Accessフォーム参考）',
      notes2: '',
      otherNo: '',
      breedId: '',
      colorId: '',
      breedCode: '92', // Minuet(LH)
      coatColorCode: '190', // Cream Tabby-White
      // 血統関係は後で設定
      fatherPedigreeId: '',
      motherPedigreeId: '',
      paternalGrandfatherId: '',
      paternalGrandmotherId: '',
      maternalGrandfatherId: '',
      maternalGrandmotherId: '',
    });

    // Call IDもリセット
    setCallIdData({
      bothParentsId: '',
      fatherId: '',
      motherId: ''
    });

    notifications.show({
      title: 'サンプルデータ入力',
      message: 'Jolly Tokuichi（700545）のサンプルデータが入力されました',
      color: 'blue',
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <Container size="xl" py="md">
      <Box mb="lg">
        <Group justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => router.back()}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>血統書新規登録</Title>
          </Group>
          <Button
            variant="outline"
            color="blue"
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={fillSampleData}
          >
            サンプルデータ入力
          </Button>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
          新しい血統書データを登録します。基本情報と血統関係情報を入力してください。
        </Text>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* 基本情報セクション */}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconPaw size={20} />
              <Title order={3}>基本情報</Title>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="血統書番号"
                  placeholder="例: 700545"
                  required
                  value={formData.pedigreeId}
                  onChange={(e) => updateFormData('pedigreeId', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="猫の名前"
                  placeholder="例: Jolly Tokuichi"
                  required
                  value={formData.catName}
                  onChange={(e) => updateFormData('catName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="タイトル"
                  placeholder="例: Champion"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="性別"
                  placeholder="選択してください"
                  data={[
                    { value: '1', label: 'オス ♂' },
                    { value: '2', label: 'メス ♀' }
                  ]}
                  value={formData.gender?.toString() || ''}
                  onChange={(value) => updateFormData('gender', value ? parseInt(value) : undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="品種"
                  placeholder="選択してください"
                  data={(breeds || []).map(breed => ({
                    value: breed.id,
                    label: breed.name
                  }))}
                  value={formData.breedId || ''}
                  onChange={(value) => updateFormData('breedId', value)}
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="毛色"
                  placeholder="選択してください"
                  data={(colors || []).map(color => ({
                    value: color.id,
                    label: color.name
                  }))}
                  value={formData.colorId || ''}
                  onChange={(value) => updateFormData('colorId', value)}
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="目の色"
                  placeholder="例: Gold"
                  leftSection={<IconEye size={16} />}
                  value={formData.eyeColor || ''}
                  onChange={(e) => updateFormData('eyeColor', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <DateInput
                  label="生年月日"
                  placeholder="YYYY-MM-DD"
                  leftSection={<IconCalendar size={16} />}
                  value={formData.birthDate || null}
                  onChange={(value) => updateFormData('birthDate', value)}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Call IDセクション */}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconDna size={20} />
              <Title order={3}>Call ID（血統呼び出し）</Title>
            </Group>
            
            <Text size="sm" c="dimmed" mb="md">
              既存の血統書IDを入力すると、関連する血統情報が自動的に設定されます
            </Text>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="両親ID"
                  placeholder="例: 700545"
                  value={callIdData.bothParentsId}
                  onChange={(e) => handleBothParentsIdChange(e.target.value)}
                  description="両親の血統情報を一括取得"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="父猫ID"
                  placeholder="例: 700545"
                  value={callIdData.fatherId}
                  onChange={(e) => handleFatherIdChange(e.target.value)}
                  description="父猫の血統情報を取得"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="母猫ID"
                  placeholder="例: 141831"
                  value={callIdData.motherId}
                  onChange={(e) => handleMotherIdChange(e.target.value)}
                  description="母猫の血統情報を取得"
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* 繁殖・登録情報セクション */}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconUser size={20} />
              <Title order={3}>繁殖・登録情報</Title>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="繁殖者名"
                  placeholder="例: Hayato Inami"
                  value={formData.breederName || ''}
                  onChange={(e) => updateFormData('breederName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="所有者名"
                  placeholder="例: Hayato Inami"
                  value={formData.ownerName || ''}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <DateInput
                  label="登録年月日"
                  placeholder="YYYY-MM-DD"
                  value={formData.registrationDate || null}
                  onChange={(value) => updateFormData('registrationDate', value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <DateInput
                  label="血統書発行日"
                  placeholder="YYYY-MM-DD"
                  value={formData.pedigreeIssueDate || null}
                  onChange={(value) => updateFormData('pedigreeIssueDate', value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="チャンピオンフラグ"
                  placeholder="例: 1"
                  value={formData.championFlag || ''}
                  onChange={(e) => updateFormData('championFlag', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="兄弟の人数"
                  placeholder="0"
                  min={0}
                  value={formData.brotherCount || ''}
                  onChange={(value) => updateFormData('brotherCount', value || undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="姉妹の人数"
                  placeholder="0"
                  min={0}
                  value={formData.sisterCount || ''}
                  onChange={(value) => updateFormData('sisterCount', value || undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="他団体No"
                  placeholder="例: 921901-700545"
                  value={formData.otherNo || ''}
                  onChange={(e) => updateFormData('otherNo', e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* 血統情報セクション */}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconDna size={20} />
              <Title order={3}>血統情報</Title>
            </Group>

            <Accordion variant="separated">
              {/* 第1世代: 両親 */}
              <Accordion.Item value="generation1">
                <Accordion.Control>
                  <Group>
                    <Badge color="blue" variant="light">第1世代</Badge>
                    <Text fw={500}>両親</Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Card p="md" withBorder style={{ borderColor: '#228be6' }}>
                        <Group mb="xs">
                          <IconGenderMale size={16} color="#228be6" />
                          <Text fw={600} c="blue">父親</Text>
                        </Group>
                        <Select
                          label="父の血統書"
                          placeholder="血統書を選択"
                          data={pedigreeOptions}
                          value={formData.fatherPedigreeId || ''}
                          onChange={(value) => updateFormData('fatherPedigreeId', value)}
                          searchable
                          clearable
                        />
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Card p="md" withBorder style={{ borderColor: '#fa5252' }}>
                        <Group mb="xs">
                          <IconGenderFemale size={16} color="#fa5252" />
                          <Text fw={600} c="pink">母親</Text>
                        </Group>
                        <Select
                          label="母の血統書"
                          placeholder="血統書を選択"
                          data={pedigreeOptions}
                          value={formData.motherPedigreeId || ''}
                          onChange={(value) => updateFormData('motherPedigreeId', value)}
                          searchable
                          clearable
                        />
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>

              {/* 第2世代: 祖父母 */}
              <Accordion.Item value="generation2">
                <Accordion.Control>
                  <Group>
                    <Badge color="green" variant="light">第2世代</Badge>
                    <Text fw={500}>祖父母</Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Text fw={600} mb="sm" c="blue">父方</Text>
                      <Stack gap="sm">
                        <Card p="sm" withBorder>
                          <Text size="sm" fw={500} mb="xs">父方祖父</Text>
                          <Select
                            placeholder="血統書を選択"
                            data={pedigreeOptions}
                            value={formData.paternalGrandfatherId || ''}
                            onChange={(value) => updateFormData('paternalGrandfatherId', value)}
                            searchable
                            clearable
                          />
                        </Card>
                        <Card p="sm" withBorder>
                          <Text size="sm" fw={500} mb="xs">父方祖母</Text>
                          <Select
                            placeholder="血統書を選択"
                            data={pedigreeOptions}
                            value={formData.paternalGrandmotherId || ''}
                            onChange={(value) => updateFormData('paternalGrandmotherId', value)}
                            searchable
                            clearable
                          />
                        </Card>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Text fw={600} mb="sm" c="pink">母方</Text>
                      <Stack gap="sm">
                        <Card p="sm" withBorder>
                          <Text size="sm" fw={500} mb="xs">母方祖父</Text>
                          <Select
                            placeholder="血統書を選択"
                            data={pedigreeOptions}
                            value={formData.maternalGrandfatherId || ''}
                            onChange={(value) => updateFormData('maternalGrandfatherId', value)}
                            searchable
                            clearable
                          />
                        </Card>
                        <Card p="sm" withBorder>
                          <Text size="sm" fw={500} mb="xs">母方祖母</Text>
                          <Select
                            placeholder="血統書を選択"
                            data={pedigreeOptions}
                            value={formData.maternalGrandmotherId || ''}
                            onChange={(value) => updateFormData('maternalGrandmotherId', value)}
                            searchable
                            clearable
                          />
                        </Card>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Paper>

          {/* 備考セクション */}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconInfoCircle size={20} />
              <Title order={3}>備考・その他</Title>
            </Group>
            
            <Grid>
              <Grid.Col span={12}>
                <Textarea
                  label="備考"
                  placeholder="追加情報や特記事項を入力"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="備考２"
                  placeholder="追加情報や特記事項を入力"
                  rows={3}
                  value={formData.notes2 || ''}
                  onChange={(e) => updateFormData('notes2', e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* 送信ボタン */}
          <Group justify="space-between" pt="md">
            <Button 
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              戻る
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconDeviceFloppy size={16} />}
              size="lg"
            >
              血統書を登録
            </Button>
          </Group>

          {/* 注意事項 */}
          <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />}>
            <Text size="sm">
              <strong>入力のヒント:</strong>
              <br />• 血統書番号は一意である必要があります
              <br />• 血統関係は任意ですが、正確な家系図表示のために入力を推奨します
              <br />• 未入力の項目は後から編集可能です
            </Text>
          </Alert>
        </Stack>
      </form>
    </Container>
  );
}
