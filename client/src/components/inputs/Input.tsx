import { Input as UIInput } from '@/components/ui/input';
import React, {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ForwardedRef,
  MouseEventHandler,
} from 'react';
import { FieldErrorsImpl, FieldValues } from 'react-hook-form';
import { Merge } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { SkeletonLoader } from './Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faSearch, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { InputErrorMessage } from './ErrorLabels';
import CustomTooltip from '../custom/CustomTooltip';
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
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
  required?: boolean;
  isLoading?: boolean;
  accept?: string;
  prefixIcon?: IconDefinition;
  prefixText?: string;
  suffixIcon?: IconDefinition;
  showSearchSuffix?: boolean;
  suffixIconPrimary?: boolean;
  prefixIconHandler?: MouseEventHandler<HTMLAnchorElement> | undefined;
  suffixIconHandler?: MouseEventHandler<HTMLAnchorElement> | undefined;
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
      type = 'text',
      checked,
      defaultChecked,
      min,
      suffixIconHandler,
      accept = 'image/*',
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    if (['checkbox', 'radio'].includes(type)) {
      if (['checkbox'].includes(type)) {
          return (
            <label className="flex w-fit items-center gap-1.5 text-[11px] lg:text-[12px] font-light leading-tight">
              <Checkbox
                onCheckedChange={
                  onChange as ((checked: CheckedState) => void) | undefined
                }
              name={name}
              value={value}
              checked={checked || !!value}
              defaultChecked={defaultChecked || !!value}
                className={`${
                  value || defaultChecked || checked
                    ? 'data-[state=checked]:bg-primary text-white'
                    : ''
                } w-4 h-4 border-[1.5px] cursor-pointer border-secondary outline-none focus:outline-none ease-in-out duration-50`}
              />
              <p
              className={`${
                label ? 'flex' : 'hidden'
              } text-secondary text-[11px] lg:text-[12px] font-light leading-tight`}
            >
              {label}
            </p>
          </label>
        );
      }
      return (
        <label className="flex items-center gap-1.5 text-[11px] lg:text-[12px] font-light leading-tight">
          <input
            type={type}
            name={name}
            value={value}
            defaultChecked={defaultChecked as boolean}
            checked={checked as boolean}
            onChange={onChange}
            className={`w-4 h-4 border-[1.5px] rounded-xl cursor-pointer border-secondary outline-none focus:outline-none accent-primary focus:border-[1.6px] focus:border-primary ease-in-out duration-50 ${className}`}
          />
          <p className={`${label ? 'flex' : 'hidden'} text-[11px] lg:text-[12px] font-light leading-tight`}>{label}</p>
        </label>
      );
    }

    return (
        <label className={`flex flex-col gap-2 w-full ${labelClassName}`}>
          <header
            className={`${
              label ? 'pl-1 flex items-center gap-1.5 text-[11px] lg:text-[12px] font-light leading-tight text-secondary' : 'hidden'
            }`}
          >
          {label}{' '}
          {required && (
            <CustomTooltip
              label={required ? `${label} is required` : ''}
              labelClassName="text-[11px] bg-red-600"
            >
              <span className="text-red-600 cursor-pointer">*</span>
            </CustomTooltip>
          )}
        </header>

          <article className="relative w-full flex flex-col gap-1.5">
          {prefixIcon || prefixText ? (
            <nav className="absolute inset-y-0 start-0 flex items-center ps-3">
              <Link
                to={'#'}
                onClick={prefixIconHandler}
                className="text-secondary hover:text-primary transition-colors duration-200"
              >
                {prefixIcon && (
                  <FontAwesomeIcon
                    className="text-[9px] sm:text-[10px] md:text-[10px] lg:text-[11px]"
                    icon={prefixIcon}
                  />
                )}
                {prefixText && (
                  <span className="text-[11px] lg:text-[12px] font-light leading-tight">
                    {prefixText}
                  </span>
                )}
              </Link>
            </nav>
          ) : null}

          {(suffixIcon || showSearchSuffix) && (
            <nav className="absolute inset-y-0 end-0 flex items-center pe-3">
              <Link
                to={'#'}
                onClick={suffixIconHandler}
                className={`text-secondary hover:text-primary transition-colors duration-200 ${
                  suffixIconPrimary ? 'text-primary' : ''
                }`}
              >
                <FontAwesomeIcon
                  className="text-[9px] sm:text-[10px] md:text-[10px] lg:text-[11px]"
                  icon={suffixIcon || faSearch}
                />
              </Link>
            </nav>
          )}

          {isLoading ? (
            <SkeletonLoader type="input" />
          ) : (
            <UIInput
              defaultValue={defaultValue as string}
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
              className={`
                !h-10 min-h-10 !py-0 px-3
                font-light leading-tight
                placeholder:!font-light
                placeholder:text-[11px] lg:placeholder:text-[12px]
                text-[11px] lg:text-[12px]
                flex items-center w-full
                rounded-md border border-[1px] border-primary/20
                outline-none focus:outline-none
                focus:border-primary
                focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20
                ease-in-out duration-200 bg-white shadow-sm
                ${className}
                ${prefixIcon && 'ps-10'}
                ${prefixText ? 'ps-[3.25rem]' : ''}
                ${(suffixIcon || showSearchSuffix) && 'pe-10'}
                ${
                  readOnly &&
                  '!border-[.1px] !border-background hover:cursor-default focus:!border-background'
                }
              `}
            />
          )}
          {errorMessage && <InputErrorMessage message={errorMessage} />}
        </article>
      </label>
    );
  }
);

export default Input;
