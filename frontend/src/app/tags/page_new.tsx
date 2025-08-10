'use client';

import { Box, Title, Text } from '@mantine/core';

export default function TagsPage() {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem' }}>
      <Title order={1} c="blue" mb="md">タグ管理</Title>
      <Text>猫の特徴やカテゴリーを管理するタグシステムです（今後実装予定）。</Text>
    </Box>
  );
}
