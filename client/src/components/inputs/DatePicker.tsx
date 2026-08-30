import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'date-fns';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { controlClassName, panelClassName } from './control';
import type { InputErrorMessageProp } from './ErrorLabels';
import { resolveErrorText } from './ErrorLabels';
import { FieldShell } from './Field';

interface DatePickerProps {
  label?: React.ReactNode;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  fromDate?: Date;
  toDate?: Date;
  disabled?: boolean;
  required?: boolean;
  description?: React.ReactNode;
  errorMessage?: InputErrorMessageProp;
  className?: string;
}

/**
 * Anything that opens a panel and sits in a form row uses the field shape, not
 * the button shape, so it lines up with the inputs beside it and reads as a
 * field rather than an action. The calendar glyph stays `--muted` — which is
 * exactly why the trigger must never flip to a solid fill on hover.
 */
const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Pick a date',
  fromDate,
  toDate,
  disabled = false,
  required = false,
  description,
  errorMessage,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

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
            disabled={disabled}
            aria-invalid={Boolean(resolveErrorText(errorMessage))}
            className={cn(
              controlClassName,
              'flex cursor-pointer items-center justify-between gap-2 text-start',
              !value && 'text-(--muted)',
              className
            )}
          >
            {value ? format(value, 'MMM d, yyyy') : placeholder}
            <FontAwesomeIcon
              icon={faCalendar}
              className="size-4 shrink-0 text-(--muted)"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(panelClassName, 'w-auto p-2')}
        >
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            startMonth={fromDate}
            endMonth={toDate}
            disabled={
              fromDate || toDate
                ? { before: fromDate as Date, after: toDate as Date }
                : undefined
            }
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
};

export default DatePicker;
