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
    <label className="grid w-full gap-1.5">
      {label && (
        <header className="flex items-center gap-1">
          <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </span>
          {required && <span className="text-destructive">*</span>}
        </header>
      )}
      <Textarea
        cols={cols}
        rows={rows}
        ref={ref}
        value={value}
        readOnly={readonly}
        placeholder={placeholder}
        className={cn(`w-full h-[20vh]`, !resize && 'resize-none', className)}
        onChange={onChange}
        onBlur={onBlur}
        defaultValue={defaultValue}
      />
      {errorMessage && <InputErrorMessage message={errorMessage} />}
    </label>
  );
};

export default TextArea;
