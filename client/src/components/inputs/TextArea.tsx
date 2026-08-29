import { FC, ChangeEvent, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { InputErrorMessageProp } from './ErrorLabels';
import { FieldShell } from './Field';

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
  description?: string | React.ReactNode;
  errorMessage?: InputErrorMessageProp;
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
  description,
  errorMessage,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!defaultValue && !value && ref?.current) {
      ref.current.value = '';
    }
  }, [defaultValue, value]);

  return (
    <FieldShell
      label={label}
      required={required}
      description={description}
      errorMessage={errorMessage}
    >
      <Textarea
        cols={cols}
        rows={rows}
        ref={ref}
        value={value}
        readOnly={readonly}
        placeholder={placeholder}
        aria-invalid={Boolean(errorMessage)}
        className={cn(!resize && 'resize-none', className)}
        onChange={onChange}
        onBlur={onBlur}
        defaultValue={defaultValue}
      />
    </FieldShell>
  );
};

export default TextArea;
