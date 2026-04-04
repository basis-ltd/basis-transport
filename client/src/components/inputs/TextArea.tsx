import { FC, ChangeEvent, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { InputErrorMessage } from './ErrorLabels';
import { FieldValues } from 'react-hook-form';
import { Merge } from 'react-hook-form';
import { FieldErrorsImpl } from 'react-hook-form';
import { FieldError } from 'react-hook-form';

interface TextAreaProps {
  cols?: number;
  rows?: number;
  className?: string;
  defaultValue?: string | number | readonly string[] | undefined;
  resize?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string | undefined;
  required?: boolean;
  readonly?: boolean;
  onBlur?: () => void | undefined;
  label?: string | React.ReactNode;
  value?: string | number | readonly string[] | undefined;
  height?: string;
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
}

const TextArea: FC<TextAreaProps> = ({
  cols = 50,
  rows = 5,
  className = '',
  defaultValue = undefined,
  resize = false,
  onChange,
  placeholder = undefined,
  required = false,
  readonly = false,
  onBlur,
  label = null,
  value,
  errorMessage,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!defaultValue && !value && ref?.current) {
      ref.current.value = '';
    }
  }, [defaultValue, value]);

  return (
    <label className="flex flex-col gap-2 w-full">
      {label && (
        <header className="flex items-center gap-1 pl-1">
          <span className="text-[11px] lg:text-[12px] font-light leading-tight text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </span>
          {required && <span className="text-red-600">*</span>}
        </header>
      )}
      <Textarea
        cols={cols}
        rows={rows}
        ref={ref}
        value={value}
        readOnly={readonly}
        placeholder={placeholder}
        className={cn(
          `w-full h-[20vh] bg-white shadow-sm text-[11px] lg:text-[12px] font-light border border-primary/20 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:font-light rounded-md`,
          !resize && 'resize-none',
          className
        )}
        onChange={onChange}
        onBlur={onBlur}
        defaultValue={defaultValue}
      />
      {errorMessage && <InputErrorMessage message={errorMessage} />}
    </label>
  );
};

export default TextArea;
