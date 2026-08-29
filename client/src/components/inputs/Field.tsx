import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import CustomTooltip from '../custom/CustomTooltip';
import {
  fieldClassName,
  fieldErrorClassName,
  fieldHelpClassName,
  fieldLabelClassName,
} from './control';
import type { InputErrorMessageProp } from './ErrorLabels';
import { resolveErrorText } from './ErrorLabels';

/**
 * The wrapper every labelled control renders through: label, control, one
 * message. Input, Select, and TextArea used to each own a slightly different
 * version of this — different label markup, and an error that had an icon in
 * one, no icon in another, and a red asterisk with no tooltip in the third.
 */
export interface FieldShellProps {
  label?: ReactNode;
  /** Helper text under the control. The error replaces it when both exist. */
  description?: ReactNode;
  errorMessage?: InputErrorMessageProp;
  required?: boolean;
  /**
   * The control's id. Given one, the shell is a plain element and the label
   * points at the control; without one the shell is itself the label and the
   * control inside is associated implicitly.
   */
  htmlFor?: string;
  /** Id the control names in aria-describedby. */
  messageId?: string;
  className?: string;
  children: ReactNode;
}

const RequiredMark = ({ label }: { label: ReactNode }) => (
  <CustomTooltip
    label={typeof label === 'string' ? `${label} is required` : 'Required'}
  >
    <span className="cursor-pointer text-(--ink)" aria-hidden="true">
      *
    </span>
  </CustomTooltip>
);

/**
 * One message slot. An error outranks a description, and always arrives with
 * its icon so a failed field is legible without colour.
 */
export const FieldMessage = ({
  description,
  errorMessage,
  id,
}: Pick<FieldShellProps, 'description' | 'errorMessage'> & { id?: string }) => {
  const error = resolveErrorText(errorMessage);

  if (error) {
    return (
      <p id={id} role="alert" className={fieldErrorClassName}>
        <AlertTriangle
          className="mt-[0.2em] size-3 shrink-0"
          aria-hidden="true"
        />
        {error}
      </p>
    );
  }

  if (!description) return null;

  return (
    <p id={id} className={fieldHelpClassName}>
      {description}
    </p>
  );
};

export const FieldShell = ({
  label,
  description,
  errorMessage,
  required = false,
  htmlFor,
  messageId,
  className,
  children,
}: FieldShellProps) => {
  const body = (
    <>
      {children}
      <FieldMessage
        description={description}
        errorMessage={errorMessage}
        id={messageId}
      />
    </>
  );

  const labelContent = label ? (
    <>
      {label}
      {required ? <RequiredMark label={label} /> : null}
    </>
  ) : null;

  if (htmlFor) {
    return (
      <div className={cn(fieldClassName, className)}>
        {labelContent ? (
          <label htmlFor={htmlFor} className={fieldLabelClassName}>
            {labelContent}
          </label>
        ) : null}
        {body}
      </div>
    );
  }

  return (
    <label className={cn(fieldClassName, className)}>
      {labelContent ? (
        <p className={fieldLabelClassName}>{labelContent}</p>
      ) : null}
      {body}
    </label>
  );
};

export default FieldShell;
