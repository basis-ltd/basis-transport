import { Input as UIInput } from '@/components/ui/input';
import React, {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ForwardedRef,
  MouseEventHandler,
} from 'react';
import { cn } from '@/lib/utils';
import { SkeletonLoader } from './Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { InputErrorMessageProp } from './ErrorLabels';
import { resolveErrorText } from './ErrorLabels';
import { FieldMessage, FieldShell } from './Field';
import { controlClassName, readOnlyControlClassName } from './control';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from '../ui/checkbox';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'search'
    | 'file'
    | 'checkbox'
    | 'radio';
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  errorMessage?: InputErrorMessageProp;
  /** Helper text under the control. The error replaces it when both exist. */
  description?: string;
  required?: boolean;
  isLoading?: boolean;
  accept?: string;
  prefixIcon?: IconDefinition;
  prefixText?: string;
  suffixIcon?: IconDefinition;
  showSearchSuffix?: boolean;
  suffixIconPrimary?: boolean;
  prefixIconHandler?: MouseEventHandler<HTMLButtonElement> | undefined;
  suffixIconHandler?: MouseEventHandler<HTMLButtonElement> | undefined;
  labelClassName?: string;
  inputMode?: 'text' | 'url' | 'tel' | 'email' | 'numeric' | 'decimal';
  pattern?: string;
  defaultValue?: string;
  readOnly?: boolean;
  name?: string;
  min?: number;
  checked?: boolean;
  defaultChecked?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      value,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      onKeyUp,
      label,
      errorMessage,
      description,
      required,
      isLoading,
      prefixIcon,
      prefixText,
      suffixIcon,
      showSearchSuffix,
      suffixIconPrimary,
      prefixIconHandler,
      labelClassName,
      inputMode,
      pattern,
      defaultValue,
      readOnly,
      placeholder,
      name,
      id,
      type = 'text',
      checked,
      defaultChecked,
      min,
      suffixIconHandler,
      accept = 'image/*',
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    /* Checked state is the inversion rule: the box fills with ink and its
       check goes to paper. Never a tint, never an accent colour. */
    if (['checkbox', 'radio'].includes(type)) {
      if (type === 'checkbox') {
        return (
          <div className="flex w-fit flex-col gap-1.5">
            <label className="flex w-fit items-center gap-2 text-sm">
              <Checkbox
                onCheckedChange={
                  onChange as ((checked: CheckedState) => void) | undefined
                }
                name={name}
                value={value}
                checked={checked || !!value}
                defaultChecked={defaultChecked || !!value}
                className="size-5 cursor-pointer border-(--ink) outline-none duration-200 data-[state=checked]:bg-(--ink) data-[state=checked]:text-(--paper)"
              />
              <p className={cn(label ? 'flex' : 'hidden', 'text-sm')}>{label}</p>
            </label>
            <FieldMessage
              description={description}
              errorMessage={errorMessage}
            />
          </div>
        );
      }

      return (
        <div className="flex w-fit flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type={type}
              name={name}
              value={value}
              defaultChecked={defaultChecked}
              checked={checked}
              onChange={onChange}
              className={cn(
                'size-5 cursor-pointer rounded-(--radius-pill) border border-(--ink) accent-(--ink) outline-none duration-200',
                className
              )}
            />
            <p className={cn(label ? 'flex' : 'hidden', 'text-sm')}>{label}</p>
          </label>
          <FieldMessage
            description={description}
            errorMessage={errorMessage}
          />
        </div>
      );
    }

    const hasError = Boolean(resolveErrorText(errorMessage));
    const messageId =
      id && (hasError || description) ? `${id}-message` : undefined;

    return (
      <FieldShell
        label={label}
        required={required}
        description={description}
        errorMessage={errorMessage}
        messageId={messageId}
        className={labelClassName}
      >
        {/* The affixes sit inside this wrapper, which is the input's own box —
            not the field's. Positioning them against the field made them drift
            downward the moment an error message grew underneath. An unhandled
            affix is decoration and renders inert; it used to be an anchor to
            "#", which put a dead stop in the tab order. */}
        <section className="relative w-full">
          {prefixIcon || prefixText ? (
            prefixIconHandler ? (
              <button
                type="button"
                onClick={prefixIconHandler}
                className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-(--muted) outline-none transition-colors duration-200 ease-(--ease-flat) hover:text-(--ink)"
              >
                {prefixIcon ? (
                  <FontAwesomeIcon className="text-current" icon={prefixIcon} />
                ) : null}
                {prefixText ? (
                  <span className="text-sm">{prefixText}</span>
                ) : null}
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-(--muted)"
              >
                {prefixIcon ? (
                  <FontAwesomeIcon className="text-current" icon={prefixIcon} />
                ) : null}
                {prefixText ? (
                  <span className="text-sm">{prefixText}</span>
                ) : null}
              </span>
            )
          ) : null}

          {suffixIcon || showSearchSuffix ? (
            <button
              type="button"
              onClick={suffixIconHandler}
              className={cn(
                'absolute inset-y-0 end-0 flex items-center rounded-e-(--radius-control) px-3.5 text-sm outline-none transition-[background-color,color] duration-200 ease-(--ease-flat)',
                suffixIconPrimary
                  ? 'bg-(--ink) text-(--paper) active:shadow-[var(--press-on-ink)_999px_999px_0_inset]'
                  : 'text-(--muted) hover:text-(--ink)'
              )}
            >
              <FontAwesomeIcon icon={suffixIcon || faSearch} />
            </button>
          ) : null}

          {isLoading ? (
            <SkeletonLoader type="input" />
          ) : (
            <UIInput
              id={id}
              defaultValue={defaultValue}
              value={value}
              type={type || 'text'}
              min={type === 'number' ? 0 : min}
              readOnly={readOnly}
              accept={accept}
              name={name}
              ref={ref}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder={readOnly ? '' : placeholder}
              inputMode={inputMode}
              pattern={pattern}
              aria-invalid={hasError}
              aria-describedby={messageId}
              className={cn(
                controlClassName,
                prefixIcon && 'ps-10',
                prefixText && 'ps-[3.6rem]',
                (suffixIcon || showSearchSuffix) && 'pe-11',
                readOnly && readOnlyControlClassName,
                className
              )}
            />
          )}
        </section>
      </FieldShell>
    );
  }
);

Input.displayName = 'Input';

export default Input;
