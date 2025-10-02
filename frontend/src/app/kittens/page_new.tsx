'use client';

import { Box, Title, Text } from '@mantine/core';

export default function KittensPage() {
  return (
  <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)', padding: '2rem' }}>
      <Title order={1} c="blue" mb="md">子猫管理</Title>
      <Text>生まれた子猫の記録や管理を行うページです（今後実装予定）。</Text>
    </Box>
  );
}
