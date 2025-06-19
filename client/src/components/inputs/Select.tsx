import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UUID } from 'crypto';
import { FieldValues } from 'react-hook-form';
import { FieldError, Merge } from 'react-hook-form';
import { FieldErrorsImpl } from 'react-hook-form';
import { InputErrorMessage } from './ErrorLabels';

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
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
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
  errorMessage = undefined,
}: SelectProps) => {
  return (
    <label className={`flex flex-col gap-1 w-full ${labelClassName}`}>
      <p className={label ? 'flex items-center gap-1 text-[14px]' : 'hidden'}>
        {label} <span className={required ? `text-red-600` : 'hidden'}>*</span>
      </p>
      <SelectComponent
        onValueChange={onChange}
        defaultValue={defaultValue}
        value={value}
        name={name}
      >
        <SelectTrigger
          className={`w-full focus:ring-transparent cursor-pointer ring-0 h-10 ${className}`}
        >
          <SelectValue
            className="text-[10px]!"
            placeholder={
              <p className="text-[13px] text-gray-500">{placeholder}</p>
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option, index: number) => {
              return (
                <SelectItem
                  key={index}
                  value={option.value}
                  disabled={readOnly}
                  className="cursor-pointer text-[13px] py-1 hover:bg-background"
                >
                  <p className="text-[13px] py-[3px]">{option.label}</p>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </SelectComponent>
      <InputErrorMessage message={errorMessage} />
    </label>
  );
};

export default Select;
