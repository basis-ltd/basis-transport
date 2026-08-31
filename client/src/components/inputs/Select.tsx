import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  controlClassName,
  panelClassName,
  panelItemClassName,
} from "./control";
import type { InputErrorMessageProp } from "./ErrorLabels";
import { resolveErrorText } from "./ErrorLabels";
import { FieldShell } from "./Field";
import { useId } from "react";

export interface SelectOption {
  label: string | undefined;
  value: string;
  disabled?: boolean;
}

type SelectProps = {
  label?: string | number;
  options?: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
  value?: string;
  required?: boolean;
  labelClassName?: string;
  name?: string;
  readOnly?: boolean;
  description?: string;
  errorMessage?: InputErrorMessageProp;
};

/**
 * The stock `ui/select` trigger is a 36px control with a ring focus; this shell
 * gives it the same edge, height, and inset focus ring as every other field, so
 * a select and the input beside it share a baseline.
 */
const Select = ({
  options = [],
  defaultValue,
  placeholder = "Select here...",
  className,
  value = "",
  onChange,
  label,
  required = false,
  labelClassName,
  name,
  readOnly = false,
  description,
  errorMessage,
}: SelectProps) => {
  const hasError = Boolean(resolveErrorText(errorMessage));
  const id = useId();
  const emptyValue = `__basis-empty-${id}`;
  const encode = (v: string | undefined) =>
    v === "" && options.some((o) => o.value === "") ? emptyValue : v;

  return (
    <FieldShell
      label={label}
      required={required}
      description={description}
      errorMessage={errorMessage}
      className={labelClassName}
      htmlFor={id}
    >
      <SelectRoot
        onValueChange={(v) => onChange?.(v === emptyValue ? "" : v)}
        defaultValue={encode(defaultValue)}
        value={encode(value)}
        name={name}
        disabled={readOnly}
      >
        <SelectTrigger
          id={id}
          aria-invalid={hasError}
          className={cn(
            controlClassName,
            "w-full cursor-pointer justify-between data-[placeholder]:text-(--muted) [&>span]:line-clamp-1 [&_svg]:text-(--muted)",
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={6}
          align="start"
          className={cn(
            panelClassName,
            "z-[var(--z-popover)] w-[var(--radix-select-trigger-width)]",
          )}
        >
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={encode(option.value)!}
                disabled={option.disabled}
                className={panelItemClassName}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectRoot>
    </FieldShell>
  );
};

export default Select;
