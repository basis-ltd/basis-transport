import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { controlClassName, panelClassName, panelItemClassName } from './control';
import type { InputErrorMessageProp } from './ErrorLabels';
import { FieldShell } from './Field';
import type { SelectOption } from './Select';

interface ComboboxProps {
  label?: React.ReactNode;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  description?: React.ReactNode;
  errorMessage?: InputErrorMessageProp;
  className?: string;
}

/** A select that needs filtering. Same trigger, same panel — one more input. */
const Combobox = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search…',
  emptyMessage = 'Nothing found.',
  disabled = false,
  required = false,
  description,
  errorMessage,
  className,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <FieldShell
      label={label}
      required={required}
      description={description}
      errorMessage={errorMessage}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              controlClassName,
              'flex cursor-pointer items-center justify-between gap-2 text-start',
              !selected && 'text-(--muted)',
              className
            )}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="size-3.5 shrink-0 text-(--muted)"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(panelClassName, 'w-(--radix-popover-trigger-width) p-1')}
        >
          <Command className="bg-transparent">
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-(--control-sm) text-sm"
            />
            <CommandList>
              <CommandEmpty className="type-meta p-3">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label ?? option.value}
                    disabled={option.disabled}
                    onSelect={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    className={panelItemClassName}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {option.value === value ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
};

export default Combobox;
