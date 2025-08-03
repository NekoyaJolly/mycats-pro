"use client";

import { useRouter } from "next/navigation";
import { Box, Flex, Heading, Button, Stack, Text, Card } from "@chakra-ui/react";

// 仮の血統データ
const pedigree = {
  id: "1",
  name: "レオ",
  parents: [
    { id: "2", name: "パパ", gender: "オス" },
    { id: "3", name: "ママ", gender: "メス" },
  ],
  grandparents: [
    { id: "4", name: "祖父A", gender: "オス" },
    { id: "5", name: "祖母A", gender: "メス" },
    { id: "6", name: "祖父B", gender: "オス" },
    { id: "7", name: "祖母B", gender: "メス" },
  ],
};

export default function PedigreePage() {
  const router = useRouter();
  return (
    <Box minH="100vh" bg="neutral.50">
      <Box bg="white" shadow="sm" px="6" py="4">
        <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
          <Heading size="lg" color="brand.500">
            血統書
          </Heading>
          <Button colorScheme="brand" onClick={() => router.push(`/cats/${pedigree.id}`)}>詳細へ戻る</Button>
        </Flex>
      </Box>
      <Box maxW="3xl" mx="auto" mt="8" p="6" bg="white" borderRadius="md" boxShadow="md">
        <Heading size="md" mb="4">{pedigree.name} の血統図</Heading>
        <Stack gap={8} align="center">
          {/* 本猫 */}
          <Card.Root style={{ padding: 16, minWidth: 200, textAlign: "center" }}>
            <Text fontWeight="bold">{pedigree.name}</Text>
            <Text fontSize="sm">本人</Text>
          </Card.Root>
          {/* 両親 */}
          <Flex gap={8} justify="center">
            {pedigree.parents.map((p) => (
              <Card.Root key={p.id} style={{ padding: 16, minWidth: 160, textAlign: "center" }}>
                <Text fontWeight="bold">{p.name}</Text>
                <Text fontSize="sm">{p.gender}</Text>
              </Card.Root>
            ))}
          </Flex>
          {/* 祖父母 */}
          <Flex gap={8} justify="center">
            {pedigree.grandparents.map((gp) => (
              <Card.Root key={gp.id} style={{ padding: 16, minWidth: 120, textAlign: "center" }}>
                <Text fontWeight="bold">{gp.name}</Text>
                <Text fontSize="sm">{gp.gender}</Text>
              </Card.Root>
            ))}
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}



// 4世代分のダミー血統データ
const mockPedigree = {
  name: "ミケ",
  gender: "♀",
  breed: "スコティッシュフォールド",
  color: "三毛",
  father: {
    name: "タマ",
    gender: "♂",
    breed: "マンチカン",
    color: "茶トラ",
    father: {
      name: "ゴロー",
      gender: "♂",
      breed: "アメリカンショートヘア",
      color: "シルバー",
      father: { name: "A1", gender: "♂", breed: "アメショ", color: "シルバー" },
      mother: { name: "A2", gender: "♀", breed: "アメショ", color: "ホワイト" },
    },
    mother: {
      name: "サクラ",
      gender: "♀",
      breed: "スコティッシュフォールド",
      color: "白",
      father: { name: "A3", gender: "♂", breed: "スコ", color: "クリーム" },
      mother: { name: "A4", gender: "♀", breed: "スコ", color: "ブルー" },
    },
  },
  mother: {
    name: "ルナ",
    gender: "♀",
    breed: "ノルウェージャン",
    color: "グレー",
    father: {
      name: "クロ",
      gender: "♂",
      breed: "ノルウェージャン",
      color: "黒",
      father: { name: "B1", gender: "♂", breed: "ノル", color: "ブラック" },
      mother: { name: "B2", gender: "♀", breed: "ノル", color: "ホワイト" },
    },
    mother: {
      name: "モモ",
      gender: "♀",
      breed: "ノルウェージャン",
      color: "白グレー",
      father: { name: "B3", gender: "♂", breed: "ノル", color: "グレー" },
      mother: { name: "B4", gender: "♀", breed: "ノル", color: "ブラウン" },
    },
  },
};

// 1ノード分の表示
function PedigreeNode({ cat }: { cat: any }) {
  if (!cat) return <Box minW="120px" minH="80px" />;
  return (
    <Card.Root minW="120px" minH="80px" p={2} textAlign="center" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Text fontWeight="bold">{cat.name}</Text>
      <Text fontSize="sm">{cat.gender} / {cat.breed}</Text>
      <Text fontSize="sm">{cat.color}</Text>
    </Card.Root>
  );
}

// 4世代分のノードを配列で返す
function getFourthGenNodes(pedigree: any) {
  // 祖父母の父母（曽祖父母）
  const fatherFather = pedigree?.father?.father;
  const fatherMother = pedigree?.father?.mother;
  const motherFather = pedigree?.mother?.father;
  const motherMother = pedigree?.mother?.mother;
  // 曽祖父母
  const nodes = [];
  // 父方祖父
  if (fatherFather) {
    nodes.push(fatherFather.father, fatherFather.mother);
  } else {
    nodes.push(null, null);
  }
  // 父方祖母
  if (fatherMother) {
    nodes.push(fatherMother.father, fatherMother.mother);
  } else {
    nodes.push(null, null);
  }
  // 母方祖父
  if (motherFather) {
    nodes.push(motherFather.father, motherFather.mother);
  } else {
    nodes.push(null, null);
  }
  // 母方祖母
  if (motherMother) {
    nodes.push(motherMother.father, motherMother.mother);
  } else {
    nodes.push(null, null);
  }
  return nodes;
}

// 4世代目の表示を追加
<Flex justify="center" gap={4} flexWrap="wrap">
  {getFourthGenNodes(mockPedigree).map((cat, idx) => (
    <PedigreeNode cat={cat} key={idx} />
  ))}
</Flex>
