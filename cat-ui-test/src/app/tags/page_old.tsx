"use client";

import { Box, Heading, Text } from "@chakra-ui/react";

export default function TagsPage() {
  return (
    <Box minH="100vh" bg="neutral.50" p={8}>
      <Heading size="lg" color="brand.500" mb={4}>タグ管理</Heading>
      <Text>カスタムタグの追加・編集・削除ページです（今後実装予定）。</Text>
    </Box>
  );
}
