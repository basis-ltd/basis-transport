import type { ReactNode } from 'react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';
import {
  RadioGroup as RadioGroupUI,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Switch as SwitchUI } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { InputErrorMessageProp } from './ErrorLabels';
import { FieldMessage } from './Field';

/**
 * Checked is the inversion rule: the control takes ink as its ground and paper
 * as its mark. Never a tint, never an accent colour — that swap is the only
 * thing in the system that means "selected".
 */
const checkedClassName =
  'cursor-pointer border-(--line-strong) bg-(--paper) shadow-none transition-[background-color,border-color,box-shadow] duration-200 ease-(--ease-flat) data-[state=checked]:border-(--ink) data-[state=checked]:bg-(--ink) data-[state=checked]:text-(--paper) focus-visible:ring-0 focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]';

interface ToggleProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: InputErrorMessageProp;
  className?: string;
  disabled?: boolean;
}

export const Checkbox = ({
  label,
  description,
  errorMessage,
  className,
  disabled,
  checked,
  onCheckedChange,
  name,
}: ToggleProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
}) => (
  <div className="flex w-fit flex-col gap-1.5">
    <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
      <CheckboxUI
        name={name}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(state) => onCheckedChange?.(state === true)}
        className={cn('size-4 shrink-0', checkedClassName, className)}
      />
      {label ? <span>{label}</span> : null}
    </label>
    <FieldMessage description={description} errorMessage={errorMessage} />
  </div>
);

export const Switch = ({
  label,
  description,
  errorMessage,
  className,
  disabled,
  checked,
  onCheckedChange,
  name,
}: ToggleProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
}) => (
  <div className="flex w-fit flex-col gap-1.5">
    <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm">
      <SwitchUI
        name={name}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={cn(
          'cursor-pointer shadow-none data-[state=checked]:bg-(--ink) data-[state=unchecked]:bg-(--surface-hover) focus-visible:ring-0 focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]',
          className
        )}
      />
      {label ? <span>{label}</span> : null}
    </label>
    <FieldMessage description={description} errorMessage={errorMessage} />
  </div>
);

export const RadioGroup = ({
  label,
  description,
  errorMessage,
  className,
  disabled,
  value,
  onChange,
  name,
  options,
}: ToggleProps & {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  options: { label: string; value: string }[];
}) => (
  <fieldset className="flex flex-col gap-2">
    {label ? <legend className="field-label mb-1">{label}</legend> : null}
    <RadioGroupUI
      name={name}
      value={value}
      disabled={disabled}
      onValueChange={onChange}
      className={cn('flex flex-col gap-2', className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex w-fit cursor-pointer items-center gap-2 text-sm"
        >
          <RadioGroupItem
            value={option.value}
            className={cn('size-4 shrink-0', checkedClassName)}
          />
          {option.label}
        </label>
      ))}
    </RadioGroupUI>
    <FieldMessage description={description} errorMessage={errorMessage} />
  </fieldset>
);
