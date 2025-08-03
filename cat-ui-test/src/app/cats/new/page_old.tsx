"use client";

import { useRouter } from "next/navigation";
import { Box, Flex, Heading, Button, Stack, Input, Textarea, Tabs } from "@chakra-ui/react";
import { useState } from "react";

const dummyEditCat = {
  id: "1",
  name: "レオ",
  gender: "オス",
  color: "茶トラ",
  birthDate: "2023-03-15",
  description: "とても元気なオス猫。人懐っこく、遊ぶのが大好き。",
};

export default function CatRegisterEditPage() {
  const router = useRouter();
  // タブ切り替え: "register" or "edit"
  const [tab, setTab] = useState("register");
  // 新規登録用
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
  DateInput,
  Tabs,
  Flex,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

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
  });

  const handleRegisterSubmit = () => {
    console.log('Registration data:', registerForm);
    // ここで実際の登録処理を行う
    router.push('/');
  };

  const handleEditSubmit = () => {
    console.log('Edit data:', editForm);
    // ここで実際の編集処理を行う
    router.push('/cats/1');
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* ヘッダー */}
      <Box style={{ backgroundColor: 'white', borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}>
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
        <Title order={1} mb="lg">猫の管理</Title>

        <Tabs value={activeTab} onChange={setActiveTab} variant="outline">
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
  // 編集用（ダミーデータ）
  const [editForm, setEditForm] = useState({ ...dummyEditCat });

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 本来はAPI送信
    alert("登録完了: " + JSON.stringify(registerForm, null, 2));
    router.push("/cats");
  };
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 本来はAPI送信
    alert("編集完了: " + JSON.stringify(editForm, null, 2));
    router.push(`/cats/${editForm.id}`);
  };
  const handleDelete = () => {
    if (window.confirm("本当に削除しますか？")) {
      // 本来はAPIで削除
      alert("削除しました");
      router.push("/cats");
    }
  };

  return (
    <Box minH="100vh" bg="neutral.50">
      <Box bg="white" shadow="sm" px="6" py="4">
        <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
          <Heading size="lg" color="brand.500">
            猫管理（新規登録・編集）
          </Heading>
          <Button colorScheme="brand" onClick={() => router.push("/cats")}>一覧へ戻る</Button>
        </Flex>
      </Box>
      <Box maxW="2xl" mx="auto" mt="8" p="6" bg="white" borderRadius="md" boxShadow="md">
        <Tabs.Root value={tab} onValueChange={details => setTab(details.value)} style={{ width: "100%" }}>
          <Tabs.List>
            <Tabs.Trigger value="register">新規登録</Tabs.Trigger>
            <Tabs.Trigger value="edit">編集</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="register">
            {/* 新規登録フォーム */}
            <form onSubmit={handleRegisterSubmit}>
              <Stack gap={6}>
                <div>
                  <label htmlFor="name">名前</label>
                  <Input id="name" name="name" value={registerForm.name} onChange={handleRegisterChange} placeholder="例: レオ" required />
                </div>
                <div>
                  <label htmlFor="gender">性別</label>
                  <select
                    id="gender"
                    name="gender"
                    value={registerForm.gender}
                    onChange={handleRegisterChange}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="">選択してください</option>
                    <option value="オス">オス</option>
                    <option value="メス">メス</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="color">色柄</label>
                  <Input id="color" name="color" value={registerForm.color} onChange={handleRegisterChange} placeholder="例: 茶トラ" />
                </div>
                <div>
                  <label htmlFor="birthDate">生年月日</label>
                  <Input id="birthDate" name="birthDate" type="date" value={registerForm.birthDate} onChange={handleRegisterChange} />
                </div>
                <div>
                  <label htmlFor="description">説明</label>
                  <Textarea id="description" name="description" value={registerForm.description} onChange={handleRegisterChange} placeholder="性格や特徴など" />
                </div>
                <Flex gap={4} justify="flex-end">
                  <Button variant="outline" onClick={() => router.push("/cats")}>キャンセル</Button>
                  <Button colorScheme="brand" type="submit">登録</Button>
                </Flex>
              </Stack>
            </form>
          </Tabs.Content>
          <Tabs.Content value="edit">
            {/* 編集フォーム */}
            <form onSubmit={handleEditSubmit}>
              <Stack gap={6}>
                <div>
                  <label htmlFor="edit-name">名前</label>
                  <Input id="edit-name" name="name" value={editForm.name} onChange={handleEditChange} required />
                </div>
                <div>
                  <label htmlFor="edit-gender">性別</label>
                  <select
                    id="edit-gender"
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="">選択してください</option>
                    <option value="オス">オス</option>
                    <option value="メス">メス</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-color">色柄</label>
                  <Input id="edit-color" name="color" value={editForm.color} onChange={handleEditChange} />
                </div>
                <div>
                  <label htmlFor="edit-birthDate">生年月日</label>
                  <Input id="edit-birthDate" name="birthDate" type="date" value={editForm.birthDate} onChange={handleEditChange} />
                </div>
                <div>
                  <label htmlFor="edit-description">説明</label>
                  <Textarea id="edit-description" name="description" value={editForm.description} onChange={handleEditChange} />
                </div>
                <Flex gap={4} justify="flex-end">
                  <Button variant="outline" colorScheme="red" onClick={handleDelete}>削除</Button>
                  <Button variant="outline" onClick={() => router.push(`/cats/${editForm.id}`)}>キャンセル</Button>
                  <Button colorScheme="brand" type="submit">保存</Button>
                </Flex>
              </Stack>
            </form>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Box>
  );
}
