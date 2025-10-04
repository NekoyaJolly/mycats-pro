import { TextInput, TextInputProps } from '@mantine/core';
import { FormField } from './FormField';

export interface ColorInputFieldProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

/**
 * シンプルなカラー/柄入力。将来的にカラーピッカー差し替え可能。
 */
export function ColorInputField({
  value,
  onChange,
  label,
  description,
  error,
  required,
  ...rest
}: ColorInputFieldProps) {
  return (
    <FormField label={label} description={description} error={error} required={required}>
      <TextInput
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder="例: 茶トラ、三毛"
        {...rest}
      />
    </FormField>
  );
}
