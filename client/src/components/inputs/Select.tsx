import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UUID } from 'crypto';
import { cn } from '@/lib/utils';
import type { InputErrorMessageProp } from './ErrorLabels';
import { FieldShell } from './Field';

type SelectProps = {
  label?: string | number | undefined;
  options?: Array<{ label: string | undefined; value: string | UUID }>;
  defaultValue?: string | undefined;
  placeholder?: string;
  className?: string;
  onChange?: ((value: string) => void) | undefined;
  value?: string | undefined;
  required?: boolean;
  labelClassName?: string | undefined;
  name?: string | undefined;
  readOnly?: boolean;
  description?: string;
  errorMessage?: InputErrorMessageProp;
};

const Select = ({
  options = [],
  defaultValue = undefined,
  placeholder = 'Select here...',
  className = undefined,
  value = '',
  onChange,
  label = undefined,
  required = false,
  labelClassName = undefined,
  name = undefined,
  readOnly = false,
  description = undefined,
  errorMessage = undefined,
}: SelectProps) => {
  return (
    <FieldShell
      label={label}
      required={required}
      description={description}
      errorMessage={errorMessage}
      className={labelClassName}
    >
      <SelectComponent
        onValueChange={onChange}
        defaultValue={defaultValue}
        value={value}
        name={name}
        disabled={readOnly}
      >
        <SelectTrigger className={cn('cursor-pointer', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={String(option.value)} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectComponent>
    </FieldShell>
  );
};

export default Select;
