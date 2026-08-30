import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import PhoneInputWithCountry, {
  getCountryCallingCode,
  type Country,
  type Value,
} from 'react-phone-number-input/max';
import countryLabels from 'react-phone-number-input/locale/en.json';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  controlClassName,
  readOnlyControlClassName,
} from './control';
import { FieldShell } from './Field';
import {
  SUPPORTED_PHONE_COUNTRY,
  validateAndFormatPhoneNumber,
} from '@/utils/phone.util';

interface CountrySelectOption {
  value?: Country;
  label: string;
  divider?: boolean;
}

interface CountryCallingCodeSelectProps {
  value?: Country;
  onChange: (country?: Country) => void;
  options: CountrySelectOption[];
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}

function CountryCallingCodeSelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  invalid,
}: CountryCallingCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const countries = useMemo(
    () =>
      options.flatMap((option) =>
        option.value && !option.divider
          ? [
              {
                value: option.value,
                label: option.label,
                hint: `+${getCountryCallingCode(option.value)}`,
                selectable: option.value === SUPPORTED_PHONE_COUNTRY,
              },
            ]
          : [],
      ),
    [options],
  );

  const filteredCountries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return countries;

    return countries.filter(
      (country) =>
        country.label.toLowerCase().includes(query) ||
        country.value.toLowerCase().includes(query) ||
        country.hint.includes(query),
    );
  }, [countries, searchTerm]);

  const isLocked = disabled || readOnly;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (isLocked) return;
        setOpen(nextOpen);
        if (!nextOpen) setSearchTerm('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Country calling code"
          aria-invalid={invalid}
          disabled={disabled}
          className={cn(
            controlClassName,
            'flex w-auto min-w-[7rem] shrink-0 cursor-pointer items-center justify-between gap-1 px-3 text-left',
            readOnly && readOnlyControlClassName,
            isLocked && 'cursor-not-allowed',
          )}
        >
          <span className="truncate tabular-nums text-sm">
            {value ? `${value} +${getCountryCallingCode(value)}` : 'Country'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-(--muted)" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={5}
        className="w-72 max-w-[calc(100vw-3rem)] p-1"
      >
        <div className="mb-1 flex items-center gap-2 border-b border-(--line) px-2 pb-2 pt-1">
          <Search className="size-3.5 shrink-0 text-(--muted)" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search countries"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-(--ink) outline-none placeholder:text-(--muted) focus:border-none focus:ring-0"
          />
        </div>
        <ul className="max-h-60 overflow-y-auto overscroll-contain">
          {filteredCountries.length === 0 ? (
            <li className="px-2 py-5 text-center text-sm text-(--muted)">
              No matching country
            </li>
          ) : (
            filteredCountries.map((country) => {
              const isSelected = value === country.value;

              return (
                <li key={country.value}>
                  <button
                    type="button"
                    disabled={!country.selectable}
                    onClick={() => {
                      if (!country.selectable) return;
                      onChange(country.value);
                      setOpen(false);
                      setSearchTerm('');
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded-(--radius-control) px-2 py-2 text-left text-sm text-(--ink) outline-none transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface-hover) focus-visible:bg-(--surface-hover)',
                      !country.selectable &&
                        'cursor-not-allowed opacity-40 hover:bg-transparent focus-visible:bg-transparent',
                    )}
                  >
                    <Check
                      className={cn(
                        'size-4 shrink-0 text-(--ink)',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{country.label}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-(--muted)">
                      {country.hint}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

const PhoneNumberField = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<'input'>
>(({ className, ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    type="tel"
    inputMode="tel"
    className={cn(controlClassName, 'min-w-0 flex-1', className)}
  />
));

PhoneNumberField.displayName = 'PhoneNumberField';

export interface TelInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  label?: ReactNode;
  name?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  className?: string;
  labelClassName?: string;
  errorMessage?: string;
  description?: ReactNode;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const TelInput = forwardRef<HTMLInputElement, TelInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      label,
      name,
      id,
      placeholder,
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete = 'tel',
      className,
      labelClassName,
      errorMessage,
      description,
      onKeyDown,
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `tel-${generatedId}`;
    const errorId = `${inputId}-error`;
    const [hasInteracted, setHasInteracted] = useState(false);

    const liveError = useMemo(() => {
      if (!hasInteracted) return undefined;
      if (!value) return required ? 'Phone number is required.' : undefined;

      const validation = validateAndFormatPhoneNumber(value);
      return validation.isValid ? undefined : validation.error;
    }, [hasInteracted, required, value]);

    const resolvedError = errorMessage || liveError;
    const isInvalid = Boolean(resolvedError);

    const handleChange = (nextValue?: Value) => {
      setHasInteracted(true);
      onChange(nextValue ?? '');
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setHasInteracted(true);
      onBlur?.(event);
    };

    return (
      <FieldShell
        label={label}
        required={required}
        description={description}
        errorMessage={resolvedError}
        htmlFor={inputId}
        messageId={errorId}
        className={labelClassName}
      >
        <PhoneInputWithCountry
          ref={ref as never}
          id={inputId}
          name={name}
          value={value || undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          defaultCountry={SUPPORTED_PHONE_COUNTRY}
          initialValueFormat="national"
          labels={countryLabels}
          addInternationalOption={false}
          countrySelectComponent={CountryCallingCodeSelect}
          countrySelectProps={{
            disabled,
            readOnly,
            invalid: isInvalid,
          }}
          inputComponent={PhoneNumberField}
          numberInputProps={{
            'aria-invalid': isInvalid,
            'aria-describedby':
              resolvedError || description ? errorId : undefined,
            readOnly,
            className: cn(readOnly && readOnlyControlClassName),
          }}
          placeholder={readOnly ? '' : (placeholder ?? 'Enter phone number')}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={cn('flex items-center gap-1', className)}
        />
      </FieldShell>
    );
  },
);

TelInput.displayName = 'TelInput';

export default TelInput;
