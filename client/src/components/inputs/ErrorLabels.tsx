import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from 'react-hook-form';

type InputErrorMessageProps = {
  message:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
};

export const InputErrorMessage = ({ message }: InputErrorMessageProps) => {
  if (!message) return null;
  return <p className="text-red-500 text-[13px]">{String(message)}</p>;
};
