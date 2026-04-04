import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from 'react-hook-form';

export type InputErrorMessageProp =
  | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<FieldValues>>
  | undefined;

type InputErrorMessageProps = {
  message: InputErrorMessageProp;
};

function resolveErrorText(message: InputErrorMessageProp): string | undefined {
  if (message == null || message === '') return undefined;
  if (typeof message === 'string') return message;
  if (typeof message === 'object' && message !== null && 'message' in message) {
    const m = (message as { message?: unknown }).message;
    if (m == null || m === '') return undefined;
    return String(m);
  }
  return undefined;
}

export const InputErrorMessage = ({ message }: InputErrorMessageProps) => {
  const text = resolveErrorText(message);
  if (!text) return null;
  return <p className="text-red-500 text-[13px]">{text}</p>;
};
