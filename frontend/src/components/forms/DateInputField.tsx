import { DateInput, DateInputProps } from '@mantine/dates';
import { FormField } from './FormField';

export interface DateInputFieldProps extends Omit<DateInputProps, 'value' | 'onChange'> {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

export function DateInputField({
  value,
  onChange,
  label,
  description,
  error,
  required,
  ...rest
}: DateInputFieldProps) {
  return (
    <FormField label={label} description={description} error={error} required={required}>
      <DateInput
        value={value ? new Date(value) : null}
        // Mantine DateInput の onChange型(DateStringValue | null)に厳密化
        onChange={(d: string | null) => {
          let dateVal: Date | null = null;
          if (typeof d === 'string') {
            const parsed = new Date(d);
            dateVal = isNaN(parsed.getTime()) ? null : parsed;
          }
          onChange(dateVal ? dateVal.toISOString().split('T')[0] : undefined);
        }}
        valueFormat="YYYY-MM-DD"
        {...rest}
      />
    </FormField>
  );
}
