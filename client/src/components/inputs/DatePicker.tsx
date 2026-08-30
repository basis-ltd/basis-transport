import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format, isValid, parse } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { controlClassName, panelClassName, panelItemClassName } from './control';
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

const MONTH_LABELS = Array.from({ length: 12 }, (_, month) =>
  format(new Date(2000, month, 1), 'MMM')
);

/**
 * Anything that opens a panel and sits in a form row uses the field shape, not
 * the button shape, so it lines up with the inputs beside it and reads as a
 * field rather than an action. The calendar glyph stays `--muted` — which is
 * exactly why the trigger must never flip to a solid fill on hover.
 *
 * Month and year are explicit selects above the grid. Paging a year back one
 * arrow at a time is twelve clicks, and it is the only way to reach a birth
 * date or a range that starts in another year.
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
  const [visibleMonth, setVisibleMonth] = useState<Date>(value ?? new Date());

  /* The grid follows the value when it changes from outside — an API load or a
     form reset — instead of stranding the reader on whatever month was last
     paged to. */
  useEffect(() => {
    if (value && isValid(value)) {
      setVisibleMonth(value);
    }
  }, [value]);

  const years = useMemo(() => {
    const min = fromDate?.getFullYear() ?? new Date().getFullYear() - 100;
    const max = toDate?.getFullYear() ?? new Date().getFullYear() + 10;
    return Array.from({ length: max - min + 1 }, (_, i) => String(max - i));
  }, [fromDate, toDate]);

  /* Only months that actually contain a selectable day. Offering "Jan" inside
     a February-onward range is a dead option. */
  const months = useMemo(() => {
    const year = visibleMonth.getFullYear();
    return MONTH_LABELS.map((labelText, index) => ({
      label: labelText,
      value: String(index),
    })).filter(({ value: monthIndex }) => {
      const index = Number(monthIndex);
      const monthStart = new Date(year, index, 1);
      const monthEnd = new Date(year, index + 1, 0);
      if (fromDate && monthEnd < fromDate) return false;
      if (toDate && monthStart > toDate) return false;
      return true;
    });
  }, [visibleMonth, fromDate, toDate]);

  const clampToRange = (date: Date) => {
    if (fromDate && date < fromDate) return fromDate;
    if (toDate && date > toDate) return toDate;
    return date;
  };

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
            <span className="truncate">
              {value ? format(value, 'MMM d, yyyy') : placeholder}
            </span>
            <FontAwesomeIcon
              icon={faCalendar}
              className="size-4 shrink-0 text-(--accent-ink)"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(panelClassName, 'w-auto p-3')}
        >
          <div className="mb-3 grid grid-cols-2 gap-2">
            <SelectRoot
              value={String(visibleMonth.getMonth())}
              onValueChange={(month) =>
                setVisibleMonth((current) =>
                  clampToRange(
                    new Date(current.getFullYear(), Number(month), 1)
                  )
                )
              }
            >
              <SelectTrigger
                aria-label="Month"
                className={cn(
                  controlClassName,
                  'h-(--control-sm) cursor-pointer justify-between'
                )}
              >
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className={panelClassName}>
                {months.map((month) => (
                  <SelectItem
                    key={month.value}
                    value={month.value}
                    className={panelItemClassName}
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>

            <SelectRoot
              value={String(visibleMonth.getFullYear())}
              onValueChange={(year) =>
                setVisibleMonth((current) =>
                  clampToRange(
                    new Date(Number(year), current.getMonth(), 1)
                  )
                )
              }
            >
              <SelectTrigger
                aria-label="Year"
                className={cn(
                  controlClassName,
                  'h-(--control-sm) cursor-pointer justify-between'
                )}
              >
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className={cn(panelClassName, 'max-h-64')}>
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={year}
                    className={panelItemClassName}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <Calendar
            mode="single"
            selected={value}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
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
            className="p-0"
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
};

export { parse };
export default DatePicker;
