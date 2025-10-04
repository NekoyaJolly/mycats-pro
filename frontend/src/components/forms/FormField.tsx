import { Box, Text } from '@mantine/core';
import { ReactNode } from 'react';

export interface FormFieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  required?: boolean;
  spacing?: string | number;
}

/**
 * 共通フォームフィールドラッパ
 * - ラベル
 * - 説明
 * - フィールド本体 (children)
 * - エラー（常にフィールド直下に表示）
 */
export function FormField({
  label,
  description,
  error,
  children,
  required,
  spacing = '0.5rem',
}: FormFieldProps) {
  return (
    <Box style={{ width: '100%' }}>
      {label && (
        <Box style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Text size="sm" fw={600} style={{ lineHeight: 1.2 }}>
            {label}
            {required && <Text component="span" c="red" ml={4}>*</Text>}
          </Text>
        </Box>
      )}
      {description && (
        <Text size="xs" c="dimmed" mb={4}>
          {description}
        </Text>
      )}
      <Box style={{ marginBottom: error ? '0.35rem' : spacing }}>
        {children}
      </Box>
      {error && (
        <Text size="xs" c="red" style={{ fontWeight: 500 }}>
          {error}
        </Text>
      )}
    </Box>
  );
}
