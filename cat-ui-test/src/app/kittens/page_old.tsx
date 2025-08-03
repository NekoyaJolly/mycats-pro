'use client';

import { Box, Title, Text } from '@mantine/core';

export default function KittensPage() {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem' }}>
      <Title order={1} c="blue" mb="md">子猫管理</Title>
      <Text>生まれた子猫の記録や管理を行うページです（今後実装予定）。</Text>
    </Box>
  );
};

import { Box, Heading, Text } from "@chakra-ui/react";

export default function KittensPage() {
  return (
    <Box minH="100vh" bg="neutral.50" p={8}>
      <Heading size="lg" color="brand.500" mb={4}>子猫管理</Heading>
      <Text>子猫の登録・管理・ケアスケジュールのページです（今後実装予定）。</Text>
    </Box>
  );
}
