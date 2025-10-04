'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Title,
  TextInput,
  Textarea,
  Select,
  Tabs,
  Flex,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import TagSelector from '../../../components/TagSelector';

export default function CatRegistrationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('register');
  
  // 登録フォーム用の状態
  const [registerForm, setRegisterForm] = useState({
    name: '',
    breed: '',
    gender: '',
    birthDate: '',
    color: '',
    weight: '',
    microchip: '',
    description: '',
    tags: [] as string[],
  });

  // 編集フォーム用の状態
  const [editForm, setEditForm] = useState({
    name: 'レオ',
    breed: '雑種',
    gender: 'オス',
    birthDate: '2023-03-15',
    color: '茶トラ',
    weight: '4.2',
    microchip: 'MC123456789',
    description: 'とても元気なオス猫。',
    tags: ['t1', 't4', 't8'] as string[], // サンプルタグ
  });

  const handleRegisterSubmit = () => {
    console.log('Registration data:', registerForm);
    router.push('/');
  };

  const handleEditSubmit = () => {
    console.log('Edit data:', editForm);
    // ここで実際の編集処理を行う
    router.push('/cats/1');
  };

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

      <Container size="lg" style={{ paddingTop: '2rem' }}>

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'register')} variant="outline">
          <Tabs.List>
            <Tabs.Tab value="register">新規登録</Tabs.Tab>
            <Tabs.Tab value="edit">編集</Tabs.Tab>
          </Tabs.List>

          {/* 新規登録タブ */}
          <Tabs.Panel value="register" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={2} mb="lg">新しい猫を登録</Title>
              <Stack gap="md">
                <TextInput
                  label="猫の名前"
                  placeholder="名前を入力してください"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
                
                <Group grow>
                  <TextInput
                    label="品種"
                    placeholder="例: 雑種、アメリカンショートヘア"
                    value={registerForm.breed}
                    onChange={(e) => setRegisterForm({ ...registerForm, breed: e.target.value })}
                  />
                  <Select
                    label="性別"
                    placeholder="性別を選択"
                    data={[
                      { value: 'オス', label: 'オス' },
                      { value: 'メス', label: 'メス' },
                    ]}
                    value={registerForm.gender}
                    onChange={(value) => setRegisterForm({ ...registerForm, gender: value || '' })}
                    required
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="生年月日"
                    placeholder="YYYY-MM-DD"
                    value={registerForm.birthDate}
                    onChange={(e) => setRegisterForm({ ...registerForm, birthDate: e.target.value })}
                  />
                  <TextInput
                    label="色柄"
                    placeholder="例: 茶トラ、三毛"
                    value={registerForm.color}
                    onChange={(e) => setRegisterForm({ ...registerForm, color: e.target.value })}
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="体重"
                    placeholder="例: 4.2"
                    value={registerForm.weight}
                    onChange={(e) => setRegisterForm({ ...registerForm, weight: e.target.value })}
                  />
                  <TextInput
                    label="マイクロチップ"
                    placeholder="マイクロチップ番号"
                    value={registerForm.microchip}
                    onChange={(e) => setRegisterForm({ ...registerForm, microchip: e.target.value })}
                  />
                </Group>

                <Textarea
                  label="備考"
                  placeholder="特徴や性格などを記入してください"
                  value={registerForm.description}
                  onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                  minRows={3}
                />

                <TagSelector
                  selectedTags={registerForm.tags}
                  onChange={(tags) => setRegisterForm({ ...registerForm, tags })}
                  label="タグ"
                  placeholder="猫の特徴タグを選択"
                />

                <Group justify="center" mt="xl">
                  <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleRegisterSubmit}
                  >
                    登録
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* 編集タブ */}
          <Tabs.Panel value="edit" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={2} mb="lg">猫の情報を編集</Title>
              <Stack gap="md">
                <TextInput
                  label="猫の名前"
                  placeholder="名前を入力してください"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
                
                <Group grow>
                  <TextInput
                    label="品種"
                    placeholder="例: 雑種、アメリカンショートヘア"
                    value={editForm.breed}
                    onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                  />
                  <Select
                    label="性別"
                    placeholder="性別を選択"
                    data={[
                      { value: 'オス', label: 'オス' },
                      { value: 'メス', label: 'メス' },
                    ]}
                    value={editForm.gender}
                    onChange={(value) => setEditForm({ ...editForm, gender: value || '' })}
                    required
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="生年月日"
                    placeholder="YYYY-MM-DD"
                    value={editForm.birthDate}
                    onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  />
                  <TextInput
                    label="色柄"
                    placeholder="例: 茶トラ、三毛"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="体重"
                    placeholder="例: 4.2"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  />
                  <TextInput
                    label="マイクロチップ"
                    placeholder="マイクロチップ番号"
                    value={editForm.microchip}
                    onChange={(e) => setEditForm({ ...editForm, microchip: e.target.value })}
                  />
                </Group>

                <Textarea
                  label="備考"
                  placeholder="特徴や性格などを記入してください"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  minRows={3}
                />

                <TagSelector
                  selectedTags={editForm.tags}
                  onChange={(tags) => setEditForm({ ...editForm, tags })}
                  label="タグ"
                  placeholder="猫の特徴タグを選択"
                />

                <Group justify="center" mt="xl">
                  <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleEditSubmit}
                  >
                    更新
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
}
