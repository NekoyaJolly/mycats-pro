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
  Tabs,
  Table,
  Flex,
  Image,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconUser } from '@tabler/icons-react';

// ダミーデータ
const catData = {
  id: '1',
  name: 'レオ',
  breed: '雑種',
  gender: 'オス',
  birthDate: '2023-03-15',
  color: '茶トラ',
  weight: '4.2kg',
  microchip: 'MC123456789',
  status: '健康',
  description: 'とても元気なオス猫。人懐っこく、遊ぶのが大好き。',
  image: '/placeholder-cat.jpg', // プレースホルダー画像
  vaccinations: [
    { date: '2023-04-15', vaccine: '三種混合ワクチン' },
    { date: '2023-10-15', vaccine: '三種混合ワクチン' },
  ],
  shows: [
    { date: '2023-06-10', show: '東京キャットショー', result: '優勝' },
    { date: '2023-09-15', show: '関東地区展', result: '入賞' },
  ],
  kittens: [
    { name: 'レオ Jr.', birthDate: '2023-08-01', partner: 'ミミ' },
    { name: 'レナ', birthDate: '2023-08-01', partner: 'ミミ' },
  ],
};

export default function CatDetailClient() {
  const router = useRouter();
  const cat = catData;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* ヘッダー */}
      <Box style={{ backgroundColor: 'white', borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}>
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/cats')}
            >
              一覧へ戻る
            </Button>
            <Group gap="sm">
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => router.push(`/cats/${cat.id}/edit`)}
              >
                編集
              </Button>
              <Button
                variant="outline"
                leftSection={<IconUser size={16} />}
                onClick={() => router.push(`/cats/${cat.id}/pedigree`)}
              >
                血統表を見る
              </Button>
            </Group>
          </Flex>
        </Container>
      </Box>

      <Container size="lg" style={{ paddingTop: '2rem' }}>
        {/* メイン詳細カード */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Flex gap="xl" align="flex-start" direction={{ base: 'column', md: 'row' }}>
            <Image
              src={cat.image}
              alt={cat.name}
              style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }}
            />
            <Stack gap="md" style={{ flex: 1 }}>
              <Title order={2}>{cat.name}</Title>
              <Text c="dimmed">{cat.gender} | {cat.color} | {cat.birthDate}</Text>
              <Text c="green" fw={600}>{cat.status}</Text>
              <Text>{cat.description}</Text>
            </Stack>
          </Flex>
        </Card>

        {/* タブで詳細情報 */}
        <Tabs defaultValue="basic" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="basic">基本情報</Tabs.Tab>
            <Tabs.Tab value="health">健康記録</Tabs.Tab>
            <Tabs.Tab value="shows">ショー実績</Tabs.Tab>
            <Tabs.Tab value="kittens">子猫</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group>
                  <Text fw={600}>品種:</Text>
                  <Text>{cat.breed}</Text>
                </Group>
                <Group>
                  <Text fw={600}>性別:</Text>
                  <Text>{cat.gender}</Text>
                </Group>
                <Group>
                  <Text fw={600}>生年月日:</Text>
                  <Text>{cat.birthDate}</Text>
                </Group>
                <Group>
                  <Text fw={600}>色柄:</Text>
                  <Text>{cat.color}</Text>
                </Group>
                <Group>
                  <Text fw={600}>体重:</Text>
                  <Text>{cat.weight}</Text>
                </Group>
                <Group>
                  <Text fw={600}>マイクロチップ:</Text>
                  <Text>{cat.microchip}</Text>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="health" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">ワクチン接種記録</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>接種日</Table.Th>
                    <Table.Th>ワクチン種類</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cat.vaccinations.map((vaccination, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{vaccination.date}</Table.Td>
                      <Table.Td>{vaccination.vaccine}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="shows" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">ショー出場記録</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>開催日</Table.Th>
                    <Table.Th>ショー名</Table.Th>
                    <Table.Th>結果</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cat.shows.map((show, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{show.date}</Table.Td>
                      <Table.Td>{show.show}</Table.Td>
                      <Table.Td>{show.result}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="kittens" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">子猫記録</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>名前</Table.Th>
                    <Table.Th>生年月日</Table.Th>
                    <Table.Th>パートナー</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cat.kittens.map((kitten, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{kitten.name}</Table.Td>
                      <Table.Td>{kitten.birthDate}</Table.Td>
                      <Table.Td>{kitten.partner}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
}
