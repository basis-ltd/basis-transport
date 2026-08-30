import { FC, ChangeEvent, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { textareaClassName } from './control';
import type { InputErrorMessageProp } from './ErrorLabels';
import { resolveErrorText } from './ErrorLabels';
import { FieldShell } from './Field';

interface TextAreaProps {
  cols?: number;
  rows?: number;
  className?: string;
  defaultValue?: string | number | readonly string[];
  resize?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  onBlur?: () => void;
  label?: string | React.ReactNode;
  value?: string | number | readonly string[];
  description?: string | React.ReactNode;
  errorMessage?: InputErrorMessageProp;
}

const TextArea: FC<TextAreaProps> = ({
  cols = 50,
  rows = 5,
  className,
  defaultValue,
  resize = false,
  onChange,
  placeholder,
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
        aria-invalid={Boolean(resolveErrorText(errorMessage))}
        className={cn(textareaClassName, !resize && 'resize-none', className)}
        onChange={onChange}
        onBlur={onBlur}
        defaultValue={defaultValue}
      />
    </FieldShell>
  );
};

export default TextArea;
