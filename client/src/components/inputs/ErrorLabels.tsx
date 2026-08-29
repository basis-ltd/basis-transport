import { AlertTriangle } from 'lucide-react';
import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from 'react-hook-form';
import { fieldErrorClassName } from './control';

export type InputErrorMessageProp =
  | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<FieldValues>>
  | undefined;

type InputErrorMessageProps = {
  message: InputErrorMessageProp;
};

export function resolveErrorText(
  message: InputErrorMessageProp
): string | undefined {
  if (message == null || message === '') return undefined;
  if (typeof message === 'string') return message;
  if (typeof message === 'object' && message !== null && 'message' in message) {
    const m = (message as { message?: unknown }).message;
    if (m == null || m === '') return undefined;
    return String(m);
  }
  return undefined;
}

/**
 * Colour is never the only carrier of the message — a red line on its own says
 * something is wrong without saying what, and disappears in greyscale.
 */
export const InputErrorMessage = ({ message }: InputErrorMessageProps) => {
  const text = resolveErrorText(message);
  if (!text) return null;
  return (
    <p role="alert" className={fieldErrorClassName}>
      <AlertTriangle className="mt-[0.2em] size-3 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
};
